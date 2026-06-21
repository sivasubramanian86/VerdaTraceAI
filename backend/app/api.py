import importlib.util
import json
import os
from typing import Any

from fastapi import APIRouter

from app.agents.adk_core import SessionState
from app.agents.orchestrator import orchestrator

from pydantic import BaseModel, Field

router = APIRouter()


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., description="Project name")
    provider: str = Field("gcp", description="Cloud provider")
    region: str = Field("us-central1", description="Cloud region")
    model_family: str = Field("gemini-2.5-flash", description="Model family")
    hardware: str = Field("GPU", description="Execution hardware")


class ChatRequest(BaseModel):
    query: str = Field(..., description="Conversational query")
    provider: str = Field("gcp", description="Cloud provider")
    region: str = Field("us-central1", description="Cloud region")
    model_family: str = Field("gemini-2.5-flash", description="Model family")
    media_type: str = Field("text", description="Media type for multimodal context")
    media_count: int = Field(0, description="Media count")
    media_duration_sec: float = Field(0.0, description="Media duration in seconds")


class MCPToolRequest(BaseModel):
    arguments: dict[str, Any] = Field(default_factory=dict, description="Tool arguments")


class EvalRequest(BaseModel):
    text: str = Field(..., description="Text to evaluate for safety/accuracy")


class LifestyleRequest(BaseModel):
    driving_km: float = Field(12000.0, description="Annual driving distance in km")
    vehicle_type: str = Field("gas", description="Vehicle propulsion type")
    diet_type: str = Field("average", description="Diet pattern")
    electricity_kwh: float = Field(4000.0, description="Annual electricity use in kWh")
    heating_source: str = Field("gas", description="Home heating fuel")
    shopping_level: str = Field("medium", description="Consumer spending level")
    recycling: bool = Field(True, description="Active household recycling")


class UnstructuredIngestRequest(BaseModel):
    unstructured_text: str = Field(..., description="Raw text of emissions report")


class DigitalWasteRequest(BaseModel):
    emails_count: int = Field(0, description="Active inbox email count")
    cloud_storage_gb: float = Field(0.0, description="Cloud storage volume in GB")
    duplicate_media_count: int = Field(0, description="Number of duplicate media files")
    ai_usage_count: int = Field(0, description="Monthly AI calls count")


class CommerceLogRequest(BaseModel):
    store_name: str = Field(..., description="Merchant name")
    location: str = Field(..., description="Transaction location")
    amount_spent: float = Field(..., description="Transaction amount")
    is_local_override: bool = Field(False, description="Manually override locality check")


class FoodScanRequest(BaseModel):
    product_name: str = Field(..., description="Product identifier")
    origin: str = Field(..., description="Origin location")


class TransitTripLogRequest(BaseModel):
    mode: str = Field(..., description="Transit mode (e.g. Metro)")
    distance_km: float = Field(..., description="Trip distance in km")


class InfraFeedbackRequest(BaseModel):
    description: str = Field(..., description="Description of the infra issue")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    issue_type: str = Field(..., description="Issue category")


class CircularItemShareRequest(BaseModel):
    item_name: str = Field(..., description="Item to share")
    owner: str = Field("Neighbor", description="Lender name")
    action: str = Field("lend", description="Share action (lend/borrow)")


class PartnerCheckoutRequest(BaseModel):
    cart_items: list[dict[str, Any]] = Field(default_factory=list, description="Checkout cart items")


class LocalizeNarrationRequest(BaseModel):
    text: str = Field(..., description="Content to translate and narrate")
    target_lang: str = Field("en", description="Target language code")



def load_mcp_server() -> Any:
    """Dynamically load the MCP server module to avoid shadowing issues with the installed mcp package."""
    try:
        # Resolve path to mcp/server.py relative to this file
        mcp_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../mcp/server.py"))
        spec = importlib.util.spec_from_file_location("mcp_server", mcp_path)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module.VerdaTraceMCPServer()
    except Exception as e:
        print(f"Warning: Failed to load local MCP server module: {e}")

    # Fallback mock class to make it bulletproof
    class MockMCPServer:
        def call_tool(self, tool_name: str, arguments: dict) -> str:
            return json.dumps({"status": "mocked", "msg": "MCP offline"})

        def get_prompt(self, prompt_name: str, arguments: dict) -> str:
            return "Mocked pitch: VerdaTraceAI optimizes carbon by 85%."

    return MockMCPServer()


