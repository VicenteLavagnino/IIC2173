from fastapi import APIRouter, Depends, HTTPException
from models import RecommendationRequest
from auth import get_current_user
from worker.recommendation_processor import process_recommendations
from celery.result import AsyncResult
from database import mongo_client
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("/recommendations")
async def create_recommendations(
    request: RecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Inicia el proceso de generación de recomendaciones
    """
    task = process_recommendations.delay(current_user["sub"], request.min_recommendations)
    return {
        "task_id": task.id,
        "status": "processing"
    }

@router.get("/recommendations/{task_id}")
async def get_recommendation_status(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el estado y resultado de las recomendaciones
    """
    task = AsyncResult(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.ready():
        if task.successful():
            return task.result
        return {
            "status": "failed",
            "error": str(task.result)
        }
    return {
        "status": "processing",
        "task_id": task_id
    }

@router.get("/users/me/recommendations")
async def get_user_recommendations(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene todas las recomendaciones generadas para un usuario
    """
    db = mongo_client["futbol_db"]
    recommendations = await db.recommendations.find(
        {"user_id": current_user["sub"]}
    ).sort("created_at", -1).to_list(None)
    
    return jsonable_encoder(recommendations, custom_encoder={ObjectId: str})

@router.post("/bonds/{bond_id}/generate-recommendations")
async def generate_recommendations_after_purchase(
    bond_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Genera recomendaciones después de una compra de bono
    """
    task = process_recommendations.delay(current_user["sub"])
    return {
        "task_id": task.id,
        "status": "processing",
        "message": "Recommendations generation started"
    }