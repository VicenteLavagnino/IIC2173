import paho.mqtt.client as mqtt
import asyncio
import os
from database import save_fixture
from dotenv import load_dotenv

load_dotenv()

# MQTT Settings con variables de entorno
host = os.getenv("MQTT_HOST")
port = int(os.getenv("MQTT_PORT"))
user = os.getenv("MQTT_USER")
password = os.getenv("MQTT_PASSWORD")

loop = asyncio.get_event_loop()

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("fixtures/info")

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print("Received data type:", type(payload))
    print("Received data:", payload[:200])
    asyncio.run_coroutine_threadsafe(save_fixture(payload), loop)

def run_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(user, password)
    client.connect(host, port, 60)
    client.loop_forever()

if __name__ == "__main__":
    run_mqtt_client()
