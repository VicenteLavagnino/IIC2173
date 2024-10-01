from motor.motor_asyncio import AsyncIOMotorClient
import json
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
import uuid
import paho.mqtt.publish as publish

load_dotenv()

# Configuración de la base de datos MongoDB
mongo_url = os.getenv("MONGO_URL")
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]
collection = db["partidos"]
bonds_collection = db["bonos"]
users_collection = db["users"]

MQTT_HOST = os.getenv("MQTT_HOST")
MQTT_PORT = int(os.getenv("MQTT_PORT"))
MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")

# Guardar fixtures en la base de datos
async def save_fixture(data):
    try:
        data = data.strip('"')
        data = data.replace('\\"', '"')
        parsed_data = json.loads(data)
        
        if 'fixtures' in parsed_data:
            fixtures = parsed_data['fixtures']
            for fixture in fixtures:
                result = await collection.insert_one(fixture)
                #print(f"Fixture saved to MongoDB with id: {result.inserted_id}")
        else:
            result = await collection.insert_one(parsed_data)
            #print(f"Data saved to MongoDB with id: {result.inserted_id}")
        
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Problematic data: {data[:200]}")
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")
        print(f"Problematic data: {data[:200]}")


# Obtener usuario por email
async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email})

async def get_user_by_auth0_id(auth0_id: str):
    return await users_collection.find_one({"auth0_id": auth0_id})


# Crear un nuevo usuario con un wallet inicial
async def create_user(email: str):
    user = {
        "email": email,
        "wallet_balance": 0  # Inicia con 0 en la billetera
    }
    result = await users_collection.insert_one(user)
    return user

# Actualizar el saldo del wallet del usuario
async def update_wallet_balance(auth0_id: str, amount: int):
    user = await get_user_by_auth0_id(auth0_id)
    if user:
        new_balance = user["wallet"] + amount
        await users_collection.update_one({"auth0_id": auth0_id}, {"$set": {"wallet": new_balance}})
        return new_balance
    return None

async def handle_request(payload):
    try:
        data = json.loads(payload)
        request_id = data.get('request_id')
        fixture_id = data.get('fixture_id')
        result = data.get('result')
        
        await bonds_collection.insert_one({
            'request_id': request_id,
            'fixture_id': fixture_id,
            'result': result,
            'status': 'pending'
        })
        
        print(f"Solicitud de bono guardada: {request_id}")
    except json.JSONDecodeError as e:
        print(f"Error decodificando JSON en handle_request: {e}")
    except Exception as e:
        print(f"Error en handle_request: {e}")

async def handle_validation(payload):
    data = json.loads(payload)
    request_id = data.get('request_id')
    is_valid = data.get('valid')
    
    bond_request = await bonds_collection.find_one({'request_id': request_id})
    
    if not bond_request:
        print(f"No se encontró la solicitud de bono: {request_id}")
        return
    
    if is_valid:
        await bonds_collection.update_one(
            {'request_id': request_id},
            {'$set': {'status': 'valid'}}
        )
        print(f"Bono validado: {request_id}")
    else:
        await update_wallet_balance(bond_request['user_auth0_id'], bond_request['amount'])
        await bonds_collection.update_one(
            {'request_id': request_id},
            {'$set': {'status': 'invalid'}}
        )
        await collection.update_one(
            {"id": bond_request['fixture_id']},
            {"$inc": {"available_bonds": 1}}
        )
        print(f"Bono invalidado y dinero devuelto: {request_id}")

async def handle_history(payload):
    data = json.loads(payload)
    fixtures = data.get('fixtures', [])
    
    for fixture in fixtures:
        fixture_id = fixture.get('fixture', {}).get('id')
        # fixture_id = fixture.get('id')
        result = {
            'home': fixture.get('goals', {}).get('home'),
            'away': fixture.get('goals', {}).get('away')
        }
        status = {
            'long': fixture.get('fixture', {}).get('status', {}).get('long'),
            'short': fixture.get('fixture', {}).get('status', {}).get('short')
        }
        
        await collection.update_one(
            {'id': fixture_id},
            {'$set': {'result': result}}
        )
        
        await process_bonds_for_fixture(fixture_id, result)
    
    print(f"Historial de {len(fixtures)} partidos procesado")

async def process_bonds_for_fixture(fixture_id, result):
    bonds = await bonds_collection.find({'fixture_id': fixture_id, 'status': 'valid'}).to_list(None)
    
    for bond in bonds:
        is_winner = (
            (bond['result'] == 'home' and result['home'] > result['away']) or
            (bond['result'] == 'away' and result['away'] > result['home']) or
            (bond['result'] == '---' and result['home'] == result['away'])
        )
        
        if is_winner:
            fixture = await collection.find_one({"id": fixture_id})

            if bond['result'] == '---':
                bond_result = 'draw'
            else :
                bond_result = bond['result']
                
            odds = next((value for value in fixture['odds'][0]['values'] if value['value'] == bond_result), None)
            # odds = next((odd for odd in fixture['odds'] if odd['name'] == bond['result']), None)
            if odds:
                prize = 1000 * bond['amount'] * float(odds['odd'])
                # prize = bond['amount'] * float(odds['values'][0]['odd'])
                await update_wallet_balance(bond['user_auth0_id'], prize)
            
            await bonds_collection.update_one(
                {'_id': bond['_id']},
                {'$set': {'status': 'won'}}
            )
        else:
            await bonds_collection.update_one(
                {'_id': bond['_id']},
                {'$set': {'status': 'lost'}}
            )

async def buy_bond(auth0_id: str, fixture_id: str, result: str, amount: int):
    user = await get_user_by_auth0_id(auth0_id)
    fixture_id_int = int(fixture_id)
    fixture = await collection.find_one({"fixture.id": fixture_id_int})
    
    if not user:
        return {"error": "User  not found"}
    if not fixture:
        return {"error": "Fixture not found"}
    
    if user["wallet"] < amount:
        return {"error": "Insufficient funds"}
    
    #if fixture['available_bonds'] < 1:
    #    return {"error": "No bonds available"}
    
    request_id = str(uuid.uuid4())
    
    request_message = {
        "request_id": request_id,
        "group_id": "8",  
        "fixture_id": fixture_id,
        "league_name": fixture["league"]["name"],
        "round": fixture["league"]["round"],
        "date": fixture["fixture"]["date"],
        "result": result,
        "deposit_token": "",
        "datetime": datetime.utcnow().isoformat(),
        "quantity": 1,
        "seller": 0
    }
    
    publish.single(
        "fixtures/requests",
        payload=json.dumps(request_message),
        hostname=MQTT_HOST,
        port=MQTT_PORT,
        auth={'username': MQTT_USER, 'password': MQTT_PASSWORD}
    )
    print(f"Mensaje enviado al broker: {json.dumps(request_message)}")
    
    await bonds_collection.insert_one({
        'request_id': request_id,
        'user_auth0_id': auth0_id,
        'fixture_id': fixture_id,
        'result': result,
        'amount': amount,
        'status': 'pending'
    })
    
    await update_wallet_balance(auth0_id, -amount)
    
    await collection.update_one(
        {"id": fixture_id},
        {"$inc": {"available_bonds": -1}}
    )
    
    return {"message": "Bond purchase request sent", "request_id": request_id}
