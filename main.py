from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.security import OAuth2AuthorizationCodeBearer
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from database import collection, users_collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from jose import jwt
from jose.exceptions import JWTError
import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv

import logging

logging.basicConfig(level=logging.DEBUG)


load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = FastAPI()

# Configuración de Auth0
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"https://{AUTH0_DOMAIN}/authorize",
    tokenUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
)

class User(BaseModel):
    email: str
    wallet: float = 0

# Función para obtener las claves públicas de Auth0
def get_auth0_jwks():
    response = requests.get(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
    jwks = response.json()
    return jwks

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        jwks = get_auth0_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=AUTH0_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/")
async def root():
    return {"message": "Hola! Bienvenido a la API de la entrega 0 - IIC2173"}

@app.get("/fixtures")
async def get_fixtures(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    count: int = Query(25, ge=1),
    home: str = None,
    visit: str = None,
    date: datetime = None
):
    skip = (page - 1) * count
    query = {}
    if home:
        query["teams.home.name"] = home
        query["fixture.status.long"] = "Not Started"
    if visit:
        query["teams.away.name"] = visit
        query["fixture.status.long"] = "Not Started"
    if date:
        start_date = datetime(date.year, date.month, date.day)
        end_date = start_date + timedelta(days=1)
        query["fixture.date"] = {"$gte": start_date.strftime("%Y-%m-%dT%H:%M:%S"), "$lt": end_date.strftime("%Y-%m-%dT%H:%M:%S")}
        query["fixture.status.long"] = "Not Started"
    cursor = collection.find(query).skip(skip).limit(count)
    fixtures_list = await cursor.to_list(length=count)
    return jsonable_encoder(fixtures_list, custom_encoder={ObjectId: str})

@app.get("/fixtures/{fixture_id}")
async def get_fixture(fixture_id: str, current_user: dict = Depends(get_current_user)):
    data = await collection.find_one({"_id": ObjectId(fixture_id)})
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        return {"error": "Fixture not found"}

@app.post("/users")
async def create_user(user: User, current_user: dict = Depends(get_current_user)):
    user_data = user.dict()
    user_data["auth0_id"] = current_user["sub"]
    result = await users_collection.insert_one(user_data)
    return {"message": "User created successfully", "id": str(result.inserted_id)}

@app.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    cursor = users_collection.find({})
    users_list = await cursor.to_list(length=100)
    return jsonable_encoder(users_list, custom_encoder={ObjectId: str})

@app.get("/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})
    if user:
        return jsonable_encoder(user, custom_encoder={ObjectId: str})
    raise HTTPException(status_code=404, detail="User not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
