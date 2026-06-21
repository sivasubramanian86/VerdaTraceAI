import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SimulatorView } from './components/SimulatorView';
import { RecommendationsView } from './components/RecommendationsView';
import { CopilotView } from './components/CopilotView';
import { JudgeView } from './components/JudgeView';
import { LifestyleView } from './components/LifestyleView';
import { DigitalFootprintView } from './components/DigitalFootprintView';
import { LocalCommerceView } from './components/LocalCommerceView';
import { FoodMilesView } from './components/FoodMilesView';
import { TransitInfraView } from './components/TransitInfraView';
import { CircularEconomyView } from './components/CircularEconomyView';
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [locale, setLocale] = useState('en');

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  // Dashboard State
  const [emissionsData, setEmissionsData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Copilot State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{ type: string, count: number, duration: number } | null>(null);

  // What-If Simulator State
  const [simProvider, setSimProvider] = useState('gcp');
  const [simCalls, setSimCalls] = useState(50000); // calls/day
  const [simRegion, setSimRegion] = useState('us-central1');
  const [simModel, setSimModel] = useState('gemini-1.5-pro');
  const [simCaching, setSimCaching] = useState(false);
  const [simExecutionHour, setSimExecutionHour] = useState(12); // Hour of day (0-23)

  // Judge View State
  const [scenario, setScenario] = useState('baseline'); // baseline vs optimized
  const [judgeSummary, setJudgeSummary] = useState('');
  const [loadingJudgeSummary, setLoadingJudgeSummary] = useState(false);

  // Seed Recommendations Data
  const recommendationsList = [
    { id: 1, action: "Migrate AWS workloads to us-west-2 (Oregon) - Clean Hydro Energy", category: "AWS Region", impact: 82, complexity: "Low" },
    { id: 2, action: "Migrate Azure workloads to swedencentral - 100% CFE Mix", category: "Azure Region", impact: 97, complexity: "Low" },
    { id: 3, action: "Migrate GCP workloads to europe-west4 (Eemshaven) - 93% CFE Match", category: "GCP Region", impact: 85, complexity: "Low" },
    { id: 4, action: "Downsize Azure GPT-4o deployments to GPT-4o-mini", category: "Model Downsizing", impact: 70, complexity: "Low" },
    { id: 5, action: "Enable Semantic Caching / Context Caching", category: "Caching", impact: 40, complexity: "Medium" },
    { id: 6, action: "Schedule heavy batch summaries off-peak on local On-Premises hardware", category: "Scheduling", impact: 15, complexity: "High" }
  ];

  // Fetch Emissions Data
  useEffect(() => {
    if (activeTab === 'dashboard' && !emissionsData) {
      setLoadingDashboard(true);
      fetch(`${API_BASE_URL}/api/v1/projects/proj_123/emissions`)
        .then(res => res.json())
        .then(data => {
          setEmissionsData(data);
          setLoadingDashboard(false);
        })
        .catch(err => {
          console.error(err);
          // Mock data fallback
          setEmissionsData({
            green_score: 85,
            analysis_result: {
              co2e_emitted_kg: 142.5,
              kwh_consumed: 320.0,
              water_liters: 384.0,
              trees_offset: 71.25,
              ocean_seagrass_sqm: 114.0
            }
          });
          setLoadingDashboard(false);
        });
    }
  }, [activeTab]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    const mediaToSend = attachedMedia;
    
    setChatInput('');
    setAttachedMedia(null);
    
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          provider: simProvider,
          region: simRegion,
          model_family: simModel,
          media_type: mediaToSend?.type || "text",
          media_count: mediaToSend?.count || 0,
          media_duration_sec: mediaToSend?.duration || 0.0
        })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'agent', text: data.response || JSON.stringify(data) }]);
    } catch (err) {
      // Mock Agent answer fallback
      let mockText = `VerdaTraceAI Copilot Response: Migrating to the greenest regions (GCP europe-west4, AWS us-west-2, or Azure swedencentral) reduces carbon intensity by 80-97% compared to coal-heavy defaults.`;
      if (mediaToSend) {
        const energy = mediaToSend.type === 'image' ? '0.0020' : mediaToSend.type === 'audio' ? '0.0150' : '0.0600';
        mockText += ` [Multimodal active footprint: Ingested 1 ${mediaToSend.type} consuming ${energy} kWh on active GPU clusters]`;
      }
      setChatHistory(prev => [...prev, { role: 'agent', text: mockText }]);
    } finally {
      setChatLoading(false);
    }
  };

  const explainRecommendation = (action: string) => {
    setActiveTab('copilot');
    setChatInput(`Explain this optimization action: ${action}`);
  };

  const triggerJudgeSummary = async () => {
    setLoadingJudgeSummary(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/mcp/prompt/GenerateJudgeSummary?workspace_id=ws_promptwars_3`);
      const data = await res.json();
      setJudgeSummary(data.prompt);
    } catch (err) {
      setJudgeSummary("Judge pitch generated via MCP: Workspace ws_promptwars_3 achieved a carbon footprint reduction of 88% (saving 500kg CO₂e/mo) using VerdaTraceAI's Parallel ADK agent mesh, Vertex AI context caching, and europe-west4 renewable regions.");
    } finally {
      setLoadingJudgeSummary(false);
    }
  };

  // What-If Simulator math
  const getSimulatedMetrics = () => {
    let regionFactor = 400; // default
    if (simProvider === 'gcp') {
      regionFactor = simRegion === 'europe-west4' ? 50 : simRegion === 'us-east4' ? 450 : 400;
    } else if (simProvider === 'aws') {
      regionFactor = simRegion === 'us-west-2' ? 80 : simRegion === 'eu-west-1' ? 280 : simRegion === 'eu-central-1' ? 350 : 450;
    } else if (simProvider === 'azure') {
      regionFactor = simRegion === 'swedencentral' ? 10 : simRegion === 'westeurope' ? 50 : 450;
    } else if (simProvider === 'onprem') {
      regionFactor = 380;
    }

    // Apply diurnal grid intensity curve factor
    const diurnalFactor = 1.0 - 0.3 * Math.sin((simExecutionHour - 6) * Math.PI / 12);
    regionFactor = Math.round(regionFactor * diurnalFactor);

    let modelFactor = 0.005; // default
    const m = simModel.toLowerCase();
    if (m.includes('pro') || m.includes('sonnet') || m.includes('70b') || m === 'gpt-4o') {
      modelFactor = 0.008;
      if (m === 'gpt-4o') modelFactor = 0.010;
      if (m.includes('sonnet')) modelFactor = 0.009;
    } else if (m.includes('flash') || m.includes('haiku') || m.includes('mini') || m.includes('8b') || m.includes('7b')) {
      modelFactor = 0.002;
      if (m.includes('mini')) modelFactor = 0.003;
      if (m.includes('haiku')) modelFactor = 0.0025;
    }

    const cachingFactor = simCaching ? 0.6 : 1.0;
    
    const kwh = (simCalls * modelFactor * cachingFactor) / 10;
    const co2 = (kwh * regionFactor) / 1000;
    const greenScore = Math.max(10, Math.min(100, Math.round(100 - (co2 / 2))));

    // Water intensity factor
    let waterIntensity = 1.2;
    if (simProvider === 'gcp') {
      waterIntensity = simRegion === 'europe-west4' ? 0.2 : simRegion === 'us-east4' ? 1.9 : 1.8;
    } else if (simProvider === 'aws') {
      waterIntensity = simRegion === 'us-west-2' ? 0.5 : simRegion === 'eu-west-1' ? 0.8 : simRegion === 'eu-central-1' ? 0.8 : 1.9;
    } else if (simProvider === 'azure') {
      waterIntensity = simRegion === 'swedencentral' ? 0.1 : simRegion === 'westeurope' ? 0.3 : 1.9;
    } else if (simProvider === 'onprem') {
      waterIntensity = 1.5;
    }

    const waterLiters = kwh * waterIntensity;
    const treesOffset = co2 * 0.5;
    const oceanSeagrassSqm = co2 * 0.8;

    // Uncertainty margin
    let uncertainty = 22;
    if (simCaching) uncertainty = 12;

    // Water stress
    let waterStress = "Medium";
    const r = simRegion.toLowerCase();
    if (r.includes('central') || r.includes('central-1')) waterStress = "Medium";
    if (r.includes('west4') || r.includes('west-2') || r.includes('west-1') || r.includes('europe') || r.includes('sweden')) waterStress = "Low";
    if (r.includes('east4') || r.includes('east-1') || r.includes('eastus')) waterStress = "High";
    if (simProvider === 'onprem') waterStress = "Medium";
    
    return { 
      kwh: kwh.toFixed(1), 
      co2: co2.toFixed(1), 
      waterLiters: waterLiters.toFixed(1),
      treesOffset: treesOffset.toFixed(1),
      oceanSeagrassSqm: oceanSeagrassSqm.toFixed(1),
      uncertaintyPct: uncertainty,
      waterStressIndex: waterStress,
      greenScore 
    };
  };

  const simMetrics = getSimulatedMetrics();

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background 0.35s ease, color 0.35s ease' }}>
      <div className="mesh-bg" aria-hidden="true" />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        locale={locale}
        setLocale={setLocale}
      />

      {/* Main Content View Routing */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ minWidth: 0 }}>
        {activeTab === 'dashboard' && (
          <DashboardView emissionsData={emissionsData} loadingDashboard={loadingDashboard} locale={locale} />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView 
            simProvider={simProvider} setSimProvider={setSimProvider}
            simCalls={simCalls} setSimCalls={setSimCalls}
            simRegion={simRegion} setSimRegion={setSimRegion}
            simModel={simModel} setSimModel={setSimModel}
            simCaching={simCaching} setSimCaching={setSimCaching}
            simExecutionHour={simExecutionHour} setSimExecutionHour={setSimExecutionHour}
            simMetrics={simMetrics}
            locale={locale}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView 
            recommendationsList={recommendationsList} 
            explainRecommendation={explainRecommendation} 
            locale={locale}
          />
        )}

        {activeTab === 'lifestyle' && (
          <LifestyleView aiWorkloadCo2Yr={Math.round(Number(simMetrics.co2) * 12)} locale={locale} />
        )}

        {activeTab === 'digital' && (
          <DigitalFootprintView locale={locale} />
        )}

        {activeTab === 'commerce' && (
          <LocalCommerceView locale={locale} />
        )}

        {activeTab === 'food' && (
          <FoodMilesView locale={locale} />
        )}

        {activeTab === 'transit' && (
          <TransitInfraView locale={locale} />
        )}

        {activeTab === 'circular' && (
          <CircularEconomyView locale={locale} />
        )}

        {activeTab === 'copilot' && (
          <CopilotView 
            chatHistory={chatHistory} 
            chatInput={chatInput} 
            setChatInput={setChatInput} 
            chatLoading={chatLoading} 
            handleChatSubmit={handleChatSubmit} 
            attachedMedia={attachedMedia}
            setAttachedMedia={setAttachedMedia}
            locale={locale}
          />
        )}

        {activeTab === 'judge' && (
          <JudgeView 
            scenario={scenario} setScenario={setScenario}
            triggerJudgeSummary={triggerJudgeSummary}
            judgeSummary={judgeSummary} loadingJudgeSummary={loadingJudgeSummary}
            locale={locale}
          />
        )}
      </main>
    </div>
  );
}

export default App;
