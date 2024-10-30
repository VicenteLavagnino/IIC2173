from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timedelta
from auth import get_current_user
from database import collection, fixture_bonds_collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

router = APIRouter()


@router.get("/fixtures")
async def get_fixtures(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    count: int = Query(25, ge=1),
    home: str = None,
    visit: str = None,
    date: datetime = None,
):
    skip = (page - 1) * count
    query = {}
    if home:
        query["teams.home.name"] = home
        query["fixture.status.long"] = "Not Started"
    if visit:
        query["teams.away.name"] = visit
        query["fixture.status.long"] = "Not Started"
    if date:
        start_date = datetime(date.year, date.month, date.day)
        end_date = start_date + timedelta(days=1)
        query["fixture.date"] = {
            "$gte": start_date.strftime("%Y-%m-%dT%H:%M:%S"),
            "$lt": end_date.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        query["fixture.status.long"] = "Not Started"

    # Calcular el total de documentos
    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(count)
    fixtures_list = await cursor.to_list(length=count)
    return {
        "fixtures": jsonable_encoder(
            fixtures_list,
            custom_encoder={
                ObjectId: str}),
        "total": total,
    }


@router.get("/fixtures/{fixture_id}")
async def get_fixture(
        fixture_id: str,
        current_user: dict = Depends(get_current_user)):
    try:
        fixture_id_int = int(fixture_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid fixture ID format")

    # Buscar el fixture usando el campo fixture.id
    data = await collection.find_one({"fixture.id": fixture_id_int})
    if data:
        return jsonable_encoder(data, custom_encoder={ObjectId: str})
    else:
        raise HTTPException(status_code=404, detail="Fixture not found")


@router.get("/fixtures/{fixture_id}/available_bonds")
async def get_available_bonds(
    fixture_id: str, current_user: dict = Depends(get_current_user)
):
    fixture_bonds = await fixture_bonds_collection.find_one(
        {"fixture_id": int(fixture_id)}
    )
    if not fixture_bonds:
        raise HTTPException(
            status_code=404,
            detail="Fixture not found or bonds not initialized")
    return {
        "fixture_id": fixture_id,
        "available_bonds": fixture_bonds["available_bonds"],
    }
