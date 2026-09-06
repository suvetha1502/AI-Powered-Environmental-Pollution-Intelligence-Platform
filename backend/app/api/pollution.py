from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import PollutionRecord, HeavyMetalRecord, IndexResult
from app.services.index_engine import (
    compute_CF, compute_PLI, compute_Igeo, compute_HPI,
    compute_MI, classify_risk
)
from app.services.preprocessor import validate_schema
import pandas as pd
import io

router = APIRouter()

_records: list = []
_processed_data: list = []

@router.post("/ingest")
def ingest_pollution(record: PollutionRecord):
    _records.append(record.model_dump())
    return {"status": "ingested", "id": len(_records)}

@router.get("/records")
def get_records(pollution_type: str = None):
    if pollution_type:
        return [r for r in _records if r["pollution_type"] == pollution_type]
    return _records

@router.post("/compute-indices")
def compute_indices(record: HeavyMetalRecord):
    metals = {
        "arsenic": record.arsenic,
        "lead": record.lead,
        "cadmium": record.cadmium,
        "nickel": record.nickel,
    }
    metals = {k: v for k, v in metals.items() if v is not None}
    cf = compute_CF(metals)
    hpi = compute_HPI(metals)
    return IndexResult(
        location=record.location,
        HPI=hpi,
        MI=compute_MI(metals),
        PLI=compute_PLI(cf),
        CF=cf,
        Igeo=compute_Igeo(metals),
        risk_level=classify_risk(hpi, (10, 30, 60)),
    )

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    global _processed_data
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
        # Map CSV columns to our metal names
        col_map = {"As": "arsenic", "Pb": "lead", "Cd": "cadmium", "Ni": "nickel"}
        results = []
        for _, row in df.iterrows():
            metals = {col_map[c]: float(row[c]) for c in col_map if c in row and pd.notna(row[c])}
            if not metals:
                continue
            cf = compute_CF(metals)
            hpi = compute_HPI(metals)
            results.append({
                "location_id": int(row.get("Location_ID", 0)),
                "latitude": float(row.get("Latitude", 0)),
                "longitude": float(row.get("Longitude", 0)),
                "soil_type": str(row.get("Soil_Type", "Unknown")),
                "metals": metals,
                "HPI": hpi,
                "MI": compute_MI(metals),
                "PLI": compute_PLI(cf),
                "CF": cf,
                "contamination_level": str(row.get("Contamination_Level", "")),
                "risk_level": classify_risk(hpi, (10, 30, 60)),
            })
        _processed_data = results
        return {"status": "processed", "total_records": len(results), "preview": results[:5]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/processed")
def get_processed_data(limit: int = 100):
    return _processed_data[:limit]

@router.get("/summary")
def get_summary():
    if not _processed_data:
        return {"message": "No data uploaded yet"}
    risk_counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    for r in _processed_data:
        risk_counts[r["risk_level"]] = risk_counts.get(r["risk_level"], 0) + 1
    avg_hpi = round(sum(r["HPI"] for r in _processed_data) / len(_processed_data), 2)
    avg_pli = round(sum(r["PLI"] for r in _processed_data) / len(_processed_data), 2)
    return {
        "total_records": len(_processed_data),
        "risk_distribution": risk_counts,
        "avg_HPI": avg_hpi,
        "avg_PLI": avg_pli,
    }
