# Documentación del Backend

Para replicar el CI de este proyecto se debe:

```bash
#crear archivo .env
MQTT_HOST=broker.iic2173.org
MQTT_PORT=9000
MQTT_USER=students
MQTT_PASSWORD=iic2173-2024-2-students

# MongoDB
MONGO_URL=mongodb+srv://vicentelavagnino:vicente1559@e0.dhcuf.mongodb.net/?retryWrites=true&w=majority&appName=E0
MONGO_USERNAME=vicentelavagnino
MONGO_PASSWORD=vicente1559

AUTH0_DOMAIN=dev-471bwugsmm2684vq.us.auth0.com
AUTH0_AUDIENCE=https://iic2173.lavagnino.cl/
AUTH0_CLIENT_ID=nvEnMYMP62NbjzKq2CsK2ACVwtaPPQ1z
AUTH0_CLIENT_SECRET=G_h2kcIXyFcvhLf2BXc1m-jcDMvG_421vq2uVsUXEKFSAgc-2nM5as9Xohs99WiU
```

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install pylint pytest

# Para formatear el código
brew install black
brew install isort

black .
isort .

pylint **/*.py
```


# Para testear en local

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload

# Para testear en docker
docker build -t backend .
docker run -p 8000:8000 backend
```



