import pytest
from app.agents.adk_core import SessionState
from app.agents.specialists import (
    ProjectOnboardingAgent,
    CarbonEstimationAgent,
    OptimizationStrategyAgent,
    AgenticRAGExplainerAgent,
    GreenCopilotChatAgent,
    MCPDataConnectorAgent,
    LocalizationAndNarrationAgent
)
from app.services.llm_service import llm_service

# Ensure we use AgnosticModel stubs instead of attempting real Vertex AI connection during test execution
llm_service.is_initialized = False

@pytest.mark.asyncio
async def test_project_onboarding_missing_name() -> None:
    """Verify onboarding agent returns error if name is missing."""
    agent = ProjectOnboardingAgent()
    session = SessionState()
    result = await agent.execute({}, session)
    assert "error" in result


@pytest.mark.asyncio
async def test_carbon_estimation_multimodal_branches() -> None:
    """Test CarbonEstimationAgent with image, audio, and video inputs + caching."""
    agent = CarbonEstimationAgent()

    # 1. Image + caching
    session1 = SessionState()
    session1.set("latest_usage", {"media_type": "image", "media_count": 5, "caching_active": True})
    res1 = await agent.execute({"runtime_ms": 1000}, session1)
    assert res1["uncertainty_pct"] == 5

    # 2. Audio + caching
    session2 = SessionState()
    session2.set("latest_usage", {"media_type": "audio", "media_duration_sec": 30.0, "caching_active": False})
    res2 = await agent.execute({"runtime_ms": 1000}, session2)
    assert res2["uncertainty_pct"] == 12

    # 3. Video
    session3 = SessionState()
    session3.set("latest_usage", {"media_type": "video", "media_duration_sec": 10.0, "caching_active": True})
    res3 = await agent.execute({"runtime_ms": 1000}, session3)
    assert res3["uncertainty_pct"] == 5


@pytest.mark.asyncio
async def test_optimization_strategy_stub_fallbacks() -> None:
    """Test OptimizationStrategyAgent under different cloud providers to hit stub recommendations."""
    agent = OptimizationStrategyAgent()
    
    session_aws = SessionState()
    result_aws = await agent.execute({"provider": "aws", "region": "us-east-1"}, session_aws)
    assert any("europe-west4" in rec or "us-west-2" in rec for rec in result_aws["recommendations"])

    session_azure = SessionState()
    result_azure = await agent.execute({"provider": "azure", "region": "eastus"}, session_azure)
    assert any("europe-west4" in rec or "swedencentral" in rec for rec in result_azure["recommendations"])

    session_onprem = SessionState()
    result_onprem = await agent.execute({"provider": "onprem", "region": "local-onprem"}, session_onprem)
    assert any("europe-west4" in rec or "quantized" in rec for rec in result_onprem["recommendations"])


@pytest.mark.asyncio
async def test_agentic_rag_explainer_agent_stub() -> None:
    """Test AgenticRAGExplainerAgent queries and fallback reasoning responses."""
    agent = AgenticRAGExplainerAgent()
    session = SessionState()
    result = await agent.execute({"query": "What is the water stress index of Azure swedencentral?"}, session)
    assert "explanation" in result


@pytest.mark.asyncio
async def test_green_copilot_chat_agent_multimodal() -> None:
    """Test GreenCopilotChatAgent with different media attachment queries."""
    agent = GreenCopilotChatAgent()
    
    # Text only
    session_text = SessionState()
    res_text = await agent.execute({"query": "sustainability comparison"}, session_text)
    assert "response" in res_text

    # With Image
    session_img = SessionState()
    session_img.set("latest_usage", {"media_type": "image", "media_count": 2})
    res_img = await agent.execute({"query": "analyze dashboard photo"}, session_img)
    assert "response" in res_img


@pytest.mark.asyncio
async def test_mcp_data_connector_agent_scenarios() -> None:
    """Test MCPDataConnectorAgent tool mappings."""
    agent = MCPDataConnectorAgent()
    session = SessionState()
    
    # Test valid tool
    res_valid = await agent.execute({"tool_name": "get_project_emissions"}, session)
    assert res_valid["status"] == "mcp_ok"

    # Test unknown tool
    res_invalid = await agent.execute({"tool_name": "unknown_tool"}, session)
    assert "error" in res_invalid or "status" in res_invalid


@pytest.mark.asyncio
async def test_localization_narration_agent_locales() -> None:
    """Test LocalizationAndNarrationAgent default/fallback language behaviors."""
    agent = LocalizationAndNarrationAgent()
    session = SessionState()
    res = await agent.execute({"target_lang": "invalid-lang-code"}, session)
    assert res["target_lang"] == "invalid-lang-code"
    assert "VerdaTrace" in res["translated_text"]
