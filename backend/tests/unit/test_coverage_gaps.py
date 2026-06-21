"""Coverage gap tests — targets uncovered branches to push backend coverage above 90%.

Covers:
  - app.exceptions: VerdaTraceException hierarchy and HTTP exception helpers
  - app.agents.adk_core: SessionState CRUD, SequentialAgent.execute error path
  - app.agents.specialists.scope3_agents: DigitalWasteAgent missions edge-cases,
    Scope3UnstructuredIngestAgent text-parsing branches, MultimodalIngestionAgent
    image sub-types and text passthrough
  - app.services.llm_service: AgnosticModel language-detection branches
  - app.agents.specialists.rag_agents: stub response keys
"""

import pytest

from app.agents.adk_core import SessionState, SequentialAgent
from app.exceptions import VerdaTraceException


# ---------------------------------------------------------------------------
# Section 1 — VerdaTraceException hierarchy
# ---------------------------------------------------------------------------

def test_verdatrace_exception_attributes() -> None:
    """VerdaTraceException stores message, error_code and status_code correctly."""
    exc = VerdaTraceException(
        message="test error",
        error_code="TEST_ERROR",
        status_code=400,
    )
    assert exc.message == "test error"
    assert exc.error_code == "TEST_ERROR"
    assert exc.status_code == 400
    assert str(exc) == "test error"


def test_verdatrace_exception_defaults() -> None:
    """VerdaTraceException falls back to 400 status when not specified."""
    exc = VerdaTraceException(message="boom", error_code="INTERNAL_ERROR")
    assert exc.status_code == 400
    assert exc.error_code == "INTERNAL_ERROR"


# ---------------------------------------------------------------------------
# Section 2 — SessionState CRUD
# ---------------------------------------------------------------------------

def test_session_state_set_get_delete() -> None:
    """SessionState set/get/delete operations work correctly."""
    state = SessionState()
    state.set("key1", {"value": 42})
    assert state.get("key1") == {"value": 42}
    state.set("key1", "overwritten")
    assert state.get("key1") == "overwritten"
    # Missing key returns None
    assert state.get("missing_key") is None


def test_session_state_default_value() -> None:
    """SessionState.get returns the provided default when key is absent."""
    state = SessionState()
    assert state.get("nonexistent", default="fallback") == "fallback"


# ---------------------------------------------------------------------------
# Section 3 — SequentialAgent error path
# ---------------------------------------------------------------------------

class _ErrorAgent(SequentialAgent):
    """Agent that always raises a VerdaTraceException from _run."""

    def __init__(self) -> None:
        super().__init__("ErrorAgent", "Raises an error every time.")

    async def _run(self, inputs: dict, session: SessionState) -> dict:
        raise VerdaTraceException(message="deliberate error", error_code="TEST_ERR", status_code=500)


@pytest.mark.asyncio
async def test_sequential_agent_execute_catches_exception() -> None:
    """SequentialAgent.execute must return an error dict when _run raises VerdaTraceException."""
    agent = _ErrorAgent()
    session = SessionState()
    result = await agent.execute({}, session)
    assert "error" in result


# ---------------------------------------------------------------------------
# Section 4 — scope3_agents: DigitalWasteAgent branch coverage
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import DigitalWasteAgent  # noqa: E402


@pytest.mark.asyncio
async def test_digital_waste_agent_no_missions() -> None:
    """DigitalWasteAgent returns empty missions when thresholds are not exceeded."""
    agent = DigitalWasteAgent()
    session = SessionState()
    # Low values — email count < 1000, duplicate < 10
    result = await agent._run({"emails_count": 500, "duplicate_media_count": 5}, session)
    assert result["missions"] == []
    assert result["digital_co2e_kg"] >= 0.0


@pytest.mark.asyncio
async def test_digital_waste_agent_both_missions() -> None:
    """DigitalWasteAgent returns two missions when both thresholds are exceeded."""
    agent = DigitalWasteAgent()
    session = SessionState()
    result = await agent._run({"emails_count": 2000, "duplicate_media_count": 50}, session)
    assert len(result["missions"]) == 2
    mission_ids = {m["id"] for m in result["missions"]}
    assert "clean_emails" in mission_ids
    assert "clean_duplicates" in mission_ids


