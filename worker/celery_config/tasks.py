from .celery_app import celery_app
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from database import collection
from random import randint
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
import asyncio
from routers.fixtures import get_fixture
from auth import get_current_user
import time

# Configuración de MongoDB
mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]


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


@celery_app.task(name="random_recommendation")
def random_recommendation():
    """
    Tarea de Celery que obtiene tres recomendaciones de fixtures aleatorias
    """

    return get_fixture(randint(1208034, 1208519), get_current_user)
