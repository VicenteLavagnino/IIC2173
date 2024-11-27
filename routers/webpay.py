import os
from transbank.webpay.webpay_plus.transaction import Transaction
import random
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from fastapi import APIRouter, HTTPException, Depends, Query
from auth import get_current_user
from database import buy_bond_webpay, handle_webpay_validation, buy_bond_to_group
import uuid

FRONTEND_URL = os.getenv("FRONTEND_URL")

router = APIRouter()


# WEBPAY
@router.get("/webpay/create")
async def webpay_plus_create(
    fixture_id: str = Query(...),
    result: str = Query(...),
    amount: int = Query(...),
    discount: int = Query(...),
    current_user: dict = Depends(get_current_user),
):
    buy_order = str(uuid.uuid4())[:26]
    session_id = str(uuid.uuid4())[:26]
    return_url = FRONTEND_URL + "/webpay/commit"

    payment_amount = ( amount * 1000 ) - ( amount * discount )

    try:
        response = (Transaction()).create(
            buy_order, session_id, payment_amount, return_url
        )
        print(f"Webpay response: {response}")
        print(f"Compra por: {amount}")
        if discount > 0 :
            await buy_bond_to_group( 
                current_user["sub"], str(fixture_id), result, amount, discount, response["token"]
            )
        else :
            await buy_bond_webpay(
                current_user["sub"], str(fixture_id), result, amount, response["token"]
            )

        return JSONResponse(
            content={"url": response["url"], "token": response["token"]}
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"{e}")


@router.get("/webpay/commit")
async def webpay_plus_commit(token_ws: str):
    try:
        response = Transaction().commit(token=token_ws)

        if response["status"] == "AUTHORIZED":
            await handle_webpay_validation(token_ws=token_ws, status=True)
            return JSONResponse(
                content={
                    "status": "AUTHORIZED",
                    "message": "Transacción autorizada. Redirigiendo...",
                    "details": response,
                }
            )
        else:
            await handle_webpay_validation(token_ws=token_ws, status=False)
            return JSONResponse(
                content={
                    "status": "FAILED",
                    "message": f"Transacción rechazada: {response['status']}",
                    "details": response,
                }
            )

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error committing transaction: {e}"
        )
