from fastapi import APIRouter, Depends, HTTPException
from models import FundRequest
from auth import get_current_user
from database import users_collection, bonds_collection, collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from celery.result import AsyncResult

router = APIRouter()


@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    cursor = users_collection.find({})
    users_list = await cursor.to_list(length=100)
    return jsonable_encoder(users_list, custom_encoder={ObjectId: str})


@router.get("/users/me")
async def get_current_user_info(
        current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})
    if user:
        return jsonable_encoder(user, custom_encoder={ObjectId: str})
    raise HTTPException(status_code=404, detail="User not found")


@router.get("/users/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    # Busca el usuario en la colección usando su ID de Auth0
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})

    # Si no se encuentra el usuario, lanza un error 404
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Devuelve el saldo actual del usuario
    return {"balance": user["wallet"]}


@router.post("/add_funds")
async def add_funds(
    fund_request: FundRequest, current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_balance = user["wallet"] + fund_request.amount
    await users_collection.update_one(
        {"auth0_id": current_user["sub"]}, {"$set": {"wallet": new_balance}}
    )
    return {"message": "Funds added successfully", "new_balance": new_balance}


@router.get("/users/me/purchased_bonds")
async def get_purchased_bonds(
        current_user: dict = Depends(get_current_user)):
    bonds = await bonds_collection.find({"user_auth0_id": current_user["sub"]}).to_list(None)
    if bonds:
        print(bonds)
        return jsonable_encoder(bonds, custom_encoder={ObjectId: str})
    
    raise HTTPException(status_code=404, detail="Bonds not found")