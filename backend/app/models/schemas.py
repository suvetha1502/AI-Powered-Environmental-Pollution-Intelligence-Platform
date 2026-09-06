from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class PollutionType(str, Enum):
    air = "air"
    water = "water"
    soil = "soil"
    noise = "noise"
    heavy_metal = "heavy_metal"

class RiskLevel(str, Enum):
    low = "Low"
    moderate = "Moderate"
    high = "High"
    critical = "Critical"

class PollutionRecord(BaseModel):
    id: Optional[int] = None
    location: str
    latitude: float
    longitude: float
    pollution_type: PollutionType
    parameters: dict
    timestamp: str
    source: Optional[str] = None

class HeavyMetalRecord(BaseModel):
    location: str
    latitude: float
    longitude: float
    arsenic: Optional[float] = None
    lead: Optional[float] = None
    cadmium: Optional[float] = None
    nickel: Optional[float] = None
    timestamp: str

class PredictionRequest(BaseModel):
    location: str
    pollution_type: PollutionType
    features: dict
    forecast_days: int = 7

class PredictionResult(BaseModel):
    location: str
    pollution_type: str
    forecast: List[dict]
    risk_level: RiskLevel
    confidence: float

class IndexResult(BaseModel):
    location: str
    HPI: Optional[float] = None
    MI: Optional[float] = None
    PLI: Optional[float] = None
    CF: Optional[dict] = None
    Igeo: Optional[dict] = None
    AQI: Optional[float] = None
    noise_index: Optional[float] = None
    risk_level: RiskLevel