mcp_server = load_mcp_server()


@router.get("/projects")
async def list_projects() -> dict:
    """Fetch active projects from the virtual workspace database."""
    return {"projects": [{"id": "proj_123", "name": "RAG Chatbot", "region": "us-central1"}]}


@router.post("/projects")
async def create_project(payload: ProjectCreateRequest) -> dict:
    """Onboard a new project via ProjectOnboardingAgent."""
    session = SessionState()
    result = await orchestrator.execute(
        {
            "intent": "onboard",
            "name": payload.name,
            "provider": payload.provider,
            "region": payload.region,
            "model_family": payload.model_family,
            "hardware": payload.hardware,
        },
        session,
    )
    return result


@router.get("/projects/{project_id}/emissions")
async def get_emissions(
    project_id: str,
    provider: str = "gcp",
    region: str = "us-east4",
    model_family: str = "gemini-1.5-pro",
    execution_hour: int = 12,
    media_type: str = "text",
    media_count: int = 0,
    media_duration_sec: float = 0.0,
) -> dict:
    """Compute and fetch project emissions metrics using Parallel Agents."""
    session = SessionState()
    # Ingest the usage snapshot to establish the multimodal and token context
    await orchestrator.execute(
        {
            "intent": "ingest",
            "calls": 1,
            "prompt_tokens": 1000,
            "completion_tokens": 200,
            "media_type": media_type,
            "media_count": media_count,
            "media_duration_sec": media_duration_sec,
        },
        session,
    )
    # Perform parallel carbon calculation and LLM recommendations analysis
    result = await orchestrator.execute(
        {
            "intent": "analyze",
            "project_id": project_id,
            "provider": provider,
            "region": region,
            "model_family": model_family,
            "execution_hour": execution_hour,
            "runtime_ms": 2500,
        },
        session,
    )
    return {
        "project_id": project_id,
        "analysis_result": result,
        "green_score": session.get("latest_emission", {}).get("green_score", 85),
    }


@router.post("/chat")
async def chat_copilot(payload: ChatRequest) -> dict:
    """Deliver a context-caching conversational response from GreenCopilotChatAgent."""
    session = SessionState()
    query = payload.query
    provider = payload.provider
    region = payload.region
    model_family = payload.model_family
    media_type = payload.media_type
    media_count = payload.media_count
    media_duration_sec = payload.media_duration_sec

    # Ingest search/prompt parameters
    await orchestrator.execute(
        {
            "intent": "ingest",
            "calls": 1,
            "prompt_tokens": 800,
            "completion_tokens": 200,
            "media_type": media_type,
            "media_count": media_count,
            "media_duration_sec": media_duration_sec,
        },
        session,
    )

    # Calculate current query emissions context
    await orchestrator.execute(
        {"intent": "analyze", "provider": provider, "region": region, "model_family": model_family, "runtime_ms": 1500},
        session,
    )

    result = await orchestrator.execute({"intent": "chat", "query": query}, session)
    return result


@router.post("/mcp/tool/{tool_name}")
async def call_mcp_tool(tool_name: str, payload: MCPToolRequest) -> dict:
    """Directly interface with the MCP server tool schemas."""
    arguments = payload.arguments
    output_str = mcp_server.call_tool(tool_name, arguments)
    try:
        return json.loads(output_str)
    except json.JSONDecodeError:
        return {"response": output_str}


@router.get("/mcp/prompt/{prompt_name}")
async def get_mcp_prompt(prompt_name: str, workspace_id: str = "ws_default") -> dict:
    """Deliver Prompt templates designed for judges."""
    prompt_str = mcp_server.get_prompt(prompt_name, {"workspace_id": workspace_id})
    return {"prompt": prompt_str}


@router.post("/eval")
async def evaluate_output(payload: EvalRequest) -> dict:
    """Run security check and output validation via EvalAndGuardrailAgent."""
    session = SessionState()
    result = await orchestrator.execute({"intent": "eval", "text": payload.text}, session)
    return result


