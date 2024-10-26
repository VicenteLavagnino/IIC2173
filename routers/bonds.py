from fastapi import APIRouter, Depends
from models import BondPurchase
from auth import get_current_user
from fastapi import Body, Depends
from database import buy_bond, collection

router = APIRouter()


@router.post("/buy_bond")
async def buy_bond_endpoint(
    bond: BondPurchase = Body(...), current_user: dict = Depends(get_current_user)
):
    result = await buy_bond(
        current_user["sub"], str(bond.fixture_id), bond.result, bond.amount
    )
    return result


@router.get("/bonds")
async def get_user_bonds_endpoint(current_user: dict = Depends(get_current_user)):
    user_bonds = await collection.get_user_bonds(current_user["sub"])
    return {"bonds": user_bonds}
