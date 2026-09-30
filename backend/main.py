from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.upload import router as upload_router

app = FastAPI(
    title="RapidFlood AI Backend",
    description="Automated system for rapid flood detection using Sentinel-1 SAR imagery",
    version="0.2.0"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static preview serving
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = Path("/tmp/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include routers
app.include_router(upload_router)

@app.get("/api/health")
def get_health():
    """Health check endpoint preserving Feature 1 contracts."""
    return {
        "status": "ok",
        "message": "RapidFlood AI backend is running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
