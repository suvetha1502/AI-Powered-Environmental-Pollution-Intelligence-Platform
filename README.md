# AI-Powered Environmental Pollution Intelligence Platform

## Project Structure
```
AI-Pollution-Platform/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── models/           # Pydantic & DB models
│   │   ├── services/         # Business logic & ML
│   │   └── utils/            # Helpers
│   ├── main.py
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page-level components
│       ├── services/         # API calls
│       ├── context/          # React context
│       └── utils/            # Helper functions
└── .vscode/
```

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Modules
- **Data Ingestion**: Multi-source environmental data integration
- **Preprocessing**: Cleaning, imputation, normalization
- **AI Prediction**: Random Forest & XGBoost pollution forecasting
- **Index Computation**: HPI, MI, PLI, CF, Igeo, AQI, Noise Indices
- **GIS Analytics**: Hotspot mapping & spatial correlation
- **Risk Classification**: Low / Moderate / High / Critical alerts
- **Dashboard**: Real-time monitoring & trend analysis
- **Report Generation**: Automated PDF reports
