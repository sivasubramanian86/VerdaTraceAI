import pytest

from app.agents.adk_core import SessionState
from app.agents.specialists import (
    CarbonEstimationAgent,
    EvalAndGuardrailAgent,
    MCPDataConnectorAgent,
    ProjectOnboardingAgent,
    UsageIngestionAgent,
)


@pytest.mark.asyncio
async def test_carbon_estimation_agent() -> None:
    """Verify that CarbonEstimationAgent computes metrics correctly based on region heuristics."""
    agent = CarbonEstimationAgent()
    session = SessionState()

    inputs = {"runtime_ms": 2000, "region": "europe-west4", "execution_hour": 12}

    result = await agent.execute(inputs, session)

    assert "kwh_consumed" in result
    assert "co2e_emitted_kg" in result
    assert "water_liters" in result
    assert "trees_offset" in result
    assert "ocean_seagrass_sqm" in result
    assert "uncertainty_pct" in result
    assert "water_stress_index" in result
    assert "green_score" in result
    assert result["co2e_emitted_kg"] > 0
    assert result["water_liters"] > 0
    assert result["water_stress_index"] == "Low"
    assert result["uncertainty_pct"] == 22
    assert result["green_score"] > 90

    # Verify diurnal curve variations
    inputs_midday = {"runtime_ms": 2000, "region": "europe-west4", "execution_hour": 12}
    inputs_night = {"runtime_ms": 2000, "region": "europe-west4", "execution_hour": 0}

    res_midday = await agent.execute(inputs_midday, session)
    res_night = await agent.execute(inputs_night, session)
    assert res_midday["co2e_emitted_kg"] < res_night["co2e_emitted_kg"]


@pytest.mark.asyncio
async def test_project_onboarding_agent() -> None:
    """Verify project onboarding configuration creation and validation."""
    agent = ProjectOnboardingAgent()
    session = SessionState()

    inputs = {"name": "My LLM Workload", "region": "europe-west4", "model_family": "gemini-1.5-pro"}

    result = await agent.execute(inputs, session)
    assert result["status"] == "success"
    assert result["config"]["name"] == "My LLM Workload"
    assert session.get("config_My LLM Workload") is not None


@pytest.mark.asyncio
async def test_usage_ingestion_agent_caching() -> None:
    """Verify token normalization with and without context caching enabled."""
    agent = UsageIngestionAgent()

    # Without caching
    session_1 = SessionState()
    result_1 = await agent.execute(
        {"calls": 100, "prompt_tokens": 1000, "completion_tokens": 500, "caching_enabled": False}, session_1
    )
    assert result_1["usage"]["effective_tokens"] == 1500

    # With caching
    session_2 = SessionState()
    result_2 = await agent.execute(
        {"calls": 100, "prompt_tokens": 1000, "completion_tokens": 500, "caching_enabled": True, "cached_tokens": 800},
        session_2,
    )
    assert result_2["usage"]["effective_tokens"] == 700


@pytest.mark.asyncio
async def test_mcp_data_connector_agent() -> None:
    """Verify simulated MCP dataset tool fetching."""
    agent = MCPDataConnectorAgent()
    session = SessionState()

    result = await agent.execute({"tool_name": "get_project_emissions"}, session)
    assert result["status"] == "mcp_ok"
    assert result["total_co2e"] == 142.5


@pytest.mark.asyncio
async def test_eval_and_guardrail_agent() -> None:
    """Verify guardrails block restricted cloud environments or hallucinated configurations."""
    agent = EvalAndGuardrailAgent()
    session = SessionState()

    # Safe text
    result_safe = await agent.execute(
        {"text": "Use Vertex AI and AlloyDB on Google Cloud, or AWS EC2 instances"}, session
    )
    assert result_safe["status"] == "safe"
    assert result_safe["metrics"]["score"] == 1.0

    # Hallucinated provider warning
    result_unsafe = await agent.execute({"text": "This workload runs on fake-cloud infrastructure"}, session)
    assert result_unsafe["status"] == "flagged"
    assert result_unsafe["metrics"]["score"] == 0.0


@pytest.mark.asyncio
async def test_lifestyle_estimation_agent() -> None:
    """Verify that LifestyleEstimationAgent computes carbon metrics correctly."""
    from app.agents.specialists import LifestyleEstimationAgent

    agent = LifestyleEstimationAgent()
    session = SessionState()

    inputs = {
        "driving_km": 10000,
        "vehicle_type": "gas",
        "diet_type": "vegan",
        "electricity_kwh": 3000,
        "heating_source": "solar",
        "shopping_level": "low",
        "recycling": True,
    }

    result = await agent.execute(inputs, session)
    assert "lifestyle_co2_yr_kg" in result
    assert "vehicle_co2_kg" in result
    assert "diet_co2_kg" in result
    assert "sustainability_rank" in result
    assert result["vehicle_co2_kg"] == 1700.0  # 10000 * 0.17
    assert result["diet_co2_kg"] == 800.0  # vegan
    assert result["sustainability_rank"] == "Green Enthusiast"


