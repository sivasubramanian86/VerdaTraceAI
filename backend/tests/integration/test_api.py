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


def test_get_emissions() -> None:
    """Verify emissions calculation endpoint."""
    response = client.get(
        "/api/v1/projects/proj_123/emissions?provider=gcp&region=us-central1&model_family=gemini-2.5-flash"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "proj_123"
    assert "analysis_result" in data
    assert "green_score" in data


def test_get_lifestyle_emissions() -> None:
    """Verify lifestyle emissions calculations."""
    payload = {
        "driving_km": 15000,
        "vehicle_type": "gas",
        "diet_type": "vegetarian",
        "electricity_kwh": 3500,
        "heating_source": "electric",
        "shopping_level": "medium",
        "recycling": True,
    }
    response = client.post("/api/v1/lifestyle/emissions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "lifestyle_co2_yr_kg" in data
    assert "sustainability_rank" in data


def test_digital_loops_endpoints() -> None:
    """Verify GET and POST routes for digital waste loops."""
    # Test GET
    response_get = client.get("/api/v1/loops/digital")
    assert response_get.status_code == 200
    assert "emails_count" in response_get.json()

    # Test POST update
    payload = {"emails_count": 2000, "cloud_storage_gb": 120.5, "duplicate_media_count": 15, "ai_usage_count": 40}
    response_post = client.post("/api/v1/loops/digital", json=payload)
    assert response_post.status_code == 200
    assert response_post.json()["digital_co2e_kg"] > 0

    # Test Mission complete
    response_mission = client.post("/api/v1/loops/digital/mission/clean_emails")
    assert response_mission.status_code == 200
    assert response_mission.json()["status"] == "success"


def test_commerce_loops_endpoints() -> None:
    """Verify GET and POST routes for commerce footprint loops."""
    # Test GET
    response_get = client.get("/api/v1/loops/commerce")
    assert response_get.status_code == 200
    assert "transactions" in response_get.json()

    # Test POST log purchase
    payload = {
        "store_name": "Koramangala Greens",
        "location": "Bengaluru, India",
        "amount_spent": 450.0,
        "is_local_override": False,
    }
    response_post = client.post("/api/v1/loops/commerce", json=payload)
    assert response_post.status_code == 200
    assert "id" in response_post.json()
    assert response_post.json()["credits_earned"] > 0


def test_food_loops_endpoints() -> None:
    """Verify grocery scans and local swap recommendations."""
    # Test POST scan
    payload = {"product_name": "avocado", "origin": "Mexico"}
    response_post = client.post("/api/v1/loops/food/scan", json=payload)
    assert response_post.status_code == 200
    assert "local_swap" in response_post.json()

    # Test GET scanned history
    response_get = client.get("/api/v1/loops/food")
    assert response_get.status_code == 200
    assert "foods" in response_get.json()


def test_transit_loops_endpoints() -> None:
    """Verify transit logs and feedback submissions."""
    # Test GET transit info
    response_get = client.get("/api/v1/loops/transit")
    assert response_get.status_code == 200
    assert "trips" in response_get.json()
    assert "feedbacks" in response_get.json()

    # Test POST log trip
    payload = {"mode": "Metro", "distance_km": 12.5}
    response_post = client.post("/api/v1/loops/transit", json=payload)
    assert response_post.status_code == 200
    assert "co2e_saved_kg" in response_post.json()

    # Test POST submit feedback
    feedback_payload = {
        "description": "Bike lane blocked by debris",
        "latitude": 12.93,
        "longitude": 77.62,
        "issue_type": "broken_bike_lane",
    }
    response_feedback = client.post("/api/v1/loops/transit/feedback", json=feedback_payload)
    assert response_feedback.status_code == 200
    assert response_feedback.json()["status"] == "success"


def test_circular_loops_endpoints() -> None:
    """Verify circular economy lending list and postings."""
    # Test GET
    response_get = client.get("/api/v1/loops/circular")
    assert response_get.status_code == 200
    assert "items" in response_get.json()

    # Test POST share item
    payload = {"item_name": "drill machine", "owner": "Raju", "action": "lend"}
    response_post = client.post("/api/v1/loops/circular", json=payload)
    assert response_post.status_code == 200
    assert response_post.json()["credits_earned"] == 100


def test_credits_ledger_endpoint() -> None:
    """Verify credits aggregation and leaderboard details."""
    response = client.get("/api/v1/loops/credits")
    assert response.status_code == 200
    data = response.json()
    assert "total_credits" in data
    assert "ledger" in data
    assert "leaderboard" in data


def test_partner_checkout_endpoint() -> None:
    """Verify sustainable cart suggestions API."""
    payload = {"cart_items": [{"name": "Imported Apples", "category": "fruit", "origin": "non-local", "price": 4.50}]}
    response = client.post("/api/v1/partner/checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "total_co2e_kg" in data
    assert "swaps" in data


def test_localize_narration_endpoint() -> None:
    """Verify multilingual narration audio text generation."""
    payload = {"text": "Hello, welcome to green AI", "target_lang": "hi"}
    response = client.post("/api/v1/narration/localize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_lang"] == "hi"
    assert "translated_text" in data
