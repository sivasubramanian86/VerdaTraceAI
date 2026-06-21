# Security Policy — VerdaTraceAI

## Supported Versions

| Version | Supported          |
|---------|-------------------|
| 3.x     | ✅ Active           |
| 1.x     | ✅ Security patches |
| < 1.0   | ❌ End of life      |

---

## 1. PII Handling Policy

VerdaTraceAI does not collect, retain, or log Personally Identifiable Information (PII).

- **No PII is stored server-side.** Chat inputs and workload parameters are processed in-memory and forwarded to Vertex AI for inference only; they are not persisted in any database or log store.
- **No user authentication or session management** is implemented in this release, which eliminates the primary surface for user-data exposure.
- **Logging is scoped to structured operational events** (request duration, agent name, error codes). No user-supplied free-text content appears in log lines.
- **AlloyDB** stores only carbon estimation results and project metadata — no fields that constitute personal data under GDPR, CCPA, or equivalent frameworks.
- If PII is inadvertently submitted in an unstructured text field, it is passed to Vertex AI under Google's Data Processing Addendum and is not retained by VerdaTraceAI after the HTTP response is returned.

---

## 2. Secrets Management

VerdaTraceAI follows a zero-secrets-in-source-code policy. All credentials are injected at runtime through one of two mechanisms:

### Environment Variables
- Local development uses `backend/.env` (excluded by `.gitignore`; only `backend/.env.example` with placeholder values is committed).
- Cloud Run services receive environment variables set in the Cloud Run service configuration, not baked into the container image.
- Sensitive variables include: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `ALLOYDB_URI`, `GOOGLE_API_KEY`.

### Google Cloud Secret Manager
- Production secrets are stored as versioned secrets in Google Cloud Secret Manager.
- The Cloud Run service account is granted `roles/secretmanager.secretAccessor` on only the specific secrets it requires.
- Secrets are injected as environment variables at container startup via Cloud Run's built-in Secret Manager integration (`--set-secrets` flag); no application code calls the Secret Manager API directly at runtime.
- No service account JSON files, PEM keys, or certificate files are stored in the repository.

### Secret Scanning in CI
- A secret scan (`bandit -r app/ -x tests/ -ll`) runs on every CI push and fails the pipeline on any HIGH-severity finding.
- The CI frontend build step scans `frontend/src/` with `grep -rE "(AKIA|sk-|AIza)[A-Za-z0-9]{16,}"` and fails if any match is found.

### Security Architecture

```
Browser ──HTTPS──► Firebase Hosting
                        │
              HTTPS (exact CORS origins only)
                        │
                   Cloud Run (FastAPI)
                   ├── ADC / Workload Identity → Vertex AI
                   ├── IAM-scoped private access → AlloyDB
                   ├── MCP Toolbox (read-only tool registry)
                   └── Secret Manager ──► runtime env injection
```

---

## 3. IAM Least-Privilege Posture

VerdaTraceAI follows the principle of least privilege for all service accounts and network communication.

### Service Account Roles

| Service Account         | Required Roles                                                                 |
|-------------------------|--------------------------------------------------------------------------------|
| Cloud Run (backend)     | `roles/aiplatform.user`, `roles/secretmanager.secretAccessor`                 |
| AlloyDB connection      | `roles/alloydb.client` scoped to one specific database                         |
| Firebase Hosting deploy | `roles/firebase.developViewer` (deploy pipeline only)                         |

- No service account is granted `roles/owner` or `roles/editor`.
- Service accounts are created with a single-purpose scope; the Cloud Run service account cannot access Firebase, and the Firebase deploy account cannot access Cloud Run.
- Workload Identity Federation is used to bind the Cloud Run service identity to Vertex AI calls, avoiding the need to distribute service account key files.

### Network Perimeter
- **AlloyDB is not exposed to the public internet.** Cloud Run connects to AlloyDB via private IP within the VPC; no public IP is assigned to the AlloyDB cluster.
- **CORS policy** restricts API access to exact production origins (e.g., `https://verdatrace.web.app`). Wildcard CORS (`*`) is explicitly rejected. Configured in `backend/app/main.py` via `CORSMiddleware`.
- **Cloud Run ingress** is set to `internal-and-cloud-load-balancing` — direct public access bypassing the load balancer is disabled.
- **Docker containers** run as a non-root user (`appuser`); no `--privileged` flags or elevated capabilities are granted.

### Pre-Deployment Security Checklist
- [ ] `gitleaks detect --source . --no-git --redact` passes with zero findings
- [ ] `python -m bandit -r app/ -x tests/` passes with zero HIGH/MEDIUM findings
- [ ] `npm audit --audit-level moderate` passes
- [ ] `ALLOWED_ORIGINS` in Cloud Run env is set to exact Firebase Hosting URL
- [ ] Cloud Run service account has only required roles (no `owner` or `editor`)
- [ ] AlloyDB not exposed to public internet; Cloud Run connects via private IP
- [ ] Secret Manager holds all runtime secrets (no environment variable fallback in production)
- [ ] Firebase Security Rules reviewed (if Firestore used)

---

## 4. Responsible Disclosure

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in VerdaTraceAI, please report it privately:

- **Email:** [security@verdatraceai.example.com](mailto:security@verdatraceai.example.com)
- **GitHub Private Advisory:** Use the [Security Advisories](../../security/advisories/new) feature in this repository to report vulnerabilities confidentially.

We acknowledge receipt within **48 hours** and aim to release a patch within **7 days** for critical or high-severity issues. We will credit reporters in the release notes unless anonymity is requested.

Please include in your report:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if safe to provide)
- Any relevant environment details (OS, Python/Node version, deployment mode)

We do not offer a bug bounty at this time but we sincerely appreciate responsible disclosure.