@pytest.mark.asyncio
async def test_digital_waste_agent() -> None:
    """Verify digital waste carbon calculations and quests generation."""
    from app.agents.specialists import DigitalWasteAgent

    agent = DigitalWasteAgent()
    session = SessionState()

    inputs = {"emails_count": 2000, "cloud_storage_gb": 500, "duplicate_media_count": 25, "ai_usage_count": 100}
    result = await agent.execute(inputs, session)
    assert (
        result["digital_co2e_kg"] == 0.345
    )  # (2000*0.01 + 500*0.2 + 25*1 + 100*2) / 1000 = (20 + 100 + 25 + 200)/1000 = 345/1000 = 0.345
    assert len(result["missions"]) == 2


@pytest.mark.asyncio
async def test_scope3_commerce_agent() -> None:
    """Verify Scope 3 commerce location checks and credit awards."""
    from app.agents.specialists import Scope3CommerceAgent

    agent = Scope3CommerceAgent()
    session = SessionState()

    # Local purchase
    res_local = await agent.execute(
        {"store_name": "Organic Shop", "location": "Koramangala, Bengaluru", "amount_spent": 1000.0}, session
    )
    assert res_local["is_local"] == 1
    assert res_local["logistics_savings_kg"] == 1.35
    assert res_local["credits_earned"] == 550  # 1000 * 0.5 + 50

    # Non-local purchase
    res_intl = await agent.execute(
        {"store_name": "Global Imports", "location": "New York, USA", "amount_spent": 1000.0}, session
    )
    assert res_intl["is_local"] == 0
    assert res_intl["logistics_savings_kg"] == 0.0
    assert res_intl["credits_earned"] == 100  # 1000 * 0.1


@pytest.mark.asyncio
async def test_food_mile_agent() -> None:
    """Verify transport food miles and Karnataka alternative swaps."""
    from app.agents.specialists import FoodMileAgent

    agent = FoodMileAgent()
    session = SessionState()

    # Non-local avocado
    res_imp = await agent.execute({"product_name": "avocado", "origin": "California"}, session)
    assert res_imp["is_local"] is False
    assert res_imp["distance_km"] == 14500.0
    assert res_imp["local_swap"] == "Coorg Avocado"

    # Local honey
    res_local = await agent.execute({"product_name": "honey", "origin": "Kolar, Karnataka"}, session)
    assert res_local["is_local"] is True
    assert res_local["distance_km"] == 120.0
    assert res_local["local_swap"] is None


@pytest.mark.asyncio
async def test_transit_gamifier_agent() -> None:
    """Verify transport trip footprint offsets and green credit allocations."""
    from app.agents.specialists import TransitGamifierAgent

    agent = TransitGamifierAgent()
    session = SessionState()

    res_metro = await agent.execute({"mode": "Metro", "distance_km": 10.0}, session)
    assert res_metro["co2e_saved_kg"] == 1.55  # 10 * (0.17 - 0.015)
    assert res_metro["credits_earned"] == 50  # 10 * 5


@pytest.mark.asyncio
async def test_infra_feedback_agent() -> None:
    """Verify submission and coordination clustering of city feedbacks."""
    from app.agents.specialists import InfraFeedbackAgent

    agent = InfraFeedbackAgent()
    session = SessionState()

    res = await agent.execute({"description": "Missing cycle stand", "issue_type": "broken_bike_lane"}, session)
    assert res["status"] == "success"
    assert "Koramangala" in res["cluster_message"]
    assert res["total_reports"] == 1


@pytest.mark.asyncio
async def test_circular_economy_agent() -> None:
    """Verify avoided embedded manufacturing footprints for shared tools."""
    from app.agents.specialists import CircularEconomyAgent

    agent = CircularEconomyAgent()
    session = SessionState()

    res = await agent.execute({"item_name": "lawnmower", "action": "lend"}, session)
    assert res["embedded_co2e_saved_kg"] == 80.0
    assert res["credits_earned"] == 100


@pytest.mark.asyncio
async def test_partner_integration_agent() -> None:
    """Verify checkout cart total footprints and suggested green swaps."""
    from app.agents.specialists import PartnerIntegrationAgent

    agent = PartnerIntegrationAgent()
    session = SessionState()

    cart = [
        {"name": "Spanish Oranges", "category": "fruit", "origin": "non-local", "price": 25.0},
        {"name": "Local Rice", "category": "grain", "origin": "local", "price": 10.0},
    ]
    res = await agent.execute({"cart_items": cart}, session)
    assert res["total_co2e_kg"] == 5.5  # (0.5 * 5 + 2.0) + (0.5 * 2) = 4.5 + 1.0 = 5.5
    assert len(res["swaps"]) == 1


@pytest.mark.asyncio
async def test_multimodal_ingestion_agent() -> None:
    """Verify multimodal mock OCR/ASR ingestion telemetry parsing."""
    from app.agents.specialists import MultimodalIngestionAgent

    agent = MultimodalIngestionAgent()
    session = SessionState()

    res_audio = await agent.execute({"media_type": "audio", "mock_transcript": "test transcript"}, session)
    assert res_audio["extracted_text"] == "test transcript"
    assert res_audio["metadata"]["language"] == "en"


@pytest.mark.asyncio
async def test_localization_narration_agent() -> None:
    """Verify translation pakets rendering across locales."""
    from app.agents.specialists import LocalizationAndNarrationAgent

    agent = LocalizationAndNarrationAgent()
    session = SessionState()

    res = await agent.execute({"target_lang": "kn"}, session)
    assert res["target_lang"] == "kn"
    assert "ನಮಸ್ಕಾರ" in res["translated_text"]
