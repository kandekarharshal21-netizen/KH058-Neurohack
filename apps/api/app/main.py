import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, zones, incidents, resources, allocations, tasks, alerts, audit, demo, simulations, settings as settings_api
from app.realtime.websocket_manager import ws_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Knowledge-based Humanitarian Emergency & Tactical Resource Allocation API"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(zones.router, prefix=settings.API_PREFIX)
app.include_router(incidents.router, prefix=settings.API_PREFIX)
app.include_router(resources.router, prefix=settings.API_PREFIX)
app.include_router(allocations.router, prefix=settings.API_PREFIX)
app.include_router(tasks.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)
app.include_router(simulations.router, prefix=settings.API_PREFIX)
app.include_router(settings_api.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "product": "KSHETRA",
        "tagline": "Intelligence for Every Emergency Zone.",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

# Realtime WebSocket Endpoint
@app.websocket("/ws/operations")
async def websocket_operations(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keepalive loop
            data = await websocket.receive_text()
            await websocket.send_text(f'{{"event": "pong", "payload": "{data}"}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
