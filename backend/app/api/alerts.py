from fastapi import APIRouter

from app.data_loader import load_real_alerts

router = APIRouter()
_alerts = load_real_alerts()


@router.get("/")
def get_alerts(acknowledged: bool = None):
    alerts = load_real_alerts()
    if acknowledged is None:
        return alerts
    return [a for a in alerts if a["acknowledged"] == acknowledged]


@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int):
    alerts = load_real_alerts()
    for a in alerts:
        if a["id"] == alert_id:
            a["acknowledged"] = True
            return {"status": "acknowledged"}
    return {"status": "not found"}
