from fastapi import APIRouter

from app.data_loader import load_real_pollution_records
from app.services.index_engine import classify_risk

router = APIRouter()


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


@router.get("/hotspots")
def get_hotspots():
    """GeoJSON FeatureCollection of pollution hotspots built from real CSV records."""
    records = load_real_pollution_records()
    features = []
    seen = set()

    for record in records:
        location = str(record.get("location", "")).strip()
        if not location or location in seen:
            continue
        seen.add(location)

        value = 0.0
        params = record.get("parameters", {})
        if isinstance(params, dict):
            if "avg_value" in params:
                value = _safe_float(params.get("avg_value", 0.0))
            elif "TDS" in params:
                value = _safe_float(params.get("TDS", 0.0))
            else:
                numeric_values = []
                for raw in params.values():
                    try:
                        numeric_values.append(float(raw))
                    except (TypeError, ValueError):
                        continue
                value = max(numeric_values) if numeric_values else 0.0

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    _safe_float(record.get("longitude", 0.0)),
                    _safe_float(record.get("latitude", 0.0)),
                ],
            },
            "properties": {
                "name": location,
                "risk": classify_risk(value),
                "pollutant": record.get("pollution_type", "unknown").title(),
                "value": round(value, 2),
            },
        })

    return {"type": "FeatureCollection", "features": features[:20]}


@router.get("/sources")
def get_pollution_sources():
    records = load_real_pollution_records()
    sources = []

    for idx, record in enumerate(records[:15], start=1):
        sources.append({
            "id": idx,
            "name": f"{record.get('pollution_type', 'Pollution').title()} Source - {record.get('location', 'Unknown')}",
            "lat": _safe_float(record.get("latitude", 0.0)),
            "lon": _safe_float(record.get("longitude", 0.0)),
            "type": record.get("pollution_type", "air"),
            "impact_radius_km": 5 if record.get("pollution_type") == "air" else 3,
        })

    return sources
