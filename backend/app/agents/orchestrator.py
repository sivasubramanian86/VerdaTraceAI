from typing import Any, Dict

from app.agents.adk_core import CoordinatorAgent, ParallelAgent, SessionState
from app.agents.specialists import (
    AgenticRAGExplainerAgent,
    CarbonEstimationAgent,
    CircularEconomyAgent,
    DigitalWasteAgent,
    EvalAndGuardrailAgent,
    FoodMileAgent,
    GreenCopilotChatAgent,
    InfraFeedbackAgent,
    LifestyleEstimationAgent,
    LocalizationAndNarrationAgent,
    MCPDataConnectorAgent,
    MultimodalIngestionAgent,
    OptimizationStrategyAgent,
    PartnerIntegrationAgent,
    ProjectOnboardingAgent,
    Scope3CommerceAgent,
    Scope3UnstructuredIngestAgent,
    TransitGamifierAgent,
    UsageIngestionAgent,
)


class OrchestratorAgent(CoordinatorAgent):
    """Root Coordinator Agent that routes and aggregates results."""

    def __init__(self) -> None:
        self.analyze_group = ParallelAgent(
            "AnalyzeGroup",
            "Runs estimation and optimization concurrently",
            [CarbonEstimationAgent(), OptimizationStrategyAgent()],
        )
        self.onboarding = ProjectOnboardingAgent()
        self.ingestion = UsageIngestionAgent()
        self.rag = AgenticRAGExplainerAgent()
        self.chat = GreenCopilotChatAgent()
        self.mcp = MCPDataConnectorAgent()
        self.eval = EvalAndGuardrailAgent()
        self.lifestyle = LifestyleEstimationAgent()
        self.unstructured_ingest = Scope3UnstructuredIngestAgent()

        # LocalLoops specialists
        self.digital_clean = DigitalWasteAgent()
        self.local_commerce = Scope3CommerceAgent()
        self.food_miles = FoodMileAgent()
        self.transit_log = TransitGamifierAgent()
        self.infra_gap = InfraFeedbackAgent()
        self.circular_share = CircularEconomyAgent()
        self.partner_cart = PartnerIntegrationAgent()
        self.multimodal_ingest = MultimodalIngestionAgent()
        self.localize_narrate = LocalizationAndNarrationAgent()

        super().__init__(
            name="OrchestratorAgent",
            description="Root agent routing user intents.",
            routes={
                "onboard": self.onboarding,
                "ingest": self.ingestion,
                "analyze": self.analyze_group,
                "rag": self.rag,
                "chat": self.chat,
                "mcp": self.mcp,
                "eval": self.eval,
                "lifestyle": self.lifestyle,
                "ingest_unstructured": self.unstructured_ingest,
                # LocalLoops routes
                "digital_clean": self.digital_clean,
                "local_commerce": self.local_commerce,
                "food_miles": self.food_miles,
                "transit_log": self.transit_log,
                "infra_gap": self.infra_gap,
                "circular_share": self.circular_share,
                "partner_cart": self.partner_cart,
                "multimodal_ingest": self.multimodal_ingest,
                "localize_narrate": self.localize_narrate,
            },
        )

    async def route(self, inputs: Dict[str, Any], session: SessionState) -> str:
        intent = inputs.get("intent", "analyze")
        if intent in self.routes:
            return intent
        # Default safety fallback
        return "analyze"


# Global instance
orchestrator = OrchestratorAgent()
