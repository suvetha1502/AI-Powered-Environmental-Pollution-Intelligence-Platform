from fastapi import APIRouter
import datetime

router = APIRouter()

_alerts = [
    {"id": 1, "location": "Zone C", "risk": "Critical", "message": "Arsenic levels exceed safe limits", "timestamp": "2024-06-01T08:00:00", "acknowledged": False},
    {"id": 2, "location": "Zone A", "risk": "High", "message": "PM2.5 above WHO threshold", "timestamp": "2024-06-01T09:30:00", "acknowledged": False},
    {"id": 3, "location": "Zone B", "risk": "Moderate", "message": "Lead concentration rising", "timestamp": "2024-06-01T11:00:00", "acknowledged": True},
]

router = APIRouter()

@router.get("/")
def get_alerts(acknowledged: bool = None):
    if acknowledged is None:
        return _alerts
    return [a for a in _alerts if a["acknowledged"] == acknowledged]

@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int):
    for a in _alerts:
        if a["id"] == alert_id:
            a["acknowledged"] = True
            return {"status": "acknowledged"}
    return {"status": "not found"}
