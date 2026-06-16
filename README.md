# 🧬 VitalSync – AI-Driven Personal Health and Fitness Ecosystem

**Author:** Emir Karatekin (Student ID: 40795)
**Institution:** Vizja University, Warsaw
**Project Goal:** To provide a 24/7 automated, personalized fitness and nutrition ecosystem by leveraging Generative AI and Computer Vision, removing the friction of manual data entry in modern health management.

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-6566F1?style=for-the-badge&logo=openai&logoColor=white)

---

## 🌟 Key Features

* **AI Diet Planner:** Generates personalized 7-day meal plans from the ingredients you select — with portions, calories and full macros (protein / carbs / fat), tuned to your computed daily calorie target.
* **AI Workout Coach:** Builds weekly training programs (sets × reps × rest) that respect your level, goal, available equipment, days per week, and session duration — including proper rest days.
* **Vision AI Nutrition Scanner:** Use your device's camera to snap a photo, or upload any food image, to get the name, portion estimate, calories, macros, a 1–10 health score, and a practical tip.
* **Activity History:** Generated workout programs and scanned foods are saved to your account (SQLite) and shown back in the Health tab.
* **Health Analysis Dashboard:** Real-time **BMI**, **BMR**, and **TDEE** calculations (Mifflin–St Jeor) based on your biological metrics.
* **Smart Hydration Tracker:** Daily goal ring, weekly history, confetti celebrations, and configurable smart reminders.
* **Grocery Catalog:** 175+ products with photos across 12 categories, smart search, and an inventory cart that feeds the AI diet planner.
* **Multilingual Localization:** Full application localization (i18next) in **English, Turkish and Polish**, persisted per user.
* **Secure Accounts:** PBKDF2-hashed passwords (per-user salt, constant-time verification) and **stateless HMAC-signed token authentication** — every protected request is authorized from the token, so each user can only access their own data.

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, i18next, Capacitor (Android-ready)
* **Backend:** FastAPI (Python), SQLAlchemy ORM, SQLite
* **Auth:** HMAC-SHA256 signed Bearer tokens (Python standard library only)
* **AI Engine:** OpenRouter API (default model: `openai/gpt-4o-mini`, multimodal vision supported)

---

## 🔑 Environment Variables (Required Setup)

> ⚠️ **This app will not start without an AI API key.** Each person running VitalSync must supply **their own** OpenRouter key — never share or commit a real `.env` file (yours is tied to your account and billing).

Create your environment file from the provided template:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in the values:

| Variable | Required | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | ✅ **Yes** | Your OpenRouter API key. Get one for free at **https://openrouter.ai/keys**. Without it the server refuses to start. |
| `AUTH_SECRET` | ⚠️ Recommended | Secret used to sign auth tokens. Generate one with the command below. If left empty, a temporary secret is generated on each start (all users get logged out on restart). |
| `OPENROUTER_MODEL` | Optional | Override the default AI model (`openai/gpt-4o-mini`). |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins for production (default `*` = allow all, fine for local dev). |

Generate a stable `AUTH_SECRET`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> The `.env` file is git-ignored on purpose — it holds secrets and must stay out of the repository. Share `backend/.env.example` (placeholders only), not your real `.env`.

---

## 🚀 Installation & Running

### 🐳 Docker — One Command (Recommended)

The easiest way to run the entire stack (Frontend + Backend) in isolated containers.

```bash
# 1. Create your environment file and add your OpenRouter key (see section above)
cp backend/.env.example backend/.env

# 2. Start the application
docker compose up --build
```

* **Frontend UI:** http://localhost:5173
* **Backend API:** http://localhost:8000  (Swagger docs at `/docs`)

> 💡 Port 5173 busy? Run: `FRONTEND_PORT=5180 docker compose up`

---

### 💻 Manual Setup (Without Docker)

**🐍 1. Backend (FastAPI)**

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your env file and insert your OPENROUTER_API_KEY (+ AUTH_SECRET)
cp .env.example .env

# Run the server
uvicorn main:app --reload
```

> Get a free API key at **https://openrouter.ai/keys** and set it as `OPENROUTER_API_KEY` in `backend/.env`.

**⚛️ 2. Frontend (React)**

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173).

---

## 👤 First Run & Accounts

There is **no bundled database** — the SQLite database (`backend/vitalsync.db`) is created automatically the first time the backend starts. Simply **register a new account** in the app to go through the full onboarding flow (biometrics → personalized AI plans).

---

## 📁 Project Structure

```
VitalSync/
├── backend/
│   ├── main.py            # FastAPI app: auth, models, AI endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example       # Copy to .env and add your keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/    # Tabs, modals, navigation
│   │   ├── i18n.js        # EN / TR / PL translations
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔐 Security Notes

* Passwords are stored as **PBKDF2-HMAC-SHA256** hashes with a per-user random salt; they are never stored in plain text.
* Sessions use **stateless HMAC-signed tokens** sent in the `Authorization: Bearer` header. Protected endpoints derive the user from the token, not from any client-supplied email — so users cannot access each other's data.
* Keep your real `.env` private. Databases (`*.db`) and `.env` are git-ignored.