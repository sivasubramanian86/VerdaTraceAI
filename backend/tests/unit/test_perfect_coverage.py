import asyncio
import os
import runpy
from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.agents.adk_core import BaseAgent, CoordinatorAgent, ParallelAgent, SequentialAgent, SessionState
from app.agents.orchestrator import OrchestratorAgent
from app.agents.specialists.core_agents import OptimizationStrategyAgent
from app.agents.specialists.rag_agents import AgenticRAGExplainerAgent, GreenCopilotChatAgent, MCPDataConnectorAgent
from app.agents.specialists.scope3_agents import LifestyleEstimationAgent, Scope3UnstructuredIngestAgent
from app.api import local_loops_db, router
from app.exceptions import ResourceNotFoundError, ValidationError, VerdaTraceException
from app.services.llm_service import AgnosticModel, LLMService

# ---------------------------------------------------------------------------
# 1. app/agents/adk_core.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_base_agent_execute_not_implemented() -> None:
    agent = BaseAgent("BaseTest", "Description")
    with pytest.raises(NotImplementedError):
        await agent.execute({}, SessionState())


@pytest.mark.asyncio
async def test_sequential_agent_run_default() -> None:
    agent = SequentialAgent("SeqTest", "Description")
    res = await agent._run({}, SessionState())
    assert res == {}


@pytest.mark.asyncio
async def test_parallel_agent_exception_handling() -> None:
    class FailingAgent(BaseAgent):
        async def execute(self, inputs, session):
            raise ValueError("Child agent failed")

    class WorkingAgent(BaseAgent):
        async def execute(self, inputs, session):
            return {"ok": True}

    p_agent = ParallelAgent("ParallelTest", "Desc", [FailingAgent("Fail", "D"), WorkingAgent("Work", "D")])
    result = await p_agent.execute({}, SessionState())
    assert "ok" in result
    assert "errors" in result
    assert "Child agent failed" in result["errors"][0]


@pytest.mark.asyncio
async def test_coordinator_agent_no_route_and_route_not_implemented() -> None:
    coord = CoordinatorAgent("CoordTest", "Description", {})
    with pytest.raises(NotImplementedError):
        await coord.route({}, SessionState())

    # Mock route to return intent that doesn't exist
    coord.route = MagicMock(return_value=asyncio.Future())
    coord.route.return_value.set_result("non_existent")
    res = await coord.execute({}, SessionState())
    assert "error" in res
    assert "No route found for intent: non_existent" in res["error"]


# ---------------------------------------------------------------------------
# 2. app/agents/orchestrator.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_orchestrator_fallback_intent() -> None:
    orch = OrchestratorAgent()
    intent = await orch.route({"intent": "invalid_intent"}, SessionState())
    assert intent == "analyze"


# ---------------------------------------------------------------------------
# 3. app/agents/specialists/core_agents.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_optimization_strategy_null_model_branches() -> None:
    agent = OptimizationStrategyAgent()

    with patch("app.services.llm_service.llm_service.get_flash_model", return_value=None):
        # Test AWS
        res_aws = await agent.execute({"provider": "aws"}, SessionState())
        assert any("us-west-2" in r for r in res_aws["recommendations"])

        # Test Azure
        res_az = await agent.execute({"provider": "azure"}, SessionState())
        assert any("swedencentral" in r for r in res_az["recommendations"])

        # Test Onprem
        res_op = await agent.execute({"provider": "onprem"}, SessionState())
        assert any("quantized" in r for r in res_op["recommendations"])

        # Test default GCP
        res_gcp = await agent.execute({"provider": "gcp"}, SessionState())
        assert any("europe-west4" in r for r in res_gcp["recommendations"])


@pytest.mark.asyncio
async def test_optimization_strategy_generate_exception() -> None:
    agent = OptimizationStrategyAgent()
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("Vertex limit exceeded")

    with patch("app.services.llm_service.llm_service.get_flash_model", return_value=mock_model):
        res = await agent.execute({"provider": "gcp"}, SessionState())
        assert any("Error generating optimizations" in r for r in res["recommendations"])


