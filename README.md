# KSHETRA (क्षेत्र)
### Knowledge-based Humanitarian Emergency & Tactical Resource Allocation
> **“THE RIGHT RESOURCE. TO THE RIGHT PLACE. AT THE RIGHT TIME.”**  
> *“आपत्काले शीघ्रनिर्णयः प्राणान् रक्षति।” (In an emergency, a timely decision can save lives)*

---

## 📌 Executive Summary
**KSHETRA** is an AI-powered disaster response and emergency resource orchestration platform. Built specifically for high-density municipal emergency management (such as the Pune Municipal Corporation emergency division), KSHETRA ingests real-time incident reports across multi-modal channels (Live Camera Vision, Voice, Text), verifies severity, prioritizes affected zones, and dynamically optimizes tactical resource movements using Google OR-Tools Mathematical Integer Programming (MIP).

---

## 🌟 Core System Features

### 1. Dual Operational Experience
- **Public & Field Reporter Portal (`/report`)**:
  - Ultra-fast incident dispatch designed for field workers and citizens.
  - **Real Webcam Stream & Live CV Screening**: Powered by `navigator.mediaDevices.getUserMedia()` with controlled 2 FPS canvas frame sampling, real-time hazard classification/detection overlay, and high-resolution snapshot capture.
  - **Voice Ingestion**: Real-time microphone capture with Marathi & English Web Speech recognition.
  - **Live Geolocation**: Browser GPS resolution (`navigator.geolocation`) tagged to exact Pune locations (*Sinhagad Road, Sahakarnagar, Dandekar Bridge, Kondhwa, Parvati*).
- **Officer Command Center (`/dashboard`)**:
  - Operational Light-Themed emergency command interface.
  - Interactive Leaflet live map showing real-time incident markers, shelter depots, and priority zones.
  - **Verification Center**: Multi-level triage, audio sirens for critical alarms, and real-time status dispatch.
  - **Resource Optimization Engine**: Mathematical allocation and dynamic reallocation diff comparison (Before vs. After).
  - **Inter-Agency Task Dispatch**: Task matrix with duplicate effort warnings.
  - **System Audit & Decision Tracing**: Immutable event log with graph visualizer.

### 2. Design System (Light Theme Only)
KSHETRA enforces a light visual system based on the official emergency palette:
- **Vanilla Silk / Cream**: `#F8F4EE`, `#F4EDE3`
- **Alpine Oat & Greige**: `#D9CEC1`, `#B5A69D`
- **Cherry Velvet (Primary Brand)**: `#542126`
- **Deep Teal & Sage (Tactical & Success)**: `#2F7775`, `#718B78`
- **Muted Red (Critical Severity)**: `#9E3F45`
- **Charcoal (Typography)**: `#2E2E2E`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+ with pip

### Backend Setup (FastAPI & OR-Tools)
```bash
# 1. Navigate to project root
cd Kshetra

# 2. Install dependencies
pip install fastapi uvicorn ortools pydantic sqlalchemy pytest

# 3. Seed demo operational database
python -m db.seed

# 4. Start backend API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend runs at `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).

### Frontend Setup (Vite, React & TypeScript)
```bash
# 1. Navigate to web directory
cd apps/web

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev -- --host 127.0.0.1 --port 3000
```
Frontend runs at `http://127.0.0.1:3000`.

---

## 🧪 Testing
Run backend unit and integration test suite:
```bash
pytest tests/test_backend.py
```
Run frontend TypeScript and production bundle validation:
```bash
cd apps/web
npm run build
```

---

## 🎭 2019 Pune Flood Presentation Skit
A 5-member demonstration script simulating the 2019 Pune Flash Floods across Sinhagad Road, Sahakarnagar, Dandekar Bridge, Kondhwa, and Parvati is documented under [`docs/PRESENTATION_SKIT.md`](./docs/PRESENTATION_SKIT.md) and viewable directly inside the command center under **Settings & Policy**.

---

## 📄 License
Licensed for humanitarian emergency operations under the MIT License.
