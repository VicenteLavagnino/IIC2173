import os
from transbank.webpay.webpay_plus.transaction import Transaction
import random
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Request
from fastapi import APIRouter, HTTPException

FRONTEND_URL = os.getenv("FRONTEND_URL")

router = APIRouter()

# WEBPAY
@router.get("/webpay/create")
async def webpay_plus_create(request: Request, amount: int):
    buy_order = str(random.randrange(1000000, 99999999))
    session_id = str(random.randrange(1000000, 99999999))
    return_url = "https://web.e0futbol.me/webpay/commit"

    try:
        response = (Transaction()).create(buy_order, session_id, amount, return_url)
        print(f"Webpay response: {response}")
        print(f"Compra por: {amount}")
        return JSONResponse(content={"url": response['url'], "token": response['token']})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating transaction: {e}")
    

@router.get("/webpay/commit")
async def webpay_plus_commit(token_ws: str):
    try:
        response = Transaction().commit(token=token_ws)

        if response['status'] == 'AUTHORIZED':
            return JSONResponse(content={
                "status": "AUTHORIZED",
                "message": "Transaction confirmed successfully",
                "details": response
            })
        else:
            return JSONResponse(content={
                "status": "FAILED",
                "message": f"Transaction failed with response code {response['response_code']}",
                "details": response 
            })

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error committing transaction: {e}")

