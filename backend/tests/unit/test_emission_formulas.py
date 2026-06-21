"""Property-based invariance tests for CarbonEstimationAgent emission formula.

**Validates: Requirements 5.1, 5.4**

Property 1: Formula Invariance — verifies that CarbonEstimationAgent._run() produces
stable, deterministic output for all targeted region/model/runtime/hour combinations.

Formula under test:
    E = (P × I_adj) / 1000
where:
    P   = (runtime_ms / 1000.0) * baseline_sec_power  (kWh)
    I_adj = int(intensity * diurnal_factor)             (gCO2e/kWh, adjusted)
    diurnal_factor = 1.0 - 0.3 * sin((execution_hour - 6) * pi / 12)
"""

import pytest

from app.agents.adk_core import SessionState
from app.agents.specialists import CarbonEstimationAgent


# ---------------------------------------------------------------------------
# Property 1 — Formula Invariance (Req 5.1)
# Fixed combos: runtime_ms=5000, execution_hour=12
#
# Expected values hand-calculated from the design doc:
#   diurnal_factor at hour 12 = 1.0 - 0.3 * sin((12-6)*π/12) = 1.0 - 0.3*1.0 = 0.7
#
#   europe-west4 + gemini-2.5-flash:
#     baseline_sec_power = 0.002, raw_intensity = 50
#     kwh  = (5000/1000) * 0.002 = 0.01
#     I_adj = int(50 * 0.7) = 35
#     co2e = (0.01 * 35) / 1000 = 0.00035
#
#   us-east4 + gpt-4o:
#     baseline_sec_power = 0.010, raw_intensity = 450
#     kwh  = (5000/1000) * 0.010 = 0.05
#     I_adj = int(450 * 0.7) = 315
#     co2e = (0.05 * 315) / 1000 = 0.01575
#
#   swedencentral + gpt-4o-mini:
#     baseline_sec_power = 0.003, raw_intensity = 10
#     kwh  = (5000/1000) * 0.003 = 0.015
#     I_adj = int(10 * 0.7) = 7
#     co2e = (0.015 * 7) / 1000 = 0.000105
# ---------------------------------------------------------------------------

EMISSION_INVARIANCE_COMBOS = [
    # (region, model_family, expected_co2e_kg)
    ("europe-west4", "gemini-2.5-flash", 0.00035),
    ("us-east4", "gpt-4o", 0.01575),
    ("swedencentral", "gpt-4o-mini", 0.000105),
]


@pytest.mark.asyncio
@pytest.mark.parametrize("region,model_family,expected_co2e", EMISSION_INVARIANCE_COMBOS)
async def test_formula_invariance_property1(region: str, model_family: str, expected_co2e: float) -> None:
    """Property 1: Formula Invariance — CarbonEstimationAgent._run() output is stable.

    Verifies E = (P × I_adj) / 1000 produces the expected co2e_emitted_kg for each
    targeted region/model combination at runtime_ms=5000, execution_hour=12.
    Calls _run() directly — no LLM involved.

    **Validates: Requirements 5.1, 5.4**
    """
    agent = CarbonEstimationAgent()
    session = SessionState()

    inputs = {
        "runtime_ms": 5000,
        "region": region,
        "model_family": model_family,
        "execution_hour": 12,
    }

    result = await agent._run(inputs, session)

    assert "co2e_emitted_kg" in result, "Result must contain 'co2e_emitted_kg'"
    actual = result["co2e_emitted_kg"]
    assert abs(actual - expected_co2e) <= 0.0001, (
        f"Formula invariance violated for ({region}, {model_family}): "
        f"expected {expected_co2e}, got {actual}, diff={abs(actual - expected_co2e)}"
    )


# ---------------------------------------------------------------------------
# Property 1 — Diurnal Intensity Invariance (Req 5.4)
# For us-east4 and eastus, co2e at hour 12 must be strictly less than at hour 0.
#
# At hour 0:  diurnal = 1.0 - 0.3*sin((0-6)*π/12) = 1.0 - 0.3*sin(-π/2)
#                     = 1.0 - 0.3*(-1.0) = 1.3  (intensity × 1.3)
# At hour 12: diurnal = 1.0 - 0.3*sin((12-6)*π/12) = 1.0 - 0.3*1.0 = 0.7  (intensity × 0.7)
# Therefore co2e(hour=12) < co2e(hour=0) for any positive intensity.
# ---------------------------------------------------------------------------

