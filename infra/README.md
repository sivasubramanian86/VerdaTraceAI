# Infrastructure & Deployment - VerdaTraceAI

This directory contains containerization templates and automated script assets to deploy VerdaTraceAI on Google Cloud and Firebase.

## 1. Backend Container Deployment (Google Cloud Run)

FastAPI backend can be packaged into a Docker container and deployed to Google Cloud Run, a managed serverless platform.

### Prerequisites

- Google Cloud SDK installed and authenticated (`gcloud auth login`).
- Docker installed if building locally. Google Cloud Build can build remotely.
- Secret Manager or deployment-time environment variables for `GCP_PROJECT_ID`, `VERTEX_REGION`, `LLM_PROVIDER`, and `ALLOWED_ORIGINS`.

### Deployment Script

Run the deployment script from the `infra/` folder. It submits source to Google Cloud Build, compiles the Docker image, uploads it to Artifact Registry, and deploys to Cloud Run.

- Windows PowerShell:

  ```powershell
  ./deploy_cloud_run.ps1
  ```

- macOS/Linux/Git Bash:

  ```bash
  ./deploy_cloud_run.sh
  ```

Production checklist:

- Set `ALLOWED_ORIGINS` to the exact Firebase Hosting domain.
- Keep backend services private unless public access is intentional.
- Use least-privilege service accounts for Vertex AI, Secret Manager, Cloud Run, and AlloyDB access.
- Do not deploy local `.env` files or service account JSON files.

## 2. Frontend SPA Hosting (Firebase Hosting)

The frontend is a single-page React app that builds down to static assets in `frontend/dist`.

### Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`).
- Authenticated via `firebase login`.

### Deployment Steps

1. Navigate to the root directory.
2. Build the production React frontend:

   ```bash
   cd frontend
   npm run build
   cd ..
   ```

3. Initialize or select your project:

   ```bash
   firebase use <your-firebase-project-id>
   ```

4. Deploy to hosting:

   ```bash
   firebase deploy --only hosting
   ```
