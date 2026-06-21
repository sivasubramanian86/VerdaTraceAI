# run_local.ps1 - Run VerdaTraceAI locally on Windows PowerShell
# 1. Kill any existing ports (8000 for FastAPI, 5173 for Vite)
$ports = @(8000, 5173)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Found active process on port $port. Terminating..." -ForegroundColor Yellow
        foreach ($c in $conn) {
            if ($c.OwningProcess -gt 0) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# 2. Start Backend FastAPI Server
Write-Host "Starting FastAPI Backend on port 8000..." -ForegroundColor Green
# Start in a new window to keep logs separate and run concurrently
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m app.main"

# 3. Start Frontend Vite Server
Write-Host "Starting Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both services launched successfully in separate PowerShell windows!" -ForegroundColor Green
