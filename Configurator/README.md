# Three.js demo (npm workflow)

This project includes a minimal Three.js demo that loads a chips bag GLB model.

Quick start (Windows PowerShell):

```powershell
Set-Location -LiteralPath 'C:\Users\tiebo\OneDrive\Thomas more\3XD\Lays_Configurator\Configurator'
npm install
npm run dev
# Open http://localhost:5173/index.html
```

Where to put your model:

- Place `chips_bag.glb` in `public/models/` (the demo expects `/models/chips_bag.glb`).

Notes:
- I used `vite` so ESM imports work and static assets in `public/` are served correctly.
- If you prefer a different dev server or need a React/Vue integration, tell me and I will adapt.
