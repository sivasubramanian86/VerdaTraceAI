# deploy_cloud_run.ps1 - Build and deploy VerdaTraceAI Backend to Google Cloud Run
# Usage: ./deploy_cloud_run.ps1 [PROJECT_ID] [REGION]

$ErrorActionPreference = "Stop"

# ─── Configuration ───────────────────────────────────────────────────────────
$gcpProjectId = if ($args[0]) { $args[0] } else { "verdatraceai-500110" }
$region       = if ($args[1]) { $args[1] } else { "us-central1" }
$serviceName  = "verdatrace-backend"
$imageName    = "gcr.io/$gcpProjectId/$serviceName`:latest"

# Comma-separated list of EXACT allowed origins (no trailing slash, no wildcard)
$allowedOrigins = "https://verdatraceai.web.app\,https://verdatraceai.firebaseapp.com"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  VerdaTraceAI — Cloud Run Backend Deploy"   -ForegroundColor Cyan
Write-Host "  Project  : $gcpProjectId"                   -ForegroundColor Cyan
Write-Host "  Region   : $region"                         -ForegroundColor Cyan
Write-Host "  Image    : $imageName"                      -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# ─── Step 1: Set gcloud project ──────────────────────────────────────────────
Write-Host "`n[1/5] Setting gcloud project context..." -ForegroundColor Yellow
gcloud config set project $gcpProjectId

# ─── Step 2: Enable required APIs ────────────────────────────────────────────
Write-Host "`n[2/5] Enabling required GCP APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com `
  aiplatform.googleapis.com `
  secretmanager.googleapis.com `
  --project $gcpProjectId

# ─── Step 3: Build via Cloud Build → push to Container Registry ──────────────
Write-Host "`n[3/5] Submitting build to Cloud Build..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/../backend"
try {
    gcloud builds submit `
      --tag $imageName `
      --project $gcpProjectId `
      .
} finally {
    Pop-Location
}

# ─── Step 4: Deploy to Cloud Run ─────────────────────────────────────────────
Write-Host "`n[4/5] Deploying to Cloud Run..." -ForegroundColor Yellow

$envYamlContent = @"
GCP_PROJECT_ID: "$gcpProjectId"
VERTEX_REGION: "$region"
LLM_PROVIDER: "vertex-ai"
USE_ALLOYDB: "False"
ALLOWED_ORIGINS: "https://verdatraceai.web.app,https://verdatraceai.firebaseapp.com"
"@
$envYamlPath = Join-Path $PSScriptRoot "env.yaml"
Set-Content -Path $envYamlPath -Value $envYamlContent

try {
    gcloud run deploy $serviceName `
      --image $imageName `
      --region $region `
      --platform managed `
      --allow-unauthenticated `
      --port 8080 `
      --cpu 1 `
      --memory 1Gi `
      --min-instances 0 `
      --max-instances 5 `
      --timeout 60 `
      --concurrency 80 `
      --env-vars-file "$envYamlPath" `
      --project $gcpProjectId
} finally {
    Remove-Item -Path $envYamlPath -ErrorAction SilentlyContinue
}

# ─── Step 5: Output ──────────────────────────────────────────────────────────
Write-Host "`n[5/5] Deployment complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
$serviceUrl = gcloud run services describe $serviceName `
  --region $region `
  --project $gcpProjectId `
  --format="value(status.url)"
Write-Host "  Backend URL : $serviceUrl"           -ForegroundColor Green
Write-Host "  Health check: $serviceUrl/health"    -ForegroundColor Green
Write-Host "  Swagger UI  : $serviceUrl/docs"      -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT: Update Firebase frontend VITE_API_BASE_URL to: $serviceUrl" -ForegroundColor Magenta
