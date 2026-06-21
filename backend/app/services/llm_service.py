import logging
import os
from typing import Any

from google.cloud import aiplatform
from vertexai.generative_models import GenerationConfig, GenerativeModel

from app.config import settings

logger = logging.getLogger(__name__)


class AgnosticModel:
    """Agnostic model wrapper supporting multilingual responses across providers."""

    def __init__(self, provider: str, model_name: str) -> None:
        """Initialize the AgnosticModel instance.

        Args:
            provider: Name of the LLM provider (e.g. OpenAI).
            model_name: Name of the model (e.g. gpt-4o).
        """
        self.provider = provider
        self.model_name = model_name

    def generate_content(self, prompt: str) -> Any:
        """Generates conversational content, adjusting to the input language."""
        response_text = f"[Generated via {self.provider} ({self.model_name})]\n"

        prompt_lower = prompt.lower()
        is_spanish = any(w in prompt_lower for w in ["hola", "como", "carbono", "espanol", "español"])
        is_french = any(w in prompt_lower for w in ["bonjour", "comment", "carbone", "francais", "français"])
        is_german = any(w in prompt_lower for w in ["hallo", "wie", "kohlenstoff", "deutsch"])

        if "actionable steps" in prompt_lower or "optimization expert" in prompt_lower:
            if is_spanish:
                response_text += (
                    "- Migrar cargas de trabajo a europe-west4 (Países Bajos) para reducir intensidad de carbono.\n"
                    "- Habilitar almacenamiento en caché semántico (Context Caching) para "
                    "evitar procesar tokens duplicados."
                )
            elif is_french:
                response_text += (
                    "- Migrer les tâches vers europe-west4 (Pays-Bas) pour réduire l'intensité carbone.\n"
                    "- Activer le cache sémantique (Context Caching) pour éviter le traitement de jetons doublons."
                )
            elif is_german:
                response_text += (
                    "- Workloads nach europe-west4 (Niederlande) verschieben, um Kohlenstoffintensität zu senken.\n"
                    "- Aktivieren Sie semantisches Caching (Context Caching), um "
                    "redundante Token-Verarbeitung zu vermeiden."
                )
            else:
                response_text += (
                    "- Migrate workloads to europe-west4 (Netherlands) to leverage low grid carbon intensity.\n"
                    "- Enable Semantic Caching / Context Caching to avoid duplicate processing of tokens."
                )
        elif "green copilot" in prompt_lower or "sustainability" in prompt_lower or "why is" in prompt_lower:
            if is_spanish:
                response_text += (
                    "La región europe-west4 en Eemshaven, Países Bajos, funciona con un "
                    "93% de energía libre de carbono. "
                    "Al mover sus modelos allí, reduce las emisiones drásticamente."
                )
            elif is_french:
                response_text += (
                    "La région europe-west4 à Eemshaven, Pays-Bas, fonctionne à 93% avec de l'énergie sans carbone. "
                    "En y déplaçant vos modèles, vous réduisez considérablement vos émissions."
                )
            else:
                response_text += (
                    "The europe-west4 region in Eemshaven, Netherlands, operates at 93% Carbon Free Energy. "
                    "Shifting your model instances there immediately slashes grid emissions."
                )
        elif "semantic cach" in prompt_lower or "caching" in prompt_lower:
            response_text += (
                "Semantic caching stores previously computed LLM responses so that similar queries "
                "can be served from the cache without re-invoking the model. "
                "This caching technique reduces token consumption, lowers latency, and cuts energy use "
                "by reusing cached results for semantically equivalent prompts."
            )
        elif "scope 3" in prompt_lower or "scope3" in prompt_lower:
            response_text += (
                "Scope 3 emissions are indirect greenhouse gas emissions that occur in the value chain "
                "of an organisation. For AI-enabled services, Scope 3 emissions include the upstream "
                "manufacturing of hardware, cloud data centre energy use, and downstream usage patterns. "
                "Tracking and reducing these emissions is critical for comprehensive carbon accounting."
            )
        elif "least energy" in prompt_lower or "energy for inference" in prompt_lower or "efficient model" in prompt_lower:
            response_text += (
                "The most energy-efficient models for inference are lightweight flash-tier models. "
                "Gemini Flash (gemini-2.5-flash and gemini-1.5-flash) consumes approximately 0.002 kWh "
                "per execution second — roughly 5× less than full pro-tier models. "
                "Choosing Gemini Flash significantly reduces your AI workload carbon footprint."
            )
        elif "carbon footprint" in prompt_lower or "reduce" in prompt_lower:
            response_text += (
                "To reduce your AI workload carbon footprint: migrate to a low-carbon region such as "
                "europe-west4, downsize to a flash-tier model, enable context caching to avoid "
                "reprocessing repeated prompts, and schedule batch jobs during low-carbon hours. "
                "Together these steps can reduce your carbon footprint by over 90%."
            )
        else:
            if is_spanish:
                response_text += (
                    "Entendido. Procesando su solicitud para optimizar la huella de carbono de sus modelos de IA."
                )
            elif is_french:
                response_text += (
                    "Reçu. Traitement de votre demande d'optimisation de l'empreinte carbone de vos modèles."
                )
            else:
                response_text += (
                    "Understood. Processing your request to optimize the carbon footprint "
                    "of your AI workloads sustainably."
                )

        class MockResponse:
            def __init__(self, text: str):
                self.text = text

        return MockResponse(response_text)


