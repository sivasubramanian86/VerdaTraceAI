import React, { useEffect, useState } from 'react';
import { Utensils, Compass, Sparkles, RefreshCw, AlertCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

interface FoodMilesViewProps {
  locale: string;
}

export const FoodMilesView: React.FC<FoodMilesViewProps> = ({ locale }) => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('Apple');
  const [origin, setOrigin] = useState('California');
  const [msg, setMsg] = useState('');

  const fetchFoods = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/loops/food')
      .then(res => res.json())
      .then(data => {
        setFoods(data.foods || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback mock
        setFoods([
          {"product_name": "Organic Avocados", "origin": "Spain", "distance_km": 14500.0, "transport_co2e_kg": 8.7, "local_swap": "Coorg Avocado", "is_local": false},
          {"product_name": "Grade A Honey", "origin": "Kolar, Karnataka", "distance_km": 120.0, "transport_co2e_kg": 0.08, "local_swap": null, "is_local": true}
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleScanFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !origin) return;

    setMsg('Analyzing food origin coordinates and logistics...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/loops/food/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName, origin: origin })
      });
      const data = await res.json();
      setFoods(prev => [data, ...prev]);
      setMsg(`Analysis complete! Scanned ${productName} from ${origin}.`);
    } catch (err) {
      // Offline mock fallback
      const localRegions = ["karnataka", "kolar", "mysore", "ooty", "coorg", "chikkamagaluru", "india"];
      const isLocal = localRegions.some(r => origin.toLowerCase().includes(r));
      const distance = isLocal ? 120.0 : 14500.0;
      const co2 = isLocal ? 0.08 : 8.7;
      const swapsMap: Record<string, string> = {
        apple: "Shimla Apple or Karnataka Guava",
        orange: "Nagpur Orange or local Sweet Lime",
        avocado: "Coorg Avocado",
        cheese: "Karnataka Dairy Cheddar",
        coffee: "Chikkamagaluru Arabica Coffee"
      };
      const swap = swapsMap[productName.toLowerCase()] || `Local Karnataka ${productName} alternative`;

      const newItem = {
        product_name: productName,
        origin: origin,
        distance_km: distance,
        transport_co2e_kg: co2,
        local_swap: isLocal ? null : swap,
        is_local: isLocal
      };
      setFoods(prev => [newItem, ...prev]);
      setMsg(`Offline Mode: Analyzed food miles for ${productName}!`);
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const selectPreset = (prod: string, orig: string) => {
    setProductName(prod);
    setOrigin(orig);
  };

  const t = translations[locale]?.food || translations["en"].food;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Utensils className="text-cyan-400 w-8 h-8" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchFoods}
          aria-label="Refresh Grocery List"
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {msg && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-455 text-xs rounded-xl font-semibold animate-pulse">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Origin Ingestion */}
        <div className="glass-panel p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-855 pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" /> {t.scanTitle}
          </h3>

          <form onSubmit={handleScanFood} className="space-y-4">
            <div>
              <label htmlFor="product-name-input" className="block text-xs text-slate-400 mb-1">{t.prodLabel}</label>
              <select
                id="product-name-input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                <option value="Apple">Apple</option>
                <option value="Orange">Orange</option>
                <option value="Avocado">Avocado</option>
                <option value="Cheese">Cheese</option>
                <option value="Coffee">Coffee</option>
              </select>
            </div>
            <div>
              <label htmlFor="origin-input" className="block text-xs text-slate-400 mb-1">{t.originLabel}</label>
              <input
                id="origin-input"
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Spain, California, Coorg"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Compass className="w-4 h-4" /> {t.scanBtn}
            </button>
          </form>

          {/* Presets */}
          <div className="border-t border-slate-855 pt-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Quick Presets</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => selectPreset("Avocado", "Spain")} className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-350 py-1.5 px-2 rounded-lg border border-slate-855">Avocado (Spain)</button>
              <button onClick={() => selectPreset("Avocado", "Coorg, Karnataka")} className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-350 py-1.5 px-2 rounded-lg border border-slate-855">Avocado (Coorg)</button>
              <button onClick={() => selectPreset("Coffee", "Ethiopia")} className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-350 py-1.5 px-2 rounded-lg border border-slate-855">Coffee (Ethiopia)</button>
              <button onClick={() => selectPreset("Coffee", "Chikkamagaluru, Karnataka")} className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-355 py-1.5 px-2 rounded-lg border border-slate-855">Coffee (Chikka.)</button>
            </div>
          </div>
        </div>

        {/* Scanned Ledger */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-855 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> {t.historyTitle}
          </h3>

          {loading ? (
            <p className="text-slate-455 animate-pulse">Loading scanned items...</p>
          ) : foods.length === 0 ? (
            <p className="text-slate-555 text-xs">No food mile audits logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foods.map((food, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    food.is_local 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100' 
                      : 'bg-slate-900 border-slate-855 text-slate-200'
                  }`}>
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-bold text-sm text-slate-200">{food.product_name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{food.origin}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-slate-855/60 pb-3">
                      <div>
                        <span className="text-slate-500 block">{t.distance}</span>
                        <span className="font-semibold text-slate-300">{food.distance_km.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t.impact}</span>
                        <span className={`font-bold ${food.is_local ? 'text-emerald-450' : 'text-rose-400'}`}>
                          {food.transport_co2e_kg} {t.co2Kg}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {food.is_local ? (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.localPerfect}
                      </span>
                    ) : (
                      <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg flex items-start gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-amber-500 uppercase font-black tracking-wider block">{t.swapSuggested}</span>
                          <span className="text-[10px] text-slate-200 font-semibold block mt-0.5">{food.local_swap}</span>
                          <span className="text-[8px] text-slate-500 block mt-0.5">Saves ~8.5kg CO₂e shipping footprint.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-900 text-[10px] text-slate-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Food Miles Footprint</strong>: Groceries sourced from other continents travel average cargo distances of over 10,000 km, leading to massive logistics footprints. Swapping to Karnataka-grown equivalents preserves nutrient density and slashes transport emissions by up to 98%.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
