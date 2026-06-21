# Security Policy — VerdaTraceAI

## Supported Versions

| Version | Supported          |
|---------|-------------------|
| 3.x     | ✅ Active           |
| 1.x     | ✅ Security patches |
| < 1.0   | ❌ End of life      |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report privately to the project maintainers via email. We acknowledge within 48 hours and aim to patch within 7 days for critical issues.

---

## Security Architecture

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

## Security Controls

### Secrets Management
- **No secrets in source code.** All credentials injected at runtime via environment variables or Google Secret Manager.
- `backend/.env` is excluded by `.gitignore`. Only `.env.example` (with placeholder values) is committed.
- No service account JSON files, PEM keys, or certificate files are stored in the repository.
- Secret scan runs on every CI push (`gitleaks` / `trufflehog`).

### IAM Least Privilege
| Service Account | Required Roles |
|---|---|
| Cloud Run (backend) | `roles/aiplatform.user`, `roles/secretmanager.secretAccessor` |
| AlloyDB connection | `roles/alloydb.client` scoped to one database |
| Firebase Hosting | `roles/firebase.developViewer` (deploy only) |

### CORS Policy
- `ALLOWED_ORIGINS` must be **exact production origins** (e.g., `https://verdatrace.web.app`).
- Wildcard CORS (`*`) is explicitly rejected.
- Configured in `backend/app/main.py` via `CORSMiddleware`.

### Input Validation
- All API request bodies are validated by Pydantic v2 models with strict field types.
- Agent inputs are sanitized before LLM injection; prompt injection resistance via structured system prompts.
- No raw SQL string interpolation — all queries use parameterized ORM/asyncpg calls.

### Data Privacy
- No PII (Personally Identifiable Information) is logged, stored, or transmitted.
- Chat inputs are passed to Vertex AI for inference only; not stored server-side.
- No user authentication or session management in this release — no user data exposure surface.

### Dependency Security
- Python: `bandit` for static security analysis, `pip audit` for CVE scanning.
- Node: `npm audit` integrated into CI.
- Dependencies pinned to minimum safe versions in `requirements.txt` and `package.json`.

### Container Security
- Docker base images use slim/distroless variants.
- `backend/Dockerfile` runs as non-root user (`appuser`).
- No `--privileged` flags; minimal capabilities.

---

## Security Checklist (Pre-Deployment)

- [ ] `gitleaks detect --source . --no-git --redact` passes with zero findings
- [ ] `python -m bandit -r app/ -x tests/` passes with zero HIGH/MEDIUM findings
- [ ] `npm audit --audit-level moderate` passes
- [ ] `ALLOWED_ORIGINS` in Cloud Run env is set to exact Firebase Hosting URL
- [ ] Cloud Run service account has only required roles (no `owner` or `editor`)
- [ ] AlloyDB not exposed to public internet; Cloud Run connects via private IP
- [ ] Secret Manager holds all runtime secrets (no environment variable fallback in production)
- [ ] Firebase Security Rules reviewed (if Firestore used)
