# Fair Drop — Integrated Frontend + Backend

## Structure

- `frontend/` — React + Vite
- `backend/` — Express + MongoDB + Redis + BullMQ
- `infrastructure/nginx/` — reverse proxy configuration

## Development

### Backend

```powershell
cd backend
npm install
npm run dev
```

Run workers in separate terminals:

```powershell
npm run worker:allocation
npm run worker:expiry
```

Backend: `http://localhost:5000`

### Redis

```powershell
docker compose up -d redis
```

If you don't have a compose file, run Redis directly:

```powershell
docker run --name fair-drop-redis -p 6379:6379 -d redis:7-alpine
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

The Vite dev server proxies `/api` to `http://localhost:5000`.

## Important environment files

Copy:

```text
backend/.env.example -> backend/.env
frontend/.env.example -> frontend/.env
```

Never commit real secrets from `.env`.

## Main user flow

```text
Register/Login
  -> Events
  -> Event details
  -> Drop
  -> Join once
  -> Wait for allocation
  -> Result
  -> Reservation
  -> Confirm
  -> My Tickets
```

## Admin flow

```text
Admin Login
  -> Create Event
  -> Generate Tickets
  -> Create Drop
  -> Open Drop
  -> Close Drop
  -> Start Allocation
  -> Monitor Metrics
```

## API integration

The frontend uses `src/api/http.js` as the single HTTP client. Authentication is cookie-based with `credentials: "include"`.

SSE is used by the drop screen for allocation/reservation events.

Risk monitoring is available at:

```text
GET /api/v1/drops/:dropId/risk
```
