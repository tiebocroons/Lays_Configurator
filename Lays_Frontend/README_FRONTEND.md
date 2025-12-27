# Lays Frontend (Vue 3 + Vite)

Quick start (PowerShell):

```powershell
cd "c:\Users\tiebo\OneDrive\Thomas more\3XD\Lays_Configurator\Lays_Frontend"
npm install
# edit .env or provide API base via Vite env var
$env:VITE_API_BASE = 'http://localhost:4000/api/v1'; npm run dev
```

Notes:
- The frontend uses `localStorage.token` to store the JWT.
- It expects the API at `VITE_API_BASE` (default `http://localhost:4000/api/v1`).
- Basic pages: register, login, list bags, view bag, create bag, vote.
