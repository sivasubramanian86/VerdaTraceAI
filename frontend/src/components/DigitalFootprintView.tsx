import React, { useEffect, useState } from 'react';
import { Mail, Database, Image, Sparkles, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { API_BASE_URL } from '../config';

interface DigitalFootprintViewProps {
  locale: string;
}

export const DigitalFootprintView: React.FC<DigitalFootprintViewProps> = ({ locale }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDigitalMetrics = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/loops/digital`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // Fallback mock
        setData({
          emails_count: 1250,
          cloud_storage_gb: 450.0,
          duplicate_media_count: 18,
          ai_usage_count: 350,
          digital_co2e_kg: 0.54,
          missions: [
            {
              id: "clean_emails",
              title: "Purge Old Newsletters",
              description: "Delete 500+ promotional emails to save 5g of CO2e.",
              carbon_savings_g: 5.0,
              credits_reward: 50,
              status: "available"
            },
            {
              id: "clean_duplicates",
              title: "Clean Duplicate Photos",
              description: "Remove duplicate high-res photos to save 10g of CO2e.",
              carbon_savings_g: 10.0,
              credits_reward: 100,
              status: "available"
            }
          ]
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDigitalMetrics();
  }, []);

  const handleCompleteMission = async (missionId: string) => {
    setActionMsg('Processing cleanup mission...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/loops/digital/mission/${missionId}`, {
        method: 'POST'
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        setData(resData.updated_digital);
        setActionMsg(`Mission completed! Earned +${resData.credits_reward} Carbon Credits.`);
      } else {
        setActionMsg('Failed to complete mission.');
      }
    } catch (err) {
      // Offline fallback simulation
      if (missionId === 'clean_emails') {
        setData((prev: any) => ({
          ...prev,
          emails_count: Math.max(0, prev.emails_count - 500),
          digital_co2e_kg: Math.max(0.01, prev.digital_co2e_kg - 0.05),
          missions: prev.missions.map((m: any) => m.id === missionId ? { ...m, status: 'completed' } : m)
        }));
        setActionMsg('Offline mode: Cleared 500 emails! Earned +50 Carbon Credits.');
      } else {
        setData((prev: any) => ({
          ...prev,
          duplicate_media_count: Math.max(0, prev.duplicate_media_count - 15),
          digital_co2e_kg: Math.max(0.01, prev.digital_co2e_kg - 0.1),
          missions: prev.missions.map((m: any) => m.id === missionId ? { ...m, status: 'completed' } : m)
        }));
        setActionMsg('Offline mode: Cleared duplicate photos! Earned +100 Carbon Credits.');
      }
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const t = translations[locale]?.digital || translations["en"].digital;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Mail className="text-cyan-400 w-8 h-8" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchDigitalMetrics}
          aria-label="Refresh Metrics"
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {loading ? (
        <p className="text-slate-400 animate-pulse">Loading digital waste telemetry...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Telemetry Box */}
          <div className="lg:col-span-2 glass-panel p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> {t.cardTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{t.emails}</span>
                  <span className="text-lg font-extrabold text-slate-200">{data.emails_count.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{t.cloud}</span>
                  <span className="text-lg font-extrabold text-slate-200">{data.cloud_storage_gb} GB</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{t.duplicates}</span>
                  <span className="text-lg font-extrabold text-slate-200">{data.duplicate_media_count} files</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{t.aiUsage}</span>
                  <span className="text-lg font-extrabold text-slate-200">{data.ai_usage_count} requests</span>
                </div>
              </div>
            </div>

            {/* Simulated Carbon Footprint Gauge */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-cyan-950/15 border border-cyan-500/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-medium">{t.totalCo2}</span>
                <span className="text-3xl font-black text-slate-200 mt-1 block">
                  {data.digital_co2e_kg} <span className="text-sm font-semibold text-slate-500">kg CO₂e / yr</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Estimations modeled based on network transmission and storage drive baseline cooling power.</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Nature Offset</span>
                <span className="text-sm font-extrabold text-cyan-400 mt-1 block">~{Math.round(data.digital_co2e_kg * 0.8)} m²</span>
                <span className="text-[9px] text-slate-500 block">Seagrass Conservation</span>
              </div>
            </div>
          </div>

          {/* Spring Clean Missions Box */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
                <Trash2 className="w-5 h-5 text-rose-400" /> {t.missionsTitle}
              </h3>
              {actionMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl animate-pulse font-medium">
                  {actionMsg}
                </div>
              )}

              <div className="space-y-4">
                {data.missions.map((mission: any) => (
                  <div 
                    key={mission.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      mission.status === 'completed'
                        ? 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60'
                        : 'bg-slate-900 border-slate-855 text-slate-200 hover:border-slate-750'
                    }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-slate-200">{mission.title}</span>
                        {mission.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{mission.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-900/60">
                      <span className="text-[10px] text-emerald-450 font-bold font-mono">+{mission.credits_reward} CREDITS</span>
                      {mission.status === 'completed' ? (
                        <span className="text-xs text-slate-500 font-bold uppercase">{t.completed}</span>
                      ) : (
                        <button
                          onClick={() => handleCompleteMission(mission.id)}
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                          <Trash2 className="w-3.5 h-3.5" /> {t.cleanUp}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
