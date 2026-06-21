# deploy_cloud_run.ps1 - Build and deploy VerdaTraceAI Backend to Google Cloud Run

# Stop on errors
$ErrorActionPreference = "Stop"

# Try to parse Project ID and Region from backend env file
$envFilePath = "../backend/.env"
$gcpProjectId = "promptwars-demo-project"
$region = "us-central1"

if (Test-Path $envFilePath) {
    $envContent = Get-Content $envFilePath
    foreach ($line in $envContent) {
        if ($line -match "^GCP_PROJECT_ID\s*=\s*(.+)") {
            $gcpProjectId = $Matches[1].Trim()
        }
        if ($line -match "^VERTEX_REGION\s*=\s*(.+)") {
            $region = $Matches[1].Trim()
        }
    }
}

$serviceName = "verdatrace-backend"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Deploying VerdaTraceAI Backend to Cloud Run..." -ForegroundColor Cyan
Write-Host "Project ID: $gcpProjectId" -ForegroundColor Cyan
Write-Host "Region:     $region" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configure gcloud project
Write-Host "Setting gcloud project context..." -ForegroundColor Yellow
gcloud config set project $gcpProjectId

# 1. Build backend using Google Cloud Build
Write-Host "Submitting build to Cloud Build..." -ForegroundColor Yellow
Push-Location ../backend
try {
    gcloud builds submit --tag "gcr.io/$gcpProjectId/$serviceName:latest" .
} finally {
    Pop-Location
}

# 2. Deploy backend to Cloud Run
Write-Host "Deploying service to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $serviceName `
  --image "gcr.io/$gcpProjectId/$serviceName:latest" `
  --region $region `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="LLM_PROVIDER=vertex-ai,GCP_PROJECT_ID=$gcpProjectId,VERTEX_REGION=$region"

Write-Host "=============================================" -ForegroundColor Green
Write-Host "VerdaTraceAI Backend successfully deployed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Output URL
gcloud run services describe $serviceName --region $region --format='value(status.url)'
