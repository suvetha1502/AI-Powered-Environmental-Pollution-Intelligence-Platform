from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if pd.isna(value):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _risk_from_value(value: float) -> str:
    if value >= 80:
        return "Critical"
    if value >= 60:
        return "High"
    if value >= 35:
        return "Moderate"
    return "Low"


def get_dataset_file(name: str) -> Path:
    file_path = DATA_DIR / name
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset not found: {file_path}")
    return file_path


def load_real_pollution_records() -> list[dict]:
    records: list[dict] = []

    try:
        aqi_df = pd.read_csv(get_dataset_file("AQI.csv"))
        for index, row in aqi_df.head(50).iterrows():
            pollutant = str(row.get("pollutant_id", "AQI")).strip()
            avg_value = _safe_float(row.get("pollutant_avg"), 0.0)
            records.append(
                {
                    "id": len(records) + 1,
                    "location": str(row.get("city", "Unknown")),
                    "latitude": _safe_float(row.get("latitude")),
                    "longitude": _safe_float(row.get("longitude")),
                    "pollution_type": "air",
                    "parameters": {
                        "pollutant": pollutant,
                        "avg_value": avg_value,
                        "min_value": _safe_float(row.get("pollutant_min"), avg_value),
                        "max_value": _safe_float(row.get("pollutant_max"), avg_value),
                        "state": str(row.get("state", "Unknown")),
                        "station": str(row.get("station", "Unknown"))
                    },
                    "timestamp": str(row.get("last_update", "2025-05-19T10:00:00")),
                    "source": "AQI.csv",
                    "risk": _risk_from_value(avg_value),
                }
            )
    except FileNotFoundError:
        pass

    try:
        water_df = pd.read_csv(get_dataset_file("ground_water_quality_2020_post.csv"))
        for index, row in water_df.head(50).iterrows():
            records.append(
                {
                    "id": len(records) + 1,
                    "location": f"{row.get('district', 'Unknown')} - {row.get('mandal', 'Unknown')}",
                    "latitude": _safe_float(row.get("lat_gis")),
                    "longitude": _safe_float(row.get("long_gis")),
                    "pollution_type": "water",
                    "parameters": {
                        "pH": _safe_float(row.get("pH")),
                        "TDS": _safe_float(row.get("TDS")),
                        "EC": _safe_float(row.get("E.C")),
                        "chloride": _safe_float(row.get("Cl")),
                        "fluoride": _safe_float(row.get("F")),
                        "nitrate": _safe_float(row.get("NO3 ")),
                        "classification": str(row.get("Classification", "Unknown")),
                    },
                    "timestamp": "2020-post-monsoon",
                    "source": "ground_water_quality_2020_post.csv",
                    "risk": _risk_from_value(_safe_float(row.get("TDS"), 0.0) / 10.0),
                }
            )
    except FileNotFoundError:
        pass

    try:
        soil_df = pd.read_csv(get_dataset_file("soil_heavy_metal_dataset.csv"))
        for index, row in soil_df.head(50).iterrows():
            metals = {
                "As": _safe_float(row.get("As")),
                "Pb": _safe_float(row.get("Pb")),
                "Cd": _safe_float(row.get("Cd")),
                "Ni": _safe_float(row.get("Ni")),
                "Cr": _safe_float(row.get("Cr")),
                "Hg": _safe_float(row.get("Hg")),
            }
            max_metal = max(metals.values()) if metals else 0.0
            records.append(
                {
                    "id": len(records) + 1,
                    "location": f"Location {int(row.get('Location_ID', index + 1))}",
                    "latitude": _safe_float(row.get("Latitude")),
                    "longitude": _safe_float(row.get("Longitude")),
                    "pollution_type": "soil",
                    "parameters": {
                        **metals,
                        "soil_type": str(row.get("Soil_Type", "Unknown")),
                        "contamination_level": str(row.get("Contamination_Level", "Unknown")),
                    },
                    "timestamp": "2025-soil-sample",
                    "source": "soil_heavy_metal_dataset.csv",
                    "risk": _risk_from_value(max_metal),
                }
            )
    except FileNotFoundError:
        pass

    return records


def load_real_alerts(limit: int = 10) -> list[dict]:
    alerts: list[dict] = []
    for record in load_real_pollution_records()[:limit]:
        risk = record.get("risk", "Low")
        pollutant = ""
        params = record.get("parameters", {})
        if isinstance(params, dict):
            pollutant = params.get("pollutant") or params.get("classification") or record.get("pollution_type", "pollutant")

        alerts.append(
            {
                "id": record["id"],
                "location": record["location"],
                "risk": risk,
                "message": f"{record['pollution_type'].title()} data exceeds baseline for {pollutant or 'environmental quality'}.",
                "timestamp": record.get("timestamp", "2025-05-19T10:00:00"),
                "acknowledged": False,
            }
        )

    if not alerts:
        alerts = [
            {
                "id": 1,
                "location": "Dataset not available",
                "risk": "Low",
                "message": "No dataset file was found in the project data folder.",
                "timestamp": "2025-05-19T10:00:00",
                "acknowledged": False,
            }
        ]

    return alerts
