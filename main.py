from fastapi import FastAPI, Query
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from database import collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hola! Bienvenido a la API de la entrega 0 - IIC2173"}

@app.get("/fixtures")
async def get_fixtures(page: int = Query(1, ge=1), count: int = Query(25, ge=1), home: str = None, visit: str = None, date: datetime = None):
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
async def get_fixture(fixture_id: str):
    data = await collection.find_one({"_id": ObjectId(fixture_id)})
    
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        return {"error": "Fixture not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