@router.post("/lifestyle/emissions")
async def get_lifestyle_emissions(payload: LifestyleRequest) -> dict:
    """Calculate lifestyle carbon footprint using LifestyleEstimationAgent."""
    session = SessionState()
    result = await orchestrator.execute(
        {
            "intent": "lifestyle",
            "driving_km": payload.driving_km,
            "vehicle_type": payload.vehicle_type,
            "diet_type": payload.diet_type,
            "electricity_kwh": payload.electricity_kwh,
            "heating_source": payload.heating_source,
            "shopping_level": payload.shopping_level,
            "recycling": payload.recycling,
        },
        session,
    )
    return result


@router.post("/ingest/unstructured")
async def ingest_unstructured_data(payload: UnstructuredIngestRequest) -> dict:
    """Parse unstructured carbon report via Scope3UnstructuredIngestAgent."""
    session = SessionState()
    result = await orchestrator.execute(
        {"intent": "ingest_unstructured", "unstructured_text": payload.unstructured_text}, session
    )
    return result


# In-memory database stubs for LocalLoops persistence in development
local_loops_db = {
    "digital": {
        "emails_count": 1250,
        "cloud_storage_gb": 450.0,
        "duplicate_media_count": 18,
        "ai_usage_count": 350,
        "digital_co2e_kg": 0.54,
        "missions": [
            {
                "id": "clean_emails",
                "title": "Purge Old Newsletters",
                "description": "Delete 500+ promotional emails to save 5g of CO2e.",
                "carbon_savings_g": 5.0,
                "credits_reward": 50,
                "status": "available",
            },
            {
                "id": "clean_duplicates",
                "title": "Clean Duplicate Photos",
                "description": "Remove duplicate high-res photos to save 10g of CO2e.",
                "carbon_savings_g": 10.0,
                "credits_reward": 100,
                "status": "available",
            },
        ],
    },
    "commerce": [
        {
            "id": "tx_1",
            "store_name": "Indiranagar Organic Market",
            "location": "Bengaluru, Karnataka",
            "is_local": 1,
            "amount_spent": 1200.0,
            "logistics_savings_kg": 1.35,
            "credits_earned": 650,
            "timestamp": "2026-06-18 10:30:00",
        },
        {
            "id": "tx_2",
            "store_name": "Super Import Depot",
            "location": "Noida, Delhi NCR",
            "is_local": 0,
            "amount_spent": 3500.0,
            "logistics_savings_kg": 0.0,
            "credits_earned": 350,
            "timestamp": "2026-06-17 14:15:00",
        },
    ],
    "food": [
        {
            "product_name": "Organic Avocados",
            "origin": "Spain",
            "distance_km": 14500.0,
            "transport_co2e_kg": 8.7,
            "local_swap": "Coorg Avocado",
            "is_local": False,
        },
        {
            "product_name": "Grade A Honey",
            "origin": "Kolar, Karnataka",
            "distance_km": 120.0,
            "transport_co2e_kg": 0.08,
            "local_swap": None,
            "is_local": True,
        },
    ],
    "transit": [
        {
            "mode": "Metro",
            "distance_km": 15.0,
            "co2e_saved_kg": 2.25,
            "credits_earned": 75,
            "timestamp": "2026-06-18 08:45:00",
        },
        {
            "mode": "Walking",
            "distance_km": 2.5,
            "co2e_saved_kg": 0.43,
            "credits_earned": 25,
            "timestamp": "2026-06-18 12:10:00",
        },
    ],
    "infra_feedback": [
        {
            "description": "Missing EV charging station near parking deck",
            "latitude": 12.9719,
            "longitude": 77.6412,
            "issue_type": "missing_ev_charger",
            "status": "submitted",
        },
        {
            "description": "Potholes along cycle lane route",
            "latitude": 12.9279,
            "longitude": 77.6271,
            "issue_type": "broken_bike_lane",
            "status": "submitted",
        },
    ],
    "circular": [
        {
            "id": "item_1",
            "name": "Power Drill",
            "owner": "Ravi K.",
            "status": "available",
            "embedded_co2e_saved_kg": 15.0,
        },
        {
            "id": "item_2",
            "name": "Bicycle",
            "owner": "Sneha M.",
            "status": "borrowed",
            "embedded_co2e_saved_kg": 120.0,
        },
        {
            "id": "item_3",
            "name": "Step Ladder",
            "owner": "John D.",
            "status": "available",
            "embedded_co2e_saved_kg": 25.0,
        },
    ],
    "credits_ledger": [
        {
            "source": "Local Commerce",
            "description": "Indiranagar Organic Market purchase",
            "credits_earned": 650,
            "timestamp": "2026-06-18 10:30:00",
        },
        {
            "source": "Transit",
            "description": "Metro commute (15.0 km)",
            "credits_earned": 75,
            "timestamp": "2026-06-18 08:45:00",
        },
        {
            "source": "Circular Economy",
            "description": "Lent Power Drill to neighbor",
            "credits_earned": 100,
            "timestamp": "2026-06-17 18:22:00",
        },
    ],
}