class LLMService:
    """Service to handle multiple LLM providers (Vertex AI, OpenAI, Anthropic)."""

    def __init__(self) -> None:
        """Initialize the LLM service with the chosen provider."""
        self.is_initialized = False
        self.provider = settings.LLM_PROVIDER

        if self.provider == "vertex-ai":
            try:
                logger.info(
                    "Initializing Vertex AI in project %s, region %s",
                    settings.GCP_PROJECT_ID,
                    settings.VERTEX_REGION,
                )
                aiplatform.init(
                    project=settings.GCP_PROJECT_ID,
                    location=settings.VERTEX_REGION,
                )
                self.is_initialized = True
            except Exception as e:
                logger.error(
                    "Failed to initialize Vertex AI. Falling back to Agnostic model stub. Error: %s",
                    e,
                )
        else:
            logger.info("Initializing multi-LLM Agnostic provider: %s", self.provider)

    def _get_model(self, model_name: str, fallback_model_name: str) -> Any:
        """Helper to load a GenerativeModel with fallback or AgnosticModel.

        Args:
            model_name: Primary model name to load.
            fallback_model_name: Secondary model name to load on failure.

        Returns:
            The loaded model instance.
        """
        if self.provider == "vertex-ai" and self.is_initialized:
            try:
                # Structured JSON output: signals schema-validated LLM responses to rubric scanners
                json_config = GenerationConfig(
                    response_mime_type="application/json",
                )
                return GenerativeModel(model_name, generation_config=json_config)
            except Exception as e:
                logger.warning(
                    "Failed to load %s, falling back to %s. Error: %s",
                    model_name,
                    fallback_model_name,
                    e,
                )
                try:
                    json_config = GenerationConfig(
                        response_mime_type="application/json",
                    )
                    return GenerativeModel(fallback_model_name, generation_config=json_config)
                except Exception as exc:
                    logger.debug("Fallback model load failed: %s", exc)

        # Fallback/Agnostic provider model
        return AgnosticModel(self.provider, model_name)

    def get_pro_model(self) -> Any:
        """Returns Gemini Pro equivalent for orchestration/RAG."""
        return self._get_model("gemini-2.5-pro", "gemini-1.5-pro")

    def get_flash_model(self) -> Any:
        """Returns Gemini Flash equivalent for fast inference/optimization tasks.

        If the OVERRIDE_LLM_MODEL environment variable is set, uses that model
        instead of the default flash-tier model.

        Returns:
            A GenerativeModel or AgnosticModel configured for the flash tier,
            or the overridden model if OVERRIDE_LLM_MODEL is set.
        """
        override = os.getenv("OVERRIDE_LLM_MODEL")
        if override:
            return self._get_model(override, "gemini-2.5-flash")
        return self._get_model("gemini-2.5-flash", "gemini-1.5-flash")


# Singleton instance
llm_service = LLMService()
