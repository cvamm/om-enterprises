# Kanpur Tiles — local dev server for your Windows terminal
# Usage: cd "C:\Users\anjua\OneDrive\Desktop\OM Tiles\kanpur-tiles"
#        .\start-desktop.ps1
# Then open http://localhost:3000

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "Kanpur Tiles — starting local dev server..." -ForegroundColor Gold

# 1. Check node + pnpm exist
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install from https://nodejs.org and re-run." -ForegroundColor Red
  exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "pnpm not found. Running: npm install -g pnpm" -ForegroundColor Yellow
  npm install -g pnpm
}

# 2. Install dependencies (fast if already done)
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install

# 3. Enable sample data so the catalogue shows products before Supabase is wired
$env:USE_SAMPLE_DATA = "1"

# 4. Start the dev server on port 3000
Write-Host "Starting on http://localhost:3000  (Ctrl+C to stop)" -ForegroundColor Green
pnpm dev
