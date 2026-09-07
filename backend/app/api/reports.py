from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.data_loader import load_real_pollution_records
from app.services.report_generator import generate_pdf_report
from app.services.index_engine import classify_risk
from io import BytesIO

router = APIRouter()


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


@router.get("/generate")
def generate_report(location: str = "Vijayawada"):
    records = load_real_pollution_records()
    location_records = [
        r for r in records
        if str(r.get("location", "")).lower() == location.lower()
    ]
    if not location_records:
        location_records = [r for r in records if location.lower() in str(r.get("location", "")).lower()]
    if not location_records:
        location_records = records[:5]

    values = []
    for record in location_records:
        params = record.get("parameters", {})
        if isinstance(params, dict):
            for value in params.values():
                try:
                    values.append(float(value))
                except (TypeError, ValueError):
                    continue

    avg_value = round(sum(values) / len(values), 2) if values else 0.0
    risk_level = classify_risk(avg_value)
    indices = {
        "HPI": round(avg_value / 10, 2),
        "MI": round(avg_value / 20, 2),
        "PLI": round(avg_value / 30, 2),
        "AQI": round(avg_value, 2),
        "Noise Index": round(avg_value / 25, 2),
    }
    forecast = [round(max(0, avg_value + i * 2), 2) for i in range(7)]
    pdf_bytes = generate_pdf_report(location, indices, risk_level, forecast)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{location}.pdf"},
    )
