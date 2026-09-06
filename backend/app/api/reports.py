from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.report_generator import generate_pdf_report
from io import BytesIO

router = APIRouter()

@router.get("/generate")
def generate_report(location: str = "Zone A"):
    indices = {"HPI": 42.5, "MI": 3.2, "PLI": 1.8, "AQI": 180, "Noise Index": 12.0}
    forecast = [180, 185, 178, 192, 200, 195, 188]
    pdf_bytes = generate_pdf_report(location, indices, "High", forecast)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{location}.pdf"},
    )
