from fastapi import APIRouter

router = APIRouter()

@router.get("/hotspots")
def get_hotspots():
    """GeoJSON FeatureCollection of pollution hotspots"""
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [80.27, 13.08]},
                "properties": {"name": "Industrial Zone A", "risk": "High", "pollutant": "PM2.5", "value": 180},
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [80.21, 13.05]},
                "properties": {"name": "River Basin B", "risk": "Moderate", "pollutant": "Lead", "value": 45},
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [80.30, 13.12]},
                "properties": {"name": "Mining Area C", "risk": "Critical", "pollutant": "Arsenic", "value": 310},
            },
        ],
    }

@router.get("/sources")
def get_pollution_sources():
    return [
        {"id": 1, "name": "Thermal Power Plant", "lat": 13.09, "lon": 80.28, "type": "air", "impact_radius_km": 5},
        {"id": 2, "name": "Chemical Factory", "lat": 13.06, "lon": 80.22, "type": "water", "impact_radius_km": 3},
        {"id": 3, "name": "Open Mine", "lat": 13.13, "lon": 80.31, "type": "soil", "impact_radius_km": 8},
    ]