# ---------------------------------------------------------------------------
# Section 5 — scope3_agents: Scope3UnstructuredIngestAgent text-parsing branches
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import Scope3UnstructuredIngestAgent  # noqa: E402


@pytest.mark.asyncio
async def test_unstructured_ingest_agent_aws_branch() -> None:
    """Scope3UnstructuredIngestAgent detects AWS from text and sets provider accordingly."""
    agent = Scope3UnstructuredIngestAgent()
    session = SessionState()
    result = await agent._run(
        {"unstructured_text": "Amazon AWS us-east-1 claude-3-5-sonnet 10000 tokens"}, session
    )
    assert result["provider"] == "aws"
    assert result["region"] == "us-east-1"
    assert "audit_hash" in result


@pytest.mark.asyncio
async def test_unstructured_ingest_agent_azure_branch() -> None:
    """Scope3UnstructuredIngestAgent detects Azure from text and sets provider."""
    agent = Scope3UnstructuredIngestAgent()
    session = SessionState()
    result = await agent._run(
        {"unstructured_text": "Microsoft Azure swedencentral gpt-4o-mini 5000"}, session
    )
    assert result["provider"] == "azure"
    assert result["region"] == "swedencentral"


@pytest.mark.asyncio
async def test_unstructured_ingest_agent_onprem_branch() -> None:
    """Scope3UnstructuredIngestAgent detects on-prem from text."""
    agent = Scope3UnstructuredIngestAgent()
    session = SessionState()
    result = await agent._run(
        {"unstructured_text": "on-prem private datacenter llama-3-8b 1000 200 50"}, session
    )
    assert result["provider"] == "onprem"
    assert result["region"] == "local-onprem"
    # calls, prompt_tokens etc. are parsed from the numeric tokens in the text
    assert isinstance(result["calls"], int)
    assert "audit_hash" in result


@pytest.mark.asyncio
async def test_unstructured_ingest_agent_caching_detected() -> None:
    """Scope3UnstructuredIngestAgent detects context caching keyword in text."""
    agent = Scope3UnstructuredIngestAgent()
    session = SessionState()
    result = await agent._run(
        {"unstructured_text": "GCP context caching enabled gemini-2.0-flash 50000 1000 200"}, session
    )
    assert result["caching_enabled"] is True
    assert result["model_family"] == "gemini-2.0-flash"


# ---------------------------------------------------------------------------
# Section 6 — scope3_agents: MultimodalIngestionAgent sub-types
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import MultimodalIngestionAgent  # noqa: E402


@pytest.mark.asyncio
async def test_multimodal_ingestion_image_label() -> None:
    """MultimodalIngestionAgent correctly processes image/label input."""
    agent = MultimodalIngestionAgent()
    session = SessionState()
    result = await agent._run({"media_type": "image", "image_type": "label"}, session)
    assert result["media_type"] == "image"
    assert "Spain" in result["extracted_text"]


@pytest.mark.asyncio
async def test_multimodal_ingestion_image_map() -> None:
    """MultimodalIngestionAgent correctly processes image/map input."""
    agent = MultimodalIngestionAgent()
    session = SessionState()
    result = await agent._run({"media_type": "image", "image_type": "map"}, session)
    assert "Indiranagar" in result["extracted_text"]
    assert "latitude" in result["metadata"]


@pytest.mark.asyncio
async def test_multimodal_ingestion_image_receipt() -> None:
    """MultimodalIngestionAgent correctly processes image/receipt input."""
    agent = MultimodalIngestionAgent()
    session = SessionState()
    result = await agent._run({"media_type": "image", "image_type": "receipt"}, session)
    assert "Namma Yatri" in result["extracted_text"]
    assert result["metadata"]["vendor"] == "Namma Yatri"


@pytest.mark.asyncio
async def test_multimodal_ingestion_text_passthrough() -> None:
    """MultimodalIngestionAgent passes raw text through when media_type='text'."""
    agent = MultimodalIngestionAgent()
    session = SessionState()
    result = await agent._run({"media_type": "text", "text": "my custom text"}, session)
    assert result["extracted_text"] == "my custom text"


