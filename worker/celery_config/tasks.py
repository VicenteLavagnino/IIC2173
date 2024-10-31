from .celery_app import celery_app
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from random import randint
# from routers import get_fixture 
# import auth 
import time
from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from database import collection
from bson import ObjectId
import asyncio

# Configuración de MongoDB
mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]

router = APIRouter()

@router.get("/fixtures/{fixture_id}")
async def get_fixture(
        fixture_id: str
        ):
    try:
        fixture_id_int = int(fixture_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid fixture ID format")

    # Buscar el fixture usando el campo fixture.id
    data = await collection.find_one({"fixture.id": fixture_id_int})
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        raise HTTPException(status_code=404, detail="Fixture not found")
    

# WORKERS
@celery_app.task(name="workers_status")
def workers_status():
    return True

@celery_app.task(name="dummy_task")
def dummy_task():
    folder = "/tmp/celery"
    os.makedirs(folder, exist_ok=True)
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    with open(f"{folder}/task-{now}.txt", "w") as f:
        f.write("hello!")
    return {"status": "completed", "time": now}

@celery_app.task(name="process_payment")
def process_payment(amount: float, currency: str):
    """
    Procesa un pago y retorna el resultado
    """
    return {
        "status": "success",
        "transaction_details": {
            "amount": amount,
            "currency": currency,
            "transaction_id": f"tx_{int(time.time())}",
            "processed_at": datetime.now(timezone.utc).isoformat(),
        },
    }

# Código https://chatgpt.com/

@celery_app.task(name="random_recommendation")
def random_recommendation():
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    return loop.run_until_complete(fetch_random_recommendations())


async def fetch_random_recommendations():
    results = []
    matches = [1208050, 1208505, 1208506, 1208042, 1208036, 1208032, 1208040]

    selected_matches = set()
    while len(selected_matches) < 3:
        selected_matches.add(randint(0, len(matches) - 1))

    for match_index in selected_matches:
        fixture = await get_fixture(matches[match_index])
        results.append(fixture)

    return results

# Código https://chatgpt.com/