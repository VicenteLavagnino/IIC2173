from pydantic import BaseModel


class User(BaseModel):
    email: str
    wallet: float = 0.0


class BondPurchase(BaseModel):
    fixture_id: str
    result: str
    amount: int


class FundRequest(BaseModel):
    amount: float
