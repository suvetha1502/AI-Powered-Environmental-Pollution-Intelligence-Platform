from fastapi import APIRouter
from app.models.schemas import PredictionRequest, PredictionResult, RiskLevel
from app.services.index_engine import classify_risk
from app.data_loader import load_real_pollution_records
import datetime

router = APIRouter()


def _extract_numeric_value(record: dict) -> float:
    params = record.get("parameters", {})
    if not isinstance(params, dict):
        return 0.0

    if "avg_value" in params:
        return float(params.get("avg_value", 0.0))
    if "TDS" in params:
        return float(params.get("TDS", 0.0))
    if "pH" in params:
        return float(params.get("pH", 0.0))

    numeric_values = []
    for value in params.values():
        try:
            numeric_values.append(float(value))
        except (TypeError, ValueError):
            continue
    return max(numeric_values) if numeric_values else 0.0


def _get_location_records(location: str, pollution_type: str, records: list[dict]) -> list[dict]:
    target = location.lower().strip()
    matches = [
        r for r in records
        if r.get("pollution_type") == pollution_type and str(r.get("location", "")).lower() == target
    ]
    if not matches:
        matches = [
            r for r in records
            if r.get("pollution_type") == pollution_type and target in str(r.get("location", "")).lower()
        ]
    if not matches:
        matches = [r for r in records if r.get("pollution_type") == pollution_type]
    return matches


@router.post("/forecast", response_model=PredictionResult)
def forecast_pollution(req: PredictionRequest):
    records = load_real_pollution_records()
    location_records = _get_location_records(req.location, req.pollution_type.value, records)
    series = [
        _extract_numeric_value(record)
        for record in location_records
        if _extract_numeric_value(record) > 0
    ]

    if not series:
        series = [float(req.features.get("current_value", 50.0))]

    recent = series[-min(7, len(series)):]
    if len(recent) == 1:
        forecast_values = [recent[0]] * req.forecast_days
    else:
        slope = (recent[-1] - recent[0]) / max(len(recent) - 1, 1)
        forecast_values = [round(max(0, recent[-1] + slope * (i + 1)), 2) for i in range(req.forecast_days)]

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
        pollution_type=req.pollution_type.value,
        forecast=forecast,
        risk_level=RiskLevel(risk),
        confidence=0.87,
    )

@router.get("/risk-zones")
def get_risk_zones():
    """Return dataset-driven risk zone data for dashboard"""
    records = load_real_pollution_records()
    zones = []
    seen = set()

    for record in records:
        location = record.get("location")
        if location in seen:
            continue
        seen.add(location)
        value = _extract_numeric_value(record)
        if value <= 0:
            continue
        zones.append({
            "location": location,
            "lat": record.get("latitude", 0.0),
            "lon": record.get("longitude", 0.0),
            "risk": classify_risk(value),
            "aqi": round(value, 2),
        })

    return zones[:8]
