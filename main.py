from fastapi import FastAPI, Query
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from database import collection  # Ensure this import is correctly referencing your MongoDB collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
import logging

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Football Fixtures API"}

@app.get("/fixtures")
async def get_fixtures(page: int = Query(1, ge=1), count: int = Query(25, ge=1)):
    skip = (page - 1) * count
    cursor = collection.find({}).skip(skip).limit(count)
    fixtures_list = await cursor.to_list(length=count)
    print(f"Page: {page}, Count: {count}, Found {len(fixtures_list)} fixtures")
    return jsonable_encoder(fixtures_list, custom_encoder={ObjectId: str})


@app.get("/fixtures/{fixture_id}")
async def get_fixture(fixture_id: str):
    data = await collection.find_one({"_id": ObjectId(fixture_id)})
    
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        return {"error": "Fixture not found"}





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
