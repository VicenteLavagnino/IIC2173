from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from celery.result import AsyncResult
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from worker.consumer import dummy_task, process_payment  # Cambiado de .tasks a worker.consumer
from routers import users, bonds, fixtures, webpay

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
    """
    Indica si el servicio está operativo
    """
    return True

@app.post("/job")
async def create_job(job_data: JobRequest):
    """
    Crea un nuevo job de pago y retorna su ID
    """
    task = process_payment.delay(job_data.amount, job_data.currency)
    return {"id": task.id}

@app.get("/job/{id}")
async def get_job(id: str):
    """
    Obtiene el estado y resultado de un job por su ID
    """
    task = AsyncResult(id)
    if not task:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if task.ready():
        if task.successful():
            return {
                "status": "completed",
                "result": task.result
            }
        else:
            return {
                "status": "failed",
                "error": str(task.result)
            }
    return {
        "status": "pending",
        "id": id
    }

@app.get("/test-worker")
async def test_worker():
    """
    Endpoint para probar el worker
    """
    # Crear una tarea
    task = dummy_task.delay()
    return {"task_id": task.id, "message": "Tarea creada, usa /test-worker/{task_id} para ver el resultado"}

@app.get("/test-worker/{task_id}")
async def get_test_result(task_id: str):
    """
    Endpoint para verificar el resultado de la tarea
    """
    task = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result if task.ready() else None
    }

@app.post("/tasks/dummy")
async def create_dummy_task():
    task = dummy_task.delay()
    return {"task_id": task.id}

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
            return {
                "status": "completed",
                "result": task.result
            }
        else:
            return {
                "status": "failed",
                "error": str(task.result)
            }
    return {
        "status": "pending",
        "task_id": task_id
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="0.0.0.0", port=8000)