import pandas as pd
import numpy as np

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Drop duplicates, impute missing numeric values with column median"""
    df = df.drop_duplicates()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    return df

def normalize(df: pd.DataFrame, cols: list) -> pd.DataFrame:
    for col in cols:
        if col not in df.columns:
            continue
        series = pd.to_numeric(df[col], errors='coerce')
        if series.dropna().empty:
            continue
        min_v, max_v = series.min(), series.max()
        if pd.notna(min_v) and pd.notna(max_v) and max_v != min_v:
            df[col] = (series - min_v) / (max_v - min_v)
    return df

def validate_schema(data: dict, required_keys: list) -> tuple[bool, list]:
    missing = [k for k in required_keys if k not in data]
    return len(missing) == 0, missing
