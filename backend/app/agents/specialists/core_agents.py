import logging
import math
from typing import Any, Dict

from app.agents.adk_core import SequentialAgent, SessionState
from app.exceptions import VerdaTraceException
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
            raise VerdaTraceException(
                message="Project name is required for onboarding.",
                error_code="VALIDATION_ERROR",
                status_code=422,
            )

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
        """Estimate power consumption and carbon emissions for an AI workload execution.

        Applies the emission formula E = (P × I) / 1000, augmented by a diurnal
        intensity curve and optional multimodal media overhead, to produce a full
        carbon + water + nature-offset result set.

        Args:
            inputs: Mapping of input parameters including:
                - runtime_ms (int): Execution duration in milliseconds. Defaults to 1000.
                - region (str): Cloud region identifier (e.g. "europe-west4"). Defaults to
                  "us-central1".
                - model_family (str): LLM model name used to look up baseline GPU power.
                  Falls back to session state or "gemini-1.5-pro".
                - execution_hour (int): UTC hour of execution (0–23) used for diurnal
                  intensity adjustment. Defaults to 12.
                - media_type (str): One of "text", "image", "audio", "video". Defaults to
                  "text".
                - media_count (int): Number of images processed (relevant when
                  media_type="image"). Defaults to 0.
                - media_duration_sec (float): Duration of audio/video media in seconds.
                  Defaults to 0.0.
            session: Current agent session providing shared state across pipeline steps.

        Returns:
            A dictionary containing:
                - kwh_consumed (float): Total energy consumed in kilowatt-hours.
                - co2e_emitted_kg (float): Carbon dioxide equivalent emitted in kilograms.
                - water_liters (float): Estimated cooling water consumed in litres.
                - trees_offset (float): Equivalent tree-years needed to offset emissions.
                - ocean_seagrass_sqm (float): Square metres of seagrass needed to offset.
                - uncertainty_pct (int): Estimation confidence margin as a percentage.
                - water_stress_index (str): Qualitative water-stress level for the region.
                - execution_hour (int): Echo of the input execution_hour.
                - green_score (int): 0–100 sustainability score derived from co2e_emitted_kg.
        """
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
        """Generate provider-specific green deployment recommendations for an AI workload.

        Uses an LLM (Gemini Flash tier) to produce actionable sustainability
        recommendations.  Falls back to hard-coded provider recommendations if the LLM
        model is unavailable.

        Args:
            inputs: Mapping of input parameters including:
                - region (str): Cloud region identifier for the workload. Defaults to
                  "us-central1".
                - model_family (str): LLM model name in current use. Defaults to
                  "gemini-1.5-pro".
                - provider (str): Cloud provider identifier — one of "gcp", "aws",
                  "azure", or "onprem". Defaults to "gcp".
            session: Current agent session providing shared state across pipeline steps.

        Returns:
            A dictionary containing:
                - recommendations (list[str]): Bulleted markdown strings, each describing
                  one actionable optimisation step (region shift, model downsize, eco
                  offset, or caching recommendation).
        """
        region = inputs.get("region", "us-central1")
        model_family = inputs.get("model_family", "gemini-1.5-pro")
        provider = inputs.get("provider", "gcp")

        model = llm_service.get_flash_model()
        if not model:
            if provider == "aws":
                recommendations = [
                    "- Shift AWS workloads to us-west-2 (Oregon) to reduce carbon"
                    " intensity by 82% and water usage by 73%.",
                    "- Downsize to Claude 3 Haiku / Llama 3 8B to cut baseline GPU power footprint.",
                    "- Sponsor verified ocean blue carbon projects (seagrass planting) to accelerate carbon capture.",
                ]
            elif provider == "azure":
                recommendations = [
                    "- Shift Azure workloads to swedencentral to achieve a 10g/kWh"
                    " grid intensity and 95% cooling water savings.",
                    "- Downsize to GPT-4o-mini to reduce energy consumption by up to 70%.",
                    "- Implement reforestation initiatives (planting native trees) to"
                    " offset remaining scope 3 cloud emissions.",
                ]
            elif provider == "onprem":
                recommendations = [
                    "- Optimize local hardware utilization or transition batch summaries"
                    " to low-carbon off-peak grid hours.",
                    "- Use air-cooled local enclosures or high-efficiency water loops to minimize local water waste.",
                    "- Deploy highly quantized open source models (e.g. Llama 3 8B INT4)"
                    " to decrease processor execution seconds.",
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
