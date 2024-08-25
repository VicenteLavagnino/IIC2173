from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from json import loads
import paho.mqtt.client as mqtt
import os
from threading import Thread
import asyncio

app = FastAPI()

# Configuración de la base de datos MongoDB
mongo_url = "mongodb+srv://vicentelavagnino:vicente1559@e0.dhcuf.mongodb.net/?retryWrites=true&w=majority&appName=E0"
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client["futbol_db"]  # Nombre de la base de datos
collection = db["partidos"]     # Nombre de la colección

# MQTT Settings
host = "broker.iic2173.org"
port = 9000
user = "students"
password = "iic2173-2024-2-students"

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

async def save_fixture(data):
    # Inserta los datos en MongoDB
    try:
        print("guardando")
        result = await collection.insert_one(data)
        print(f"Data saved to MongoDB with id: {result.inserted_id}")
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")

def on_message(client, userdata, msg):
    payload = loads(msg.payload.decode())
    print("Received data:", payload)
    # Guardar en MongoDB (correr en el event loop de FastAPI)
    print("ahora deberia guardarse")
    asyncio.run_coroutine_threadsafe(save_fixture(payload), asyncio.get_event_loop())

def run_mqtt_client():
    print("paso 1")
    client = mqtt.Client()
    print("paso 2")
    client.on_connect = on_connect
    print("paso 3")
    client.on_message = on_message
    print("paso 4")

    client.username_pw_set(user, password)
    print("paso 5")
    client.connect(host, int(port), 60)
    print("paso 6")
    client.loop_start()  # Use loop_start instead of loop_forever for non-blocking

thread = Thread(target=run_mqtt_client)
thread.start()
