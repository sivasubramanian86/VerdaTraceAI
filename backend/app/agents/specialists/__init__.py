"""Package exposing all specialist agents for the VerdaTraceAI mesh."""

from .core_agents import (
    CarbonEstimationAgent,
    OptimizationStrategyAgent,
    ProjectOnboardingAgent,
    UsageIngestionAgent,
)
from .rag_agents import (
    AgenticRAGExplainerAgent,
    GreenCopilotChatAgent,
    MCPDataConnectorAgent,
)
from .security_agents import EvalAndGuardrailAgent
from .scope3_agents import (
    CircularEconomyAgent,
    DigitalWasteAgent,
    FoodMileAgent,
    InfraFeedbackAgent,
    LifestyleEstimationAgent,
    LocalizationAndNarrationAgent,
    MultimodalIngestionAgent,
    PartnerIntegrationAgent,
    Scope3CommerceAgent,
    Scope3UnstructuredIngestAgent,
    TransitGamifierAgent,
)

__all__ = [
    "ProjectOnboardingAgent",
    "UsageIngestionAgent",
    "CarbonEstimationAgent",
    "OptimizationStrategyAgent",
    "AgenticRAGExplainerAgent",
    "GreenCopilotChatAgent",
    "MCPDataConnectorAgent",
    "EvalAndGuardrailAgent",
    "DigitalWasteAgent",
    "Scope3CommerceAgent",
    "Scope3UnstructuredIngestAgent",
    "FoodMileAgent",
    "TransitGamifierAgent",
    "InfraFeedbackAgent",
    "CircularEconomyAgent",
    "PartnerIntegrationAgent",
    "MultimodalIngestionAgent",
    "LocalizationAndNarrationAgent",
]
