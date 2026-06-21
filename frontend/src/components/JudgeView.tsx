import React from 'react';
import { Award, RefreshCw, ShieldCheck, Thermometer, ShoppingBag, Car } from 'lucide-react';
import { translations } from '../i18n/translations';

interface JudgeViewProps {
  scenario: string;
  setScenario: (scen: string) => void;
  triggerJudgeSummary: () => void;
  judgeSummary: string;
  loadingJudgeSummary: boolean;
  locale: string;
}

export const JudgeView: React.FC<JudgeViewProps> = ({
  scenario,
  setScenario,
  triggerJudgeSummary,
  judgeSummary,
  loadingJudgeSummary,
  locale
}) => {
  const t = translations[locale]?.judge || translations["en"].judge;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="text-amber-400" aria-hidden="true" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={triggerJudgeSummary}
          aria-label="Generate Pitch Summary via MCP"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <RefreshCw className="w-5 h-5 animate-spin-slow" aria-hidden="true" /> {t.pitchBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contrast Selection Panel */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-200">{t.sliderTitle}</h3>
          <p className="text-xs text-slate-400">{t.sliderSub}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setScenario('baseline')}
              aria-label="Set Scenario to Baseline"
              className={`flex-1 p-4 rounded-xl border transition-all text-left ${scenario === 'baseline' ? 'bg-red-500/10 border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'}`}>
              <span className="block text-xs uppercase text-slate-500">{t.baselineLabel}</span>
              <span className="block text-sm font-bold mt-2">{t.baselineSpecs}</span>
              <span className="block text-2xl font-black mt-1 text-red-400">850kg CO₂e / mo</span>
            </button>
            <button 
              onClick={() => setScenario('optimized')}
              aria-label="Set Scenario to Optimized"
              className={`flex-1 p-4 rounded-xl border transition-all text-left ${scenario === 'optimized' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'}`}>
              <span className="block text-xs uppercase text-slate-500">{t.optLabel}</span>
              <span className="block text-sm font-bold mt-2">{t.optSpecs}</span>
              <span className="block text-2xl font-black mt-1 text-emerald-400">45kg CO₂e / mo</span>
            </button>
          </div>

          {/* Dials Comparison Board */}
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Metric Contrast Breakdown</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase">{t.gridInt}</span>
                <span className={`text-xl font-extrabold block mt-2 ${scenario === 'baseline' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scenario === 'baseline' ? '450 g/kWh' : '10 g/kWh'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Virginia vs. Sweden</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1"><Thermometer className="w-3 h-3 text-cyan-400" /> {t.waterCooling}</span>
                <span className={`text-xl font-extrabold block mt-2 ${scenario === 'baseline' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {scenario === 'baseline' ? '1,900 Liters' : '11 Liters'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Evaporative vs. Air</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1"><ShoppingBag className="w-3 h-3 text-cyan-400" /> {t.logistics}</span>
                <span className={`text-xl font-extrabold block mt-2 ${scenario === 'baseline' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {scenario === 'baseline' ? '240 kg' : '12 kg'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Import vs. Local Sourced</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1"><Car className="w-3 h-3 text-amber-400" /> {t.credits}</span>
                <span className={`text-xl font-extrabold block mt-2 ${scenario === 'baseline' ? 'text-red-400' : 'text-amber-400'}`}>
                  {scenario === 'baseline' ? '0 credits' : '520 credits'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Carbon offset ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pitch output */}
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px] bg-gradient-to-b from-slate-900/60 to-emerald-950/15 border-emerald-500/20">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">{t.pitchTitle}</h3>
            <p className="text-xs text-slate-400 mt-1">{t.pitchSub}</p>
            <div className="my-6 p-4 bg-slate-950/60 rounded-xl text-xs text-slate-300 italic border border-slate-850 leading-relaxed">
              {loadingJudgeSummary ? "Calling MCP Prompt Registry..." : judgeSummary || "Click 'One-Click Pitch Export' to pull the live pitch summary directly from the MCP prompt endpoints."}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
            Powered by MCP template <code>GenerateJudgeSummary</code>.
          </div>
        </div>
      </div>

      {/* Dynamic Compliance Certificate Widget */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-950 to-emerald-950/10 border-emerald-500/15 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-850">
          <div>
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-450" /> {t.certTitle}
            </h3>
            <p className="text-xs text-slate-400">{t.certSub}</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/35 rounded-full text-xs font-black text-emerald-400 uppercase tracking-widest animate-pulse">
            Active Verified
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-900/40 rounded-xl border border-slate-850 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl select-none shadow-[0_0_20px_rgba(16,185,129,0.1)]" aria-hidden="true">
            🏆
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-slate-200">VerdaTrace Compliance Seal: Class A</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-[10px]">
              <div>
                <span className="text-slate-500 block">Workspace ID:</span>
                <span className="font-semibold text-slate-300">ws_promptwars_3</span>
              </div>
              <div>
                <span className="text-slate-500 block">Emissions Target:</span>
                <span className="font-semibold text-slate-300">&lt; 50kg CO₂e / mo</span>
              </div>
              <div>
                <span className="text-slate-500 block">Water Stress Profile:</span>
                <span className="font-semibold text-emerald-400">{scenario === 'baseline' ? t.statusHigh : t.statusLow}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ledger Verification:</span>
                <span className="font-mono text-emerald-455">{scenario === 'baseline' ? 'vt_c821ea98...' : 'vt_8fa72be1...'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => alert(`Certificate details exported: Verified carbon score of ${scenario === 'baseline' ? '30' : '98'}/100 matching EN 50600 datacenter guidelines.`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700/50 hover:text-slate-100 shadow-sm">
            Export Audit JSON
          </button>
        </div>
      </div>
    </div>
  );
};

