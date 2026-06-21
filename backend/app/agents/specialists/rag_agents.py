import json
import logging
from typing import Any, Dict

from app.agents.adk_core import SequentialAgent, SessionState
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class AgenticRAGExplainerAgent(SequentialAgent):
    """Uses RAG data logic to provide scientifically backed optimization metrics."""

    def __init__(self) -> None:
        super().__init__("AgenticRAGExplainerAgent", "Explains sustainability concepts using Gemini Pro and Context.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        model = llm_service.get_pro_model()
        query = inputs.get("query", "Why is europe-west4 greener?")

        mock_context = (
            "GCP CFE 2023 Report: europe-west4 (Eemshaven) operates at 93% Carbon Free Energy. "
            "AWS Sustainability Report: us-west-2 (Oregon) is highly powered by clean "
            "hydroelectric grids, reducing intensity to 80g/kWh. "
            "Azure Sustainability Index: swedencentral is powered by 100% carbon-free "
            "hydro and nuclear power, reducing carbon intensity to 10g/kWh. "
            "On-Premises Baseline: Local deployments default to the average US grid carbon intensity (~380g/kWh). "
            "Water Footprint of AI: Large language models require water for server "
            "cooling, typically 500ml per 10-50 queries. "
            "Shifting to air-cooled sites saves 95% water. "
            "Ocean Blue Carbon: Ocean seagrass meadows, mangroves, and kelp forests "
            "store up to 10 times more carbon per square meter than tropical forests. "
            "Forest Reforestation: Terrestrial tree planting absorbs carbon over long "
            "periods, with one native tree absorbing about 22kg of CO2 per year."
        )

        prompt = f"""
        You are the VerdaTraceAI Green Copilot.
        Use this context: {mock_context}
        Answer the user's question concisely: {query}
        Provide the response in the same language as the user's question.
        """

        if not model:
            return {"explanation": f"Vertex AI not initialized. Mock Context Answer: {mock_context}"}

        try:
            response = model.generate_content(prompt)
            return {"explanation": response.text}
        except Exception as e:
            return {"explanation": f"Failed to generate explanation. Error: {e}"}


class GreenCopilotChatAgent(SequentialAgent):
    """Fronts user-facing chat, merging RAG context with latest metrics."""

    def __init__(self) -> None:
        super().__init__("GreenCopilotChatAgent", "Combines metrics, RAG, and user query.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        query = inputs.get("query", "")
        latest_emission = session.get("latest_emission", {})

        prompt = f"""
        User Query: {query}
        Latest Workspace Metrics: {json.dumps(latest_emission)}
        Provide a concise response helping the user understand and reduce carbon footprint.
        Provide the response in the same language as the user query.
        """
        model = llm_service.get_pro_model()
        if not model:
            return {"response": "Vertex AI Offline. Please optimize your caching thresholds."}
        try:
            response = model.generate_content(prompt)
            return {"response": response.text}
        except Exception as e:
            return {"response": f"Chat failure: {e}"}


class MCPDataConnectorAgent(SequentialAgent):
    """Integrates database and tools access via Model Context Protocol."""

    def __init__(self) -> None:
        super().__init__("MCPDataConnectorAgent", "Connects to MCP schema registries and datasets.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        tool_name = inputs.get("tool_name", "get_project_emissions")
        # Direct simulation of MCP Toolbox Server calls
        if tool_name == "get_project_emissions":
            return {"total_co2e": 142.5, "trend": "-12%", "status": "mcp_ok"}
        elif tool_name == "get_recommendations":
            return {"recommendations": ["Europe Migration", "Context Caching"], "status": "mcp_ok"}
        return {"status": "mcp_not_found"}
