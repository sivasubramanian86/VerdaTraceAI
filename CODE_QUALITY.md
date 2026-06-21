# VerdaTraceAI — Code Quality Standards

This document describes the coding standards enforced in the VerdaTraceAI backend. All Python source files under `backend/app/` are expected to comply with the rules below before being merged.

---

## 1. Linting Configuration

The backend uses [ruff](https://docs.astral.sh/ruff/) for both linting and formatting. Configuration is locked in `backend/pyproject.toml`.

### Global Settings

| Setting | Value | Rationale |
|---|---|---|
| `line-length` | `120` | Accommodates type annotations and descriptive identifiers without wrapping |
| `target-version` | `py312` | Matches the Cloud Run runtime (Python 3.12) |

### Rule Sets Selected

| Rule Set | Prefix | Purpose |
|---|---|---|
| Pyflakes | `F` | Detects undefined names, unused imports, and other logical errors |
| pycodestyle errors | `E` | Enforces PEP 8 style (indentation, whitespace, line length) |
| pycodestyle warnings | `W` | Catches common style warnings (trailing whitespace, blank lines) |
| pydocstyle | `D` | Enforces consistent docstring presence and format |
| flake8-annotations | `ANN` | Requires type annotations on all function signatures |
| flake8-bugbear | `B` | Catches likely bugs and design issues beyond E/W |
| flake8-bandit | `S` | Flags security-sensitive patterns (SQL injection, hardcoded secrets) |
| isort | `I` | Enforces consistent import ordering |

### Rules Ignored (with Rationale)

| Rule | Code | Rationale |
|---|---|---|
| `ANN204` | Return type on special methods | `__init__` always returns `None` implicitly; annotating it is redundant noise |
| `ANN401` | Disallow `Any` in annotations | Dynamic ADK agent inputs (`Dict[str, Any]`) and Pydantic model generics require `Any` at defined boundaries |
| `D100` | Missing docstring in public module | Module-level docstrings add limited value in a tightly scoped application package |
| `D102` | Missing docstring on public method | Inherited and overridden endpoint methods derive meaning from their parent; docstrings duplicated there are noise |
| `D104` | Missing docstring in public package | `__init__.py` files are structural; docstrings there are not informative |
| `D107` | Missing docstring in `__init__` | Constructor intent is documented at the class level; per-constructor docstrings are skipped |

### Per-File Overrides

Test files under `**/tests/*` and `tests/*` have `S101` (assert usage), `D` (docstrings), and `ANN` (annotations) suppressed — test code is intentionally assertive and less formally documented.

### Running the Linter

```bash
# From the backend/ directory
python -m ruff check app/
python -m ruff format --check app/
```

Both commands must exit with code `0` before any pull request is merged. The CI backend job enforces this gate automatically.

---

## 2. Docstring Convention

All docstrings in `backend/app/` follow the **Google style** convention as configured via `[tool.ruff.lint.pydocstyle] convention = "google"`.

### Required Format

A full Google-style docstring includes:

```python
def example_function(param_a: str, param_b: int) -> float:
    """One-line summary ending with a period.

    Optional extended description providing context about the algorithm,
    side effects, or non-obvious behaviour.

    Args:
        param_a: The input string to process. Must be non-empty.
        param_b: The integer multiplier applied to the result.

    Returns:
        The computed float value representing the estimated output.

    Raises:
        VerdaTraceException: If param_a is empty or param_b is negative.
    """
```

### Four Function Categories That Require Full Docstrings

Only the following four categories of public functions are required to carry a full Google-style docstring (with at minimum an `Args:` section and a `Returns:` section). All other functions are exempt from the `D` rule set, though concise single-line summaries are encouraged.

| # | Category | Description | Example Functions |
|---|---|---|---|
| 1 | **Emission Formula** | Functions that implement or directly invoke the `E = (P × I) / 1000` formula to produce a `co2e_emitted_kg` value | `CarbonEstimationAgent._run()` |
| 2 | **Carbon Credit Calculation** | Functions that compute integer carbon credit rewards from monetary amounts or actions | `Scope3CommerceAgent._run()` |
| 3 | **RAG Query Builder** | Functions that construct or dispatch retrieval-augmented generation queries to the vector store or LLM | `AgenticRAGExplainerAgent._run()` |
| 4 | **Agent Orchestration Sequence** | Functions that coordinate the execution order and data flow across two or more specialist agents | `OrchestratorAgent._run()`, `DigitalWasteAgent._run()`, `LifestyleEstimationAgent._run()` |

Functions that do not belong to any of these four categories (e.g., simple property accessors, data-class constructors, utility helpers) are exempt from the full docstring requirement.

---

## 3. Module Decomposition

The backend follows a strict separation of concerns. Each directory has a defined role, and cross-boundary dependencies flow in one direction only: `api.py` → `agents/` or `services/`, `agents/` → `services/` or `models/`.

### Layer Boundaries

```
┌──────────────────────────────────────────────────────────────┐
│                   app/api.py  (HTTP Layer)                   │
│  Pydantic request/response validation, route handlers,       │
│  HTTP status mapping. No business logic or arithmetic.       │
│  Delegates all calculations to agents, services, or models.  │
└──────────────────────────┬───────────────────────────────────┘
                           │ calls
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ app/agents/  │   │app/services/ │   │ app/models/  │
└──────────────┘   └──────────────┘   └──────────────┘
```

### `app/agents/`

Contains the ADK-based multi-agent mesh. Every agent is a class that extends the ADK `BaseAgent` or `LlmAgent` pattern and exposes a single `_run(inputs, session)` async method.

- **`agents/orchestrator.py`** — `OrchestratorAgent` (Coordinator). Routes incoming requests to the `AnalyzeGroup` parallel agent or to specialist agents depending on session context. Uses `asyncio.gather` for the `CarbonEstimationAgent` + `OptimizationStrategyAgent` concurrent branch.
- **`agents/adk_core.py`** — Core ADK primitives: `BaseAgent`, `ParallelAgent`, `SessionState`. No business logic.
- **`agents/specialists/core_agents.py`** — `CarbonEstimationAgent`, `OptimizationStrategyAgent`, `ProjectOnboardingAgent`. Emission formula and recommendation logic.
- **`agents/specialists/scope3_agents.py`** — `Scope3CommerceAgent`, `LifestyleEstimationAgent`, `DigitalWasteAgent`. LocalLoops carbon and credit calculations.
- **`agents/specialists/rag_agents.py`** — `AgenticRAGExplainerAgent`, `GreenCopilotChatAgent`. RAG query dispatch and chat routing.
- **`agents/specialists/security_agents.py`** — Security-audit specialist agents.

**Rule:** Agent modules must not import from `app/api.py`. Agent modules may import from `app/services/` and `app/models/`.

### `app/services/`

Contains stateless helper services that encapsulate external provider interaction or reusable computation logic.

- **`services/llm_service.py`** — `LLMService`. Single source of truth for LLM provider selection. All agent modules call `LLMService.get_flash_model()` or `LLMService.get_pro_model()`. No other module under `app/` may contain provider-selection conditionals (`if provider == ...` patterns).
- **`services/db_service.py`** — AlloyDB/Cloud SQL connection management. Respects the `USE_ALLOYDB` feature flag.
- **`services/mcp_service.py`** — Model Context Protocol toolbox integration.

**Rule:** Service modules must not import from `app/agents/` or `app/api.py`.

### `app/models/`

Contains Pydantic v2 data models used as shared types across agents and the API layer.

- Defines request/response schemas, domain value objects, and typed intermediate results.
- Must not contain business logic or I/O operations.
- May be imported by `app/api.py`, `app/agents/`, and `app/services/`.

### `app/api.py`

The FastAPI route layer. Responsibilities:

- Declare route handlers using Pydantic request models for automatic input validation.
- Map HTTP verbs and paths to agent or service calls.
- Return unified JSON envelopes. Error responses use the format `{"error_code": "...", "message": "..."}`.
- **Must not** contain inline business-logic calculations (CO₂e arithmetic, carbon credit formulas, green score computation, kWh calculations). All such logic must be delegated to imported agents, services, or models.

### Unified Error Envelope

All error responses from the API follow this structure:

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Human-readable description of the fault.",
  "detail": [...]
}
```

Domain errors use the `VerdaTraceException` hierarchy defined in `app/exceptions.py`. Bare `Exception` raises are only permitted in test files.

---

## 4. Type Annotation Policy

All public functions and methods in `backend/app/` must carry complete Python type annotations. This is enforced by the `ANN` ruff rule set.

### Required Annotations

- Every function parameter must have a type annotation.
- Every function must declare a return type.
- Functions that return nothing must be annotated `-> None` explicitly (including `__init__` methods, though these are exempt from the `ANN204` warning by configuration — the annotation is still expected for clarity in non-trivial constructors).

### `Any` Usage Policy

`typing.Any` is permitted **only** in the following locations:

| Permitted Location | Reason |
|---|---|
| Agent `_run` method signatures: `inputs: Dict[str, Any]` | ADK contract — agent inputs are dynamic key-value stores constructed at runtime by the orchestrator |
| Agent `_run` return type: `-> Dict[str, Any]` | Agent outputs are dynamic dictionaries; their structure varies per agent |
| LLM service return types: `-> Any` | The generative model object type differs across Vertex AI and OpenAI SDKs; `Any` bridges the two at the service boundary |
| Third-party library boundaries where type stubs are absent | Only when no typed alternative exists and the value is immediately narrowed after the call |

`Any` must **not** appear in:

- Pydantic model field definitions (use specific types or `Union`)
- Route handler signatures in `app/api.py`
- Utility functions in `app/services/` that do not cross SDK boundaries
- Test files (test fixtures and assertions must use concrete types)

### Checking Annotations

```bash
# Ruff enforces ANN rules on every check run:
python -m ruff check app/

# Zero ANN violations indicates full annotation coverage.
```

The `ANN401` rule (which would flag every `Any` usage as an error) is disabled because `Any` is legitimately required at the ADK and LLM provider boundaries described above. Reviewers are expected to manually verify that any new `Any` annotation falls into one of the permitted categories listed in this section.