DIURNAL_REGIONS = ["us-east4", "eastus"]


@pytest.mark.asyncio
@pytest.mark.parametrize("region", DIURNAL_REGIONS)
async def test_diurnal_intensity_invariance(region: str) -> None:
    """Property 1 (diurnal variant): midday intensity strictly less than midnight.

    For regions us-east4 and eastus, co2e_emitted_kg at execution_hour=12 must be
    strictly less than at execution_hour=0, with all other inputs held constant.

    **Validates: Requirements 5.4**
    """
    agent = CarbonEstimationAgent()

    base_inputs = {
        "runtime_ms": 5000,
        "region": region,
        "model_family": "gpt-4o",
    }

    session_noon = SessionState()
    result_noon = await agent._run({**base_inputs, "execution_hour": 12}, session_noon)

    session_midnight = SessionState()
    result_midnight = await agent._run({**base_inputs, "execution_hour": 0}, session_midnight)

    co2_noon = result_noon["co2e_emitted_kg"]
    co2_midnight = result_midnight["co2e_emitted_kg"]

    assert co2_noon < co2_midnight, (
        f"Diurnal invariance violated for region '{region}': "
        f"co2e at hour 12 ({co2_noon}) should be < co2e at hour 0 ({co2_midnight})"
    )


# ---------------------------------------------------------------------------
# Property 2: Credit formula invariance (Req 5.2)
# ---------------------------------------------------------------------------
# Verifies that Scope3CommerceAgent._run() credit calculations are unchanged
# after docstring/type additions.  Tests all 6 combinations:
#   amount_spent ∈ {10.00, 100.00, 0.01}  ×  is_local ∈ {True, False}
#
# Local formula:     credits = int(amount * 0.5) + 50
# Non-local formula: credits = int(amount * 0.1)
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import Scope3CommerceAgent  # noqa: E402

_CREDIT_CASES = [
    # (amount_spent, is_local_override, expected_credits)
    (10.00, True, 55),    # int(10.00 * 0.5) + 50 = 5 + 50 = 55
    (100.00, True, 100),  # int(100.00 * 0.5) + 50 = 50 + 50 = 100
    (0.01, True, 50),     # int(0.01 * 0.5) + 50 = 0 + 50 = 50
    (10.00, False, 1),    # int(10.00 * 0.1) = 1
    (100.00, False, 10),  # int(100.00 * 0.1) = 10
    (0.01, False, 0),     # int(0.01 * 0.1) = 0
]


@pytest.mark.asyncio
@pytest.mark.parametrize("amount_spent,is_local_override,expected_credits", _CREDIT_CASES)
async def test_credit_formula_invariance_property2(
    amount_spent: float,
    is_local_override: bool,
    expected_credits: int,
) -> None:
    """Property 2: Credit formula invariance.

    Verifies that Scope3CommerceAgent._run() produces the exact expected
    integer credits for all 6 (amount_spent × is_local) combinations.
    Uses is_local_override=True for local purchases and a non-local
    location ("New York") for non-local purchases so the local-keyword
    check does not interfere.

    Local formula:     credits = int(amount * 0.5) + 50
    Non-local formula: credits = int(amount * 0.1)

    **Validates: Requirements 5.2**
    """
    agent = Scope3CommerceAgent()
    session = SessionState()

    if is_local_override:
        inputs: dict = {
            "store_name": "Test Store",
            "location": "Test City",
            "amount_spent": amount_spent,
            "is_local_override": True,
        }
    else:
        inputs = {
            "store_name": "Test Store",
            "location": "New York",  # non-local: no Bengaluru/Karnataka keywords
            "amount_spent": amount_spent,
            "is_local_override": False,
        }

    result = await agent._run(inputs, session)

    assert result["credits_earned"] == expected_credits, (
        f"Credit formula invariance violated: amount={amount_spent}, "
        f"is_local={is_local_override} -> expected credits={expected_credits}, "
        f"got {result['credits_earned']}"
    )


