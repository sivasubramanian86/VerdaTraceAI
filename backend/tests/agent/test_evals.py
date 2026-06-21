"""Tests for the agent evaluation harness (Requirement 6.3).

Validates:
- All 5 canned prompt-response pairs return valid JSON with a "response" key
- Each pair's expected keywords appear (case-insensitive) in the agent response
- Emission sanity checks: kwh >= 0, co2 >= 0, 0 <= green_score <= 100
"""
import pytest

from app.agents.adk_core import SessionState
from app.agents.orchestrator import orchestrator
from app.evals import run_evals
from app.services.llm_service import llm_service


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _chat_result(query: str) -> dict:
    """Run a single chat query through the orchestrator and return the result."""
    llm_service.is_initialized = False
    session = SessionState()
    session.set("latest_emission", {
        "kwh_consumed": 1.2,
        "co2e_emitted_kg": 0.06,
        "water_liters": 0.24,
        "green_score": 99,
    })
    return await orchestrator.execute({"intent": "chat", "query": query}, session)


# ---------------------------------------------------------------------------
# Pair 1 — europe-west4 / Eemshaven
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_eval_pair_1_europe_west4() -> None:
    """Pair 1: sustainability of europe-west4 → keywords 'europe-west4' and 'Eemshaven'."""
    query = "Why is europe-west4 a good region for sustainability?"
    expected_keywords = ["europe-west4", "Eemshaven"]

    result = await _chat_result(query)

    # JSON structure check
    assert isinstance(result, dict), "Result must be a dict"
    assert "response" in result, "Result must contain a 'response' key"

    response_text = result["response"].lower()
    for keyword in expected_keywords:
        assert keyword.lower() in response_text, (
            f"Expected keyword '{keyword}' not found in response for pair 1.\n"
            f"Response: {result['response']}"
        )


# ---------------------------------------------------------------------------
# Pair 2 — semantic caching
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_eval_pair_2_semantic_caching() -> None:
    """Pair 2: semantic caching query → keywords 'cache' and 'caching'."""
    query = "What is semantic caching?"
    expected_keywords = ["cache", "caching"]

    result = await _chat_result(query)

    # JSON structure check
    assert isinstance(result, dict), "Result must be a dict"
    assert "response" in result, "Result must contain a 'response' key"

    response_text = result["response"].lower()
    for keyword in expected_keywords:
        assert keyword.lower() in response_text, (
            f"Expected keyword '{keyword}' not found in response for pair 2.\n"
            f"Response: {result['response']}"
        )


# ---------------------------------------------------------------------------
# Pair 3 — reduce AI workload carbon footprint
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_eval_pair_3_carbon_footprint() -> None:
    """Pair 3: reducing AI workload carbon footprint → keywords 'carbon' and 'footprint'."""
    query = "How do I reduce my AI workload carbon footprint?"
    expected_keywords = ["carbon", "footprint"]

    result = await _chat_result(query)

    # JSON structure check
    assert isinstance(result, dict), "Result must be a dict"
    assert "response" in result, "Result must contain a 'response' key"

    response_text = result["response"].lower()
    for keyword in expected_keywords:
        assert keyword.lower() in response_text, (
            f"Expected keyword '{keyword}' not found in response for pair 3.\n"
            f"Response: {result['response']}"
        )


# ---------------------------------------------------------------------------
# Pair 4 — Scope 3 emissions
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_eval_pair_4_scope3_emissions() -> None:
    """Pair 4: Scope 3 emissions linked to AI services → keywords 'scope 3' and 'emissions'."""
    query = "What are Scope 3 emissions linked to AI-enabled services?"
    expected_keywords = ["scope 3", "emissions"]

    result = await _chat_result(query)

    # JSON structure check
    assert isinstance(result, dict), "Result must be a dict"
    assert "response" in result, "Result must contain a 'response' key"

    response_text = result["response"].lower()
    for keyword in expected_keywords:
        assert keyword.lower() in response_text, (
            f"Expected keyword '{keyword}' not found in response for pair 4.\n"
            f"Response: {result['response']}"
        )


# ---------------------------------------------------------------------------
# Pair 5 — least-energy model
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_eval_pair_5_least_energy_model() -> None:
    """Pair 5: least-energy model for inference → keywords 'flash' and 'gemini'."""
    query = "Which model uses the least energy for inference?"
    expected_keywords = ["flash", "gemini"]

    result = await _chat_result(query)

    # JSON structure check
    assert isinstance(result, dict), "Result must be a dict"
    assert "response" in result, "Result must contain a 'response' key"

    response_text = result["response"].lower()
    for keyword in expected_keywords:
        assert keyword.lower() in response_text, (
            f"Expected keyword '{keyword}' not found in response for pair 5.\n"
            f"Response: {result['response']}"
        )


# ---------------------------------------------------------------------------
# Emission sanity checks
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_emission_sanity_checks() -> None:
    """Sanity check: kwh >= 0, co2 >= 0, and 0 <= green_score <= 100 after a full analyze run."""
    llm_service.is_initialized = False
    session = SessionState()

    # Onboard
    await orchestrator.execute(
        {
            "intent": "onboard",
            "name": "Validation Workload",
            "provider": "gcp",
            "region": "europe-west4",
            "model_family": "gemini-1.5-flash",
            "hardware": "GPU",
        },
        session,
    )
    # Ingest
    await orchestrator.execute(
        {
            "intent": "ingest",
            "calls": 1000,
            "prompt_tokens": 50000,
            "completion_tokens": 10000,
        },
        session,
    )
    # Analyze
    estimate_result = await orchestrator.execute(
        {
            "intent": "analyze",
            "project_id": "proj_val",
            "provider": "gcp",
            "region": "europe-west4",
            "model_family": "gemini-1.5-flash",
            "runtime_ms": 5000,
        },
        session,
    )

    kwh = estimate_result.get("kwh_consumed", 0.0)
    co2 = estimate_result.get("co2e_emitted_kg", 0.0)
    green_score = estimate_result.get("green_score", 0)

    assert kwh >= 0, f"kwh_consumed must be non-negative, got {kwh}"
    assert co2 >= 0, f"co2e_emitted_kg must be non-negative, got {co2}"
    assert 0 <= green_score <= 100, f"green_score must be in [0, 100], got {green_score}"


# ---------------------------------------------------------------------------
# Full harness smoke test (backward-compatible)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_run_evals_harness() -> None:
    """Verify that the evaluation harness runs correctly and returns a boolean value."""
    llm_service.is_initialized = False
    result = await run_evals()
    assert isinstance(result, bool)
    assert result is True
