import json
import logging
import math
from typing import Any, Dict

from app.agents.adk_core import SequentialAgent, SessionState
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class ProjectOnboardingAgent(SequentialAgent):
    """Validates and creates configuration metadata for new AI workloads."""

    def __init__(self) -> None:
        super().__init__("ProjectOnboardingAgent", "Validates and onboards new AI projects.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        name = inputs.get("name")
        provider = inputs.get("provider", "gcp")
        region = inputs.get("region", "us-central1")
        model_family = inputs.get("model_family", "gemini-1.5-pro")
        hardware = inputs.get("hardware", "GPU")

        if not name:
            return {"error": "Project name is required for onboarding."}

        project_config = {
            "name": name,
            "provider": provider,
            "region": region,
            "model_family": model_family,
            "hardware": hardware,
            "status": "active",
        }

        session.set(f"config_{name}", project_config)
        session.set("active_project_provider", provider)
        session.set("active_project_model_family", model_family)
        return {"status": "success", "config": project_config}


class UsageIngestionAgent(SequentialAgent):
    """Normalizes and logs usage snapshotted data (tokens, runtimes)."""

    def __init__(self) -> None:
        super().__init__("UsageIngestionAgent", "Normalizes and ingests usage logs.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        calls = inputs.get("calls", 0)
        prompt_tokens = inputs.get("prompt_tokens", 0)
        completion_tokens = inputs.get("completion_tokens", 0)

        # Context Caching calculations: if caching enabled, reduce total tokens billed/processed
        caching_enabled = inputs.get("caching_enabled", False)
        cached_tokens = inputs.get("cached_tokens", 0)

        effective_tokens = prompt_tokens + completion_tokens
        if caching_enabled:
            effective_tokens = max(0, effective_tokens - cached_tokens)

        usage_snapshot = {
            "calls": calls,
            "raw_tokens": prompt_tokens + completion_tokens,
            "effective_tokens": effective_tokens,
            "caching_active": caching_enabled,
            "media_type": inputs.get("media_type", "text"),
            "media_count": inputs.get("media_count", 0),
            "media_duration_sec": inputs.get("media_duration_sec", 0.0),
        }

        session.set("latest_usage", usage_snapshot)
        return {"status": "success", "usage": usage_snapshot}


class CarbonEstimationAgent(SequentialAgent):
    """Estimates power consumption (kWh) and greenhouse emissions (gCO2e)."""

    def __init__(self) -> None:
        super().__init__("CarbonEstimationAgent", "Calculates kWh and CO2e based on region and hardware.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        runtime = inputs.get("runtime_ms", 1000)
        region = inputs.get("region", "us-central1")
        model_family = inputs.get("model_family") or session.get("active_project_model_family") or "gemini-1.5-pro"
        execution_hour = inputs.get("execution_hour", 12)

        # Grid carbon intensities (gCO2e per kWh) across GCP, AWS, Azure, Onprem
        intensity_map = {
            # GCP
            "us-central1": 400,
            "europe-west4": 50,
            "us-east4": 450,
            # AWS
            "us-east-1": 450,
            "us-west-2": 80,
            "eu-west-1": 280,
            "eu-central-1": 350,
            # Azure
            "eastus": 450,
            "westeurope": 50,
            "swedencentral": 10,
            # On-Prem
            "local-onprem": 380,
        }
        intensity = intensity_map.get(region, 300)

        # Apply diurnal curve factor: solar midday (12 PM) drops intensity by 30%, nighttime increases it.
        diurnal_factor = 1.0 - 0.3 * math.sin((execution_hour - 6) * math.pi / 12)
        intensity = int(intensity * diurnal_factor)

        # Baseline active power of standard GPU/TPU/CPU accelerator in kWh per execution second
        power_map = {
            # Heavy reasoning models
            "gemini-2.5-pro": 0.008,
            "gemini-1.5-pro": 0.008,
            "gpt-4o": 0.010,
            "claude-3-5-sonnet": 0.009,
            "llama-3-1-70b": 0.009,
            "llama-3-70b": 0.009,
            # Energy efficient/smaller models
            "gemini-2.5-flash": 0.002,
            "gemini-1.5-flash": 0.002,
            "gemini-2.0-flash": 0.002,
            "gpt-4o-mini": 0.003,
            "claude-3-haiku": 0.0025,
            "llama-3-8b": 0.002,
            "mistral-7b": 0.002,
        }
        baseline_sec_power = power_map.get(model_family.lower(), 0.005)

        # Baseline Power consumed based on model footprint
        kwh_consumed = (runtime / 1000.0) * baseline_sec_power

        # Incorporate multimodal data-processing active energy consumption
        latest_usage = session.get("latest_usage", {})
        media_type = latest_usage.get("media_type", inputs.get("media_type", "text"))
        media_count = latest_usage.get("media_count", inputs.get("media_count", 0))
        media_duration_sec = latest_usage.get("media_duration_sec", inputs.get("media_duration_sec", 0.0))

        multimodal_kwh = 0.0
        if media_type == "image":
            multimodal_kwh = media_count * 0.002
        elif media_type == "audio":
            multimodal_kwh = media_duration_sec * 0.0005
        elif media_type == "video":
            multimodal_kwh = media_duration_sec * 0.004

        kwh_consumed += multimodal_kwh
        co2e_emitted = (kwh_consumed * intensity) / 1000.0  # kg CO2e

        # Water intensity factor (Liters of water per kWh consumed based on cooling tech)
        water_intensity_map = {
            "us-central1": 1.8,
            "europe-west4": 0.2,
            "us-east4": 1.9,
            "us-east-1": 1.9,
            "us-west-2": 0.5,
            "eu-west-1": 0.8,
            "eu-central-1": 0.8,
            "eastus": 1.9,
            "westeurope": 0.3,
            "swedencentral": 0.1,
            "local-onprem": 1.5,
        }
        water_intensity = water_intensity_map.get(region, 1.2)
        water_consumed_liters = kwh_consumed * water_intensity

        # Nature Offset Equivalents:
        trees_offset = co2e_emitted * 0.5
        ocean_seagrass_sqm = co2e_emitted * 0.8

        # Calculate Data Uncertainty confidence margin (unsolved problem solution)
        caching_active = latest_usage.get("caching_active", False)
        if caching_active and media_type != "text":
            uncertainty_pct = 5  # Rich telemetry: High confidence
        elif caching_active or media_type != "text":
            uncertainty_pct = 12
        else:
            uncertainty_pct = 22  # Generic estimates only: Low confidence

        # Calculate Water Stress Index (unsolved problem trade-off mapping)
        water_stress_map = {
            "us-central1": "Medium",
            "europe-west4": "Low",
            "us-east4": "High",
            "us-east-1": "High",
            "us-west-2": "Low",
            "eu-west-1": "Low",
            "eu-central-1": "Medium",
            "eastus": "High",
            "westeurope": "Low",
            "swedencentral": "Low",
            "local-onprem": "Medium",
        }
        water_stress_index = water_stress_map.get(region, "Medium")

        result = {
            "kwh_consumed": round(kwh_consumed, 4),
            "co2e_emitted_kg": round(co2e_emitted, 4),
            "water_liters": round(water_consumed_liters, 4),
            "trees_offset": round(trees_offset, 4),
            "ocean_seagrass_sqm": round(ocean_seagrass_sqm, 4),
            "uncertainty_pct": uncertainty_pct,
            "water_stress_index": water_stress_index,
            "execution_hour": execution_hour,
            "green_score": max(10, min(100, int(100 - (co2e_emitted * 10)))),
        }
        session.set("latest_emission", result)
        return result


class OptimizationStrategyAgent(SequentialAgent):
    """Uses LLM to recommend green deployment configurations."""

    def __init__(self) -> None:
        super().__init__("OptimizationStrategyAgent", "Uses Gemini Flash to generate fast green optimizations.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        region = inputs.get("region", "us-central1")
        model_family = inputs.get("model_family", "gemini-1.5-pro")
        provider = inputs.get("provider", "gcp")

        model = llm_service.get_flash_model()
        if not model:
            if provider == "aws":
                recommendations = [
                    "- Shift AWS workloads to us-west-2 (Oregon) to reduce carbon intensity "
                    "by 82% and water usage by 73%.",
                    "- Downsize to Claude 3 Haiku / Llama 3 8B to cut baseline GPU power footprint.",
                    "- Sponsor verified ocean blue carbon projects (seagrass planting) to accelerate carbon capture.",
                ]
            elif provider == "azure":
                recommendations = [
                    "- Shift Azure workloads to swedencentral to achieve a 10g/kWh grid "
                    "intensity and 95% cooling water savings.",
                    "- Downsize to GPT-4o-mini to reduce energy consumption by up to 70%.",
                    "- Implement reforestation initiatives (planting native trees) to offset "
                    "remaining scope 3 cloud emissions.",
                ]
            elif provider == "onprem":
                recommendations = [
                    "- Optimize local hardware utilization or transition batch summaries "
                    "to low-carbon off-peak grid hours.",
                    "- Use air-cooled local enclosures or high-efficiency water loops to minimize local water waste.",
                    "- Deploy highly quantized open source models (e.g. Llama 3 8B INT4) "
                    "to decrease processor execution seconds.",
                ]
            else:
                recommendations = [
                    "- Shift GCP workloads to europe-west4 (Eemshaven) for a 93% CFE match and 90% water reduction.",
                    "- Downsize to Gemini 1.5 Flash to save active accelerator cycles.",
                    "- Enable Vertex AI Context Caching to save 40% of compute energy on repetitive prompts.",
                ]
            session.set("latest_recommendations", recommendations)
            return {"recommendations": recommendations}

        prompt = f"""
        You are a Sustainability Optimization Expert.
        The current AI workload is running on provider '{provider.upper()}' using '{model_family}' in region '{region}'.
        Recommend 2 actionable, provider-specific steps to reduce the carbon footprint.
        Examples include green region shifts, model downsizing, and context caching.
        Recommend 1 physical eco-step such as water cooling optimization, tree planting,
        or ocean blue carbon seagrass and mangrove offsets.
        Return purely as a bulleted markdown list.
        """

        try:
            response = model.generate_content(prompt)
            recommendations = response.text.split("\n")
        except Exception as e:
            recommendations = [f"Error generating optimizations: {e}"]

        session.set("latest_recommendations", recommendations)
        return {"recommendations": recommendations}


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


class LifestyleEstimationAgent(SequentialAgent):
    """Calculates yearly personal carbon footprint (kg CO2e) based on lifestyle factors."""

    def __init__(self) -> None:
        super().__init__(
            "LifestyleEstimationAgent",
            "Calculates personal lifestyle emissions (transport, diet, energy, consumption).",
        )

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        driving_km = inputs.get("driving_km", 12000.0)  # km per year
        vehicle_type = inputs.get("vehicle_type", "gas")  # "gas" or "ev" or "none"
        diet_type = inputs.get("diet_type", "average")  # "vegan", "vegetarian", "average", "meat-heavy"
        electricity_kwh = inputs.get("electricity_kwh", 4000.0)  # kWh per year
        heating_source = inputs.get("heating_source", "gas")  # "gas" or "electric" or "solar"
        shopping_level = inputs.get("shopping_level", "medium")  # "low", "medium", "high"
        recycling = inputs.get("recycling", True)

        # 1. Transportation Carbon Footprint (kg CO2e / yr)
        if vehicle_type == "gas":
            vehicle_co2 = driving_km * 0.17  # 170g CO2e/km
        elif vehicle_type == "ev":
            vehicle_co2 = driving_km * 0.05  # 50g CO2e/km
        else:
            vehicle_co2 = 0.0

        # 2. Dietary Carbon Footprint (kg CO2e / yr)
        diet_map = {"vegan": 800.0, "vegetarian": 1200.0, "average": 2000.0, "meat-heavy": 3200.0}
        diet_co2 = diet_map.get(diet_type, 2000.0)

        # 3. Energy Footprint (kg CO2e / yr)
        energy_co2 = electricity_kwh * 0.4
        if heating_source == "gas":
            energy_co2 += 1500.0
        elif heating_source == "electric":
            energy_co2 += 800.0
        else:
            energy_co2 += 100.0

        # 4. Mindful Consumption (kg CO2e / yr)
        shopping_map = {"low": 500.0, "medium": 1200.0, "high": 2500.0}
        consumption_co2 = shopping_map.get(shopping_level, 1200.0)
        if recycling:
            consumption_co2 *= 0.8  # 20% savings

        total_co2 = vehicle_co2 + diet_co2 + energy_co2 + consumption_co2

        if total_co2 < 3000.0:
            rank = "Eco-Guardian"
        elif total_co2 < 6000.0:
            rank = "Green Enthusiast"
        elif total_co2 < 10000.0:
            rank = "Average Citizen"
        else:
            rank = "Carbon Heavyweight"

        result = {
            "lifestyle_co2_yr_kg": round(total_co2, 2),
            "vehicle_co2_kg": round(vehicle_co2, 2),
            "diet_co2_kg": round(diet_co2, 2),
            "energy_co2_kg": round(energy_co2, 2),
            "consumption_co2_kg": round(consumption_co2, 2),
            "sustainability_rank": rank,
        }
        session.set("latest_lifestyle", result)
        return result


class Scope3UnstructuredIngestAgent(SequentialAgent):
    """Parses unstructured text (supplier emails, invoices, logs) into verified carbon telemetry."""

    def __init__(self) -> None:
        super().__init__("Scope3UnstructuredIngestAgent", "Parses raw supplier reports into structured telemetry.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        text = inputs.get("unstructured_text", "")

        # Default fallback values
        provider = "gcp"
        region = "us-central1"
        model_family = "gemini-1.5-pro"
        calls = 50000
        prompt_tokens = 1000
        completion_tokens = 200
        caching_enabled = False

        model = llm_service.get_flash_model()
        text_lower = text.lower()

        # Regex/keyword matching fallback
        if "aws" in text_lower or "amazon" in text_lower:
            provider = "aws"
            region = "us-west-2"
            model_family = "claude-3-5-sonnet"
        elif "azure" in text_lower or "microsoft" in text_lower:
            provider = "azure"
            region = "swedencentral"
            model_family = "gpt-4o"
        elif "on-prem" in text_lower or "onprem" in text_lower or "private" in text_lower:
            provider = "onprem"
            region = "local-onprem"
            model_family = "llama-3-8b"
        elif "gcp" in text_lower or "google" in text_lower:
            provider = "gcp"
            region = "europe-west4"
            model_family = "gemini-1.5-pro"

        # Region parsing
        for r in [
            "us-central1",
            "europe-west4",
            "us-east4",
            "us-east-1",
            "us-west-2",
            "eu-west-1",
            "eu-central-1",
            "eastus",
            "westeurope",
            "swedencentral",
            "local-onprem",
        ]:
            if r in text_lower:
                region = r

        # Model parsing
        for m in [
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "claude-3-5-sonnet",
            "claude-3-haiku",
            "llama-3-1-70b",
            "llama-3-8b",
            "gpt-4o",
            "gpt-4o-mini",
            "mistral-7b",
            "llama-3-70b",
        ]:
            if m.lower() in text_lower or m.lower().replace("-", "") in text_lower:
                model_family = m

        if "cache" in text_lower or "caching" in text_lower:
            caching_enabled = True

        import re

        numbers = re.findall(r"\b\d+(?:,\d+)?\b", text)
        clean_nums = [int(num.replace(",", "")) for num in numbers]
        if len(clean_nums) >= 1:
            calls = clean_nums[0]
        if len(clean_nums) >= 2:
            prompt_tokens = clean_nums[1]
        if len(clean_nums) >= 3:
            completion_tokens = clean_nums[2]

        # Call real LLM if available and not a fallback stub
        if model and not hasattr(model, "provider"):
            prompt = f"""
            Parse the following unstructured Scope 3 supplier report and output a JSON dictionary.
            Text: "{text}"

            JSON format:
            {{
                "provider": "gcp" | "aws" | "azure" | "onprem",
                "region": "one of the supported GCP, AWS, Azure, or on-prem regions",
                "model_family": "one of the supported Gemini, Claude, GPT, Llama, or Mistral models",
                "calls": integer,
                "prompt_tokens": integer,
                "completion_tokens": integer,
                "caching_enabled": boolean
            }}
            Return ONLY the raw JSON.
            """
            try:
                resp = model.generate_content(prompt)
                extracted = json.loads(resp.text.strip().replace("```json", "").replace("```", ""))
                provider = extracted.get("provider", provider)
                region = extracted.get("region", region)
                model_family = extracted.get("model_family", model_family)
                calls = extracted.get("calls", calls)
                prompt_tokens = extracted.get("prompt_tokens", prompt_tokens)
                completion_tokens = extracted.get("completion_tokens", completion_tokens)
                caching_enabled = extracted.get("caching_enabled", caching_enabled)
            except Exception as exc:
                logger.debug("Unstructured supplier parse fallback used: %s", exc)

        import hashlib

        # Hash text to generate an audit receipt hash
        audit_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

        result = {
            "provider": provider,
            "region": region,
            "model_family": model_family,
            "calls": calls,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "caching_enabled": caching_enabled,
            "audit_hash": audit_hash,
        }
        session.set("latest_unstructured_extraction", result)
        return result


class DigitalWasteAgent(SequentialAgent):
    """Estimates digital waste footprint and suggests cleanup missions."""

    def __init__(self) -> None:
        super().__init__("DigitalWasteAgent", "Estimates digital footprint and suggests cleanup quests.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        emails_count = inputs.get("emails_count", 0)
        cloud_storage_gb = inputs.get("cloud_storage_gb", 0.0)
        duplicate_media = inputs.get("duplicate_media_count", 0)
        ai_usage_count = inputs.get("ai_usage_count", 0)

        # Mathematical factors:
        # 1 email = 0.01g CO2e/yr
        # 1 GB cloud storage = 0.2g CO2e/yr
        # 1 duplicate media = 1g CO2e/yr
        # 1 AI query = 2g CO2e
        co2_g = (emails_count * 0.01) + (cloud_storage_gb * 0.2) + (duplicate_media * 1.0) + (ai_usage_count * 2.0)
        co2_kg = co2_g / 1000.0

        # Build clean-up missions
        missions = []
        if emails_count > 1000:
            missions.append(
                {
                    "id": "clean_emails",
                    "title": "Purge Old Newsletters",
                    "description": "Delete 500+ promotional emails to save 5g of CO2e.",
                    "carbon_savings_g": 5.0,
                    "credits_reward": 50,
                    "status": "available",
                }
            )
        if duplicate_media > 10:
            missions.append(
                {
                    "id": "clean_duplicates",
                    "title": "Clean Duplicate Photos",
                    "description": "Remove duplicate high-res photos to save 10g of CO2e.",
                    "carbon_savings_g": 10.0,
                    "credits_reward": 100,
                    "status": "available",
                }
            )

        result = {
            "digital_co2e_kg": round(co2_kg, 4),
            "emails_count": emails_count,
            "cloud_storage_gb": cloud_storage_gb,
            "duplicate_media_count": duplicate_media,
            "missions": missions,
        }
        session.set("latest_digital_waste", result)
        return result


class Scope3CommerceAgent(SequentialAgent):
    """Estimates Scope 3 commerce emissions and awards Carbon Credits for local purchases."""

    def __init__(self) -> None:
        super().__init__("Scope3CommerceAgent", "Checks shipping logistics and handles local B2B2C rewards.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        store_name = inputs.get("store_name", "Unknown Store")
        location = inputs.get("location", "Bengaluru")
        amount_spent = inputs.get("amount_spent", 0.0)

        # Determine if Bengaluru/Karnataka purchase
        local_keywords = ["bengaluru", "bangalore", "karnataka", "mysore", "kolar", "indiranagar", "koramangala"]
        is_local = any(kw in location.lower() for kw in local_keywords) or inputs.get("is_local_override", False)

        logistics_savings_kg = 0.0
        credits_earned = 0
        if is_local:
            # Sourced locally: saves shipping logistics (standard ~1.5 kg CO2e)
            logistics_savings_kg = 1.35
            credits_earned = int(amount_spent * 0.5) + 50  # 50 bonus points for buying local
        else:
            credits_earned = int(amount_spent * 0.1)

        result = {
            "store_name": store_name,
            "location": location,
            "is_local": 1 if is_local else 0,
            "amount_spent": amount_spent,
            "logistics_savings_kg": round(logistics_savings_kg, 2),
            "credits_earned": credits_earned,
        }

        # Log to ledger in session
        ledger = session.get("credits_ledger") or []
        ledger.append(
            {
                "source": "Local Commerce",
                "description": f"Purchase at {store_name} ({location})",
                "credits_earned": credits_earned,
            }
        )
        session.set("credits_ledger", ledger)
        return result


class FoodMileAgent(SequentialAgent):
    """Computes food miles from labels/origin and suggests Karnataka-first swaps."""

    def __init__(self) -> None:
        super().__init__("FoodMileAgent", "Tracks food miles origin and suggests nutritious local alternatives.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        product_name = inputs.get("product_name", "Apple")
        origin = inputs.get("origin", "California")

        local_regions = ["karnataka", "kolar", "mysore", "ooty", "coorg", "chikkamagaluru", "india"]
        is_local = any(r in origin.lower() for r in local_regions)

        # Standard food mile calculation heuristics
        if is_local:
            distance_km = 120.0
            transport_co2e_kg = 0.08
            swap = None
        else:
            distance_km = 14500.0
            transport_co2e_kg = 8.7
            # Suggest swap from Karnataka
            swaps_map = {
                "apple": "Shimla Apple or Karnataka Guava",
                "orange": "Nagpur Orange or local Sweet Lime",
                "avocado": "Coorg Avocado",
                "cheese": "Karnataka Dairy Cheddar",
                "coffee": "Chikkamagaluru Arabica Coffee",
            }
            swap = swaps_map.get(product_name.lower(), f"Local Karnataka {product_name} alternative")

        result = {
            "product_name": product_name,
            "origin": origin,
            "distance_km": distance_km,
            "transport_co2e_kg": round(transport_co2e_kg, 2),
            "local_swap": swap,
            "is_local": is_local,
        }
        session.set("latest_food_mile", result)
        return result


class TransitGamifierAgent(SequentialAgent):
    """Logs mobility trips and rewards low-carbon transportation modes."""

    def __init__(self) -> None:
        super().__init__("TransitGamifierAgent", "Estimates transport footprint and awards eco-badges.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        mode = inputs.get("mode", "Metro")  # Metro, EV Bus, Walking, Cycling, Cab
        distance_km = inputs.get("distance_km", 0.0)

        # Baseline: Gas car / ICE Cab = 0.17 kg CO2e per km
        baseline_co2e = distance_km * 0.17

        mode_co2e_per_km = {"walking": 0.0, "cycling": 0.0, "metro": 0.015, "ev bus": 0.02, "cab": 0.17}

        actual_co2e = distance_km * mode_co2e_per_km.get(mode.lower(), 0.17)
        co2e_saved_kg = max(0.0, baseline_co2e - actual_co2e)

        # Credits: Walking/cycling = 10 pts/km, EV/Metro = 5 pts/km
        credits_per_km = {"walking": 10, "cycling": 10, "metro": 5, "ev bus": 5, "cab": 0}
        credits_earned = int(distance_km * credits_per_km.get(mode.lower(), 0))

        result = {
            "mode": mode,
            "distance_km": distance_km,
            "co2e_saved_kg": round(co2e_saved_kg, 2),
            "credits_earned": credits_earned,
        }

        # Log credits
        if credits_earned > 0:
            ledger = session.get("credits_ledger") or []
            ledger.append(
                {
                    "source": "Transit",
                    "description": f"{mode} trip ({distance_km} km)",
                    "credits_earned": credits_earned,
                }
            )
            session.set("credits_ledger", ledger)

        return result


class InfraFeedbackAgent(SequentialAgent):
    """Collects and aggregates crowdsourced urban sustainability feedback."""

    def __init__(self) -> None:
        super().__init__("InfraFeedbackAgent", "Aggregates crowdsourced urban gaps like EV chargers or bike lanes.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        description = inputs.get("description", "")
        latitude = inputs.get("latitude", 12.9716)
        longitude = inputs.get("longitude", 77.5946)
        issue_type = inputs.get("issue_type", "missing_ev_charger")

        feedback_item = {
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "issue_type": issue_type,
            "status": "submitted",
        }

        feedbacks = session.get("infra_feedbacks") or []
        feedbacks.append(feedback_item)
        session.set("infra_feedbacks", feedbacks)

        # Mock clustering response
        cluster_msg = (
            "Central Bengaluru EV Charger feedback hotspot"
            if "charger" in issue_type
            else "Koramangala Cycling safety report"
        )

        return {
            "status": "success",
            "feedback": feedback_item,
            "cluster_message": cluster_msg,
            "total_reports": len(feedbacks),
        }


class CircularEconomyAgent(SequentialAgent):
    """Manages circular economy lending logs and computes manufacturing offset footprints."""

    def __init__(self) -> None:
        super().__init__(
            "CircularEconomyAgent", "Logs shared neighborhood tools to estimate avoided embedded emissions."
        )

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        item_name = inputs.get("item_name", "Drill")
        owner = inputs.get("owner", "Neighbor")
        action = inputs.get("action", "lend")  # lend or borrow

        # Manufacturing embedded footprints
        footprint_map = {"drill": 15.0, "lawnmower": 80.0, "bicycle": 120.0, "ladder": 25.0, "vacuum": 35.0}

        embedded_co2e_saved_kg = footprint_map.get(item_name.lower(), 10.0)
        credits_earned = 100 if action == "lend" else 10

        result = {
            "item_name": item_name,
            "owner": owner,
            "action": action,
            "embedded_co2e_saved_kg": embedded_co2e_saved_kg,
            "credits_earned": credits_earned,
        }

        # Log credits
        ledger = session.get("credits_ledger") or []
        ledger.append(
            {
                "source": "Circular Economy",
                "description": f"Shared {item_name} ({action})",
                "credits_earned": credits_earned,
            }
        )
        session.set("credits_ledger", ledger)

        return result


class PartnerIntegrationAgent(SequentialAgent):
    """Exposes sustainable checkout APIs for commercial B2B2C partners."""

    def __init__(self) -> None:
        super().__init__("PartnerIntegrationAgent", "B2B2C API partner routing for cart emissions and green swaps.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        cart_items = inputs.get("cart_items", [])

        total_co2e_kg = 0.0
        swaps = []
        for item in cart_items:
            # Heuristics
            origin = item.get("origin", "non-local")
            price = item.get("price", 10.0)

            item_co2e = 0.5 * (price / 5.0)
            if origin == "non-local":
                item_co2e += 2.0  # shipping logistics overhead

            total_co2e_kg += item_co2e

            # Suggest swap if non-local
            if origin == "non-local":
                swaps.append(
                    {
                        "original_item": item.get("name"),
                        "suggested_item": f"Local Karnataka {item.get('name')} equivalent",
                        "co2e_saving_kg": 1.5,
                        "discount_applied_pct": 5,
                    }
                )

        credits_reward = int(total_co2e_kg * 10)

        return {"total_co2e_kg": round(total_co2e_kg, 2), "swaps": swaps, "potential_credits": credits_reward}


class MultimodalIngestionAgent(SequentialAgent):
    """Processes multimodal inputs (ASR transcription, receipt OCR, Label parsing)."""

    def __init__(self) -> None:
        super().__init__("MultimodalIngestionAgent", "Parses audio or image files into clean text indicators.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        media_type = inputs.get("media_type", "text")

        text_result = ""
        metadata = {}

        if media_type == "audio":
            # Mock Audio ASR transcription
            text_result = inputs.get("mock_transcript", "How do I optimize europe-west4 carbon footprints?")
            metadata = {"duration_sec": inputs.get("media_duration_sec", 10.0), "language": "en"}
        elif media_type == "image":
            image_type = inputs.get("image_type", "receipt")
            if image_type == "receipt":
                text_result = "Namma Yatri Cab Receipt - Total: 150 INR, Route: Majestic to Indiranagar, 12km"
                metadata = {"ocr_status": "success", "vendor": "Namma Yatri", "amount": 150.0}
            elif image_type == "label":
                text_result = "Product: Organic Avocados, Origin: Spain"
                metadata = {"ocr_status": "success", "origin": "Spain", "product": "Avocados"}
            elif image_type == "map":
                text_result = "EV Charger missing at Indiranagar Metro Station parking lot"
                metadata = {"ocr_status": "success", "latitude": 12.9719, "longitude": 77.6412}
        else:
            text_result = inputs.get("text", "")

        return {"media_type": media_type, "extracted_text": text_result, "metadata": metadata}


class LocalizationAndNarrationAgent(SequentialAgent):
    """Supplies system templates and does translations for Indian languages."""

    def __init__(self) -> None:
        super().__init__("LocalizationAndNarrationAgent", "Provides Kannada, Hindi, and Tamil support.")

    async def _run(self, inputs: Dict[str, Any], session: SessionState) -> Dict[str, Any]:
        target_lang = inputs.get("target_lang", "en")

        # Localized greetings and summaries dictionary stubs
        translations = {
            "kn": {
                "greeting": (
                    "\u0ca8\u0cae\u0cb8\u0ccd\u0c95\u0cbe\u0cb0, \u0ca8\u0cbe\u0ca8\u0cc1 VerdaTrace Copilot."
                ),
                "carbon_saving": (
                    "\u0ca8\u0cbf\u0cae\u0ccd\u0cae CO2 \u0c89\u0cb3\u0cbf\u0ca4\u0cbe\u0caf: {value} kg."
                ),
                "recommendation": (
                    "\u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0cae\u0cbe\u0ca6\u0cb0\u0cbf\u0caf\u0ca8\u0ccd\u0ca8\u0cc1 "
                    "europe-west4 \u0c97\u0cc6 \u0cb5\u0cb0\u0ccd\u0c97\u0cbe\u0caf\u0cbf\u0cb8\u0cbf."
                ),
            },
            "hi": {
                "greeting": (
                    "\u0928\u092e\u0938\u094d\u0924\u0947, \u092e\u0948\u0902 VerdaTrace Copilot \u0939\u0942\u0902."
                ),
                "carbon_saving": "\u0906\u092a\u0915\u0940 CO2 \u092c\u091a\u0924: {value} kg.",
                "recommendation": (
                    "\u0905\u092a\u0928\u0947 \u092e\u0949\u0921\u0932 \u0915\u094b europe-west4 "
                    "\u092a\u0930 \u0938\u094d\u0925\u093e\u0928\u093e\u0902\u0924\u0930\u093f\u0924 "
                    "\u0915\u0930\u0947\u0902."
                ),
            },
            "ta": {
                "greeting": "Vanakkam, I am VerdaTrace Copilot.",
                "carbon_saving": "Your CO2 savings: {value} kg.",
                "recommendation": "Migrate your model to europe-west4.",
            },
            "en": {
                "greeting": "Hello, I am VerdaTrace Copilot.",
                "carbon_saving": "Your carbon savings: {value} kg.",
                "recommendation": "Migrate your model to europe-west4.",
            },
        }

        lang_pack = translations.get(target_lang, translations["en"])

        # Audio recap summary generation
        tts_summary_text = lang_pack.get("greeting") + " " + lang_pack.get("recommendation")

        return {
            "target_lang": target_lang,
            "language_package": lang_pack,
            "translated_text": tts_summary_text,
            "tts_audio_url": f"/api/v1/narration/audio_{target_lang}.mp3",
        }
