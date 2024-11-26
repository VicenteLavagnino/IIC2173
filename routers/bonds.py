from fastapi import APIRouter, Depends
from models import BondPurchase, BondOffer
from auth import get_current_user
from fastapi import Body, Depends
from database import buy_bond, buy_bond_group, group_bonds_collection

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

@router.get("/bonds/group")
async def get_group_bonds():
    print("Getting group bonds...")
    bonds = await group_bonds_collection.find().to_list(length=None)
    for bond in bonds:
        bond["_id"] = str(bond["_id"])
    print(bonds)
    return bonds

@router.post("/bonds/offer")
async def create_bonds_offer(
    bond_offer: BondOffer = Body(...),
):
    print(bond_offer.dict())
    return {"message": "Offer enviada."}
