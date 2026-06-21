import pytest
from app.evals import run_evals

@pytest.mark.asyncio
async def test_run_evals_harness() -> None:
    """Verify that the evaluation harness runs correctly and returns a boolean value."""
    result = await run_evals()
    assert isinstance(result, bool)
