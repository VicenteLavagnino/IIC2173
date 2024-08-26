import paho.mqtt.client as mqtt
import asyncio
from database import save_fixture

# MQTT Settings
host = "broker.iic2173.org"
port = 9000
user = "students"
password = "iic2173-2024-2-students"

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
    client.connect(host, int(port), 60)
    client.loop_forever()

if __name__ == "__main__":
    run_mqtt_client()
