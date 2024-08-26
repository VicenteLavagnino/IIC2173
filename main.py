from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from database import collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId


app = FastAPI()

@app.get("/")
async def root():
    print("Hello World")
    return {"message": "Hello World"}

@app.get("/fixtures")
async def fixtures():
    cursor = collection.find({})
    fixtures_list = await cursor.to_list(length=100)
    return jsonable_encoder(fixtures_list, custom_encoder={ObjectId: str})




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
