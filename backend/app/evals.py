import asyncio
import logging

from app.agents.adk_core import SessionState
from app.agents.orchestrator import orchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VerdaTrace_Evaluator")


async def run_evals() -> bool:
    """Evaluation harness to test Green Copilot accuracy, JSON stability, and calculation sanity."""
    logger.info("Starting AI Evaluator Harness...")

    # 1. Test Copilot Chat response and keyword matching
    test_cases = [
        {
            "query": "Why is europe-west4 a good region for sustainability?",
            "expected_keywords": ["europe-west4", "Eemshaven"],
        },
        {"query": "What is semantic caching?", "expected_keywords": ["cache", "caching"]},
        {
            "query": "How do I reduce my AI workload carbon footprint?",
            "expected_keywords": ["carbon", "footprint"],
        },
        {
            "query": "What are Scope 3 emissions linked to AI-enabled services?",
            "expected_keywords": ["scope 3", "emissions"],
        },
        {
            "query": "Which model uses the least energy for inference?",
            "expected_keywords": ["flash", "gemini"],
        },
    ]

    passed = 0
    for idx, tc in enumerate(test_cases):
        session = SessionState()
        logger.info(f"Running Eval Case {idx + 1}: {tc['query']}")

        # Seed some emissions context first
        session.set("latest_emission", {
            "kwh_consumed": 1.2,
            "co2e_emitted_kg": 0.06,
            "water_liters": 0.24,
            "green_score": 99,
        })

        result = await orchestrator.execute({"intent": "chat", "query": tc["query"]}, session)

        # Verify JSON structure stability
        if not isinstance(result, dict) or "response" not in result:
            logger.error(f"❌ FAIL: Response JSON structure unstable. Result: {result}")
            continue

        response_text = result.get("response", "").lower()

        # Check against expected keywords
        keywords_found = [kw for kw in tc["expected_keywords"] if kw.lower() in response_text]

        if len(keywords_found) > 0:
            logger.info(f"✅ PASS: Found keywords {keywords_found}")
            passed += 1
        else:
            logger.warning(f"❌ FAIL: Expected keywords not found. Response: {response_text}")

    # 2. Test Emissions sanity check (no negative values)
    session = SessionState()
    # Ingest project config
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
    # Ingest usage
    await orchestrator.execute(
        {
            "intent": "ingest",
            "calls": 1000,
            "prompt_tokens": 50000,
            "completion_tokens": 10000,
        },
        session,
    )
    # Estimate
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

    # Sanity checks
    if kwh < 0 or co2 < 0:
        logger.error(f"❌ FAIL: Nonsensical negative values calculated (kwh={kwh}, co2={co2})")
        return False

    if green_score < 0 or green_score > 100:
        logger.error(f"❌ FAIL: Green Score out of bounds: {green_score}")
        return False

    logger.info("✅ PASS: Emissions calculations and Green Score boundaries validated.")

    total_passed = passed == len(test_cases)
    logger.info(f"Evals Complete: {passed}/{len(test_cases)} chat cases passed. Total status: {total_passed}")
    return total_passed


if __name__ == "__main__":
    import sys
    success = asyncio.run(run_evals())
    sys.exit(0 if success else 1)
