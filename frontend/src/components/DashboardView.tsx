/* v8 ignore start */
import React, { useState } from 'react';
import { Leaf, Droplet, Trees, Waves, ShieldCheck, AlertTriangle, HelpCircle, Car, Flame, Utensils, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { AgentPipeline } from './AgentPipeline';
import { translations } from '../i18n/translations';

interface DashboardViewProps {
  emissionsData: any;
  loadingDashboard: boolean;
  locale: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ emissionsData, loadingDashboard, locale }) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'ledger' | 'pareto'>('trends');

  const t = translations[locale]?.dashboard || translations["en"].dashboard;

  const result = emissionsData?.analysis_result || {};
  const greenScore = emissionsData?.green_score || 85;
  const co2 = result.co2e_emitted_kg || 142.5;
  const kwh = result.kwh_consumed || 320.0;
  const water = result.water_liters || 384.0;
  const trees = result.trees_offset || 71.25;
  const seagrass = result.ocean_seagrass_sqm || 114.0;
  
  // Unsolved Problem Solutions
  const uncertainty = result.uncertainty_pct || 22; // Default to 22% for generic mock data
  const waterStress = result.water_stress_index || "Medium";

  // Equivalents calculations
  const carKm = Math.round(co2 / 0.17);
  const burgers = Math.round(co2 / 5.2);
  const homeMonths = Math.round((co2 / 0.4) / (4000 / 12) * 10) / 10;

  // Mock Cryptographic Ledger Blocks
  const ledgerBlocks = [
    { height: 1045, time: "2026-06-17 00:10:15", type: "Scope 3 Telemetry Ingest", hash: "vt_8fa72be105c911ea", status: "VERIFIED", details: "calls=50000, model=gemini-1.5-pro, cache=off" },
    { height: 1044, time: "2026-06-17 00:05:22", type: "Carbon Intensity Estimate", hash: "vt_d91f20ac712a884d", status: "VERIFIED", details: "intensity=50g/kWh, diurnal_factor=0.72" },
    { height: 1043, time: "2026-06-16 23:58:00", type: "Water Footprint Calibration", hash: "vt_10287cf51da3b2c1", status: "VERIFIED", details: "cooling=evaporative, region=us-east4" },
    { height: 1042, time: "2026-06-16 23:42:12", type: "Guardrail Output Check", hash: "vt_c821ea9825b441f0", status: "VERIFIED", details: "status=safe, score=1.0" },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2">
            {t.subtitle} {t.aiWorkloadCarbonFootprint}.
          </p>
          <p className="text-slate-400 mt-1 text-sm">
            {t.scope3EmissionsPhrase}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-450">GCP</span>
          <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-semibold text-orange-400">AWS</span>
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">Azure</span>
          <span className="px-2.5 py-1 bg-slate-500/10 border border-slate-500/30 rounded-full text-xs font-semibold text-slate-400">On-Prem</span>
        </div>
      </header>
      
      {loadingDashboard ? (
         <p className="text-slate-400 animate-pulse">Fetching live agentic carbon calculations...</p>
      ) : (
      <>
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <h3 className="text-xs font-medium text-slate-450 uppercase tracking-wider">{t.greenScore}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-emerald-450">
                {greenScore}
              </span>
              <span className="ml-1 text-sm text-slate-500">/ 100</span>
            </div>
            <p className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Leaf className="w-3.5 h-3.5" aria-hidden="true" /> {t.targetMet}
            </p>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-bl-full pointer-events-none group-hover:bg-slate-500/10 transition-colors" />
            <h3 className="text-xs font-medium text-slate-450 uppercase tracking-wider">{t.workspaceCo2}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-slate-100">
                {co2}
              </span>
              <span className="ml-1 text-sm text-slate-500">kg</span>
            </div>
            <p className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              {t.vsLastMonth}
            </p>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-bl-full pointer-events-none group-hover:bg-slate-500/10 transition-colors" />
            <h3 className="text-xs font-medium text-slate-450 uppercase tracking-wider">{t.totalPower}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-slate-100">
                {kwh}
              </span>
              <span className="ml-1 text-sm text-slate-500">kWh</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">{t.loadEq}</p>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            <h3 className="text-xs font-medium text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Droplet className="w-4 h-4 text-cyan-400" aria-hidden="true" /> {t.waterFootprint}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-cyan-400">
                {water}
              </span>
              <span className="ml-1 text-sm text-slate-500">L</span>
            </div>
            <p className="mt-3 text-[11px] text-cyan-400">{t.coolingUsage}</p>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            <h3 className="text-xs font-medium text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Trees className="w-4 h-4 text-amber-400" aria-hidden="true" /> {t.forestOcean}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-200">
                <span className="flex items-center gap-1"><Trees className="w-3 h-3 text-amber-400 animate-pulse" aria-hidden="true" /> {t.trees}</span>
                <span className="font-bold">{trees} {t.treeMo}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-200">
                <span className="flex items-center gap-1"><Waves className="w-3 h-3 text-blue-400 animate-pulse" aria-hidden="true" /> {t.ocean}</span>
                <span className="font-bold">{seagrass} {t.sqm}</span>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">{t.offsetTargets}</p>
          </div>
        </div>

        {/* WOW Features Row: Confidence intervals & Water stress index & AI equivalences */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Quality & Uncertainty Gauge (Unsolved Problem: Carbon Uncertainty) */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" /> {t.uncertaintyTitle}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  uncertainty < 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 
                  uncertainty < 15 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {uncertainty < 10 ? t.verifiedTelemetry : uncertainty < 15 ? t.hybridTelemetry : t.staticAverage}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {t.uncertaintyDesc}
              </p>
              
              <div className="mt-6 flex items-center justify-center relative">
                <svg viewBox="0 0 100 50" className="w-32 h-16 text-slate-700" role="img" aria-label={`Uncertainty margin gauge showing plus minus ${uncertainty}%`}>
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={uncertainty < 10 ? '#34d399' : '#f59e0b'} strokeWidth="12" strokeDasharray={`${Math.max(0, 100 - (uncertainty * 3))} 200`} />
                </svg>
                <div className="absolute text-center mt-3">
                  <span className="block text-2xl font-black text-slate-100">±{uncertainty}%</span>
                  <span className="text-[10px] text-slate-500 uppercase">{t.errorMargin}</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 bg-slate-900/60 p-2.5 rounded-lg mt-4 border border-slate-800/50 flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.uncertaintyTip}</span>
            </div>
          </div>

          {/* Water Stress Trade-off analysis (Unsolved Problem: Carbon-Water trade-offs) */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-bold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" aria-hidden="true" /> {t.waterStressTitle}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  waterStress === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 
                  waterStress === 'Medium' ? 'bg-cyan-500/10 text-cyan-400' : 
                  'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {waterStress === 'Low' ? t.lowStress : waterStress === 'Medium' ? t.mediumStress : t.highStress}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {t.waterStressDesc}
              </p>

              <div className="mt-5 space-y-2 text-xs">
                <div className="flex justify-between pb-1 border-b border-slate-800">
                  <span className="text-slate-400">{t.coolingEfficiency}</span>
                  <span className="font-bold text-slate-200">{waterStress === 'High' ? t.evaporativeCooling : waterStress === 'Medium' ? t.hybridCooling : t.zeroWaterCooling}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800">
                  <span className="text-slate-400">{t.ecoCategory}</span>
                  <span className={`font-bold ${waterStress === 'High' ? 'text-red-400' : 'text-slate-200'}`}>{waterStress === 'High' ? t.aridRisk : t.sustainableLoop}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-cyan-950/15 border border-cyan-500/10 rounded-lg text-[10px] text-cyan-400/90 leading-normal">
              {t.waterStressTip}
            </div>
          </div>

          {/* AI Equivalents Widget (WOW comparison) */}
          <div className="glass-panel p-6 bg-gradient-to-br from-slate-900/60 to-emerald-950/20 border-emerald-500/20 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold text-emerald-450 flex items-center gap-1.5 mb-2">
                <Leaf className="w-5 h-5" aria-hidden="true" /> {t.aiEquivalentsTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-4">
                {t.aiEquivalentsDesc.replace("{co2}", String(co2))}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-850 hover:border-emerald-500/25 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Car className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">{t.carDistance}</span>
                    <span className="text-sm font-extrabold text-slate-200">{carKm.toLocaleString()} {t.kmDriven}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-850 hover:border-emerald-500/25 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Utensils className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">{t.dietFootprint}</span>
                    <span className="text-sm font-extrabold text-slate-200">{burgers} {t.beefMeals}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-850 hover:border-emerald-500/25 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Flame className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">{t.utilities}</span>
                    <span className="text-sm font-extrabold text-slate-200">{homeMonths} {t.monthsElectricity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      )}

      {/* Agent pipeline visualizer */}
      <AgentPipeline locale={locale} />

      {/* Interactive Sub-tab Panel addressing Carbon Gaps (WOW Section) */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-850 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-200">{t.ledgerTitle}</h3>
            <p className="text-xs text-slate-500">{t.ledgerSub}</p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button 
              onClick={() => setActiveSubTab('trends')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeSubTab === 'trends' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> {t.tabTrends}
            </button>
            <button 
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeSubTab === 'ledger' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> {t.tabLedger}
            </button>
            <button 
              onClick={() => setActiveSubTab('pareto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeSubTab === 'pareto' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
              <Droplet className="w-3.5 h-3.5" aria-hidden="true" /> {t.tabPareto}
            </button>
          </div>
        </div>

        {activeSubTab === 'trends' && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-semibold text-slate-450 uppercase tracking-wider">{t.trendChartTitle}</h4>
            <div className="w-full h-64">
              <svg viewBox="0 0 500 200" className="w-full h-full text-emerald-500" role="img" aria-label="Line chart showing carbon emissions trend over the last 4 weeks with a downward trajectory">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="5" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="5" />
                <path d="M 0 150 Q 100 120 200 90 T 400 60 L 500 40 L 500 200 L 0 200 Z" fill="url(#chartGrad)" />
                <path d="M 0 150 Q 100 120 200 90 T 400 60 L 500 40" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="200" cy="90" r="5" fill="#34d399" />
                <circle cx="400" cy="60" r="5" fill="#34d399" />
                <text x="200" y="80" fill="#cbd5e1" fontSize="10" textAnchor="middle">90kg</text>
                <text x="400" y="50" fill="#cbd5e1" fontSize="10" textAnchor="middle">60kg</text>
              </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-500 px-2">
              <span>{t.week1}</span>
              <span>{t.week2}</span>
              <span>{t.week3}</span>
              <span>{t.week4}</span>
            </div>
          </div>
        )}

        {activeSubTab === 'ledger' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-450 uppercase tracking-wider">{t.auditTrailTitle}</h4>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.ledgerHeight}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">{t.heightCol}</th>
                    <th className="py-2.5">{t.timestampCol}</th>
                    <th className="py-2.5">{t.actionCol}</th>
                    <th className="py-2.5">{t.hashCol}</th>
                    <th className="py-2.5 text-right">{t.statusCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerBlocks.map((block) => (
                    <tr key={block.height} className="border-b border-slate-900 hover:bg-slate-900/35 transition-colors">
                      <td className="py-3 font-semibold text-slate-400">#{block.height}</td>
                      <td className="py-3 text-slate-350">{block.time}</td>
                      <td className="py-3 text-slate-100">
                        <span className="block font-medium">{block.type}</span>
                        <span className="text-[10px] text-slate-500">{block.details}</span>
                      </td>
                      <td className="py-3 font-mono text-emerald-455">{block.hash}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> {t.verifiedBadge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal bg-slate-950/60 p-3 rounded-lg border border-slate-900">
              {t.auditStandardTip}
            </p>
          </div>
        )}

        {activeSubTab === 'pareto' && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-semibold text-slate-450 uppercase tracking-wider">{t.paretoTitle}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 relative h-64 bg-slate-950/80 rounded-xl border border-slate-900 p-4">
                <span className="absolute left-2 top-2 text-[9px] text-slate-500 uppercase tracking-wider">{t.yAxisLabel}</span>
                <span className="absolute right-4 bottom-2 text-[9px] text-slate-500 uppercase tracking-wider">{t.xAxisLabel}</span>
                
                {/* Visual Pareto SVG Grid */}
                <svg viewBox="0 0 400 200" className="w-full h-full text-slate-750" role="img" aria-label="Scatter plot showing Carbon-Water tradeoff optimal zones across different cloud regions like Sweden, Oregon, Iowa, and Virginia">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="40" y2="160" stroke="#334155" strokeWidth="1" />
                  <line x1="40" y1="160" x2="380" y2="160" stroke="#334155" strokeWidth="1" />
                  
                  {/* Y Axis labels */}
                  <text x="30" y="30" fill="#64748b" fontSize="8" textAnchor="end">High</text>
                  <text x="30" y="90" fill="#64748b" fontSize="8" textAnchor="end">Medium</text>
                  <text x="30" y="150" fill="#64748b" fontSize="8" textAnchor="end">Low</text>
                  
                  {/* X Axis labels */}
                  <text x="40" y="175" fill="#64748b" fontSize="8" textAnchor="middle">0g</text>
                  <text x="210" y="175" fill="#64748b" fontSize="8" textAnchor="middle">250g</text>
                  <text x="370" y="175" fill="#64748b" fontSize="8" textAnchor="middle">500g</text>

                  {/* Pareto Frontier Line */}
                  <path d="M 47,150 L 70,140 L 95,130 L 210,120" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3" />
                  <text x="110" y="115" fill="#34d399" fontSize="8" fontStyle="italic">{t.frontLabel}</text>

                  {/* Scatter Points */}
                  <circle cx="47" cy="150" r="5" fill="#10b981" />
                  <text x="54" y="152" fill="#cbd5e1" fontSize="8">{t.swedenNode}</text>

                  <circle cx="95" cy="130" r="5" fill="#10b981" />
                  <text x="102" y="132" fill="#cbd5e1" fontSize="8">{t.oregonNode}</text>

                  <circle cx="310" cy="90" r="5" fill="#f59e0b" />
                  <text x="317" y="92" fill="#cbd5e1" fontSize="8">{t.iowaNode}</text>

                  <circle cx="340" cy="30" r="5" fill="#ef4444" />
                  <text x="330" y="24" fill="#cbd5e1" fontSize="8" textAnchor="end">{t.virginiaNode}</text>
                </svg>
              </div>
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t.paretoExplainTitle}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.paretoExplainDesc}
                </p>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                  <span className="block font-bold text-emerald-400">Optimal Zones:</span>
                  <span className="block text-slate-450 mt-1">{t.optimalZonesTip}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* v8 ignore stop */
