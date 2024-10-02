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
fixture_bonds_collection = db["fixture_bonds"]
bond_requests_collection = db["bond_requests"]

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
                print(f"Fixture saved to MongoDB with id: {result.inserted_id}")
        else:
            result = await collection.insert_one(parsed_data)
            print(f"Data saved to MongoDB with id: {result.inserted_id}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Problematic data: {data[:200]}")
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")
        print(f"Problematic data: {data[:200]}")


# Guardar usuario en la base de datos
async def save_user(user_data):
    try:
        result = await users_collection.insert_one(user_data)
        print(f"User saved to MongoDB with id: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"Error saving user to MongoDB: {e}")
        return None

# Obtener usuario por email
async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email})

# Obtener usuario por auth0_id
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

async def initialize_fixture_bonds(fixture_id):
    existing_bonds = await fixture_bonds_collection.find_one({"fixture_id": fixture_id})
    if not existing_bonds:
        await fixture_bonds_collection.insert_one({
            "fixture_id": fixture_id,
            "available_bonds": 40
        })
        print(f"Initialized 40 bonds for fixture {fixture_id}")
    else:
        print(f"Bonds already initialized for fixture {fixture_id}")

async def check_and_update_available_bonds(fixture_id, quantity):
    # Intentar con el fixture_id como número primero
    result = await fixture_bonds_collection.find_one_and_update(
        {"fixture_id": int(fixture_id), "available_bonds": {"$gte": quantity}},
        {"$inc": {"available_bonds": -quantity}},
        return_document=True
    )
    
    if not result:
        # Si no se encuentra, intentar con el fixture_id como string
        result = await fixture_bonds_collection.find_one_and_update(
            {"fixture_id": str(fixture_id), "available_bonds": {"$gte": quantity}},
            {"$inc": {"available_bonds": -quantity}},
            return_document=True
        )
    
    if result:
        print(f"Updated available bonds for fixture {fixture_id}. Remaining: {result['available_bonds']}")
        return True
    else:
        print(f"No available bonds for fixture {fixture_id}")
        return False

async def handle_request(payload):
    try:
        data = json.loads(payload)
        request_id = data.get('request_id')
        group_id = data.get('group_id')
        fixture_id = data.get('fixture_id')
        result = data.get('result')
        quantity = data.get('quantity', 1)

        # Verificar si la solicitud es de otro grupo
        if group_id != "8":  # Asumiendo que "8" es el ID de tu grupo
            await bond_requests_collection.insert_one({
                'request_id': request_id,
                'group_id': group_id,
                'fixture_id': fixture_id,
                'result': result,
                'quantity': quantity,
                'status': 'pending'
            })
            
            # Actualizar la cantidad de bonos disponibles
            await check_and_update_available_bonds(fixture_id, quantity)
            
            print(f"Solicitud de bono de otro grupo guardada: {request_id}")
        else:
            print(f"Solicitud de bono de nuestro grupo recibida: {request_id}")

    except json.JSONDecodeError as e:
        print(f"Error decodificando JSON en handle_request: {e}")
    except Exception as e:
        print(f"Error en handle_request: {e}")
async def handle_validation(payload):

    print("validation")

    data = json.loads(payload)
    request_id = data.get('request_id')
    is_valid = data.get('valid')

    our_bond = await bonds_collection.find_one({'request_id': request_id})
    other_bond = await bond_requests_collection.find_one({'request_id': request_id})

    bond_request = our_bond or other_bond

    if not bond_request:
        print(f"No se encontró la solicitud de bono: {request_id}")
        return

    if is_valid:
        if our_bond:
            await bonds_collection.update_one(
                {'request_id': request_id},
                {'$set': {'status': 'valid'}}
            )
        elif other_bond:
            await bond_requests_collection.update_one(
                {'request_id': request_id},
                {'$set': {'status': 'valid'}}
            )
        print(f"Bono validado: {request_id}")
    else:
        await restore_available_bonds(bond_request['fixture_id'], bond_request['quantity'])
        
        if our_bond:
            # Devolver el dinero al usuario
            await update_wallet_balance(our_bond['user_auth0_id'], our_bond['amount'] * 1000)
            await bonds_collection.update_one(
                {'request_id': request_id},
                {'$set': {'status': 'invalid'}}
            )
        elif other_bond:
            await bond_requests_collection.update_one(
                {'request_id': request_id},
                {'$set': {'status': 'invalid'}}
            )
        
        print(f"Bono invalidado: {request_id}")

async def handle_history(payload):

    if isinstance(payload, str):
        if payload.startswith('"') and payload.endswith('"'):
            payload = payload[1:-1]
        payload = payload.replace('\\"', '"')

    data = json.loads(payload)

    fixtures = data.get('fixtures', [])
    print(f"Procesando historial de {len(fixtures)} partidos")

    for fixture in fixtures:
        fixture_id = fixture.get('fixture', {}).get('id')
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

    bonds = await bonds_collection.find({'fixture_id': fixture_id}).to_list(None)

    for bond in bonds:
        is_winner = (
            (bond['result'] == 'home' and result['home'] > result['away']) or
            (bond['result'] == 'away' and result['away'] > result['home']) or
            (bond['result'] == '---' and result['home'] == result['away'])
        )

        if is_winner:
            print(f"hay un ganador con el fixture {fixture_id}")
            fixture = await collection.find_one({"id": fixture_id})

            if bond['result'] == '---':
                bond_result = 'draw'
            else:
                bond_result = bond['result']

            odds = next((value for value in fixture['odds'][0]['values'] if value['value'] == bond_result), None)
            if odds:
                prize = 1000 * bond['amount'] * float(odds['odd'])
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
    cost = amount * 1000
    user = await get_user_by_auth0_id(auth0_id)
    fixture_id_int = int(fixture_id)
    fixture = await collection.find_one({"fixture.id": fixture_id_int})

    if not user:
        return {"error": "User not found"}
    if not fixture:
        return {"error": "Fixture not found"}
    if user["wallet"] < cost:
        return {"error": "Insufficient funds"}
    
    bonds_available = await check_and_update_available_bonds(fixture_id_int, amount)
    if not bonds_available:
        return {"error": "No hay suficientes bonos disponibles para este partido"}

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
        "quantity": amount,
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

    await update_wallet_balance(auth0_id, -amount * 1000)

    await collection.update_one(
        {"id": fixture_id},
        {"$inc": {"available_bonds": -amount}}
    )

    return {"message": "Bond purchase request sent", "request_id": request_id}

async def restore_available_bonds(fixture_id, quantity):
    result = await fixture_bonds_collection.find_one_and_update(
        {"fixture_id": fixture_id},
        {"$inc": {"available_bonds": quantity}},
        return_document=True
    )
    if result:
        print(f"Restored {quantity} bonds for fixture {fixture_id}. Now available: {result['available_bonds']}")
    else:
        print(f"Failed to restore bonds for fixture {fixture_id}")

async def update_user_wallet(auth0_id, new_wallet_value):
    try:
        result = await users_collection.update_one(
            {"auth0_id": auth0_id},
            {"$set": {"wallet": new_wallet_value}}
        )
        if result.modified_count > 0:
            print(f"User wallet updated for auth0_id: {auth0_id}")
            return True
        else:
            print(f"No user found with auth0_id: {auth0_id}")
            return False
    except Exception as e:
        print(f"Error updating user wallet in MongoDB: {e}")
        return False

