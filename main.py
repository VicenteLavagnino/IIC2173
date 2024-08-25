from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import json
import paho.mqtt.client as mqtt
import asyncio
from threading import Thread

app = FastAPI()

# Configuración de la base de datos MongoDB
mongo_url = "mongodb+srv://vicentelavagnino:vicente1559@e0.dhcuf.mongodb.net/?retryWrites=true&w=majority&appName=E0"
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]
collection = db["partidos"]

# MQTT Settings
host = "broker.iic2173.org"
port = 9000
user = "students"
password = "iic2173-2024-2-students"

# Create a global event loop
loop = asyncio.get_event_loop()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/fixtures")
async def fixtures():
    cursor = collection.find({})
    fixtures_list = await cursor.to_list(length=100)
    return {"fixtures": fixtures_list}

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("fixtures/info")

import json

async def save_fixture(data):
    try:
        # Remove extra quotes at the beginning and end if they exist
        data = data.strip('"')
        
        # Replace escaped quotes with regular quotes
        data = data.replace('\\"', '"')
        
        # Parse the JSON string into a Python dictionary
        parsed_data = json.loads(data)
        
        # Check if the parsed data has a 'fixtures' key
        if 'fixtures' in parsed_data:
            fixtures = parsed_data['fixtures']
            for fixture in fixtures:
                # Insert each fixture separately
                result = await collection.insert_one(fixture)
                print(f"Fixture saved to MongoDB with id: {result.inserted_id}")
        else:
            # If there's no 'fixtures' key, insert the whole parsed data
            result = await collection.insert_one(parsed_data)
            print(f"Data saved to MongoDB with id: {result.inserted_id}")
        
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Problematic data: {data[:200]}")  # Print first 200 characters
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")
        print(f"Problematic data: {data[:200]}")  # Print first 200 characters

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print("Received data type:", type(payload))
    print("Received data:", payload[:200])  # Print first 200 characters
    asyncio.run_coroutine_threadsafe(save_fixture(payload), loop)

def run_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(user, password)
    client.connect(host, int(port), 60)
    client.loop_forever()

# Start MQTT client in a separate thread
mqtt_thread = Thread(target=run_mqtt_client)
mqtt_thread.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, loop=loop)

