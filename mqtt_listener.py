import asyncio
import os

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from database import handle_history, handle_request, handle_validation, save_fixture

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
    client.subscribe("fixtures/requests")
    client.subscribe("fixtures/validation")
    client.subscribe("fixtures/history")


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    print(f"Received message on topic: {topic}")
    # print(f"Message payload: {payload[:200]}...")
    if topic == "fixtures/info":
        asyncio.run_coroutine_threadsafe(save_fixture(payload), loop)
    elif topic == "fixtures/requests":
        asyncio.run_coroutine_threadsafe(handle_request(payload), loop)
    elif topic == "fixtures/validation":
        asyncio.run_coroutine_threadsafe(handle_validation(payload), loop)
    elif topic == "fixtures/history":
        asyncio.run_coroutine_threadsafe(handle_history(payload), loop)


def run_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(user, password)
    client.connect(host, port, 60)
    client.loop_forever()


if __name__ == "__main__":
    run_mqtt_client()
