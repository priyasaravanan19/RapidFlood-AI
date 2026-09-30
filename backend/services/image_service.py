import os
from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image

# Graceful optional import for rasterio
try:
    import rasterio
except ImportError:
    rasterio = None


def format_file_size(size_bytes: int) -> str:
    """Format bytes into human readable string (KB, MB, GB)."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"


def extract_image_metadata(file_path: Path, original_filename: str) -> Dict[str, Any]:
    """
    Extract dimensional, format, and geospatial metadata from an uploaded image.
    Uses Rasterio for GeoTIFF if installed, with robust PIL fallback.
    """
    ext = file_path.suffix.lower()
    file_size = file_path.stat().st_size
    
    metadata: Dict[str, Any] = {
        "filename": original_filename,
        "saved_filename": file_path.name,
        "size_bytes": file_size,
        "size_formatted": format_file_size(file_size),
        "format": "Unknown",
        "dimensions": {
            "width": None,
            "height": None
        },
        "crs": None,
        "resolution": None,
        "bands": 1,
        "is_geotiff": False
    }

    is_tiff = ext in [".tif", ".tiff"]

    # 1. Attempt GeoTIFF extraction via Rasterio if available
    if is_tiff and rasterio is not None:
        try:
            with rasterio.open(str(file_path)) as dataset:
                metadata["dimensions"]["width"] = dataset.width
                metadata["dimensions"]["height"] = dataset.height
                metadata["crs"] = str(dataset.crs) if dataset.crs else "Not Defined"
                metadata["resolution"] = [round(float(r), 4) for r in dataset.res] if dataset.res else None
                metadata["bands"] = dataset.count
                metadata["format"] = "GeoTIFF"
                metadata["is_geotiff"] = True
                return metadata
        except Exception as e:
            # Fall back to PIL if rasterio encounters non-georeferenced TIFF
            pass

    # 2. PIL fallback for TIFF, PNG, JPG, JPEG
    try:
        with Image.open(str(file_path)) as img:
            metadata["dimensions"]["width"] = img.width
            metadata["dimensions"]["height"] = img.height
            
            if is_tiff:
                metadata["format"] = "GeoTIFF"
                metadata["is_geotiff"] = True
            elif img.format:
                metadata["format"] = img.format.upper()
            else:
                metadata["format"] = ext.lstrip(".").upper()
                
            metadata["bands"] = len(img.getbands()) if hasattr(img, "getbands") else 1
    except Exception as e:
        metadata["format"] = ext.lstrip(".").upper()

    return metadata
