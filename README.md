# RapidFlood AI

**Rapid Flood Mapping Using Sentinel-1 Synthetic Aperture Radar (SAR)**

RapidFlood AI is an automated disaster risk assessment and rapid flood detection platform. It processes Sentinel-1 radar imagery to map inundation extent, floodwater expansion, and analyze critical impacts across settlements, roads, and agricultural zones.

---

## Current Status: Initial Foundation

This repository currently implements the core foundation:
- **Backend**: Python FastAPI service with CORS enabled and `/api/health` endpoint.
- **Frontend**: Lightweight, high-performance vanilla web dashboard (HTML5, CSS3, Vanilla JavaScript) styled as an emergency operations command center.
- **Real-Time Connectivity**: Frontend polling that validates backend connectivity and updates the status indicator.

> **Note**: Advanced analytical modules (SAR pre/post-flood processing, Leaflet interactive mapping, GeoJSON vector overlays, infrastructure risk classification, reporting, and database storage) will be integrated in subsequent milestones.

---

## Project Structure

```text
rapid-flood-ai/
│
├── backend/
│   ├── main.py              # FastAPI application & health endpoint
│   ├── requirements.txt     # Python backend dependencies
│   └── uploads/             # Working directory for SAR imagery & artifacts
│
├── frontend/
│   ├── index.html           # Disaster-management command center markup
│   ├── css/
│   │   └── style.css        # Command center dark theme styling
│   └── js/
│       └── app.js           # Vanilla JS health monitoring and UI logic
│
└── README.md
```

---

## Getting Started

### 1. Backend Setup (FastAPI)

Prerequisites: Python 3.8+ (Python 3.12 recommended).

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell/CMD):
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend development server
uvicorn main:app --reload --port 8000
```

Verify backend health at:
- Endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup (HTML / CSS / Vanilla JS)

*No Node.js, npm, or build tools are required.*

Run a simple local HTTP server from the `frontend/` directory:

```bash
# Navigate to frontend directory
cd frontend

# Using Python's built-in HTTP server:
python -m http.server 3000
```

Open your browser at:
[http://127.0.0.1:3000](http://127.0.0.1:3000)

The dashboard will automatically connect to the FastAPI backend and display:
`● Backend Connected` (in green) or `● Backend Offline` (in red if the API is unreachable).

---

## Architectural Rules
- Strictly **Zero Node.js / React / Vite / Tailwind** dependencies for the frontend.
- Standard compliant HTML5, CSS3, and modern Vanilla ES6 JavaScript.
- Microservice ready FastAPI architecture with decoupled REST endpoints.
