from fastapi import APIRouter, Depends
from models import BondPurchase
from auth import get_current_user
from fastapi import Body, Depends
from database import buy_bond, buy_bond_group

router = APIRouter()


@router.post("/buy_bond")
async def buy_bond_endpoint(
        bond: BondPurchase = Body(...),
        current_user: dict = Depends(get_current_user)):
    result = await buy_bond(
        current_user["sub"], str(bond.fixture_id), bond.result, bond.amount
    )
    return result

@router.post("/bonds/group_buy")
async def group_buy_bond_endpoint(
        bond: BondPurchase = Body(...),
        current_user: dict = Depends(get_current_user)):
    print("Purchasing bonds for group...")
    print(bond.fixture_id)
    result = await buy_bond_group(
        current_user["sub"], str(bond.fixture_id), bond.result, bond.amount
    )
    return result
