from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    """Verify the health check endpoint returns 200 OK and expected status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "mcp_toolbox" in data


def test_list_projects() -> None:
    """Verify list projects endpoint."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert isinstance(response.json().get("projects"), list)


def test_create_project() -> None:
    """Verify project creation endpoints route to onboarding agent logic."""
    response = client.post(
        "/api/v1/projects", json={"name": "Test Project", "region": "us-central1", "model_family": "gemini-1.5-flash"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "config" in data


def test_chat_endpoint() -> None:
    """Verify Copilot Chat endpoint yields conversational responses."""
    response = client.post("/api/v1/chat", json={"query": "How does europe-west4 save carbon?"})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data


def test_mcp_tool_routing() -> None:
    """Verify FastAPI routes correctly delegate commands to our MCP registry."""
    response = client.post("/api/v1/mcp/tool/get_project_emissions", json={"arguments": {"project_id": "proj_123"}})
    assert response.status_code == 200
    data = response.json()
    assert data["total_co2e"] == 142.5


def test_mcp_prompt_routing() -> None:
    """Verify template retrieval for Judge summary pitch matches schemas."""
    response = client.get("/api/v1/mcp/prompt/GenerateJudgeSummary?workspace_id=ws_promptwars")
    assert response.status_code == 200
    data = response.json()
    assert "prompt" in data
    assert "ws_promptwars" in data["prompt"]


def test_eval_guardrail_route() -> None:
    """Verify that user outputs are evaluated correctly via the FastAPI endpoint."""
    response = client.post("/api/v1/eval", json={"text": "This setup runs on fake-cloud clusters."})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "flagged"


def test_unstructured_ingestion() -> None:
    """Verify that unstructured supplier data is parsed via /ingest/unstructured."""
    response = client.post(
        "/api/v1/ingest/unstructured",
        json={
            "unstructured_text": (
                "AWS supplier invoice showing 150000 API requests with context caching "
                "enabled on claude-3-5-sonnet in Oregon region us-west-2"
            )
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "aws"
    assert data["region"] == "us-west-2"
    assert data["caching_enabled"] is True
    assert "audit_hash" in data
