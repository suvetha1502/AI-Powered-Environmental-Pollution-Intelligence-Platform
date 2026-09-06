import numpy as np

# WHO/standard background reference values for heavy metals (mg/kg)
BACKGROUND = {"arsenic": 15, "lead": 35, "cadmium": 0.3, "nickel": 50}

def compute_CF(metals: dict) -> dict:
    """Contamination Factor per metal"""
    return {m: round(v / BACKGROUND[m], 4) for m, v in metals.items() if m in BACKGROUND and v}

def compute_PLI(cf: dict) -> float:
    """Pollution Load Index"""
    vals = list(cf.values())
    return round(float(np.prod(vals) ** (1 / len(vals))), 4) if vals else 0.0

def compute_Igeo(metals: dict) -> dict:
    """Geo-accumulation Index"""
    return {m: round(np.log2(v / (1.5 * BACKGROUND[m])), 4)
            for m, v in metals.items() if m in BACKGROUND and v}

def compute_HPI(metals: dict) -> float:
    """Heavy Pollution Index"""
    weights = {"arsenic": 1, "lead": 1, "cadmium": 2, "nickel": 1}
    max_permissible = {"arsenic": 50, "lead": 50, "cadmium": 3, "nickel": 100}
    hpi = sum(weights.get(m, 1) * (v / max_permissible[m])
              for m, v in metals.items() if m in max_permissible and v)
    return round(hpi, 4)

def compute_MI(metals: dict) -> float:
    """Metal Index"""
    return round(sum(v / BACKGROUND[m] for m, v in metals.items()
                     if m in BACKGROUND and v), 4)

def compute_AQI(pm25: float, pm10: float, no2: float, so2: float) -> float:
    """Simplified AQI from key air parameters"""
    sub_indices = [
        min(500, (pm25 / 60) * 100),
        min(500, (pm10 / 100) * 100),
        min(500, (no2 / 80) * 100),
        min(500, (so2 / 80) * 100),
    ]
    return round(max(sub_indices), 2)

def compute_noise_index(leq: float) -> float:
    """Noise Pollution Index relative to 55 dB standard"""
    return round(leq - 55, 2)

def classify_risk(value: float, thresholds=(25, 50, 75)) -> str:
    if value < thresholds[0]:
        return "Low"
    elif value < thresholds[1]:
        return "Moderate"
    elif value < thresholds[2]:
        return "High"
    return "Critical"
