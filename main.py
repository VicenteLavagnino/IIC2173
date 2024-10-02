from fastapi import FastAPI, Query, Depends, HTTPException, Body
from fastapi.security import OAuth2AuthorizationCodeBearer
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from database import collection, users_collection, buy_bond  # Mantener la importación completa de develop
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from jose import jwt
from jose.exceptions import JWTError
import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Métodos permitidos
    allow_headers=["*"],  # Headers permitidos
)

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

class BondPurchase(BaseModel):
    fixture_id: str
    result: str
    amount: int

class FundRequest(BaseModel):
    amount: float

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
    return {"message": "Hola! Bienvenido a la API de la entrega 1- IIC2173 - Grupo 8"}  # Usando el mensaje de develop

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

    total = await collection.count_documents(query)  # Calcular el total de documentos
    cursor = collection.find(query).skip(skip).limit(count)
    fixtures_list = await cursor.to_list(length=count)
    return {
        "fixtures": jsonable_encoder(fixtures_list, custom_encoder={ObjectId: str}),
        "total": total,
    }

@app.get("/fixtures/{fixture_id}")
async def get_fixture(fixture_id: str, current_user: dict = Depends(get_current_user)):
    try:
        fixture_id_int = int(fixture_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid fixture ID format")

    # Buscar el fixture usando el campo fixture.id
    data = await collection.find_one({"fixture.id": fixture_id_int})
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        raise HTTPException(status_code=404, detail="Fixture not found")

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

@app.post("/buy_bond")
async def buy_bond_endpoint(bond: BondPurchase = Body(...), current_user: dict = Depends(get_current_user)):
    result = await buy_bond(current_user['sub'], bond.fixture_id, bond.result, bond.amount)
    return result

@app.post("/add_funds")
async def add_funds(fund_request: FundRequest, current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_balance = user["wallet"] + fund_request.amount
    await users_collection.update_one(
        {"auth0_id": current_user["sub"]},
        {"$set": {"wallet": new_balance}}
    )
    return {"message": "Funds added successfully", "new_balance": new_balance}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
