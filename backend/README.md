# StarCast Backend API (Django & Django REST Framework)

Modular, database-free backend architecture designed for the **StarCast International Casting Marketplace**.

---

## Architecture Highlights
- **Framework:** Python, Django, Django REST Framework
- **Database Status:** Disconnected by design (`DATABASES = {}`). No migrations, no SQLite, no PostgreSQL.
- **Data Layer:** In-memory state and validated serializers.
- **Candidate Ranking:** Explainable scoring engine with 6 criteria (Skills 30, Portfolio 25, Experience 15, Language 10, Availability 10, Location 10).
- **Security & Privacy:** Protected personal attributes excluded from ranking algorithms; talent views sanitized.
- **Payments:** Testable service interface (`MockTestablePaymentService`). No real financial transactions.
- **CORS:** Configured for React development server at `http://localhost:5173`.

---

## Directory Structure
```
backend/
├── manage.py
├── requirements.txt
├── .gitignore
├── .env.example
├── .env
├── README.md
├── starcast/                  # Project configuration
│   ├── settings.py            # Database-free settings, CORS, DRF
│   ├── urls.py                # Health check & modular route registry
│   ├── asgi.py
│   └── wsgi.py
├── users/                     # User management & authentication
├── companies/                 # Production studio profiles
├── opportunities/             # Casting calls & role requirements
├── applications/              # Audition applications & status transitions
├── ranking/                   # Transparent role matching & candidate ranking
├── messaging/                 # Platform recruiter-talent messages
├── notifications/             # System alerts & audition callbacks
└── payments/                  # Testable mock payment service interface
```

---

## Setup & Running Instructions

### 1. Prerequisites
Ensure Python 3.10+ is installed on your system.

### 2. Virtual Environment
A virtual environment named `venv` resides at the project root (`../venv`).
To activate it on Windows PowerShell:
```powershell
..\venv\Scripts\Activate.ps1
```
On macOS / Linux:
```bash
source ../venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Django Checks (Zero Database Dependencies)
```bash
python manage.py check
```

### 5. Start the Development Server
```bash
python manage.py runserver 5050
```
The API will be live at `http://127.0.0.1:5050/`.

---

## Available API Endpoints

### System & Health Check
- `GET /api/health/` — Health check status and service metadata.

### 1. Users
- `POST /api/users/register/` — Register a talent or recruiter user.
- `POST /api/users/login/` — In-memory login returning mock token.
- `GET /api/users/profile/` — Fetch current user profile.
- `PUT /api/users/profile/` — Update profile skills, languages, headline.

### 2. Production Companies
- `GET /api/companies/` — List verified studio profiles.
- `POST /api/companies/` — Register a new production studio.
- `GET /api/companies/<id>/` — Single studio details.

### 3. Casting Opportunities
- `GET /api/opportunities/` — Search casting opportunities (filter by `category`, `location`, `search`).
- `POST /api/opportunities/` — Publish a new casting call with role specifications.
- `GET /api/opportunities/<id>/` — Full opportunity details with role requirements.
- `GET /api/opportunities/recruiter/` — Recruiter dashboard opportunities with stats.

### 4. Applications
- `GET /api/applications/` — Filter applications by `opportunity_id` or `status`.
- `POST /api/applications/` — Submit application to a casting role.
- `GET /api/applications/<id>/` — Application details.
- `PATCH /api/applications/<id>/status/` — Move application stage (Shortlisted, Under Review, etc.).
- `POST /api/applications/<id>/invite-audition/` — Schedule audition callback.
- `GET /api/applications/my/` — Candidate privacy-safe view (own applications only).

### 5. Candidate Ranking & Role Matching
- `GET /api/ranking/opportunities/<opp_id>/` — Ranked applicants for a role (sorted by `match_score`, `experience`, `applied_date`).
- `POST /api/ranking/applications/<app_id>/recalculate/` — Recalculate score with latest role criteria.
- `GET /api/ranking/compare/?ids=cand-1,cand-2` — Side-by-side comparison matrix across all 6 criteria.
- `POST /api/ranking/bulk-shortlist/` — Bulk shortlist candidates with audit log.
- `GET /api/ranking/criteria/` — Inspect role scoring weights & fairness guidelines.
- `PUT /api/ranking/criteria/` — Customize weights per production.

### 6. Messaging
- `GET /api/messaging/?user_id=usr-1` — Message thread history.
- `POST /api/messaging/` — Send direct message between recruiter and candidate.

### 7. Notifications
- `GET /api/notifications/` — List unread alerts, shortlist updates, audition invites.
- `POST /api/notifications/` — Mark all alerts as read.

### 8. Payments (Testable Interface)
- `POST /api/payments/create-intent/` — Initialize test payment intent (Sandbox only).
- `POST /api/payments/confirm/` — Simulate payment confirmation for frontend checkout test.
- `GET /api/payments/status/<intent_id>/` — Check mock payment intent status.

---

## Example Health Check Test
```bash
curl http://127.0.0.1:5050/api/health/
```
Expected response:
```json
{
  "status": "healthy",
  "service": "StarCast International Casting Marketplace API",
  "version": "1.0.0-in-memory",
  "database_connected": false,
  "database_status": "disconnected_by_design (in-memory mode)",
  "cors_configured": true
}
```
