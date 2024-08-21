from fastapi import FastAPI
import paho.mqtt.client as mqtt
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv('HOST')
port = os.getenv('PORT')
user = os.getenv('USER')
password = os.getenv('PASSWORD')


host="broker.iic2173.org"
port=9000
user="students"
password="iic2173-2024-2-students"

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("fixtures/info")



def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set(user, password)
client.connect(host, port, 60)

client.loop_forever()
