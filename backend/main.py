from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import json
import os
import hashlib
import hmac
import secrets
import base64
import logging

from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

from typing import List, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vitalsync")

# =========================
# LOAD ENV
# =========================
load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

if not API_KEY:
    raise Exception("OPENROUTER_API_KEY not found in .env")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

LANG_NAMES = {"tr": "Turkish", "en": "English", "pl": "Polish"}


# =========================
# PASSWORD HASHING (PBKDF2, stdlib only)
# =========================
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), 100_000
    ).hex()
    return f"pbkdf2${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    if stored and stored.startswith("pbkdf2$"):
        try:
            _, salt, digest = stored.split("$", 2)
        except ValueError:
            return False
        check = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt), 100_000
        ).hex()
        return hmac.compare_digest(check, digest)
    # legacy plaintext rows (pre-hashing) — still comparable, upgraded on login
    return hmac.compare_digest(stored or "", password)

# =========================
# DATABASE
# =========================
DB_URL = "sqlite:///./vitalsync.db"

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# =========================
# DATABASE MODELS
# =========================
class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True)
    name = Column(String)

    email = Column(String, unique=True, index=True)
    password = Column(String)

    gender = Column(String, default="Male")
    age = Column(Integer, default=0)

    height = Column(Float, default=0.0)
    weight = Column(Float, default=0.0)

    exercise = Column(String, default="0 (None)")
    sleep = Column(String, default="8")
    meals = Column(String, default="3 meals")
    stress = Column(String, default="Moderate")

    goal = Column(String, default="Better health")

    daily_water_goal = Column(Float, default=2.0)

    water_logs = relationship("WaterLog", back_populates="user")
    workout_logs = relationship("WorkoutLog", back_populates="user")
    nutrition_logs = relationship("NutritionLog", back_populates="user")


class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    amount_ml = Column(Integer)

    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="water_logs")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    plan_json = Column(String)

    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="workout_logs")


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    food_name = Column(String)

    calories = Column(Float)

    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="nutrition_logs")


Base.metadata.create_all(bind=engine)

# =========================
# FASTAPI
# =========================
app = FastAPI()

# CORS: prod'da ALLOWED_ORIGINS env ile sınırlanabilir (örn. "https://app.example.com").
# Varsayılan "*" geliştirme içindir. Bearer token kullandığımız için credentials kapalı.
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

# =========================
# REQUEST MODELS
# =========================
class RegisterRequest(BaseModel):
    username: str
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    email: str
    name: str
    gender: str
    # Aralıklar frontend validation.js (PROFILE_LIMITS) ile birebir aynı tutuldu.
    # Not: 0 (boş/eski kayıt) durumunda alan istek gövdesinden çıkarılmalı; gönderilen
    # değer her zaman bu gerçekçi aralıkta olmalı (frontend onboarding bunu garanti eder).
    age: int = Field(default=0, ge=13, le=100)
    height: float = Field(default=0, ge=100, le=250)
    weight: float = Field(default=0, ge=30, le=300)
    exercise: str
    sleep: str
    meals: str
    stress: str
    goal: str
    water: float = Field(default=2.0, ge=0, le=15)


class CredentialsUpdate(BaseModel):
    email: str
    current_password: str
    new_password: str


class WaterLogRequest(BaseModel):
    email: str
    amount_ml: int


class DietGenerationRequest(BaseModel):
    email: str
    inventory: List[str]
    lang: str = "tr"


class WorkoutGenerationRequest(BaseModel):
    email: str
    survey_data: Optional[dict] = {}
    lang: str = "tr"


class VisionAnalysisRequest(BaseModel):
    email: Optional[str] = None
    image_base64: str
    lang: str = "tr"


# =========================
# DATABASE DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================
# AUTH TOKENS (HMAC-signed, stdlib only)
# =========================
AUTH_SECRET = os.getenv("AUTH_SECRET")
if not AUTH_SECRET:
    AUTH_SECRET = secrets.token_hex(32)
    logger.warning(
        "AUTH_SECRET not set; generated a temporary one (tokens reset on restart). "
        "Set AUTH_SECRET in .env for stable sessions."
    )

TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def create_token(user: "UserProfile") -> str:
    payload = {
        "uid": user.id,
        "email": user.email,
        "exp": int(datetime.now(timezone.utc).timestamp()) + TOKEN_TTL_SECONDS,
    }
    body = _b64e(json.dumps(payload).encode())
    sig = _b64e(hmac.new(AUTH_SECRET.encode(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def decode_token(token: str):
    try:
        body, sig = token.split(".", 1)
    except (ValueError, AttributeError):
        return None
    expected = _b64e(hmac.new(AUTH_SECRET.encode(), body.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(expected, sig):
        return None
    try:
        payload = json.loads(_b64d(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if payload.get("exp", 0) < int(datetime.now(timezone.utc).timestamp()):
        return None
    return payload


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> "UserProfile":
    """Resolve the authenticated user from the Bearer token. The endpoint trusts
    THIS identity, never an email supplied in the request body or URL."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(UserProfile).filter(UserProfile.id == payload.get("uid")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# =========================
# OPENROUTER FUNCTION
# =========================
def call_openrouter(prompt=None, messages=None, model: str = None, temperature: float = 0.4, system: str = None):

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "VitalSync"
    }

    if messages is None:
        messages = [{"role": "user", "content": prompt}]

    system_content = "You must ALWAYS return ONLY valid JSON. No markdown. No explanation."
    if system:
        system_content = f"{system}\n{system_content}"

    payload = {
        "model": model or AI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_content
            },
            *messages
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"}
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=90
    )

    logger.info("openrouter status=%s", response.status_code)

    if response.status_code != 200:
        logger.error("openrouter error: %s", response.text[:500])
        raise HTTPException(status_code=502, detail="AI service error")

    data = response.json()

    content = data["choices"][0]["message"]["content"]

    # markdown temizliği
    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    return content


def parse_ai_json(content: str) -> dict:
    """Parse AI output as JSON, salvaging the outermost object if needed."""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end > start:
            return json.loads(content[start:end + 1])
        raise


ACTIVITY_FACTORS = {
    "0 (None)": 1.2,
    "1-2 times": 1.375,
    "3-4 times": 1.55,
    "5+ times": 1.725
}


def compute_calorie_targets(user: "UserProfile") -> tuple:
    """Mifflin-St Jeor BMR → TDEE → hedefe göre günlük kalori hedefi."""
    height = user.height or 170
    weight = user.weight or 70
    age = user.age or 25

    bmr = 10 * weight + 6.25 * height - 5 * age
    bmr += 5 if user.gender == "Male" else -161

    tdee = bmr * ACTIVITY_FACTORS.get(user.exercise, 1.2)

    goal = (user.goal or "").lower()
    if "lose" in goal:
        adjustment = 0.85   # kilo verme: ~%15 açık
    elif "muscle" in goal or "gain" in goal:
        adjustment = 1.10   # kas kazanımı: ~%10 fazla
    else:
        adjustment = 1.0    # koruma

    return round(tdee), round(tdee * adjustment)


def profile_payload(user: "UserProfile") -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "gender": user.gender,
        "age": user.age,
        "height": user.height,
        "weight": user.weight,
        "exercise": user.exercise,
        "sleep": user.sleep,
        "meals": user.meals,
        "stress": user.stress,
        "goal": user.goal,
        "water": user.daily_water_goal or 2.0
    }


# =========================
# ROUTES
# =========================

@app.get("/")
def home():
    return {"message": "VitalSync API Running"}


# =========================
# REGISTER
# =========================
@app.post("/register")
def register_user(
    req: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(UserProfile).filter(
        UserProfile.email == req.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # email prefixes collide easily (a@x.com vs a@y.com) → fall back to full email
    username = req.username
    if db.query(UserProfile).filter(UserProfile.username == username).first():
        username = req.email

    user = UserProfile(
        username=username,
        name=req.name,
        email=req.email,
        password=hash_password(req.password)
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return {"status": "success", "token": create_token(user), **profile_payload(user)}


# =========================
# LOGIN
# =========================
@app.post("/login")
def login_user(
    req: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(UserProfile).filter(
        UserProfile.email == req.email
    ).first()

    if not user or not verify_password(req.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # transparently upgrade legacy plaintext rows to hashed storage
    if not user.password.startswith("pbkdf2$"):
        user.password = hash_password(req.password)
        db.commit()

    return {**profile_payload(user), "token": create_token(user)}


# =========================
# UPDATE PROFILE
# =========================
@app.post("/update-profile")
def update_profile(
    data: ProfileUpdate,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = current

    user.name = data.name
    user.gender = data.gender
    user.age = data.age
    user.height = data.height
    user.weight = data.weight
    user.exercise = data.exercise
    user.sleep = data.sleep
    user.meals = data.meals
    user.stress = data.stress
    user.goal = data.goal
    user.daily_water_goal = data.water

    db.commit()

    return {"status": "success"}


# =========================
# UPDATE CREDENTIALS (password change)
# =========================
@app.post("/update-credentials")
def update_credentials(
    data: CredentialsUpdate,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current

    if not verify_password(data.current_password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    user.password = hash_password(data.new_password)
    db.commit()

    return {"status": "success"}

# =========================
# GET PROFILE
# =========================
@app.get("/get-profile/{email}")
def get_profile(
    email: str,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return profile_payload(current)

# =========================
# WATER LOG
# =========================
@app.post("/log-water")
def log_water(
    req: WaterLogRequest,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = current

    water_log = WaterLog(
        user_id=user.id,
        amount_ml=req.amount_ml
    )

    db.add(water_log)

    db.commit()

    return {"status": "success"}


# =========================
# WATER HISTORY
# =========================
@app.get("/water-history/{email}")
def get_water_history(
    email: str,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = current

    logs = db.query(WaterLog).filter(
        WaterLog.user_id == user.id
    ).order_by(WaterLog.date.desc()).all()

    return [
        {
            "amount": log.amount_ml,
            "date": log.date
        }
        for log in logs
    ]


# =========================
# GENERATE DIET
# =========================
@app.post("/api/generate-diet")
def generate_diet(
    req: DietGenerationRequest,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = current
    logger.info("diet request for %s (%d items)", user.email, len(req.inventory))

    ingredients = ", ".join(req.inventory)
    language = LANG_NAMES.get(req.lang, "Turkish")

    tdee, target_kcal = compute_calorie_targets(user)
    meals_per_day = {"2 meals": 2, "3 meals": 3, "4+ meals": 4}.get(user.meals, 3)

    prompt = f"""
Create a personalized 7-day diet plan.

User profile:
- Gender: {user.gender}, Age: {user.age}, Height: {user.height} cm, Weight: {user.weight} kg
- Activity: {user.exercise} per week, Sleep: {user.sleep}h, Stress: {user.stress}
- Goal: {user.goal}
- Maintenance calories (TDEE): {tdee} kcal
- DAILY CALORIE TARGET: {target_kcal} kcal (hit this within ±10% every day)
- Meals per day: {meals_per_day}{" (3 main meals + 1 snack)" if meals_per_day == 4 else ""}

Available ingredients (build meals mainly around these; basic pantry staples like oil, salt, spices are allowed):
{ingredients}

Rules:
- Exactly 7 days, each day exactly {meals_per_day} meals with realistic times.
- Every meal needs: concrete portion sizes (grams/pieces), calories, protein_g, carbs_g, fat_g.
- total_calories per day = sum of meal calories, within ±10% of the target.
- Prioritize protein for the goal; vary dishes across the week (no main dish twice).
- Write "meal", "description" and "portion" in {language}.

Return ONLY valid JSON exactly in this shape:
{{
  "daily_calories_target": {target_kcal},
  "diet_plan": [
    {{
      "day": 1,
      "total_calories": 2050,
      "meals": [
        {{
          "meal": "Breakfast",
          "time": "08:00",
          "description": "Spinach omelette with oats",
          "portion": "3 eggs + 50g oats + 100g spinach",
          "calories": 450,
          "protein_g": 32,
          "carbs_g": 40,
          "fat_g": 16
        }}
      ]
    }}
  ]
}}
"""

    try:

        content = call_openrouter(
            prompt,
            system="You are a certified dietitian creating safe, realistic and tasty meal plans.",
            temperature=0.4
        )

        data = parse_ai_json(content)

        return {
            "status": "success",
            "daily_calories_target": data.get("daily_calories_target", target_kcal),
            "diet_plan": data.get("diet_plan", [])
        }

    except HTTPException:
        raise
    except Exception as e:

        logger.error("diet generation failed: %s", e)

        raise HTTPException(
            status_code=502,
            detail="AI could not generate a valid plan, please try again"
        )


# =========================
# GENERATE WORKOUT
# =========================
@app.post("/api/generate-workout")
def generate_workout(
    req: WorkoutGenerationRequest,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = current

    survey_data = req.survey_data or {}

    details = ", ".join(
        [f"{k}: {v}" for k, v in survey_data.items()]
    )

    language = LANG_NAMES.get(req.lang, "Turkish")

    prompt = f"""
Create a personalized weekly workout program (7 day entries).

User profile:
- Gender: {user.gender}, Age: {user.age}, Height: {user.height} cm, Weight: {user.weight} kg
- Sleep: {user.sleep}h, Stress: {user.stress}, Overall goal: {user.goal}

Survey answers (respect ALL of these, especially equipment and days per week):
{details}

Rules:
- Exactly 7 entries (day 1 to 7). Training days must match the requested days per week,
  spread sensibly across the week; remaining days are rest days
  (is_rest_day = true, exercises = [], short active-recovery note).
- Each training day: 4-6 exercises ONLY with the available equipment,
  with sets, reps and rest_sec. Total session ≈ requested max duration.
- Match difficulty to the user's level; build a sensible split for the goal.
- Add a short "notes" per day (warm-up advice, form cue or recovery tip).
- Write "focus", exercise "name" and "notes" in {language}.

Return ONLY valid JSON exactly in this shape:
{{
  "workout_plan": [
    {{
      "day": 1,
      "focus": "Chest & Triceps",
      "is_rest_day": false,
      "duration_min": 50,
      "notes": "5 min warm-up before starting.",
      "exercises": [
        {{ "name": "Bench Press", "sets": 4, "reps": "8-10", "rest_sec": 90 }}
      ]
    }}
  ]
}}
"""

    try:

        content = call_openrouter(
            prompt,
            system="You are a certified personal trainer designing safe, progressive programs.",
            temperature=0.4
        )

        data = parse_ai_json(content)

        # persist the generated plan so the user keeps a server-side history
        try:
            db.add(WorkoutLog(user_id=user.id, plan_json=json.dumps(data, ensure_ascii=False)))
            db.commit()
        except Exception as log_err:
            db.rollback()
            logger.error("could not save workout log: %s", log_err)

        return {
            "status": "success",
            "workout_plan": data.get("workout_plan", [])
        }

    except HTTPException:
        raise
    except Exception as e:

        logger.error("workout generation failed: %s", e)

        raise HTTPException(
            status_code=502,
            detail="AI could not generate a valid plan, please try again"
        )


# =========================
# VISION: FOOD IMAGE ANALYSIS
# =========================
@app.post("/analyze-food-image")
def analyze_food_image(
    req: VisionAnalysisRequest,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    language = LANG_NAMES.get(req.lang, "Turkish")

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Identify the food in this photo and analyze it for the visible portion. "
                        f"Write food_name, portion_estimate, analysis and tip in {language}. "
                        "Return ONLY valid JSON exactly like: "
                        '{"food_name": "...", "portion_estimate": "1 bowl (~250g)", '
                        '"calories_estimate": 250, "protein_g": 12, "carbs_g": 30, "fat_g": 8, '
                        '"health_score": 7, '
                        '"analysis": "2-3 sentences: what it is nutritionally and whether it is healthy", '
                        '"tip": "one short practical tip to make it healthier"}'
                        " health_score is 1-10 (10 = very healthy)."
                    )
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{req.image_base64}"}
                }
            ]
        }
    ]

    try:

        content = call_openrouter(messages=messages, temperature=0.2)

        data = parse_ai_json(content)

        analysis = data.get("analysis", "")

        # log the scanned food to the authenticated user's history
        try:
            db.add(NutritionLog(
                user_id=current.id,
                food_name=data.get("food_name", "?"),
                calories=data.get("calories_estimate") or 0,
            ))
            db.commit()
        except Exception as log_err:
            db.rollback()
            logger.error("could not save nutrition log: %s", log_err)

        return {
            "status": "success",
            "food_name": data.get("food_name", "?"),
            "analysis": analysis,
            # backwards-compatible alias for older clients
            "analysis_tr": analysis,
            "calories_estimate": data.get("calories_estimate"),
            "portion_estimate": data.get("portion_estimate"),
            "protein_g": data.get("protein_g"),
            "carbs_g": data.get("carbs_g"),
            "fat_g": data.get("fat_g"),
            "health_score": data.get("health_score"),
            "tip": data.get("tip")
        }

    except HTTPException:
        raise
    except Exception as e:

        logger.error("vision analysis failed: %s", e)

        raise HTTPException(
            status_code=502,
            detail="AI could not analyze the image, please try again"
        )

# =========================
# WORKOUT HISTORY
# =========================
@app.get("/workout-history/{email}")
def get_workout_history(
    email: str,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current

    logs = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == user.id
    ).order_by(WorkoutLog.date.desc()).all()

    out = []
    for log in logs:
        try:
            plan = json.loads(log.plan_json) if log.plan_json else None
        except (ValueError, TypeError):
            plan = None
        out.append({"plan": plan, "date": log.date})
    return out


# =========================
# NUTRITION HISTORY
# =========================
@app.get("/nutrition-history/{email}")
def get_nutrition_history(
    email: str,
    current: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current

    logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == user.id
    ).order_by(NutritionLog.date.desc()).all()

    return [
        {
            "food_name": log.food_name,
            "calories": log.calories,
            "date": log.date
        }
        for log in logs
    ]
