
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.turno_router import router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
)

app.title = "turnosApi"  

app.include_router(router, tags=["turnos"], prefix="")


