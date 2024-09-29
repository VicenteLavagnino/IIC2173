from motor.motor_asyncio import AsyncIOMotorClient
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de la base de datos MongoDB
mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]
collection = db["partidos"]
users_collection = db["users"]  # Nueva colección para usuarios

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

async def save_user(user_data):
    try:
        result = await users_collection.insert_one(user_data)
        print(f"User saved to MongoDB with id: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"Error saving user to MongoDB: {e}")
        return None

async def get_user(auth0_id):
    try:
        user = await users_collection.find_one({"auth0_id": auth0_id})
        return user
    except Exception as e:
        print(f"Error retrieving user from MongoDB: {e}")
        return None

async def update_user_wallet(auth0_id, new_wallet_value):
    try:
        result = await users_collection.update_one(
            {"auth0_id": auth0_id},
            {"$set": {"wallet": new_wallet_value}}
        )
        if result.modified_count > 0:
            print(f"User wallet updated for auth0_id: {auth0_id}")
            return True
        else:
            print(f"No user found with auth0_id: {auth0_id}")
            return False
    except Exception as e:
        print(f"Error updating user wallet in MongoDB: {e}")
        return False