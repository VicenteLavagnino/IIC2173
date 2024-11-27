from pydantic import BaseModel


class User(BaseModel):
    email: str
    wallet: float = 0.0

class BondPurchase(BaseModel):
    fixture_id: str
    result: str
    amount: int
    discount: int

class BondOffer(BaseModel):
    fixture_id: str
    league_name: str
    fixture_round: str
    result: str
    quantity: int

class BondProposal(BaseModel):
    auction_id: str
    fixture_id: str
    league_name: str
    fixture_round: str
    result: str
    quantity: int

class FundRequest(BaseModel):
    amount: float

class MatchRecommendation(BaseModel):
    fixture_id: str
    home_team: str
    away_team: str
    league_name: str
    round: str
    match_date: str
    odds: float
    recommendation_score: float
    historical_accuracy: float

class RecommendationRequest(BaseModel):
    user_id: str
    min_recommendations: int = 3
