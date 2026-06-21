# Contributing to VerdaTraceAI

Thank you for your interest in contributing. This document covers the development workflow, code standards, and quality gates.

---

## Development Setup

### Prerequisites
- Python 3.12+ | Node.js 20+
- Google Cloud SDK (`gcloud auth application-default login`)
- Git

### Clone and Configure

```bash
git clone https://github.com/sivasubramanian86/VerdaTraceAI.git
cd VerdaTraceAI

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate  # .venv\Scripts\activate on Windows
pip install -e ".[dev]"
cp .env.example .env  # Edit with your values

# Frontend
cd ../frontend
npm install
```

---

## Code Standards

### Python (Backend)
- **Formatter / Linter**: Ruff (`ruff check . --fix && ruff format .`)
- **Type hints**: All public functions must be fully annotated
- **Docstrings**: Google-style (`pyproject.toml` → `convention = "google"`)
- **Security**: Bandit (`bandit -r app/ -x tests/`) — no HIGH or MEDIUM findings
- **No secrets in code**: Use environment variables only

### TypeScript (Frontend)
- **Build gate**: `npm run build` must pass with zero TypeScript errors
- **React patterns**: Functional components + hooks; no class components
- **Accessibility**: Every interactive element needs an `aria-label` or `aria-labelledby`
- **i18n**: All UI strings must be in the translation schema — no hardcoded English

---

## Testing Requirements

```bash
# Backend
python -m pytest tests/ -v --cov=app --cov-report=term-missing

# Frontend TypeScript check
npm run build
```

- **Minimum coverage**: 70% on `app/` modules
- New agent logic → corresponding test in `backend/tests/test_agents.py`
- New API routes → corresponding test in `backend/tests/test_api.py`

---

## Pull Request Process

1. Branch from `main` using: `feature/<short-description>`, `fix/<issue-id>`, or `docs/<topic>`
2. Keep PRs focused — one logical change per PR
3. All CI checks must pass before merge (Ruff, Bandit, pytest, TypeScript build)
4. Add/update relevant tests and documentation
5. Update `ARCHITECTURE.md` if agent structure or API contracts change

---

## Quality Gates (CI enforced)

| Gate | Tool | Threshold |
|---|---|---|
| Python lint | Ruff | Zero violations |
| Python security | Bandit | Zero HIGH/MEDIUM |
| Python tests | pytest | All pass, ≥70% coverage |
| Secret scan | gitleaks | Zero findings |
| TypeScript build | `npm run build` | Zero errors |
| Node security | `npm audit` | No critical CVEs |

---

## Commit Message Format

```
<type>(<scope>): <short summary>

Types: feat | fix | docs | style | refactor | test | chore
```

Examples:
- `feat(simulator): add diurnal carbon intensity curve`
- `fix(i18n): add missing Marathi dashboard keys`
- `docs(readme): update deployment section for Cloud Run`

---

## Security Reporting

See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures. Do not open public issues for security bugs.
