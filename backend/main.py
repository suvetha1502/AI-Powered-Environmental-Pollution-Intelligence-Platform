from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import pollution, prediction, gis, reports, alerts
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Pollution Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pollution.router, prefix="/api/pollution", tags=["Pollution Data"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["AI Prediction"])
app.include_router(gis.router, prefix="/api/gis", tags=["GIS Analytics"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])

@app.get("/")
def root():
    return {"message": "AI Pollution Intelligence Platform API"}
