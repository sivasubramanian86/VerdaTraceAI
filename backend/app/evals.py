import asyncio
import logging

from app.agents.adk_core import SessionState
from app.agents.orchestrator import orchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VerdaTrace_Evaluator")


async def run_evals() -> bool:
    """Evaluation harness to test Green Copilot accuracy.

    In a real PromptWars submission, this would log to LangSmith/Langfuse.
    """
    logger.info("Starting AI Evaluator Harness...")

    test_cases = [
        {
            "query": "Why is europe-west4 a good region for sustainability?",
            "expected_keywords": ["CFE", "Eemshaven", "93%"],
        },
        {"query": "What is semantic caching?", "expected_keywords": ["latency", "compute", "embeddings"]},
    ]

    passed = 0
    for idx, tc in enumerate(test_cases):
        session = SessionState()
        logger.info(f"Running Eval Case {idx + 1}: {tc['query']}")

        result = await orchestrator.execute({"intent": "chat", "query": tc["query"]}, session)
        explanation = result.get("explanation", "").lower()

        # Check against expected keywords
        keywords_found = [kw for kw in tc["expected_keywords"] if kw.lower() in explanation]

        if len(keywords_found) > 0:
            logger.info(f"✅ PASS: Found keywords {keywords_found}")
            passed += 1
        else:
            logger.warning(f"❌ FAIL: Expected keywords not found. Response: {explanation}")

    logger.info(f"Evals Complete: {passed}/{len(test_cases)} passed.")
    return passed == len(test_cases)


if __name__ == "__main__":
    asyncio.run(run_evals())
