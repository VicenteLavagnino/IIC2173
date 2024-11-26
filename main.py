from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from celery.result import AsyncResult
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routers import users, bonds, fixtures, webpay
import asyncio
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

from worker.celery_config.tasks import (
    workers_status,
    process_payment,
    random_recommendation,
)

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bonds.router)
app.include_router(fixtures.router)
app.include_router(users.router)
app.include_router(webpay.router)


class PaymentRequest(BaseModel):
    amount: float
    currency: str


@app.get("/")
async def root():
    return {"message": "Hola! Bienvenido a la API de la entrega 1 - IIC2173 - Grupo 8"}


class JobRequest(BaseModel):
    amount: float
    currency: str


@app.get("/heartbeat")
async def heartbeat():
    task = workers_status.delay()
    result = AsyncResult(task.id)

    while not result.ready():
        await asyncio.sleep(0.1)  

    if result.successful() and result.result is True:
        return {"status": "operational", "result": True}
    else:
        return {"status": "not operational", "result": False}

@app.get("/version")
async def get_version():
    try:
        with open("VERSION", "r") as version_file:
            version = version_file.read().strip()
        return {"version": version}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="VERSION file not found")

@app.post("/job")
async def create_job(job_data: JobRequest):
    task = process_payment.delay(job_data.amount, job_data.currency)
    return {"id": task.id}


@app.get("/job/{id}")
async def get_job(id: str):
    task = AsyncResult(id)
    if not task:
        raise HTTPException(status_code=404, detail="Job not found")

    if task.ready():
        if task.successful():
            return {"status": "completed", "result": task.result}
        else:
            return {"status": "failed", "error": str(task.result)}
    return {"status": "pending", "id": id}


@app.post("/tasks/payment")
async def create_payment_task(payment: PaymentRequest):
    task = process_payment.delay(payment.amount, payment.currency)
    return {"task_id": task.id}


@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    task = AsyncResult(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.ready():
        if task.successful():
            return {"status": "completed", "result": task.result}
        else:
            return {"status": "failed", "error": str(task.result)}
    return {"status": "pending", "task_id": task_id}


@app.get("/recommendations")
async def make_recommendation():
    task = random_recommendation.delay()
    result = AsyncResult(task.id)
    while not result.ready():
        await asyncio.sleep(0.1)
    print(result.result)
    return jsonable_encoder(result.result, custom_encoder={ObjectId: str})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
