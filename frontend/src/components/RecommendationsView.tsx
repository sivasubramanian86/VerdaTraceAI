import React, { useState } from 'react';
import { Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

interface Recommendation {
  id: number;
  action: string;
  category: string;
  impact: number;
  complexity: string;
}

interface RecommendationsViewProps {
  recommendationsList: Recommendation[];
  explainRecommendation: (action: string) => void;
  locale: string;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendationsList,
  explainRecommendation,
  locale
}) => {
  const [committedPledges, setCommittedPledges] = useState<number[]>([]);

  const t = translations[locale]?.recommendations || translations["en"].recommendations;

  const toggleCommit = (id: number) => {
    if (committedPledges.includes(id)) {
      setCommittedPledges(committedPledges.filter((p) => p !== id));
    } else {
      setCommittedPledges([...committedPledges, id]);
    }
  };

  // Calculate total committed savings
  const totalReduction = recommendationsList
    .filter((r) => committedPledges.includes(r.id))
    .reduce((sum, r) => sum + r.impact, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">{t.title}</h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>

        {/* Total Reductions Tally (WOW widget) */}
        {committedPledges.length > 0 && (
          <div className="glass-panel px-5 py-3 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-emerald-455 uppercase font-semibold">{t.activeCommit}</span>
              <span className="text-lg font-black text-emerald-400">-{totalReduction}% {t.carbonSaved}</span>
            </div>
          </div>
        )}
      </header>

      {/* Marginal Abatement Cost Curve (MACC) Chart Card (WOW feature) */}
      <div className="glass-panel p-6 space-y-4 bg-gradient-to-r from-slate-950 to-slate-900/40">
        <div className="flex justify-between items-center pb-2 border-b border-slate-850">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{t.maccTitle}</h3>
            <p className="text-[10px] text-slate-500">{t.maccDesc}</p>
          </div>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase">{t.costNetPos}</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { name: t.awsShift, cost: -120, carbon: "82%" },
            { name: t.azureShift, cost: -80, carbon: "97%" },
            { name: t.gcpShift, cost: -50, carbon: "85%" },
            { name: t.modelDown, cost: -420, carbon: "70%" },
            { name: t.semCache, cost: -310, carbon: "40%" },
            { name: t.offPeak, cost: 10, carbon: "15%" },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg flex flex-col justify-between space-y-2">
              <span className="text-[10px] font-bold text-slate-355 block truncate">{item.name}</span>
              <div className="h-12 flex items-end justify-center relative">
                {/* Cost bar (going up or down) */}
                <div 
                  className={`w-4 rounded-sm transition-all ${
                    item.cost < 0 ? 'bg-emerald-500' : 'bg-red-400'
                  }`}
                  style={{
                    height: `${Math.min(100, (Math.abs(item.cost) / 450) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono border-t border-slate-850 pt-1.5">
                <span className={item.cost < 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                  {item.cost < 0 ? `-` : `+`}${Math.abs(item.cost)}/t
                </span>
                <span className="text-slate-500">{item.carbon} CO₂</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendationsList.map((rec) => {
          const isCommitted = committedPledges.includes(rec.id);
          return (
            <div key={rec.id} className={`glass-panel p-6 flex flex-col justify-between transition-all duration-350 ${
              isCommitted ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''
            }`}>
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-450 font-semibold">{rec.category}</span>
                  <span className={`text-xs font-semibold ${rec.complexity === 'Low' ? 'text-emerald-400' : rec.complexity === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {rec.complexity === 'Low' ? t.lowComp : rec.complexity === 'Medium' ? t.medComp : t.highComp}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-4 flex items-center gap-2">
                  {isCommitted && <CheckCircle2 className="w-5 h-5 text-emerald-455 shrink-0" />}
                  {rec.action}
                </h3>
              </div>

              {/* Explanations Tooltip */}
              <div className="mt-4 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {rec.category.includes("Region") ? t.tooltipRegion :
                   rec.category.includes("Caching") ? t.tooltipCache :
                   rec.category.includes("Model") ? t.tooltipModel :
                   t.tooltipSched}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <span className="text-3xl font-black text-emerald-400">-{rec.impact}% <span className="text-xs text-slate-500 uppercase font-normal">{t.co2Impact}</span></span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => explainRecommendation(rec.action)}
                    aria-label={`Explain concept: ${rec.action}`}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50 px-3 py-2 rounded text-xs transition-colors font-semibold text-slate-300">
                    {t.explainBtn}
                  </button>
                  <button 
                    onClick={() => toggleCommit(rec.id)}
                    aria-label={isCommitted ? `Cancel commitment for ${rec.action}` : `Commit to ${rec.action}`}
                    className={`px-4 py-2 rounded text-xs transition-all font-bold ${
                      isCommitted 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.25)]' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}>
                    {isCommitted ? t.committedBtn : t.commitBtn}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

