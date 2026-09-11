import os
import uuid
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Any

from app.services.cv_service import ComputerVisionService

router = APIRouter(prefix="/cv", tags=["Computer Vision"])

class FrameAnalysisRequest(BaseModel):
    image_base64: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

@router.post("/analyze")
async def analyze_frame_endpoint(payload: FrameAnalysisRequest):
    """
    Direct endpoint for real-time live webcam frame analysis (2-5 fps).
    Processes actual camera frame, returns real bounding boxes (GREEN for Fire),
    real confidence, and detected hazard class.
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 payload is required")

    result = ComputerVisionService.analyze_frame(payload.image_base64)
    return result

@router.post("/upload-analyze")
async def upload_analyze_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for user uploaded disaster evidence image files (PNG, JPEG, WebP).
    """
    contents = await file.read()
    result = ComputerVisionService.analyze_frame(contents)
    return result

@router.post("/video-analyze")
async def video_analyze_endpoint(file: UploadFile = File(...), fps_sample: int = 2):
    """
    Processes an uploaded disaster video (MP4, WebM, AVI).
    Performs frame extraction, temporal disaster detection, and peak risk aggregation.
    """
    suffix = os.path.splitext(file.filename or ".mp4")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video:
        temp_path = temp_video.name
        contents = await file.read()
        temp_video.write(contents)

    try:
        result = ComputerVisionService.analyze_video_file(temp_path, fps_sample=fps_sample)
        return result
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
