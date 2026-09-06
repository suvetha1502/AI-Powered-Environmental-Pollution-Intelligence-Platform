from fastapi import APIRouter
from app.models.schemas import PredictionRequest, PredictionResult, RiskLevel
from app.services.ml_predictor import generate_mock_forecast
from app.services.index_engine import classify_risk
import datetime

router = APIRouter()

@router.post("/forecast", response_model=PredictionResult)
def forecast_pollution(req: PredictionRequest):
    base = req.features.get("current_value", 50.0)
    forecast_values = generate_mock_forecast(base, req.forecast_days)
    avg = sum(forecast_values) / len(forecast_values)
    risk = classify_risk(avg)

    forecast = [
        {
            "day": (datetime.date.today() + datetime.timedelta(days=i + 1)).isoformat(),
            "value": v,
        }
        for i, v in enumerate(forecast_values)
    ]
    return PredictionResult(
        location=req.location,
        pollution_type=req.pollution_type,
        forecast=forecast,
        risk_level=RiskLevel(risk),
        confidence=0.87,
    )

@router.get("/risk-zones")
def get_risk_zones():
    """Return mock risk zone data for dashboard"""
    return [
        {"location": "Zone A", "lat": 13.08, "lon": 80.27, "risk": "High", "aqi": 180},
        {"location": "Zone B", "lat": 13.05, "lon": 80.21, "risk": "Moderate", "aqi": 95},
        {"location": "Zone C", "lat": 13.12, "lon": 80.30, "risk": "Critical", "aqi": 310},
        {"location": "Zone D", "lat": 13.00, "lon": 80.18, "risk": "Low", "aqi": 42},
    ]
