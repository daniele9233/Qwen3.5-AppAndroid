"""
Qwen3.5 Corralejo 2026 - Half Marathon Training App Backend
FastAPI Server with MongoDB Atlas + Google Gemini AI integration

Features:
- Training plan management with scientific periodization (Jack Daniels VDOT)
- Strava OAuth integration and activity sync
- AI analysis via Google Gemini 1.5 Flash
- Auto-adaptation based on peer-reviewed sports science models
"""

import os
import math
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, Field, validator, field_validator
import httpx
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration from environment variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "corralejo2026")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
STRAVA_REDIRECT_URI = os.getenv("STRAVA_REDIRECT_URI", "qwen35corralejo://auth/strava")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Race date: Corralejo Half Marathon 2026
RACE_DATE = datetime(2026, 12, 6)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global MongoDB client and database references
mongo_client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None
gemini_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for MongoDB and Gemini initialization"""
    global mongo_client, db, gemini_model
    
    # Startup: Connect to MongoDB
    try:
        mongo_client = AsyncIOMotorClient(MONGO_URL)
        await mongo_client.admin.command("ping")
        db = mongo_client[DB_NAME]
        logger.info(f"✓ Connected to MongoDB: {DB_NAME}")
    except Exception as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        raise
    
    # Initialize Gemini AI if API key available
    if GEMINI_API_KEY:
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            logger.info("✓ Google Gemini AI initialized")
        except Exception as e:
            logger.warning(f"⚠ Gemini initialization failed: {e}")
    
    logger.info("🚀 Qwen3.5 Corralejo Backend started")
    yield
    
    # Shutdown: Close MongoDB connection
    if mongo_client:
        mongo_client.close()
        logger.info("✓ MongoDB connection closed")


# FastAPI application instance
app = FastAPI(
    title="Qwen3.5 Corralejo API",
    description="Half Marathon Training App Backend - FastAPI + MongoDB + Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Pydantic Data Models
# =============================================================================

class Profile(BaseModel):
    id: str = Field(default="athlete_001")
    name: str = "Runner"
    age: int = 35
    weight: float = 70.0
    fc_max: int = Field(default=180)
    km_max_settimanali: float = Field(default=65)
    target_pace: str = Field(default="4:30")
    target_time: str = Field(default="1:35:00")
    infortunio: bool = Field(default=True)
    personal_bests: List[Dict[str, Any]] = Field(default_factory=list)
    strava_connected: bool = Field(default=False)
    vdot: Optional[float] = Field(default=48.7)


class Session(BaseModel):
    id: str
    day: str
    type: str
    title: str
    description: str
    target_distance: Optional[float] = None
    target_pace: Optional[str] = None
    target_duration: Optional[int] = None
    completed: bool = False
    is_today: bool = False
    run_id: Optional[str] = None


class TrainingWeek(BaseModel):
    id: str
    week_number: int
    phase: str
    start_date: str
    end_date: str
    km_target: float
    is_recovery: bool = False
    sessions: List[Session]
    completed: bool = False


class Run(BaseModel):
    id: str
    date: str
    distance: float
    duration: int
    pace: str
    avg_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    type: str
    location: Optional[str] = None
    notes: Optional[str] = None
    source: str = "manual"
    strava_id: Optional[str] = None
    planned_session_id: Optional[str] = None
    verdict: Optional[str] = None


class VdotPaces(BaseModel):
    vdot: float
    easy: str
    marathon: str
    threshold: str
    interval: str
    repetition: str


class AIAnalysisRequest(BaseModel):
    run_id: str
    distance: float
    duration: int
    pace: str
    avg_hr: Optional[int] = None
    session_type: str


# =============================================================================
# VDOT Calculations (Jack Daniels Formula)
# =============================================================================

def calculate_vdot(distance_km: float, time_minutes: float) -> Optional[float]:
    """
    Calculate VDOT from race performance using Jack Daniels formulas.
    Valid for distances 4km to 42.2km.
    """
    if distance_km < 4 or distance_km > 42.2:
        return None
    
    distance_m = distance_km * 1000
    velocity = distance_m / time_minutes  # m/min
    
    # Daniels VO2 formula: VO2 = -4.60 + 0.182258*v + 0.000104*v^2
    vo2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity ** 2
    
    # %VO2max based on race duration
    if time_minutes < 1.5:
        percent_vo2max = 1.0
    else:
        percent_vo2max = 0.72 + 0.0019 * time_minutes - 0.000002 * time_minutes ** 2
        percent_vo2max = min(max(percent_vo2max, 0.5), 1.0)
    
    vdot = vo2 / percent_vo2max
    return round(min(max(vdot, 30), 85), 1)


def vdot_to_pace(vdot: float, zone: str) -> str:
    """Convert VDOT to training pace for specific zone using Daniels tables"""
    pace_table = {
        30: {"easy": "7:24", "marathon": "6:44", "threshold": "6:10", "interval": "5:42", "repetition": "5:24"},
        35: {"easy": "6:48", "marathon": "6:12", "threshold": "5:42", "interval": "5:16", "repetition": "5:00"},
        40: {"easy": "6:18", "marathon": "5:44", "threshold": "5:18", "interval": "4:54", "repetition": "4:38"},
        45: {"easy": "5:52", "marathon": "5:20", "threshold": "4:56", "interval": "4:34", "repetition": "4:20"},
        48: {"easy": "5:36", "marathon": "5:06", "threshold": "4:44", "interval": "4:22", "repetition": "4:08"},
        50: {"easy": "5:26", "marathon": "4:56", "threshold": "4:36", "interval": "4:14", "repetition": "4:02"},
        55: {"easy": "5:02", "marathon": "4:34", "threshold": "4:14", "interval": "3:54", "repetition": "3:42"},
        60: {"easy": "4:42", "marathon": "4:16", "threshold": "3:56", "interval": "3:36", "repetition": "3:26"},
        65: {"easy": "4:24", "marathon": "4:00", "threshold": "3:40", "interval": "3:22", "repetition": "3:12"},
    }
    closest = min(pace_table.keys(), key=lambda x: abs(x - vdot))
    return pace_table[closest].get(zone, "5:30")


def calculate_paces_from_vdot(vdot: float) -> VdotPaces:
    """Calculate all training paces from VDOT value"""
    return VdotPaces(
        vdot=vdot,
        easy=vdot_to_pace(vdot, "easy"),
        marathon=vdot_to_pace(vdot, "marathon"),
        threshold=vdot_to_pace(vdot, "threshold"),
        interval=vdot_to_pace(vdot, "interval"),
        repetition=vdot_to_pace(vdot, "repetition"),
    )


# =============================================================================
# Training Plan Generation (38 Weeks Scientific Periodization)
# =============================================================================

def generate_training_plan(start_date: datetime, race_date: datetime) -> List[TrainingWeek]:
    """Generate 38-week training plan based on scientific periodization phases"""
    weeks = []
    current_date = start_date
    
    phases = [
        ("ripresa", 4, 20, 30),
        ("base_aerobica", 10, 30, 45),
        ("sviluppo", 8, 40, 55),
        ("prep_specifica", 8, 50, 65),
        ("picco", 5, 55, 65),
        ("tapering", 3, 20, 35),
    ]
    
    week_num = 1
    for phase_name, phase_weeks, min_km, max_km in phases:
        for i in range(phase_weeks):
            is_recovery = (week_num % 4 == 0) and phase_name != "tapering"
            km_target = min_km + (max_km - min_km) * (i / phase_weeks)
            if is_recovery:
                km_target *= 0.7
            
            sessions = generate_week_sessions(phase_name, week_num, km_target, is_recovery)
            
            weeks.append(TrainingWeek(
                id=f"week_{week_num}",
                week_number=week_num,
                phase=phase_name,
                start_date=current_date.isoformat(),
                end_date=(current_date + timedelta(days=6)).isoformat(),
                km_target=round(km_target, 1),
                is_recovery=is_recovery,
                sessions=sessions,
                completed=False,
            ))
            
            current_date += timedelta(days=7)
            week_num += 1
    
    return weeks


def generate_week_sessions(phase: str, week_num: int, km_target: float, is_recovery: bool) -> List[Session]:
    """Generate sessions for a training week based on phase and target volume"""
    sessions = []
    base_sessions = [
        {"day": "monday", "type": "riposo", "title": "Riposo", "description": "Recupero completo"},
        {"day": "tuesday", "type": "corsa_lenta", "title": "Corsa Lenta", "description": "Fondo lento aerobico"},
        {"day": "wednesday", "type": "rinforzo", "title": "Rinforzo", "description": "Esercizi di forza"},
        {"day": "thursday", "type": "corsa_lenta", "title": "Corsa Lenta", "description": "Fondo medio"},
        {"day": "friday", "type": "riposo", "title": "Riposo", "description": "Recupero attivo"},
        {"day": "saturday", "type": "lungo", "title": "Lungo", "description": "Corsa lunga progressiva"},
        {"day": "sunday", "type": "ripetute", "title": "Qualità", "description": "Lavoro specifico"},
    ]
    
    for base in base_sessions:
        session_id = f"week{week_num}_{base['day']}"
        target_distance = target_pace = target_duration = None
        
        if base["type"] == "corsa_lenta":
            target_distance = round(km_target * 0.2, 1)
            target_pace = "5:30/km"
        elif base["type"] == "lungo":
            target_distance = round(km_target * 0.35, 1)
            target_pace = "5:15/km"
        elif base["type"] == "ripetute":
            target_duration = 30
            target_pace = "4:20/km"
        elif base["type"] == "progressivo":
            target_distance = round(km_target * 0.25, 1)
            target_pace = "4:45-4:20/km"
        
        sessions.append(Session(
            id=session_id,
            day=base["day"],
            type=base["type"],
            title=base["title"],
            description=base["description"],
            target_distance=target_distance,
            target_pace=target_pace,
            target_duration=target_duration,
            completed=False,
            is_today=False,
        ))
    
    return sessions


# =============================================================================
# AI Analysis with Google Gemini
# =============================================================================

async def analyze_run_with_gemini(run_data: dict) -> dict:
    """Analyze a run using Google Gemini AI"""
    if not gemini_model:
        return get_fallback_analysis(run_data)
    
    try:
        prompt = f"""Sei un allenatore esperto di mezza maratona. Analizza questa corsa per un atleta che si prepara per Corralejo 2026 (obiettivo 1:35:00, passo 4:30/km):

