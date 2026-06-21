# PromptWars Virtual Challenge 3: Demo Script

**Project**: VerdaTraceAI
**Pitch**: "A Carbon Intelligence Copilot for AI Workloads"

## Pre-requisites
- Ensure backend API is running (`uvicorn app.main:app`).
- Ensure frontend is running (`npm run dev`).
- Open the dashboard at `localhost:5173`.

## Scene 1: The Problem (Dashboard)
1. Navigate to **Dashboard**.
2. Explain the problem: "AI is power-hungry, and most developers don't know the carbon footprint of their RAG pipelines or chatbots."
3. Show the **GreenScore Gauge** (currently at 60/100) and the **Total CO2e** metrics. Point out the high-carbon project (e.g., "Legacy GPT-4 chatbot in us-east").

## Scene 2: What-If Simulator (Optimization)
1. Navigate to **What-If Simulator**.
2. Select the legacy high-carbon project.
3. Use the dropdown to switch the model to **Gemini 1.5 Flash**.
4. Use the region dropdown to switch from a coal-heavy region to **europe-west4** (Eemshaven, 100% renewable).
5. Toggle "Enable Semantic Caching".
6. Click **Simulate**. 
7. Show the projected 85% drop in carbon emissions and the updated projected GreenScore.

## Scene 3: Agentic RAG & Copilot (Explanation)
1. Navigate to **Green Copilot**.
2. Type: *"Why did the system recommend moving to europe-west4?"*
3. The Agentic RAG Explainer will fetch the GCP Carbon Free Energy (CFE) docs via the vector store.
4. Show the response: *"Europe-west4 operates at roughly 93% CFE, significantly lowering the gCO2eq/kWh compared to your previous region. [Source: GCP CFE 2023 Report]"*

## Scene 4: The Judge Pitch (MCP Integration)
1. Open the MCP tool integration panel (or trigger via API).
2. Run the `GenerateJudgeSummary` prompt.
3. Read the generated output: "VerdaTraceAI uses parallel ADK agents to estimate emissions in real-time, Agentic RAG to explain complex sustainability trade-offs, and an interactive UI to drive immediate architectural changes."
4. Close the video with a call to action: "Build Green, Build Smart."
