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
        if col in df.columns:
            min_v, max_v = df[col].min(), df[col].max()
            if max_v != min_v:
                df[col] = (df[col] - min_v) / (max_v - min_v)
    return df

def validate_schema(data: dict, required_keys: list) -> tuple[bool, list]:
    missing = [k for k in required_keys if k not in data]
    return len(missing) == 0, missing
