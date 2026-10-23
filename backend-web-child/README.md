# Web Child API

Backend REST API built with FastAPI, SQLAlchemy 2, and PostgreSQL. It exposes OpenAPI docs at `/docs` and includes endpoints for children, health records, growth records, daily notes, reminders, and inventory needs.

## Create the database and sample data

The `schema.sql` script creates the `web_child` database if it does not exist, creates all application tables, and inserts sample data for three children plus two application accounts. It is a `psql` script and does not delete existing databases or rows.

Run from this folder in PowerShell:

```powershell
$env:PGPASSWORD = '<password-postgres>'
psql -h '<host>' -p 5432 -U postgres -d postgres -f schema.sql
Remove-Item Env:PGPASSWORD
```

The demo accounts inserted by the script are `admin` / `Admin123!` and `pengasuh` / `Pengasuh123!`. Change these passwords before using the system with real data. The password values are saved in PostgreSQL as bcrypt hashes. The accounts table is ready, but API login/authentication has not been implemented yet.

## Run API locally (PowerShell)

```powershell
cd backend-web-child
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL` using the server host, port, database, username, and password. Do not commit `.env` or put database credentials in frontend variables. Example format:

```text
DATABASE_URL=postgresql+psycopg://postgres:<password>@<host>:5432/<database>
FRONTEND_ORIGINS=http://localhost:5173
```

Set the same PostgreSQL connection details in `.env`, then start the API:

```powershell
uvicorn app.main:app --reload
```

The API is served at `http://127.0.0.1:8000`; health check: `/api/healthz`.

## Routes

- `GET /api/healthz`
- `GET|POST /api/children`, `GET|DELETE /api/children/{id}`
- `GET|POST /api/children/{id}/health-records`
- `GET|POST /api/children/{id}/growth-records`
- `GET|POST /api/children/{id}/daily-notes`
- `GET|POST /api/reminders`, `PATCH|DELETE /api/reminders/{id}`
- `GET /api/needs`, `POST /api/needs/initialize`, `POST /api/needs`, `PATCH|DELETE /api/needs/{code}`

`Base.metadata.create_all` creates missing development tables on startup. The needs catalog is added idempotently by the frontend on first use; this preserves saved quantities. `schema.sql` is the canonical schema with database creation, constraints, indexes, accounts, and sample data.
