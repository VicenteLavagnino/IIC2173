from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from routers import router as api_router
from routers import users, bonds, fixtures, webpay

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bonds.router)
app.include_router(fixtures.router)
app.include_router(users.router)
app.include_router(webpay.router)


@app.get("/")
async def root():
    return {"message": "Hola! Bienvenido a la API de la entrega 1 - IIC2173 - Grupo 8"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
