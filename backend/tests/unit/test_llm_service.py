import pytest
from app.services.llm_service import AgnosticModel, LLMService, llm_service

def test_agnostic_model_languages() -> None:
    """Test AgnosticModel translations and prompt patterns."""
    model = AgnosticModel("openai", "gpt-4o")
    
    # 1. Actionable steps prompts
    p_en = "give me actionable steps for carbon reduction"
    res_en = model.generate_content(p_en)
    assert "europe-west4" in res_en.text
    assert "Context Caching" in res_en.text

    # 2. Green copilot / sustainability prompts
    p2_en = "tell me about sustainability of cloud"
    res2_en = model.generate_content(p2_en)
    assert "Eemshaven" in res2_en.text


def test_llm_service_models() -> None:
    """Test LLMService get methods and initialization fallback."""
    service = LLMService()
    pro = service.get_pro_model()
    flash = service.get_flash_model()
    assert pro is not None
    assert flash is not None

    # Test private method _get_model fallback
    model = service._get_model("invalid-model-name", "gemini-1.5-flash")
    assert model is not None