@router.get("/loops/digital")
async def get_digital_waste() -> dict:
    """Fetch digital waste footprint and active missions."""
    return local_loops_db["digital"]


@router.post("/loops/digital")
async def update_digital_waste(payload: DigitalWasteRequest) -> dict:
    """Run DigitalWasteAgent and update digital footprint metrics."""
    session = SessionState()
    result = await orchestrator.execute(
        {
            "intent": "digital_clean",
            "emails_count": payload.emails_count,
            "cloud_storage_gb": payload.cloud_storage_gb,
            "duplicate_media_count": payload.duplicate_media_count,
            "ai_usage_count": payload.ai_usage_count,
        },
        session,
    )
    local_loops_db["digital"].update(result)
    return result


@router.post("/loops/digital/mission/{mission_id}")
async def complete_digital_mission(mission_id: str) -> dict:
    """Simulate clean-up actions and award credits."""
    missions = local_loops_db["digital"]["missions"]
    for m in missions:
        if m["id"] == mission_id:
            m["status"] = "completed"
            earned = m["credits_reward"]
            local_loops_db["credits_ledger"].append(
                {
                    "source": "DigitalLoop",
                    "description": f"Completed mission: {m['title']}",
                    "credits_earned": earned,
                    "timestamp": "Just now",
                }
            )
            # Deduct metrics
            if mission_id == "clean_emails":
                local_loops_db["digital"]["emails_count"] = max(0, local_loops_db["digital"]["emails_count"] - 500)
            elif mission_id == "clean_duplicates":
                local_loops_db["digital"]["duplicate_media_count"] = max(
                    0, local_loops_db["digital"]["duplicate_media_count"] - 15
                )
            # Recompute CO2
            co2_g = (
                (local_loops_db["digital"]["emails_count"] * 0.01)
                + (local_loops_db["digital"]["cloud_storage_gb"] * 0.2)
                + (local_loops_db["digital"]["duplicate_media_count"] * 1.0)
                + (local_loops_db["digital"]["ai_usage_count"] * 2.0)
            )
            local_loops_db["digital"]["digital_co2e_kg"] = round(co2_g / 1000.0, 4)
            return {"status": "success", "credits_earned": earned, "updated_digital": local_loops_db["digital"]}
    return {"status": "error", "message": "Mission not found"}


@router.get("/loops/commerce")
async def get_commerce_transactions() -> dict:
    """Fetch Scope 3 local purchases ledger."""
    return {"transactions": local_loops_db["commerce"]}


@router.post("/loops/commerce")
async def log_commerce_purchase(payload: CommerceLogRequest) -> dict:
    """Run Scope3CommerceAgent to log transaction and award carbon credits."""
    session = SessionState()
    session.set("credits_ledger", local_loops_db["credits_ledger"])
    result = await orchestrator.execute(
        {
            "intent": "local_commerce",
            "store_name": payload.store_name,
            "location": payload.location,
            "amount_spent": payload.amount_spent,
            "is_local_override": payload.is_local_override,
        },
        session,
    )
    import uuid

    tx_item = {
        "id": f"tx_{uuid.uuid4().hex[:8]}",
        "store_name": result["store_name"],
        "location": result["location"],
        "is_local": result["is_local"],
        "amount_spent": result["amount_spent"],
        "logistics_savings_kg": result["logistics_savings_kg"],
        "credits_earned": result["credits_earned"],
        "timestamp": "Just now",
    }
    local_loops_db["commerce"].insert(0, tx_item)
    return tx_item


@router.post("/loops/food/scan")
async def scan_food_miles(payload: FoodScanRequest) -> dict:
    """Run FoodMileAgent to scan label and suggest alternative swappings."""
    session = SessionState()
    result = await orchestrator.execute(
        {"intent": "food_miles", "product_name": payload.product_name, "origin": payload.origin}, session
    )
    local_loops_db["food"].insert(0, result)
    return result


