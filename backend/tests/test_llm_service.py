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

    p_es = "actionable steps en espanol"
    res_es = model.generate_content(p_es)
    assert "europe-west4" in res_es.text
    assert "caché" in res_es.text

    p_fr = "actionable steps français"
    res_fr = model.generate_content(p_fr)
    assert "europe-west4" in res_fr.text
    assert "sémantique" in res_fr.text

    p_de = "actionable steps deutsch"
    res_de = model.generate_content(p_de)
    assert "europe-west4" in res_de.text
    assert "Caching" in res_de.text

    # 2. Green copilot / sustainability prompts
    p2_en = "tell me about sustainability of cloud"
    res2_en = model.generate_content(p2_en)
    assert "Eemshaven" in res2_en.text

    p2_es = "sustainability por que es europe-west4 mas verde?"
    res2_es = model.generate_content(p2_es)
    assert "Eemshaven" in res2_es.text

    p2_fr = "sustainability comment est europe-west4 carbone?"
    res2_fr = model.generate_content(p2_fr)
    assert "Eemshaven" in res2_fr.text

    # 3. Default fallback prompts
    p3_en = "random query"
    res3_en = model.generate_content(p3_en)
    assert "Understood" in res3_en.text

    p3_es = "hola amigo"
    res3_es = model.generate_content(p3_es)
    assert "Entendido" in res3_es.text

    p3_fr = "bonjour"
    res3_fr = model.generate_content(p3_fr)
    assert "Reçu" in res3_fr.text


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
