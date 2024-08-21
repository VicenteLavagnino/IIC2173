from fastapi import FastAPI
from json import loads
import paho.mqtt.client as mqtt
import os
from threading import Thread

host = "broker.iic2173.org"
port = 9000
user = "students"
password = "iic2173-2024-2-students"

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/fixtures")
async def fixtures():
    return {"message": "fixtures"}

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("fixtures/info")

def on_message(client, userdata, msg):
    payload = loads(msg.payload.decode())
    print(payload)

def run_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    client.username_pw_set(user, password)
    client.connect(host, int(port), 60)
    client.loop_forever()

thread = Thread(target=run_mqtt_client)
thread.start()