# ---------------------------------------------------------------------------
# 4. app/agents/specialists/rag_agents.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_rag_explainer_null_model_and_exception() -> None:
    agent = AgenticRAGExplainerAgent()

    # Null model
    with patch("app.services.llm_service.llm_service.get_pro_model", return_value=None):
        res_null = await agent.execute({"query": "testing"}, SessionState())
        assert "Vertex AI not initialized" in res_null["explanation"]

    # Exception model
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("Quota error")
    with patch("app.services.llm_service.llm_service.get_pro_model", return_value=mock_model):
        res_err = await agent.execute({"query": "testing"}, SessionState())
        assert "Failed to generate explanation" in res_err["explanation"]


@pytest.mark.asyncio
async def test_green_copilot_chat_null_model_and_exception() -> None:
    agent = GreenCopilotChatAgent()

    # Null model
    with patch("app.services.llm_service.llm_service.get_pro_model", return_value=None):
        res_null = await agent.execute({"query": "testing"}, SessionState())
        assert "Vertex AI Offline" in res_null["response"]

    # Exception model
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("General error")
    with patch("app.services.llm_service.llm_service.get_pro_model", return_value=mock_model):
        res_err = await agent.execute({"query": "testing"}, SessionState())
        assert "Chat failure" in res_err["response"]


@pytest.mark.asyncio
async def test_mcp_data_connector_recommendations() -> None:
    agent = MCPDataConnectorAgent()
    res = await agent.execute({"tool_name": "get_recommendations"}, SessionState())
    assert "Europe Migration" in res["recommendations"]


# ---------------------------------------------------------------------------
# 5. app/agents/specialists/scope3_agents.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_lifestyle_onboarding_guardian_and_heavyweight() -> None:
    agent = LifestyleEstimationAgent()

    # Eco-Guardian: Total co2 < 3000
    res_guardian = await agent.execute(
        {
            "driving_km": 0,
            "diet_type": "vegan",
            "electricity_kwh": 0,
            "heating_source": "none",
            "shopping_level": "low",
            "recycling": True,
        },
        SessionState(),
    )
    assert res_guardian["sustainability_rank"] == "Eco-Guardian"

    # Carbon Heavyweight: Total co2 >= 10000
    res_heavy = await agent.execute(
        {
            "driving_km": 100000,
            "diet_type": "meat-heavy",
            "electricity_kwh": 5000,
            "heating_source": "gas",
            "shopping_level": "high",
            "recycling": False,
        },
        SessionState(),
    )
    assert res_heavy["sustainability_rank"] == "Carbon Heavyweight"


@pytest.mark.asyncio
async def test_scope3_unstructured_ingest_real_llm_flow() -> None:
    agent = Scope3UnstructuredIngestAgent()

    # Mock a model that does NOT have the 'provider' attribute to trigger the real LLM flow
    mock_model = MagicMock(spec=["generate_content"])
    mock_response = MagicMock()
    mock_response.text = '{"provider": "aws", "region": "us-east-1", "model_family": "claude-3", "calls": 1234}'
    mock_model.generate_content.return_value = mock_response

    with patch("app.services.llm_service.llm_service.get_flash_model", return_value=mock_model):
        res = await agent.execute({"unstructured_text": "run some tasks"}, SessionState())
        assert res["provider"] == "aws"
        assert res["region"] == "us-east-1"
        assert res["calls"] == 1234

    # Exception path in real LLM block
    mock_model.generate_content.side_effect = Exception("JSON Parse Error")
    with patch("app.services.llm_service.llm_service.get_flash_model", return_value=mock_model):
        res = await agent.execute({"unstructured_text": "run some tasks"}, SessionState())
        assert res["provider"] == "gcp"  # falls back to defaults


# ---------------------------------------------------------------------------
# 6. app/api.py Gaps
# ---------------------------------------------------------------------------


def test_api_load_mcp_server_exception_and_mock_server() -> None:
    # Trigger exception in load_mcp_server by patching spec_from_file_location
    with patch("importlib.util.spec_from_file_location", side_effect=ValueError("import fail")):
        from app.api import load_mcp_server

        server = load_mcp_server()
        assert server.call_tool("tool", {}) == '{"status": "mocked", "msg": "MCP offline"}'
        assert "optimizes carbon" in server.get_prompt("prompt", {})


