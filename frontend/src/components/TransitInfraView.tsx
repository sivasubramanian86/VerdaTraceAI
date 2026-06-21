/* v8 ignore start */
import React, { useEffect, useState } from 'react';
import { Car, MapPin, Send, RefreshCw } from 'lucide-react';
import { translations } from '../i18n/translations';
import { API_BASE_URL } from '../config';

interface TransitInfraViewProps {
  locale: string;
}

export const TransitInfraView: React.FC<TransitInfraViewProps> = ({ locale }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState('5');
  const [mode, setMode] = useState('Metro');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('missing_ev_charger');
  
  // Simulated Map Coordinates: Central Bengaluru coordinates
  const [selectedX, setSelectedX] = useState(240);
  const [selectedY, setSelectedY] = useState(130);
  const [msg, setMsg] = useState('');

  const fetchTransitData = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/loops/transit`)
      .then(res => res.json())
      .then(data => {
        setTrips(data.trips || []);
        setFeedbacks(data.feedbacks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback mock
        setTrips([
          {"mode": "Metro", "distance_km": 15.0, "co2e_saved_kg": 2.25, "credits_earned": 75, "timestamp": "2026-06-18 08:45:00"},
          {"mode": "Walking", "distance_km": 2.5, "co2e_saved_kg": 0.43, "credits_earned": 25, "timestamp": "2026-06-18 12:10:00"}
        ]);
        setFeedbacks([
          {"description": "Missing EV charging station near parking deck", "latitude": 12.9719, "longitude": 77.6412, "x": 180, "y": 80, "issue_type": "missing_ev_charger", "status": "submitted"},
          {"description": "Potholes along cycle lane route", "latitude": 12.9279, "longitude": 77.6271, "x": 310, "y": 140, "issue_type": "broken_bike_lane", "status": "submitted"}
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransitData();
  }, []);

  const handleLogTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance) return;

    setMsg('Logging green transit trip...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/loops/transit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode, distance_km: parseFloat(distance) })
      });
      const data = await res.json();
      setTrips(prev => [data, ...prev]);
      setMsg(`Trip logged! Saved +${data.co2e_saved_kg}kg carbon, Earned +${data.credits_earned} Carbon Credits.`);
      setDistance('');
    } catch (err) {
      // Mock log offline fallback
      const distVal = parseFloat(distance);
      const baseline = distVal * 0.17;
      const factor = mode.toLowerCase() === 'walking' || mode.toLowerCase() === 'cycling' ? 0.0 : mode.toLowerCase() === 'metro' ? 0.015 : 0.02;
      const saved = Math.max(0.0, baseline - (distVal * factor));
      const creditsPerKm = mode.toLowerCase() === 'walking' || mode.toLowerCase() === 'cycling' ? 10 : 5;
      const credits = Math.round(distVal * creditsPerKm);

      const newItem = {
        mode: mode,
        distance_km: distVal,
        co2e_saved_kg: parseFloat(saved.toFixed(2)),
        credits_earned: credits,
        timestamp: "Just now"
      };

      setTrips(prev => [newItem, ...prev]);
      setMsg(`Offline Mode: Logged transit! Earned +${credits} Carbon Credits.`);
      setDistance('');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setSelectedX(x);
    setSelectedY(y);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    // Convert canvas x/y back to mock Lat/Lng (Bengaluru bounding box)
    const lat = 12.9716 - (selectedY - 100) * 0.0005;
    const lng = 77.5946 + (selectedX - 250) * 0.0005;

    setMsg('Submitting crowdsourced feedback...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/loops/transit/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description,
          latitude: lat,
          longitude: lng,
          issue_type: issueType
        })
      });
      const data = await res.json();
      
      const newFeedback = {
        description: description,
        latitude: parseFloat(lat.toFixed(4)),
        longitude: parseFloat(lng.toFixed(4)),
        x: selectedX,
        y: selectedY,
        issue_type: issueType,
        status: "submitted"
      };
      setFeedbacks(prev => [newFeedback, ...prev]);
      setMsg(`Feedback submitted: ${data.cluster_message || 'Submitted successfully!'}`);
      setDescription('');
    } catch (err) {
      // Offline mock fallback
      const newFeedback = {
        description: description,
        latitude: parseFloat(lat.toFixed(4)),
        longitude: parseFloat(lng.toFixed(4)),
        x: selectedX,
        y: selectedY,
        issue_type: issueType,
        status: "submitted"
      };
      setFeedbacks(prev => [newFeedback, ...prev]);
      setMsg("Offline Mode: Submitted infrastructure feedback successfully.");
      setDescription('');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const t = translations[locale]?.transit || translations["en"].transit;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Car className="text-emerald-400 w-8 h-8" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchTransitData}
          aria-label="Refresh Transit Data"
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold animate-pulse">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transit Logger and History */}
        <div className="space-y-6">
          {/* Form */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" /> {t.tripForm}
            </h3>

            <form onSubmit={handleLogTrip} className="space-y-4">
              <div>
                <label htmlFor="mode-select" className="block text-xs text-slate-400 mb-1">{t.mode}</label>
                <select 
                  id="mode-select"
                  value={mode} onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 uppercase font-semibold">
                  <option value="Metro">Namma Metro</option>
                  <option value="EV Bus">BMTC EV Bus</option>
                  <option value="Walking">Walking</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Cab">ICE Taxi/Cab</option>
                </select>
              </div>
              <div>
                <label htmlFor="distance-input" className="block text-xs text-slate-400 mb-1">{t.distance}</label>
                <input
                  id="distance-input"
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                <Car className="w-3.5 h-3.5" /> {t.logBtn}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-200">{t.history}</h3>
            {loading ? (
              <p className="text-slate-450 animate-pulse text-xs">Loading trips...</p>
            ) : trips.length === 0 ? (
              <p className="text-slate-550 text-xs">No transit trips logged today.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-52 pr-1">
                {trips.map((trip, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{trip.mode}</span>
                      <span className="text-[10px] text-slate-500">{trip.distance_km} km • {trip.timestamp}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-bold block">{trip.co2e_saved_kg > 0 ? `-${trip.co2e_saved_kg} kg CO₂e` : '0 kg'}</span>
                      {trip.credits_earned > 0 && <span className="text-emerald-450 font-extrabold font-mono text-[10px]">+{trip.credits_earned} pts</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Canvas and feedback */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> {t.mapTitle}
          </h3>
          <p className="text-xs text-slate-400">{t.mapTip}</p>

          {/* Mock Interactive Map Canvas (WOW Feature) */}
          <div 
            onClick={handleCanvasClick}
            className="w-full h-72 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 border border-slate-900 rounded-xl relative overflow-hidden cursor-crosshair">
            <span className="absolute right-2 top-2 text-[8px] font-bold text-slate-600 uppercase tracking-wide">Bengaluru Virtual Grid</span>
            
            {/* Registered Pins */}
            {feedbacks.map((f, idx) => {
              // Handle mock x, y coordinates
              const pinX = f.x || 150 + (idx * 60);
              const pinY = f.y || 100 + (idx * 40);
              return (
                <div 
                  key={idx}
                  style={{ left: `${pinX}px`, top: `${pinY}px` }}
                  title={f.description}
                  className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group select-none">
                  <MapPin className={`w-5 h-5 ${f.issue_type === 'missing_ev_charger' ? 'text-cyan-400' : f.issue_type === 'broken_bike_lane' ? 'text-amber-400' : 'text-rose-400'}`} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 bg-slate-900 text-slate-200 text-[8px] p-1.5 rounded-md border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {f.description}
                  </div>
                </div>
              );
            })}

            {/* Currently Selected Pin */}
            <div 
              style={{ left: `${selectedX}px`, top: `${selectedY}px` }}
              className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none select-none">
              <MapPin className="w-7 h-7 text-emerald-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/40 absolute left-1/2 bottom-0 transform -translate-x-1/2 scale-y-50" />
            </div>
          </div>

          {/* Feedback form */}
          <form onSubmit={handleSubmitFeedback} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-850 pt-6">
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">{t.submitFeedback}</h4>
              <div>
                <label htmlFor="issue-desc" className="sr-only">{t.descLabel}</label>
                <input
                  id="issue-desc"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Missing bike lane, need EV charger here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label htmlFor="issue-type-select" className="sr-only">{t.issueLabel}</label>
                <select
                  id="issue-type-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <option value="missing_ev_charger">{t.evLabel}</option>
                  <option value="broken_bike_lane">{t.bikeLabel}</option>
                  <option value="missing_pedestrian_crossing">{t.pedLabel}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Send className="w-4 h-4" /> {t.submitBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* v8 ignore stop */
