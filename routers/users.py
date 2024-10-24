from fastapi import APIRouter, Depends, HTTPException
from models import FundRequest
from auth import get_current_user
from database import users_collection, bonds_collection, collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

router = APIRouter()


@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    cursor = users_collection.find({})
    users_list = await cursor.to_list(length=100)
    return jsonable_encoder(users_list, custom_encoder={ObjectId: str})


@router.get("/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"auth0_id": current_user["sub"]})
    if user:
        return jsonable_encoder(user, custom_encoder={ObjectId: str})
    raise HTTPException(status_code=404, detail="User not found")


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
async def get_purchased_bonds(current_user: dict = Depends(get_current_user)):
    user_bonds = await bonds_collection.find(
        {"user_auth0_id": current_user["sub"]}
    ).to_list(None)

    if not user_bonds:
        return {"message": "No bonds purchased yet"}

    formatted_bonds = []
    for bond in user_bonds:
        fixture = await collection.find_one({"fixture.id": int(bond["fixture_id"])})
        formatted_bond = {
            "request_id": bond["request_id"],
            "fixture_id": bond["fixture_id"],
            "result": bond["result"],
            "amount": bond["amount"],
            "status": bond["status"],
            "fixture_details": {
                "home_team": fixture["teams"]["home"]["name"],
                "away_team": fixture["teams"]["away"]["name"],
                "date": fixture["fixture"]["date"],
            },
        }
        formatted_bonds.append(formatted_bond)

    return jsonable_encoder(formatted_bonds, custom_encoder={ObjectId: str})
