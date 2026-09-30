import os
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.image_service import extract_image_metadata

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# Configuration
ALLOWED_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


async def process_and_save_upload(file: UploadFile, image_type: str) -> JSONResponse:
    """
    Validates, securely writes, and extracts metadata from an uploaded image.
    Enforces extension validation, non-empty validation, and 50MB size limit.
    """
    raw_filename = file.filename or "unknown"
    safe_suffix = Path(raw_filename).suffix.lower()

    # 1. Validate file extension
    if safe_suffix not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=400,
            content={
                "success": false,
                "message": f"Unsupported format '{safe_suffix}'. Allowed formats: GeoTIFF (.tif, .tiff), PNG, JPG, JPEG."
            }
        )

    # 2. Generate secure unique filename
    unique_id = uuid.uuid4().hex[:10]
    secure_filename = f"{image_type}_{unique_id}{safe_suffix}"
    destination_path = UPLOADS_DIR / secure_filename

    total_bytes = 0

    try:
        with open(destination_path, "wb") as out_file:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_bytes += len(chunk)

                if total_bytes > MAX_FILE_SIZE_BYTES:
                    # Exceeded 50 MB limit - cleanup and abort
                    out_file.close()
                    if destination_path.exists():
                        destination_path.unlink()
                    return JSONResponse(
                        status_code=400,
                        content={
                            "success": false,
                            "message": "File size exceeds 50 MB limit."
                        }
                    )
                out_file.write(chunk)

        # 3. Validate empty files
        if total_bytes == 0:
            if destination_path.exists():
                destination_path.unlink()
            return JSONResponse(
                status_code=400,
                content={
                    "success": false,
                    "message": "Uploaded file is empty (0 bytes)."
                }
            )

        # 4. Extract dimensional & geospatial metadata
        metadata = extract_image_metadata(destination_path, raw_filename)

        type_label = "Pre-flood" if image_type == "pre_flood" else "Post-flood"
        api_type_slug = "pre-flood" if image_type == "pre_flood" else "post-flood"

        return JSONResponse(
            status_code=200,
            content={
                "success": true,
                "type": api_type_slug,
                "filename": secure_filename,
                "original_filename": raw_filename,
                "size": total_bytes,
                "size_formatted": metadata.get("size_formatted"),
                "format": metadata.get("format"),
                "dimensions": metadata.get("dimensions"),
                "crs": metadata.get("crs"),
                "resolution": metadata.get("resolution"),
                "bands": metadata.get("bands"),
                "is_geotiff": metadata.get("is_geotiff"),
                "preview_url": f"/uploads/{secure_filename}",
                "message": f"{type_label} image uploaded successfully"
            }
        )

    except Exception as exc:
        if destination_path.exists():
            destination_path.unlink()
        return JSONResponse(
            status_code=500,
            content={
                "success": false,
                "message": f"Server error processing upload: {str(exc)}"
            }
        )
    finally:
        await file.close()


@router.post("/pre-flood")
async def upload_pre_flood(file: UploadFile = File(...)):
    """Upload and process Pre-Flood Sentinel-1 image."""
    return await process_and_save_upload(file, "pre_flood")


@router.post("/post-flood")
async def upload_post_flood(file: UploadFile = File(...)):
    """Upload and process Post-Flood Sentinel-1 image."""
    return await process_and_save_upload(file, "post_flood")