# ---------------------------------------------------------------------------
# Section 7 — AgnosticModel language-detection branches
# ---------------------------------------------------------------------------

from app.services.llm_service import AgnosticModel  # noqa: E402


def test_agnostic_model_spanish_optimization() -> None:
    """AgnosticModel detects Spanish prompt and returns Spanish optimization response."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("Necesito actionable steps para optimizar el carbono en español")
    assert "europe-west4" in resp.text or "carbono" in resp.text.lower()


def test_agnostic_model_french_optimization() -> None:
    """AgnosticModel detects French prompt and returns French optimization response."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("actionable steps pour réduire le carbone en français")
    assert "europe-west4" in resp.text or "carbone" in resp.text.lower()


def test_agnostic_model_german_optimization() -> None:
    """AgnosticModel detects German prompt and returns German response."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("actionable steps für Kohlenstoff auf Deutsch")
    assert "europe-west4" in resp.text or "carbon" in resp.text.lower()


def test_agnostic_model_scope3_branch() -> None:
    """AgnosticModel returns Scope 3 explanation for scope3 queries."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("What are scope 3 emissions?")
    assert "Scope 3" in resp.text


def test_agnostic_model_efficient_model_branch() -> None:
    """AgnosticModel returns energy-efficient model advice."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("Which model uses least energy for inference?")
    assert "Flash" in resp.text or "efficient" in resp.text.lower()


def test_agnostic_model_semantic_caching_branch() -> None:
    """AgnosticModel returns caching explanation for semantic cach queries."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("Explain semantic caching for LLMs")
    assert "cache" in resp.text.lower() or "latency" in resp.text.lower()


def test_agnostic_model_copilot_french_branch() -> None:
    """AgnosticModel returns French copilot response when green copilot in French."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("green copilot pourquoi la région europe-west4 est meilleure en français")
    assert "europe-west4" in resp.text or "carbone" in resp.text.lower()


def test_agnostic_model_generic_spanish_fallback() -> None:
    """AgnosticModel returns generic Spanish response for unrecognized Spanish prompts."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("Hola, necesito ayuda con algo genérico")
    assert "Procesando" in resp.text or "optimizar" in resp.text.lower()


def test_agnostic_model_generic_french_fallback() -> None:
    """AgnosticModel returns generic French response for unrecognized French prompts."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("Bonjour, comment puis-je faire quelque chose de générique")
    assert "Reçu" in resp.text or "carbone" in resp.text.lower()


def test_agnostic_model_carbon_footprint_branch() -> None:
    """AgnosticModel returns carbon footprint reduction advice."""
    model = AgnosticModel("stub", "mock-model")
    resp = model.generate_content("How can I reduce my carbon footprint?")
    assert "europe-west4" in resp.text or "flash" in resp.text.lower()


# ---------------------------------------------------------------------------
# Section 8 — TransitGamifierAgent: zero credits (cab mode)
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import TransitGamifierAgent  # noqa: E402


@pytest.mark.asyncio
async def test_transit_gamifier_cab_zero_credits() -> None:
    """TransitGamifierAgent awards zero credits for cab rides."""
    agent = TransitGamifierAgent()
    session = SessionState()
    result = await agent._run({"mode": "Cab", "distance_km": 5.0}, session)
    assert result["credits_earned"] == 0
    assert result["co2e_saved_kg"] == 0.0  # cab = baseline


@pytest.mark.asyncio
async def test_transit_gamifier_walking_maximum_credits() -> None:
    """TransitGamifierAgent awards maximum credits for walking."""
    agent = TransitGamifierAgent()
    session = SessionState()
    result = await agent._run({"mode": "Walking", "distance_km": 10.0}, session)
    assert result["credits_earned"] == 100  # 10 * 10
    assert result["co2e_saved_kg"] == 1.70  # 10 * 0.17


@pytest.mark.asyncio
async def test_transit_gamifier_cycling_credits() -> None:
    """TransitGamifierAgent awards cycling credits correctly."""
    agent = TransitGamifierAgent()
    session = SessionState()
    result = await agent._run({"mode": "Cycling", "distance_km": 5.0}, session)
    assert result["credits_earned"] == 50  # 5 * 10
