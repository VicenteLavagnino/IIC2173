from .celery_config import celery_app
import time
from datetime import datetime, timezone

@celery_app.task(name="dummy_task")
def dummy_task():
    """
    Tarea de prueba simple
    """
    time.sleep(5)
    return {"status": "completed", "message": "Dummy task completed"}


@celery_app.task(name="process_payment")
def process_payment(amount: float, currency: str):
    """
    Procesa un pago y retorna el resultado
    """
    # Simulamos procesamiento
    time.sleep(5)
    
    return {
        "status": "success",
        "transaction_details": {
            "amount": amount,
            "currency": currency,
            "transaction_id": f"tx_{int(time.time())}",
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
    }