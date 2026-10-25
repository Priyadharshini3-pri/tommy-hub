# TOMMY HUB — Billing Terminal

Full-stack luxury apparel billing app: React + Tailwind frontend, FastAPI backend, MySQL database, served behind one nginx URL so it works identically on Android, tablet, and desktop.

```
tommy-hub/
├── frontend/        React (Vite) app — pages, components, context, services
├── backend/         FastAPI app — models, schemas, routers, services
├── database/        MySQL schema.sql + seed.sql
├── nginx/           Reverse proxy config (single URL for app + API)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Option A — Run everything with Docker (recommended)

**Prerequisites:** Docker + Docker Compose installed.

1. **Clone/unzip the project** and move into it:
   ```bash
   cd tommy-hub
   ```

2. **Create your environment file**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — at minimum set a real `JWT_SECRET_KEY` and a proper `MYSQL_PASSWORD`.

3. **Generate a real admin password hash** (the seed file ships with a placeholder):
   ```bash
   cd backend
   python3 -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('YourAdminPassword123'))"
   cd ..
   ```
   Paste the output into `database/seed.sql`, replacing `$2b$12$replace_with_real_bcrypt_hash_before_use`.

4. **Build and start all services**:
   ```bash
   docker compose up --build
   ```
   This starts MySQL (auto-loading `schema.sql` + `seed.sql` on first boot), the FastAPI backend, the built React frontend, and the nginx proxy.

5. **Open the app**: visit `http://localhost` — same URL works from your phone/tablet on the same network via `http://<your-machine-ip>`.

6. **Sign in** with the admin username/password you hashed in step 3.

To stop: `docker compose down`. To wipe the database and start fresh: `docker compose down -v`.

---

## Option B — Run locally without Docker (development)

### 1. Database
```bash
mysql -u root -p -e "CREATE USER 'tommyhub_user'@'%' IDENTIFIED BY 'changeme'; GRANT ALL ON tommy_hub.* TO 'tommyhub_user'@'%';"
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql   # update the bcrypt hash first, as in step 3 above
```

### 2. Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS
uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs` (FastAPI's auto-generated OpenAPI UI) — useful for testing endpoints directly.

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
Visit `http://localhost:5173`. For phone/tablet testing on the same Wi-Fi, use your machine's LAN IP instead of `localhost` (Vite's `server.host: true` already allows this).

---

## Deploying the full application to Vercel

This repository keeps the React frontend and FastAPI backend in separate folders. Vercel Services builds both services in one project and routes `/api/*` to FastAPI and all other paths to the Vite frontend.

1. Import the repository into Vercel and set **Root Directory** to `tommy-hub` (the folder containing `vercel.json`). Do not select only `backend` or only `frontend`.
2. In Vercel **Settings → Build and Deployment**, set **Framework Preset** to `Services`. Vercel only builds the `services` block when this project framework is selected.
3. Vercel reads `vercel.json`, builds `frontend/` with Node, and builds `backend/` with Python 3.12.
4. Add `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, and `SMS_PROVIDER` to the Vercel project Environment Variables. Do not put database credentials in a `VITE_` variable.
5. Set `CORS_ORIGINS` to the production Vercel origin and `SMS_PROVIDER` to `mock` unless a real SMS provider is configured.
6. Redeploy after saving environment variables.

The backend remains runnable with Docker Compose or from `backend/` using its own `requirements.txt`. The Supabase/PostgreSQL database setup files are `database/schema.supabase.sql` and `database/seed.supabase.sql`.

---

## Testing Responsiveness
- Resize the browser or use Chrome DevTools device toolbar: confirm 2-column category grid on phone widths (~360–767px), 4-column on tablet (768–1023px), 7-column + split-screen invoice on desktop (≥1024px).
- Confirm zero horizontal scroll at 360px width.
- Confirm every button/input is at least 48×48px (DevTools → Inspect → Computed).

## Testing Print Output
1. Complete a bill and land on `/invoice/{bill_number}`.
2. Use the on-screen 58MM / 80MM / A4 toggle, then click **Print Bill**.
3. In the browser print dialog, set paper size to match (or use "Save as PDF" to inspect layout) — the `#invoice-print` element is the only thing that renders; all navigation/buttons are hidden via `.no-print`.
4. For a real thermal printer, install its driver as a standard OS printer and select it in the print dialog; the CSS is monochrome-safe and uses monospace alignment for 58/80mm widths.

## Security Notes Before Going to Production
- Replace `JWT_SECRET_KEY` and all MySQL passwords with strong, unique values — never commit `.env`.
- Set `SMS_PROVIDER=fast2sms` or `twilio` and fill in the corresponding credentials as environment variables (never hardcode them in source).
- Put the whole stack behind HTTPS (e.g., terminate TLS at nginx with a real certificate, or place it behind a managed load balancer).
- Review `CORS_ORIGINS` — it must list only your real deployed frontend origin(s), not `*`.
