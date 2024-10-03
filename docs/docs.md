# Documentación del Backend

Para replicar el CI de este proyecto se debe:

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



