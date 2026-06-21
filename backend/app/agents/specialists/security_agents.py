import logging
from typing import Any, Dict

from app.agents.adk_core import SequentialAgent, SessionState

logger = logging.getLogger(__name__)


class EvalAndGuardrailAgent(SequentialAgent):
    """Enforces safety rules, safety parameters, and logs eval indicators."""

    def __init__(self) -> None:
        super().__init__("EvalAndGuardrailAgent", "Validates output quality and logs leaderboard metrics.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        text_to_validate = inputs.get("text", "")

        # Guardrail logic (check for hallucinated cloud providers)
        hallucinations = ["fake-cloud", "hallucinated-cloud"]
        flagged = any(h in text_to_validate.lower() for h in hallucinations)

        status = "flagged" if flagged else "safe"
        session.set("last_guardrail_status", status)

        return {
            "status": status,
            "safety_checked": True,
            "metrics": {"hallucination_detected": flagged, "score": 1.0 if not flagged else 0.0},
        }
