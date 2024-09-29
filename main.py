from typing import Optional
import jwt
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi import FastAPI
from dotenv import load_dotenv
import requests
import os
from database import get_all_users

# Cargar las variables de entorno
load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ALGORITHMS = os.getenv("AUTH0_ALGORITHMS")

# Crear instancia de HTTPBearer para manejar la autenticación
security = HTTPBearer()

# Obtener claves públicas (JWKS) de Auth0 para verificar JWTs
def get_jwks():
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    response = requests.get(jwks_url)
    response.raise_for_status()
    return response.json()

jwks = get_jwks()

# Función para verificar el token JWT
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
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
                algorithms=[ALGORITHMS],
                audience=AUTH0_API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect claims. Please, check the audience and issuer.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Inicializar la aplicación FastAPI
app = FastAPI()

# Ruta pública de bienvenida
@app.get("/")
async def root():
    return {"message": "Hola! Bienvenido a la API de la entrega 0 - IIC2173"}

# Conectar con MongoDB
client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client["nombre_de_tu_base_de_datos"]
collection = db["nombre_de_tu_coleccion"]

# Ruta protegida para obtener una lista de fixtures
@app.get("/fixtures")
async def get_fixtures(
    page: int = Query(1, ge=1),
    count: int = Query(25, ge=1),
    home: Optional[str] = None,
    visit: Optional[str] = None,
    date: Optional[datetime] = None,
    current_user: dict = Depends(verify_token)  # Protegemos esta ruta
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

# Ruta protegida para obtener un fixture específico
@app.get("/fixtures/{fixture_id}")
async def get_fixture(fixture_id: str, current_user: dict = Depends(verify_token)):  # Protegemos esta ruta
    data = await collection.find_one({"_id": ObjectId(fixture_id)})
    
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        return {"error": "Fixture not found"}


@app.get("/users")
async def get_users():
    users = await get_all_users()
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No existen usuarios registrados :(")
    
    return users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