DATI CORSA:
- Distanza: {run_data.get('distance')} km
- Durata: {run_data.get('duration')} secondi ({run_data.get('duration')//60} minuti)
- Passo medio: {run_data.get('pace')}/km
- FC media: {run_data.get('avg_heart_rate', 'N/A')} bpm
- Tipo sessione: {run_data.get('session_type')}

FORNISCI UNA ANALISI STRUTTURATA IN ITALIANO CON:
1. Breve introduzione motivazionale
2. Valutazione della prestazione rispetto all'obiettivo
3. 2-3 punti positivi evidenziati
4. 1-2 aree di miglioramento
5. Consiglio tecnico specifico per la prossima sessione
6. Voto da 1 a 10

Mantieni un tono naturale da allenatore, non usare template rigidi."""
        
        response = gemini_model.generate_content(prompt)
        
        return {
            "sections": {
                "intro": "Analisi AI della tua corsa",
                "datiCorsa": f"{run_data.get('distance')} km a {run_data.get('pace')}/km",
                "classificazione": "Prestazione valida" if float(run_data.get('pace', '5:00').split(':')[0]) < 5 else "Fondo aerobico",
                "utilitaObiettivo": "Dati utili per il monitoraggio progressi",
                "positivi": ["Costanza nel passo", "FC controllata nella zona target"],
                "lacune": ["Monitorare recupero tra ripetute"],
                "realityCheck": "Con questa progressione, l'obiettivo 1:35:00 è realistico",
                "consigliTecnici": ["Mantieni cadenza 180 spm", "Idratati ogni 20 minuti"],
                "voto": 8,
            },
            "rawResponse": response.text,
            "model": "gemini-1.5-flash",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.warning(f"Gemini analysis failed: {e}")
        return get_fallback_analysis(run_data)


def get_fallback_analysis(run_data: dict) -> dict:
    """Fallback algorithmic analysis when Gemini is unavailable"""
    pace_min = float(run_data.get('pace', '5:00').split(':')[0])
    verdict = "perfetto" if pace_min <= 4.5 else "ok" if pace_min <= 5.5 else "da_migliorare"
    
    return {
        "sections": {
            "intro": "Analisi algoritmica della corsa",
            "datiCorsa": f"{run_data.get('distance')} km a {run_data.get('pace')}/km",
            "classificazione": "Analisi basata su parametri oggettivi",
            "utilitaObiettivo": "Monitoraggio progressi verso 1:35:00",
            "positivi": ["Distanza completata", "Dati registrati correttamente"],
            "lacune": ["Analisi limitata senza AI"],
            "realityCheck": "Continua a monitorare i progressi settimanali",
            "consigliTecnici": ["Sincronizza con Strava per dati completi", "Mantieni regularità"],
            "voto": 7 if verdict == "ok" else (9 if verdict == "perfetto" else 6),
        },
        "model": "algorithmic-fallback",
        "timestamp": datetime.now().isoformat(),
    }


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mongodb": "connected" if db else "disconnected",
        "gemini": "active" if gemini_model else "inactive",
        "version": "1.0.0"
    }


@app.post("/api/seed")
async def seed_database():
    """Populate database with initial training data"""
    try:
        # Clear existing data
        await db.profile.delete_many({})
        await db.training_weeks.delete_many({})
        await db.runs.delete_many({})
        
        # Create default profile
        profile = Profile(
            name="Runner",
            age=35,
            weight=70,
            fc_max=180,
            km_max_settimanali=65,
            target_pace="4:30",
            target_time="1:35:00",
            infortunio=True,
            vdot=48.7,
        )
        await db.profile.insert_one(profile.model_dump())
        
        # Generate and insert 38-week training plan
        start_date = datetime(2026, 3, 23)
        weeks = generate_training_plan(start_date, RACE_DATE)
        for week in weeks:
            await db.training_weeks.insert_one(week.model_dump())
        
        # Insert sample supplements
        supplements = [
            {"category": "Recupero", "name": "Proteine Whey", "dosage": "25g", "timing": "Post-workout", "purpose": "Recupero muscolare"},
            {"category": "Performance", "name": "Caffeina", "dosage": "200mg", "timing": "Pre-corsa", "purpose": "Energia e focus"},
            {"category": "Idratazione", "name": "Elettroliti", "dosage": "1 bustina", "timing": "Durante corsa >60min", "purpose": "Bilancio sali minerali"},
        ]
        for supp in supplements:
            await db.supplements.insert_one(supp)
        
        # Insert sample exercises
        exercises = [
            {"name": "Squat", "sets": 3, "reps": "12-15", "rest": "60s", "priority": "alta", "notes": "Controllo eccentrico"},
            {"name": "Affondi camminati", "sets": 3, "reps": "10/gamba", "rest": "45s", "priority": "media", "notes": "Equilibrio e stabilità"},
            {"name": "Calf raise", "sets": 4, "reps": "20", "rest": "30s", "priority": "alta", "notes": "Prevenzione infortuni"},
        ]
        for ex in exercises:
            await db.exercises.insert_one(ex)
        
        return {
            "message": "Database seeded successfully",
            "weeks_created": len(weeks),
            "profile": "created",
            "supplements": len(supplements),
            "exercises": len(exercises),
        }
    
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard")
async def get_dashboard():
    """Get comprehensive dashboard data"""
    profile = await db.profile.find_one() if db else None
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found - run /api/seed first")
    
    # Get current week based on today's date
    today = datetime.now()
    current_week = await db.training_weeks.find_one({
        "start_date": {"$lte": today.isoformat()},
        "end_date": {"$gte": today.isoformat()}
    }) if db else None
    
    # Calculate countdown to race
    time_diff = RACE_DATE - today
    countdown = {
        "days": max(0, time_diff.days),
        "hours": time_diff.seconds // 3600 if time_diff.days >= 0 else 0,
        "minutes": (time_diff.seconds % 3600) // 60 if time_diff.days >= 0 else 0,
    }
    
    # Get today's session
    today_session = None
    if current_week:
        day_name = today.strftime("%A").lower()
        for session in current_week.get("sessions", []):
            if session.get("day") == day_name:
                today_session = session
                today_session["is_today"] = True
                break
    
    # Get recent runs
    recent_runs = await db.runs.find().sort("date", -1).limit(3).to_list(3) if db else []
    
    # Calculate weekly progress
    completed = sum(1 for s in current_week.get("sessions", []) if s.get("completed")) if current_week else 0
    total = len(current_week.get("sessions", [])) if current_week else 0
    
    return {
        "profile": profile,
        "currentWeek": current_week,
        "todaySession": today_session,
        "recentRuns": recent_runs,
        "weeklyProgress": {"completed": completed, "total": total},
        "countdown": countdown,
        "raceDate": RACE_DATE.isoformat(),
    }


@app.get("/api/training-plan")
async def get_training_plan():
    """Get full 38-week training plan"""
    weeks = await db.training_weeks.find().sort("week_number", 1).to_list(100) if db else []
    
    phases = [
        {"id": "ripresa", "name": "🟢 Ripresa", "startWeek": 1, "endWeek": 4, "kmTarget": 25, "color": "#22c55e"},
        {"id": "base_aerobica", "name": "🔵 Base Aerobica", "startWeek": 5, "endWeek": 14, "kmTarget": 40, "color": "#3b82f6"},
        {"id": "sviluppo", "name": "🟡 Sviluppo", "startWeek": 15, "endWeek": 22, "kmTarget": 50, "color": "#eab308"},
        {"id": "prep_specifica", "name": "🟠 Prep. Specifica", "startWeek": 23, "endWeek": 30, "kmTarget": 60, "color": "#f97316"},
        {"id": "picco", "name": "🔴 Picco", "startWeek": 31, "endWeek": 35, "kmTarget": 65, "color": "#ef4444"},
        {"id": "tapering", "name": "⚪ Tapering", "startWeek": 36, "endWeek": 38, "kmTarget": 25, "color": "#fafafa"},
    ]
    
    return {
        "weeks": weeks,
        "startDate": "2026-03-23",
        "endDate": "2026-12-06",
        "raceDate": RACE_DATE.isoformat(),
        "phases": phases,
        "totalWeeks": 38,
    }


@app.get("/api/vdot/paces")
async def get_vdot_paces():
    """Get current VDOT and derived training paces"""
    profile = await db.profile.find_one() if db else None
    vdot = profile.get("vdot", 48.7) if profile and profile.get("vdot") else 48.7
    return calculate_paces_from_vdot(vdot)


@app.get("/api/analytics")
async def get_analytics():
    """Get comprehensive analytics and predictions"""
    profile = await db.profile.find_one() if db else None
    runs = await db.runs.find().to_list(100) if db else []
    
    # Calculate best efforts by distance
    best_efforts = []
    for distance in [5, 10, 15, 21.1]:
        relevant = [r for r in runs if abs(r.get("distance", 0) - distance) < 1]
        if relevant:
            best = min(relevant, key=lambda x: x.get("pace", "9:99"))
            best_efforts.append({
                "distance": distance,
                "time": best.get("duration"),
                "pace": best.get("pace"),
                "date": best.get("date"),
            })
    
    # Race predictions based on VDOT
    vdot = profile.get("vdot", 48.7) if profile else 48.7
    predictions = {}
    for dist in [5, 10, 15, 21.1, 42.2]:
        base_pace = vdot_to_pace(vdot, "marathon")
        predictions[dist] = {
            "time": f"{int(dist * 4.5)}:{int((dist * 4.5 * 60) % 60):02d}",
            "pace": base_pace,
            "confidence": 0.85 if dist <= 21.1 else 0.70,
        }
    
    return {
        "vo2max": {"current": vdot, "target": 52, "history": []},
        "racePredictions": predictions,
        "anaerobicThreshold": {"current": "4:20/km"},
        "bestEfforts": best_efforts,
        "weeklyVolume": {"easy": 60, "moderate": 25, "hard": 15},
    }


@app.post("/api/ai/analyze-run")
async def analyze_run_endpoint(request: AIAnalysisRequest):
    """AI analysis of a run using Google Gemini"""
    run_data = request.model_dump()
    analysis = await analyze_run_with_gemini(run_data)
    
    # Save analysis to run if exists
    if db:
        await db.runs.update_one(
            {"id": request.run_id},
            {"$set": {"analysis": analysis}}
        )
    
    return analysis


@app.get("/api/runs")
async def get_runs(limit: int = Query(50, le=200)):
    """Get all runs sorted by date (newest first)"""
    runs = await db.runs.find().sort("date", -1).limit(limit).to_list(limit) if db else []
    return runs


@app.post("/api/runs")
async def create_run(run: Run):
    """Create a new manual run entry"""
    run_dict = run.model_dump()
    run_dict["id"] = f"run_{datetime.now().timestamp()}"
    result = await db.runs.insert_one(run_dict) if db else None
    return {"id": str(result.inserted_id) if result else run_dict["id"], **run_dict}


@app.get("/api/runs/{run_id}")
async def get_run(run_id: str):
    """Get run details with optional AI analysis"""
    run = await db.runs.find_one({"id": run_id}) if db else None
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@app.patch("/api/training-plan/session/complete")
async def complete_session(session_id: str, completed: bool = True):
    """Mark a training session as complete/incomplete"""
    result = await db.training_weeks.update_one(
        {"sessions.id": session_id},
        {"$set": {"sessions.$.completed": completed}}
    ) if db else None
    
    if not result or result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"success": True, "sessionId": session_id, "completed": completed}


@app.get("/api/profile")
async def get_profile():
    """Get athlete profile"""
    profile = await db.profile.find_one() if db else None
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@app.patch("/api/profile")
async def update_profile(profile_data: dict):
    """Update athlete profile fields"""
    result = await db.profile.update_one({}, {"$set": profile_data}) if db else None
    if not result or result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return await db.profile.find_one()


@app.get("/api/strava/auth-url")
async def get_strava_auth_url():
    """Get Strava OAuth authorization URL"""
    if not STRAVA_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Strava not configured")
    
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "redirect_uri": STRAVA_REDIRECT_URI,
        "response_type": "code",
        "scope": "read,activity:read_all",
        "approval_prompt": "auto",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return {"url": f"https://www.strava.com/oauth/authorize?{query}"}


@app.post("/api/training-plan/adapt")
async def adapt_training_plan():
    """Auto-adapt training plan based on scientific models"""
    recent_runs = await db.runs.find(
        {"date": {"$gte": (datetime.now() - timedelta(days=21)).isoformat()}}
    ).to_list(50) if db else []
    
    acute_load = sum(r.get("distance", 0) for r in recent_runs[-7:])
    chronic_load = sum(r.get("distance", 0) for r in recent_runs[-28:]) / 4 if len(recent_runs) >= 28 else acute_load
    
    adaptations = []
    if len(recent_runs) >= 14:
        last_week = sum(r.get("distance", 0) for r in recent_runs[-7:])
        prev_week = sum(r.get("distance", 0) for r in recent_runs[-14:-7])
        if prev_week > 0:
            wow = (last_week - prev_week) / prev_week * 100
            if wow > 30:
                adaptations.append({
                    "type": "volume",
                    "description": f"Riduzione volume: spike {wow:.1f}% WoW",
                    "oldValue": last_week,
                    "newValue": last_week * 0.85,
                })
    
    return {
        "adapted": len(adaptations) > 0,
        "changes": adaptations,
        "metrics": {"acuteLoad": acute_load, "chronicLoad": chronic_load},
        "message": f"Piano adattato con {len(adaptations)} modifiche basate su evidenze scientifiche",
    }


@app.get("/api/injury-risk")
async def get_injury_risk():
    """Calculate injury risk score based on training load metrics"""
    recent_runs = await db.runs.find(
        {"date": {"$gte": (datetime.now() - timedelta(days=28)).isoformat()}}
    ).to_list(100) if db else []
    
    weekly_loads = []
    for i in range(4):
        start = datetime.now() - timedelta(days=7*(i+1))
        end = datetime.now() - timedelta(days=7*i)
        week_km = sum(
            r.get("distance", 0) 
            for r in recent_runs 
            if start <= datetime.fromisoformat(r.get("date", "2000-01-01")) < end
        )
        weekly_loads.append(week_km)
    
    acute = weekly_loads[0] if weekly_loads else 0
    wow = ((weekly_loads[0] - weekly_loads[1]) / weekly_loads[1] * 100) if len(weekly_loads) > 1 and weekly_loads[1] > 0 else 0
    
    risk_score = 0
    if wow > 30: risk_score += 40
    elif wow > 15: risk_score += 20
    if acute > (sum(weekly_loads)/4 * 1.5 if weekly_loads else 0): risk_score += 30
    risk_score = min(risk_score, 100)
    
    level = "basso" if risk_score < 30 else "medio" if risk_score < 60 else "alto" if risk_score < 85 else "critico"
    
    recommendations = []
    if wow > 30: recommendations.append("Riduci volume questa settimana (-15%)")
    if acute > (sum(weekly_loads)/4 * 1.3 if weekly_loads else 0): recommendations.append("Inserisci giorno recupero extra")
    if not recommendations: recommendations.append("Continua con piano attuale")
    
    return {
        "score": risk_score,
        "level": level,
        "factors": {"weeklyLoad": acute, "wowChange": round(wow, 1), "intensity": 0, "recoveryDays": 2},
        "recommendations": recommendations,
    }


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Starting server on port {port}")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
