from fastapi import APIRouter, Depends
from models import BondPurchase, BondOffer, BondProposal, BondProposalResponse
from auth import get_current_user
from fastapi import Body, Depends
from database import buy_bond, buy_bond_group, group_bonds_collection, offer_bonds, other_group_offers_collection, group_offers_collection, propose_bonds, other_group_proposals_collection, buy_bond_to_group, collection, handle_proposal_decision
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId

router = APIRouter()


@router.post("/buy_bond")
async def buy_bond_endpoint(
        bond: BondPurchase = Body(...),
        current_user: dict = Depends(get_current_user)):
    result = await buy_bond(
        current_user["sub"], str(bond.fixture_id), bond.result, bond.amount, bond.discount
    )
    return result

@router.post("/bonds/group/buy_bond")
async def buy_bond_group_endpoint( 
    bond: BondPurchase = Body(...),
    current_user: dict = Depends(get_current_user)):
    result = await buy_bond_to_group(
        current_user["sub"], str(bond.fixture_id), bond.result, bond.amount, bond.discount, token_ws=""
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
async def get_offered_bonds():
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
    try:
        print("Getting proposed bonds...")
        
        bonds = await other_group_proposals_collection.find().to_list(length=None)
        result = []

        for bond in bonds:
            bond["_id"] = str(bond["_id"]) 

            bond_fixture = await collection.find_one({"fixture.id": int(bond["fixture_id"])})
            encoded_bond_fixture = None
            if bond_fixture:
                encoded_bond_fixture = jsonable_encoder(bond_fixture, custom_encoder={ObjectId: str})

            associated_bond = await group_offers_collection.find_one({"auction_id": bond["auction_id"]})
            encoded_associated_bond_fixture = None
            if associated_bond:
                associated_bond["_id"] = str(associated_bond["_id"])

                associated_bond_fixture = await collection.find_one({"fixture.id": int(associated_bond["fixture_id"])})
                if associated_bond_fixture:
                    encoded_associated_bond_fixture = jsonable_encoder(associated_bond_fixture, custom_encoder={ObjectId: str})

                    result.append([
                        [bond, encoded_bond_fixture],
                        [associated_bond, encoded_associated_bond_fixture],
                    ])
        print(result)
        return JSONResponse(content=result)

    except Exception as e:
        print(f"Error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/bonds/proposed") 
async def post_proposal_decision(
    proposal_response: BondProposalResponse = Body(...),
):  
    result = await handle_proposal_decision(proposal_response.auction_id, proposal_response.proposal_id, proposal_response.proposal_decision)
    return result