@router.get("/loops/food")
async def get_scanned_foods() -> dict:
    """Fetch history of scanned food items."""
    return {"foods": local_loops_db["food"]}


@router.get("/loops/transit")
async def get_transit_logs() -> dict:
    """Fetch logged mobility trips and city infrastructure feedback."""
    return {"trips": local_loops_db["transit"], "feedbacks": local_loops_db["infra_feedback"]}


@router.post("/loops/transit")
async def log_transit_trip(payload: TransitTripLogRequest) -> dict:
    """Run TransitGamifierAgent to log mileage and calculate carbon savings."""
    session = SessionState()
    session.set("credits_ledger", local_loops_db["credits_ledger"])
    result = await orchestrator.execute(
        {"intent": "transit_log", "mode": payload.mode, "distance_km": payload.distance_km}, session
    )
    trip_item = {
        "mode": result["mode"],
        "distance_km": result["distance_km"],
        "co2e_saved_kg": result["co2e_saved_kg"],
        "credits_earned": result["credits_earned"],
        "timestamp": "Just now",
    }
    local_loops_db["transit"].insert(0, trip_item)
    return trip_item


@router.post("/loops/transit/feedback")
async def submit_infra_feedback(payload: InfraFeedbackRequest) -> dict:
    """Run InfraFeedbackAgent to log crowdsourced feedback."""
    session = SessionState()
    session.set("infra_feedbacks", local_loops_db["infra_feedback"])
    result = await orchestrator.execute(
        {
            "intent": "infra_gap",
            "description": payload.description,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "issue_type": payload.issue_type,
        },
        session,
    )
    return result


@router.get("/loops/circular")
async def get_circular_items() -> dict:
    """Fetch circular economy listings."""
    return {"items": local_loops_db["circular"]}


@router.post("/loops/circular")
async def share_circular_item(payload: CircularItemShareRequest) -> dict:
    """Run CircularEconomyAgent to lend/borrow items and offset embedded manufacturing carbon."""
    session = SessionState()
    session.set("credits_ledger", local_loops_db["credits_ledger"])
    result = await orchestrator.execute(
        {
            "intent": "circular_share",
            "item_name": payload.item_name,
            "owner": payload.owner,
            "action": payload.action,
        },
        session,
    )
    # Check if item exists, else add it
    found = False
    for item in local_loops_db["circular"]:
        if item["name"].lower() == result["item_name"].lower():
            item["status"] = "borrowed" if result["action"] == "borrow" else "available"
            found = True
            break
    if not found:
        import uuid

        local_loops_db["circular"].append(
            {
                "id": f"item_{uuid.uuid4().hex[:8]}",
                "name": result["item_name"],
                "owner": result["owner"],
                "status": "available",
                "embedded_co2e_saved_kg": result["embedded_co2e_saved_kg"],
            }
        )
    return result


@router.get("/loops/credits")
async def get_credits_ledger() -> dict:
    """Fetch carbon credits ledger and workspace dashboard aggregations."""
    ledger = local_loops_db["credits_ledger"]
    total = sum(x["credits_earned"] for x in ledger)

    # Simple leaderboard stubs
    leaderboard = [
        {"name": "Indiranagar Eco-Loopers", "rank": 1, "credits": total + 1500, "members": 24},
        {"name": "Koramangala Green Mesh (You)", "rank": 2, "credits": total, "members": 15},
        {"name": "Whitefield Clean Grid", "rank": 3, "credits": max(0, total - 800), "members": 19},
    ]
    return {"total_credits": total, "ledger": ledger, "leaderboard": leaderboard, "streak_days": 8}


@router.post("/partner/checkout")
async def partner_checkout(payload: PartnerCheckoutRequest) -> dict:
    """Exposes B2B2C Sustainable checkout API via PartnerIntegrationAgent."""
    session = SessionState()
    result = await orchestrator.execute(
        {"intent": "partner_cart", "cart_items": payload.cart_items}, session
    )
    return result


@router.post("/narration/localize")
async def localize_narration(payload: LocalizeNarrationRequest) -> dict:
    """Provide localization packet and audio summary template via LocalizationAndNarrationAgent."""
    session = SessionState()
    result = await orchestrator.execute(
        {
            "intent": "localize_narrate",
            "text": payload.text,
            "target_lang": payload.target_lang,
        },
        session,
    )
    return result
