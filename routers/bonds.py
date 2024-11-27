from fastapi import APIRouter, Depends
from models import BondPurchase, BondOffer, BondProposal
from auth import get_current_user
from fastapi import Body, Depends
from database import buy_bond, buy_bond_group, group_bonds_collection, offer_bonds, other_group_offers_collection, group_offers_collection, propose_bonds, other_group_proposals_collection

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


@router.get("/bonds/group/offered")
async def get_group_offered_bonds():
    bonds = await group_offers_collection.find().to_list(length=None)
    for bond in bonds:
        bond["_id"] = str(bond["_id"])
    print(bonds)
    return bonds


@router.post("/bonds/offer")
async def create_bonds_offer(
    bond_offer: BondOffer = Body(...),
):
    print(bond_offer.dict())
    result = await offer_bonds(bond_offer.fixture_id, bond_offer.league_name, bond_offer.fixture_round, bond_offer.result, bond_offer.quantity)

    return result

@router.get("/bonds/offered")
async def get_group_bonds():
    print("Getting offered bonds...")
    bonds = await other_group_offers_collection.find().to_list(length=None)
    for bond in bonds:
        bond["_id"] = str(bond["_id"])
    print(bonds)
    return bonds

@router.post("/bonds/propose")
async def create_bonds_proposal(
    bond_proposal: BondProposal = Body(...),
):
    print(bond_proposal.dict())
    result = await propose_bonds(bond_proposal.auction_id, bond_proposal.fixture_id, bond_proposal.league_name, bond_proposal.fixture_round, bond_proposal.result, bond_proposal.quantity)

    return result

@router.get("/bonds/proposed")
async def get_proposed_bonds():
    print("Getting proposed bonds...")
    bonds = await other_group_proposals_collection.find().to_list(length=None)
    for bond in bonds:
        bond["_id"] = str(bond["_id"])
    print(bonds)
    return bonds

    