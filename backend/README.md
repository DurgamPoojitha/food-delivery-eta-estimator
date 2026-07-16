# ⚡ DeliverIQ — Production ETA Engine

DeliverIQ is an interview-quality, production-ready microservice for estimating food delivery arrival times.

It calculates ETAs using the **Haversine formula** for great-circle GPS distance, combined with a realistic rules engine that accounts for traffic multipliers, restaurant busy levels, peak dispatch hours, weather delays, and weekend surges.

## Architecture
- **FastAPI**: High-performance async API framework.
- **Pydantic**: Type enforcement and payload validation.
- **Redis**: In-memory caching for repeated ETA requests (10 min TTL).
- **Docker**: Containerized environment for reproducibility.

---

## 🏗️ Clean Architecture

The backend has been upgraded from a simple script to a full production architecture:

```text
backend/
├── app/
│   ├── core/         ← Config & Logging (cross-cutting)
│   ├── exceptions/   ← Custom errors & Global handlers
│   ├── models/       ← Pydantic schemas (validations)
│   ├── routers/      ← HTTP layer (zero business logic)
│   ├── services/     ← Core business logic (ETA algorithms)
│   ├── db/           ← Redis client & connection pooling
│   └── utils/        ← Pure functions (Haversine math)
└── tests/            ← 70+ Pytest Integration & Unit Tests
```

---

## ✨ Enterprise Features

- **Advanced Rules Engine:** Implements realistic modifiers (e.g. 1.4x traffic slowdowns, +12 min peak hour delays).
- **Pydantic BaseSettings:** Single source of truth for all config, loaded from `.env`.
- **Global Error Handling:** All errors (404, 422, 500, custom) are caught and formatted into a uniform JSON shape for the frontend.
- **Structured Logging:** JSON logs in production (for Datadog/CloudWatch), colour-coded text in development.
- **Dockerized:** Multi-stage `Dockerfile` running as a non-root user for security, with a `docker-compose.yml` for instant local setup.
- **Rich Swagger Docs:** `Field(description=...)` and OpenAPI examples built into the models.
- **100% Type Hinted:** Fully compliant with `mypy` strict mode.

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)
```bash
# 1. Clone and navigate to backend
cd backend

# 2. Start the API and Redis via Docker Compose
docker compose up --build -d

# The API is now running at http://localhost:8000
# Redis is running at localhost:6379
```

### Option 2: Local Python
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

---

## 🧪 Testing

The test suite contains **73 tests** covering unit logic, boundary values, exception paths, and full API integration.

```bash
pip install -r requirements-dev.txt
pytest -v
```

---

## 📖 API Documentation

Once running, interactive API documentation is automatically available at:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### `POST /api/estimate`

**Request:**
```json
{
  "restaurant_name": "Burger Palace",
  "restaurant_lat": 51.5074,
  "restaurant_lon": -0.1278,
  "delivery_lat": 51.5155,
  "delivery_lon": -0.0922,
  "prep_time": 15,
  "traffic": "medium",
  "busy_level": "high",
  "peak_hour": "dinner",
  "weather": "rain",
  "is_weekend": true
}
```

**Response (200 OK):**
```json
{
  "restaurant_name": "Burger Palace",
  "distance_km": 2.62,
  "total_eta": 55.8,
  "delivery_status": "Delayed",
  "eta_breakdown": {
    "base_travel_time": 3.9,
    "traffic_delay": 1.6,
    "base_prep_time": 15.0,
    "busy_delay": 10.0,
    "peak_delay": 12.0,
    "weather_delay": 10.0,
    "weekend_delay": 5.0
  }
}
```
