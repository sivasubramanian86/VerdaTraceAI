# EVALS.md — Agent Evaluation Harness

This document describes the evaluation harness used to validate `GreenCopilotChatAgent` behaviour regression-free across a fixed set of canned prompts.

---

## Canned Prompts and Expected Keywords

The harness defines five prompt–keyword pairs. A response **passes** a case when every keyword in the set appears in the agent output (case-insensitive substring match).

| # | Prompt | Expected Keywords |
|---|--------|-------------------|
| 1 | Why is europe-west4 a good region for sustainability? | `europe-west4`, `eemshaven` |
| 2 | What is semantic caching? | `cache`, `caching` |
| 3 | How do I reduce my AI workload carbon footprint? | `carbon`, `footprint` |
| 4 | What are Scope 3 emissions linked to AI-enabled services? | `scope 3`, `emissions` |
| 5 | Which model uses the least energy for inference? | `flash`, `gemini` |

---

## Scoring Methodology

The harness uses **keyword presence rate** as its sole metric:

```
score = (number of cases where ALL keywords are present) / (total cases)
```

- A single case is considered **passing** only when **every** keyword in its set appears in the response text (case-insensitive).
- The score therefore ranges from `0.0` (no cases pass) to `1.0` (all cases pass).
- The CI gate requires `score == 1.0` — all five canned prompts must pass.

### Example

Given a response to prompt 1 that contains the words `europe-west4` and `eemshaven`, that case contributes `1` to the numerator. A response that contains `europe-west4` but not `eemshaven` contributes `0`.

---

## Running Locally

Run the eval harness directly against the live agent:

```bash
# From the repository root
python backend/app/evals.py
```

The script prints a per-case pass/fail summary and the overall score:

```
[PASS] Case 1: Why is europe-west4 a good region for sustainability?
[PASS] Case 2: What is semantic caching?
[PASS] Case 3: How do I reduce my AI workload carbon footprint?
[PASS] Case 4: What are Scope 3 emissions linked to AI-enabled services?
[PASS] Case 5: Which model uses the least energy for inference?

Score: 5/5 (1.00)
```

> **Note:** Running locally requires a valid `GOOGLE_API_KEY` (or `OPENAI_API_KEY`) and a running backend environment. Set the environment variables defined in `backend/.env.example` before running.

---

## CI Enforcement

The eval harness is enforced in CI via pytest. On every push the CI pipeline runs:

```bash
pytest tests/agent/test_evals.py -v
```

The test file (`backend/tests/agent/test_evals.py`) imports the `run_evals()` function from `backend/app/evals.py` and asserts:

1. Each of the five canned prompt–response pairs individually passes the keyword-presence check.
2. Every response is a valid JSON dict containing a `"response"` key.
3. Numeric sanity checks hold for applicable responses: `kwh >= 0`, `co2 >= 0`, `0 <= green_score <= 100`.

The CI backend job fails if any assertion is not met, preventing merges that regress agent output quality.

See `.github/workflows/ci.yml` for the full pipeline definition.