@pytest.mark.asyncio
async def test_api_mcp_tool_json_decode_error() -> None:
    # Patch mcp_server.call_tool to return a non-JSON string
    with patch("app.api.mcp_server.call_tool", return_value="plain-text-response"):
        app = FastAPI()
        app.include_router(router)
        client = TestClient(app)
        response = client.post("/mcp/tool/test_tool", json={"arguments": {}})
        assert response.status_code == 200
        assert response.json() == {"response": "plain-text-response"}


def test_api_loops_clean_duplicates_and_not_found() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    # Pre-populate a digital mission in DB to verify it can be completed
    local_loops_db["digital"]["missions"] = [
        {"id": "clean_duplicates", "title": "Clean duplicates", "credits_reward": 50, "status": "active"}
    ]

    # 1. clean_duplicates mission
    response = client.post("/loops/digital/mission/clean_duplicates")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # 2. Mission not found
    response = client.post("/loops/digital/mission/non_existent")
    assert response.status_code == 200
    assert response.json() == {"status": "error", "message": "Mission not found"}


def test_api_loops_circular_borrow_existing() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    # Ensure local_loops_db contains the item
    local_loops_db["circular"] = [{"name": "LED Monitor", "status": "available", "id": "item_123"}]

    response = client.post(
        "/loops/circular", json={"item_name": "LED Monitor", "owner": "Neighbor", "action": "borrow"}
    )
    assert response.status_code == 200
    assert response.json()["action"] == "borrow"
    # The status should change to borrowed
    assert local_loops_db["circular"][0]["status"] == "borrowed"


# ---------------------------------------------------------------------------
# 7. app/evals.py Gaps
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_run_evals_unstable_json() -> None:
    from app.evals import run_evals

    # Mock orchestrator to return empty dict (missing response key)
    with patch("app.evals.orchestrator.execute", return_value={"wrong_key": "val"}):
        success = await run_evals()
        assert success is False


@pytest.mark.asyncio
async def test_run_evals_missing_keywords() -> None:
    from app.evals import run_evals

    # Mock orchestrator to return a response without matching keywords
    with patch("app.evals.orchestrator.execute", return_value={"response": "unrelated gibberish"}):
        success = await run_evals()
        assert success is False


@pytest.mark.asyncio
async def test_run_evals_negative_metrics() -> None:
    from app.evals import run_evals

    # Mock orchestrator execution returns
    def mock_exec(inputs, session):
        # For the chat test cases
        if inputs.get("intent") == "chat":
            return {"response": "europe-west4 Eemshaven cache footprint scope 3 emissions flash gemini"}
        # For the onboard / ingest / analyze steps
        return {"kwh_consumed": -1.0, "co2e_emitted_kg": 0.0, "green_score": 50}

    with patch("app.evals.orchestrator.execute", side_effect=mock_exec):
        success = await run_evals()
        assert success is False


@pytest.mark.asyncio
async def test_run_evals_invalid_green_score() -> None:
    from app.evals import run_evals

    def mock_exec(inputs, session):
        if inputs.get("intent") == "chat":
            return {"response": "europe-west4 Eemshaven cache footprint scope 3 emissions flash gemini"}
        return {"kwh_consumed": 1.0, "co2e_emitted_kg": 0.05, "green_score": 150}

    with patch("app.evals.orchestrator.execute", side_effect=mock_exec):
        success = await run_evals()
        assert success is False


def test_evals_main_block() -> None:
    # Mock orchestrator.execute so the real run_evals succeeds organically
    def mock_exec(inputs, session):
        if inputs.get("intent") == "chat":
            return {"response": "europe-west4 Eemshaven cache caching carbon footprint scope 3 emissions flash gemini"}
        return {"kwh_consumed": 1.5, "co2e_emitted_kg": 0.05, "green_score": 90}

    with patch("app.evals.orchestrator.execute", side_effect=mock_exec):
        with patch("sys.exit") as mock_exit:
            runpy.run_path("app/evals.py", run_name="__main__")
            mock_exit.assert_called_once_with(0)


# ---------------------------------------------------------------------------
# 8. app/exceptions.py Gaps
# ---------------------------------------------------------------------------


def test_validation_error_init() -> None:
    err = ValidationError("Bad schema")
    assert err.status_code == 422
    assert err.error_code == "VALIDATION_ERROR"


def test_resource_not_found_init() -> None:
    err = ResourceNotFoundError("Not there")
    assert err.status_code == 404
    assert err.error_code == "RESOURCE_NOT_FOUND"


