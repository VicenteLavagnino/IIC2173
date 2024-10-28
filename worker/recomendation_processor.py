from .celery_config import celery_app
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict
import os
from datetime import datetime

mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]

@celery_app.task(name="process_recommendations")
async def process_recommendations(user_id: str, min_recommendations: int = 3) -> Dict:
    try:
        # 1. Obtener el historial de compras del usuario
        user_bonds = await db.bonds.find({
            "user_auth0_id": user_id,
            "status": {"$in": ["valid", "won", "lost"]}
        }).to_list(None)

        if not user_bonds:
            return {"error": "No betting history found"}

        # 2. Obtener equipos y ligas involucrados
        teams_data = {}
        leagues_data = {}
        for bond in user_bonds:
            fixture = await db.collection.find_one({"fixture.id": int(bond["fixture_id"])})
            if fixture:
                # Registrar equipos
                home_team = fixture["teams"]["home"]["name"]
                away_team = fixture["teams"]["away"]["name"]
                league_name = fixture["league"]["name"]
                
                for team in [home_team, away_team]:
                    if team not in teams_data:
                        teams_data[team] = {
                            "matches": 0,
                            "correct_predictions": 0
                        }
                    teams_data[team]["matches"] += 1
                    if bond["status"] == "won":
                        teams_data[team]["correct_predictions"] += 1

                # Registrar ligas
                if league_name not in leagues_data:
                    leagues_data[league_name] = {
                        "matches": 0,
                        "round": fixture["league"]["round"]
                    }
                leagues_data[league_name]["matches"] += 1

        # 3. Obtener próximos partidos de los equipos
        upcoming_matches = []
        for team in teams_data.keys():
            matches = await db.collection.find({
                "$or": [
                    {"teams.home.name": team},
                    {"teams.away.name": team}
                ],
                "fixture.status.long": "Not Started"
            }).to_list(None)
            upcoming_matches.extend(matches)

        # 4. Calcular ponderadores
        weighted_matches = []
        for match in upcoming_matches:
            home_team = match["teams"]["home"]["name"]
            away_team = match["teams"]["away"]["name"]
            league_name = match["league"]["name"]
            
            # Calcular precisión histórica para los equipos
            team_accuracy = 0
            teams_involved = 0
            if home_team in teams_data:
                team_data = teams_data[home_team]
                team_accuracy += team_data["correct_predictions"] / team_data["matches"]
                teams_involved += 1
            if away_team in teams_data:
                team_data = teams_data[away_team]
                team_accuracy += team_data["correct_predictions"] / team_data["matches"]
                teams_involved += 1
            
            if teams_involved > 0:
                team_accuracy /= teams_involved
            
                # Obtener round actual de la liga
                league_round = int(match["league"]["round"].split(" ")[-1])
                
                # Obtener odd del equipo
                odds = float(match["odds"][0]["values"][0]["odd"])
                
                # Calcular ponderador: pond = Aciertos * round_de_liga / odd_de_equipo_involucrado
                weight = (team_accuracy * league_round) / odds
                
                weighted_matches.append({
                    "match": match,
                    "weight": weight,
                    "accuracy": team_accuracy
                })

        # 5. Seleccionar las mejores recomendaciones
        weighted_matches.sort(key=lambda x: x["weight"], reverse=True)
        recommendations = []
        
        for wm in weighted_matches[:min_recommendations]:
            match = wm["match"]
            recommendations.append({
                "fixture_id": str(match["fixture"]["id"]),
                "home_team": match["teams"]["home"]["name"],
                "away_team": match["teams"]["away"]["name"],
                "league_name": match["league"]["name"],
                "round": match["league"]["round"],
                "match_date": match["fixture"]["date"],
                "odds": float(match["odds"][0]["values"][0]["odd"]),
                "recommendation_score": wm["weight"],
                "historical_accuracy": wm["accuracy"]
            })

        # Guardar recomendaciones en la base de datos
        await db.recommendations.insert_one({
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "recommendations": recommendations
        })

        return {
            "status": "success",
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }