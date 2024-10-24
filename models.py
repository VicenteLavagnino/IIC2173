from pydantic import BaseModel, EmailStr


class User(BaseModel):
    email: EmailStr
    wallet: float = 0.0


class BondPurchase(BaseModel):
    fixture_id: str
    result: str
    amount: int


class FundRequest(BaseModel):
    amount: float