# ---------------------------------------------------------------------------
# 9. app/main.py Gaps
# ---------------------------------------------------------------------------


def test_main_exception_handlers() -> None:
    from app.main import app

    client = TestClient(app, raise_server_exceptions=False)

    # 1. VerdaTraceException Handler
    # Triggered by calling a router function or we can use a dummy endpoint added to app
    @app.get("/test-verda-exc")
    async def trigger_verda_exc():
        raise VerdaTraceException("Domain error occurred", "DOMAIN_ERR", 400)

    res = client.get("/test-verda-exc")
    assert res.status_code == 400
    assert res.json() == {"status": "error", "error_code": "DOMAIN_ERR", "message": "Domain error occurred"}

    # 2. General Exception Handler
    @app.get("/test-general-exc")
    async def trigger_general_exc():
        raise RuntimeError("Something broke internally")

    res = client.get("/test-general-exc")
    assert res.status_code == 500
    assert res.json() == {
        "status": "error",
        "error_code": "INTERNAL_SERVER_ERROR",
        "message": "An unexpected error occurred on the server.",
    }

    # 3. RequestValidationError Handler
    # Trigger by sending invalid payload to an existing post endpoint
    res = client.post("/api/v1/loops/digital", json={"emails_count": "not-an-int-should-fail"})
    assert res.status_code == 422
    assert "error_code" in res.json()
    assert res.json()["error_code"] == "VALIDATION_ERROR"


def test_main_uvicorn_run() -> None:
    with patch("uvicorn.run") as mock_run:
        runpy.run_path("app/main.py", run_name="__main__")
        mock_run.assert_called_once()


# ---------------------------------------------------------------------------
# 10. app/services/llm_service.py Gaps
# ---------------------------------------------------------------------------


def test_agnostic_model_spanish_copilot_branch() -> None:
    model = AgnosticModel("stub", "model")
    res = model.generate_content("green copilot en español hola como region")
    assert "europe-west4" in res.text
    assert "energia libre" in res.text.lower() or "libre de carbono" in res.text.lower()


def test_agnostic_model_generic_english_fallback() -> None:
    model = AgnosticModel("stub", "model")
    res = model.generate_content("some completely random text")
    assert "optimize the carbon footprint" in res.text


def test_llm_service_initialization_exceptions() -> None:
    # Test Vertex AI initialization exception path
    with patch("app.services.llm_service.settings") as mock_settings:
        mock_settings.LLM_PROVIDER = "vertex-ai"
        mock_settings.GCP_PROJECT_ID = "test-proj"
        mock_settings.VERTEX_REGION = "us-central1"
        with patch("google.cloud.aiplatform.init", side_effect=RuntimeError("GCP init fail")):
            service = LLMService()
            assert service.is_initialized is False

    # Test Non-Vertex Provider path
    with patch("app.services.llm_service.settings") as mock_settings:
        mock_settings.LLM_PROVIDER = "openai"
        service = LLMService()
        assert service.is_initialized is False


def test_llm_service_get_model_exceptions() -> None:
    # 1. Primary failure, fallback success
    service = LLMService()
    service.provider = "vertex-ai"
    service.is_initialized = True

    # GenerativeModel raises exception for primary_model, works for fallback
    def mock_generative_model(name, generation_config=None):
        if name == "primary":
            raise RuntimeError("Primary model not found")
        return f"GenerativeModel-{name}"

    with patch("app.services.llm_service.GenerativeModel", side_effect=mock_generative_model):
        model = service._get_model("primary", "fallback")
        assert model == "GenerativeModel-fallback"

    # 2. Both failure, returns AgnosticModel
    def mock_both_fail(name, generation_config=None):
        raise RuntimeError("No model available")

    with patch("app.services.llm_service.GenerativeModel", side_effect=mock_both_fail):
        model = service._get_model("primary", "fallback")
        assert isinstance(model, AgnosticModel)
        assert model.model_name == "primary"


def test_llm_service_override_model() -> None:
    service = LLMService()
    service.provider = "openai"
    service.is_initialized = False
    with patch.dict(os.environ, {"OVERRIDE_LLM_MODEL": "custom-override-model"}):
        model = service.get_flash_model()
        assert model.model_name == "custom-override-model"
