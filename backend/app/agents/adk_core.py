"""Core abstractions and base classes for the ADK agent framework."""

import asyncio
from typing import Any, Dict, List


class SessionState:
    """Mock ADK Session State for sharing context across the agent mesh."""

    def __init__(self) -> None:
        """Initialize the shared state dictionary."""
        self.state: Dict[str, Any] = {}

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieve a value from the session state.

        Args:
            key: The unique lookup key.
            default: Fallback value if key is not found.

        Returns:
            The value associated with the key, or default.
        """
        return self.state.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Set a value in the session state.

        Args:
            key: The unique state key.
            value: The data to persist.
        """
        self.state[key] = value


class BaseAgent:
    """Base class for all ADK Agents."""

    def __init__(self, name: str, description: str) -> None:
        """Initialize base agent attributes.

        Args:
            name: Human-readable name of the agent.
            description: Purpose and description of the agent.
        """
        self.name = name
        self.description = description

    async def execute(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        """Execute the core logic of the agent.

        Args:
            inputs: Dictionary of input data parameters.
            session: Shared session state instance.

        Returns:
            A dictionary containing the execution output payload.
        """
        raise NotImplementedError("Subclasses must implement execute()")


class SequentialAgent(BaseAgent):
    """Executes a defined sequence of logic using an LLM or heuristic."""

    async def execute(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        """Execute sequence in order.

        Args:
            inputs: Input configuration dictionary.
            session: Shared session state context.

        Returns:
            Resulting agent dictionary payload.
        """
        return await self._run(inputs, session)

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        """Core execution hook for sequential agents.

        Args:
            inputs: Input parameters.
            session: Active session state.

        Returns:
            Output payload dictionary.
        """
        return {}


class ParallelAgent(BaseAgent):
    """Executes multiple sub-agents concurrently (Fan-Out/Gather)."""

    def __init__(self, name: str, description: str, agents: List[BaseAgent]) -> None:
        """Initialize ParallelAgent.

        Args:
            name: Agent identifier.
            description: Agent description.
            agents: List of sub-agents to run in parallel.
        """
        super().__init__(name, description)
        self.agents = agents

    async def execute(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        """Execute all sub-agents concurrently.

        Args:
            inputs: Input variables.
            session: Active session context.

        Returns:
            Aggregated/merged dictionary of all sub-agent runs.
        """
        tasks = [agent.execute(inputs, session) for agent in self.agents]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Merge results
        gathered: Dict[str, Any] = {}
        for res in results:
            if isinstance(res, dict):
                gathered.update(res)
            elif isinstance(res, Exception):
                errors_list: List[str] = gathered.get("errors", [])
                errors_list.append(str(res))
                gathered["errors"] = errors_list
        return gathered


class CoordinatorAgent(BaseAgent):
    """Routes intents to the correct sub-agent."""

    def __init__(self, name: str, description: str, routes: Dict[str, BaseAgent]) -> None:
        """Initialize CoordinatorAgent.

        Args:
            name: Root identifier.
            description: Task context.
            routes: Routing map connecting string intents to specialist instances.
        """
        super().__init__(name, description)
        self.routes = routes

    async def execute(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        """Route input parameters to the appropriate sub-agent.

        Args:
            inputs: User parameters.
            session: Active state workspace.

        Returns:
            Executed sub-agent results.
        """
        intent = await self.route(inputs, session)
        target_agent = self.routes.get(intent)
        if target_agent:
            return await target_agent.execute(inputs, session)
        return {"error": f"No route found for intent: {intent}"}

    async def route(self, inputs: Dict[str, Any], session: SessionState) -> str:
        """Determine target agent route key.

        Args:
            inputs: Query dictionary.
            session: Running workspace state.

        Returns:
            String matching one of the keys in self.routes.
        """
        raise NotImplementedError