# ---------------------------------------------------------------------------
# Section 3 — Lifestyle Combination Tests (Req 5.3)
# ---------------------------------------------------------------------------
# 27 combos: vehicle_type ∈ {gas, ev, none} × diet_type ∈ {vegan, vegetarian, average}
#            × heating_source ∈ {gas, electric, solar}
# Plus 3 electric_car alias combos (one per diet, gas heating) to verify the alias added in 2.3.
#
# Fixed inputs: driving_km=15000, electricity_kwh=3500, shopping_level="medium", recycling=True
#
# Expected formula (from LifestyleEstimationAgent._run):
#   vehicle: gas=15000*0.17=2550, ev=15000*0.05=750, none=0, electric_car=750 (alias of ev)
#   diet:    vegan=800, vegetarian=1200, average=2000
#   energy:  3500*0.4 + heating(gas=+1500→2900, electric=+800→2200, solar=+100→1500)
#   consumption: medium=1200*0.8=960 (recycling=True cuts 20%)
#   total = vehicle + diet + energy + consumption
# ---------------------------------------------------------------------------

from app.agents.specialists.scope3_agents import LifestyleEstimationAgent  # noqa: E402

_LIFESTYLE_COMBOS = [
    # (vehicle_type, diet_type, heating_source, expected_total_co2_kg)
    # --- gas vehicle ---
    ("gas", "vegan", "gas", 7210),
    ("gas", "vegan", "electric", 6510),
    ("gas", "vegan", "solar", 5810),
    ("gas", "vegetarian", "gas", 7610),
    ("gas", "vegetarian", "electric", 6910),
    ("gas", "vegetarian", "solar", 6210),
    ("gas", "average", "gas", 8410),
    ("gas", "average", "electric", 7710),
    ("gas", "average", "solar", 7010),
    # --- ev vehicle ---
    ("ev", "vegan", "gas", 5410),
    ("ev", "vegan", "electric", 4710),
    ("ev", "vegan", "solar", 4010),
    ("ev", "vegetarian", "gas", 5810),
    ("ev", "vegetarian", "electric", 5110),
    ("ev", "vegetarian", "solar", 4410),
    ("ev", "average", "gas", 6610),
    ("ev", "average", "electric", 5910),
    ("ev", "average", "solar", 5210),
    # --- no vehicle ---
    ("none", "vegan", "gas", 4660),
    ("none", "vegan", "electric", 3960),
    ("none", "vegan", "solar", 3260),
    ("none", "vegetarian", "gas", 5060),
    ("none", "vegetarian", "electric", 4360),
    ("none", "vegetarian", "solar", 3660),
    ("none", "average", "gas", 5860),
    ("none", "average", "electric", 5160),
    ("none", "average", "solar", 4460),
    # --- electric_car alias (3 rows — one per diet, gas heating) ---
    ("electric_car", "vegan", "gas", 5410),
    ("electric_car", "vegetarian", "gas", 5810),
    ("electric_car", "average", "gas", 6610),
]


@pytest.mark.asyncio
@pytest.mark.parametrize("vehicle_type,diet_type,heating_source,expected_co2", _LIFESTYLE_COMBOS)
async def test_lifestyle_combinations(
    vehicle_type: str,
    diet_type: str,
    heating_source: str,
    expected_co2: float,
) -> None:
    """Req 5.3: Lifestyle combinations produce deterministic lifestyle_co2_yr_kg.

    Verifies that LifestyleEstimationAgent._run() returns lifestyle_co2_yr_kg within
    ±0.01 kg of the hand-calculated value for all 27 vehicle × diet × heating combos,
    plus 3 electric_car alias rows to confirm the alias added in task 2.3 works correctly.

    Fixed inputs: driving_km=15000, electricity_kwh=3500, shopping_level="medium", recycling=True.

    **Validates: Requirements 5.3**
    """
    agent = LifestyleEstimationAgent()
    session = SessionState()

    inputs = {
        "driving_km": 15000,
        "vehicle_type": vehicle_type,
        "diet_type": diet_type,
        "electricity_kwh": 3500,
        "heating_source": heating_source,
        "shopping_level": "medium",
        "recycling": True,
    }

    result = await agent._run(inputs, session)

    assert "lifestyle_co2_yr_kg" in result, "Result must contain 'lifestyle_co2_yr_kg'"
    actual = result["lifestyle_co2_yr_kg"]
    assert abs(actual - expected_co2) <= 0.01, (
        f"Lifestyle combo ({vehicle_type}, {diet_type}, {heating_source}): "
        f"expected {expected_co2}, got {actual}, diff={abs(actual - expected_co2)}"
    )
