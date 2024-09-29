from motor.motor_asyncio import AsyncIOMotorClient
import json
import os
import bcrypt  # Para manejar el hashing de las contraseñas
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

# Configuración de la base de datos MongoDB
mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]
collection = db["partidos"]

# Colección de usuarios
users_collection = db["users"]

# Guardar fixtures en la base de datos
async def save_fixture(data):
    try:
        data = data.strip('"')
        data = data.replace('\\"', '"')
        parsed_data = json.loads(data)
        
        if 'fixtures' in parsed_data:
            fixtures = parsed_data['fixtures']
            for fixture in fixtures:
                result = await collection.insert_one(fixture)
                print(f"Fixture saved to MongoDB with id: {result.inserted_id}")
        else:
            result = await collection.insert_one(parsed_data)
            print(f"Data saved to MongoDB with id: {result.inserted_id}")
        
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Problematic data: {data[:200]}")
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")
        print(f"Problematic data: {data[:200]}")

# Obtener usuario por email
async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email})

# Crear un nuevo usuario con un wallet inicial y clave de usuario
async def create_user(email: str, password: str):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        "email": email,
        "password": hashed_password,  # Guardamos la clave como hash
        "wallet_balance": 0  # Inicia con 0 en la billetera
    }
    result = await users_collection.insert_one(user)
    return user

# Verificar la contraseña de un usuario
async def verify_user_password(email: str, password: str):
    user = await get_user_by_email(email)
    if user and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return True
    return False

# Actualizar el saldo del wallet del usuario
async def update_wallet_balance(email: str, amount: int):
    user = await get_user_by_email(email)
    if user:
        new_balance = user["wallet_balance"] + amount
        await users_collection.update_one({"email": email}, {"$set": {"wallet_balance": new_balance}})
        return new_balance
    return None

# Obtener todos los usuarios
async def get_all_users():
    users_cursor = users_collection.find({})
    users = await users_cursor.to_list(length=None)  # Obtener todos los usuarios en una lista
    for user in users:
        user["_id"] = str(user["_id"])
        user["password"] = str(user["password"])
        user["wallet_balance"] = str(user["wallet_balance"])
    return users
