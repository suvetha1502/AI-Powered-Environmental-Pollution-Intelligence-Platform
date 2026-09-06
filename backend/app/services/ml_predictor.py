import numpy as np
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def build_rf_pipeline():
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", RandomForestRegressor(n_estimators=100, random_state=42))
    ])

def build_xgb_pipeline():
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42, verbosity=0))
    ])

def train_and_predict(X_train, y_train, X_future, model_type="xgb"):
    pipeline = build_xgb_pipeline() if model_type == "xgb" else build_rf_pipeline()
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_future)
    return predictions.tolist()

def generate_mock_forecast(base_value: float, days: int = 7) -> list:
    """Generate synthetic forecast when no training data is available"""
    np.random.seed(42)
    trend = np.linspace(0, base_value * 0.1, days)
    noise = np.random.normal(0, base_value * 0.05, days)
    return [round(max(0, base_value + trend[i] + noise[i]), 2) for i in range(days)]
