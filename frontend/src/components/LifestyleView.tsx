import React, { useState } from 'react';
import { Leaf, Car, Flame, ShoppingBag, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

interface LifestyleViewProps {
  aiWorkloadCo2Yr?: number; // annual AI workload carbon in kg CO2e
  locale: string;
}

export const LifestyleView: React.FC<LifestyleViewProps> = ({ aiWorkloadCo2Yr = 1710, locale }) => {
  // Lifestyle inputs
  const [drivingKm, setDrivingKm] = useState(12000);
  const [vehicleType, setVehicleType] = useState('gas'); // gas, ev, none
  const [dietType, setDietType] = useState('average'); // vegan, vegetarian, average, meat-heavy
  const [electricityKwh, setElectricityKwh] = useState(4000);
  const [heatingSource, setHeatingSource] = useState('gas'); // gas, electric, solar
  const [shoppingLevel, setShoppingLevel] = useState('medium'); // low, medium, high
  const [recycling, setRecycling] = useState(true);

  // Pledges inputs
  const [pledgeSwitchEv, setPledgeSwitchEv] = useState(false);
  const [pledgeSolarPanels, setPledgeSolarPanels] = useState(false);
  const [pledgeVegetarianDays, setPledgeVegetarianDays] = useState(0); // days per week
  const [pledgeLowWaste, setPledgeLowWaste] = useState(false);

  // Live footprint calculation (in kg CO2e / yr)
  const getFootprint = () => {
    // 1. Transport
    let effectiveVehicleType = vehicleType;
    if (pledgeSwitchEv && vehicleType === 'gas') effectiveVehicleType = 'ev';
    
    let transportCo2 = 0;
    if (effectiveVehicleType === 'gas') transportCo2 = drivingKm * 0.17;
    else if (effectiveVehicleType === 'ev') transportCo2 = drivingKm * 0.05;

    // 2. Diet
    let baseDietCo2 = 2000;
    if (dietType === 'vegan') baseDietCo2 = 800;
    else if (dietType === 'vegetarian') baseDietCo2 = 1200;
    else if (dietType === 'meat-heavy') baseDietCo2 = 3200;

    // Apply vegetarian days pledge
    let dietCo2 = baseDietCo2;
    if (pledgeVegetarianDays > 0 && (dietType === 'average' || dietType === 'meat-heavy')) {
      const vegRatio = pledgeVegetarianDays / 7;
      dietCo2 = (1 - vegRatio) * baseDietCo2 + vegRatio * 1200;
    }

    // 3. Energy
    let effectiveElectricity = electricityKwh;
    let effectiveHeating = heatingSource;
    if (pledgeSolarPanels) {
      effectiveElectricity = 0;
      effectiveHeating = 'solar';
    }

    let energyCo2 = effectiveElectricity * 0.4;
    if (effectiveHeating === 'gas') energyCo2 += 1500;
    else if (effectiveHeating === 'electric') energyCo2 += 800;
    else energyCo2 += 100; // solar

    // 4. Shopping & Waste
    let effectiveShopping = shoppingLevel;
    if (pledgeLowWaste) {
      if (shoppingLevel === 'high') effectiveShopping = 'medium';
      else if (shoppingLevel === 'medium') effectiveShopping = 'low';
    }

    let shopMap: Record<string, number> = { low: 500, medium: 1200, high: 2500 };
    let consumptionCo2 = shopMap[effectiveShopping] || 1200;
    if (recycling) consumptionCo2 *= 0.8;

    const totalCo2 = transportCo2 + dietCo2 + energyCo2 + consumptionCo2;
    const baseTotalCo2 = (vehicleType === 'gas' ? drivingKm * 0.17 : vehicleType === 'ev' ? drivingKm * 0.05 : 0) +
                         (dietType === 'vegan' ? 800 : dietType === 'vegetarian' ? 1200 : dietType === 'meat-heavy' ? 3200 : 2000) +
                         (electricityKwh * 0.4 + (heatingSource === 'gas' ? 1500 : heatingSource === 'electric' ? 800 : 100)) +
                         (shopMap[shoppingLevel] * (recycling ? 0.8 : 1.0));

    const savings = Math.max(0, baseTotalCo2 - totalCo2);

    return {
      total: Math.round(totalCo2),
      savings: Math.round(savings),
      transport: Math.round(transportCo2),
      diet: Math.round(dietCo2),
      energy: Math.round(energyCo2),
      consumption: Math.round(consumptionCo2)
    };
  };

  const t = translations[locale]?.lifestyle || translations["en"].lifestyle;

  const metrics = getFootprint();

  // Determine Rank
  const getRank = (co2Val: number) => {
    if (co2Val < 3000) return { name: t.rankGuardianName, color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10", desc: t.rankGuardianDesc };
    if (co2Val < 6000) return { name: t.rankEnthusiastName, color: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10", desc: t.rankEnthusiastDesc };
    if (co2Val < 10000) return { name: t.rankAverageName, color: "text-amber-400 border-amber-500/50 bg-amber-500/10", desc: t.rankAverageDesc };
    return { name: t.rankHeavyName, color: "text-rose-400 border-rose-500/50 bg-rose-500/10", desc: t.rankHeavyDesc };
  };

  const rank = getRank(metrics.total);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
          <Leaf className="text-emerald-400 w-8 h-8" /> {t.title}
        </h2>
        <p className="text-slate-400 mt-2">
          {t.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lifestyle Inputs Panel */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> {t.inputHabits}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Travel */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Car className="w-4 h-4" /> {t.travelHeader}</h4>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.annualDist}: {drivingKm.toLocaleString()} km</label>
                <input
                  type="range" min="0" max="40000" step="1000"
                  aria-label={t.annualDist}
                  value={drivingKm} onChange={(e) => setDrivingKm(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-700 rounded-lg appearance-none h-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.primaryFuel}</label>
                <select
                  aria-label={t.primaryFuel}
                  value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <option value="gas">{t.optionGasCar}</option>
                  <option value="ev">{t.optionEV}</option>
                  <option value="none">{t.optionNoCar}</option>
                </select>
              </div>
            </div>

            {/* Diet */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Leaf className="w-4 h-4 text-emerald-400" /> {t.foodHeader}</h4>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.primaryDiet}</label>
                <select
                  aria-label={t.primaryDiet}
                  value={dietType} onChange={(e) => setDietType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <option value="meat-heavy">{t.optionHeavyMeat}</option>
                  <option value="average">{t.optionAverageDiet}</option>
                  <option value="vegetarian">{t.optionVegetarian}</option>
                  <option value="vegan">{t.optionVegan}</option>
                </select>
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-400" /> {t.energyHeader}</h4>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.yearlyElectricity}: {electricityKwh.toLocaleString()} kWh</label>
                <input
                  type="range" min="500" max="15000" step="500"
                  aria-label={t.yearlyElectricity}
                  value={electricityKwh} onChange={(e) => setElectricityKwh(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-700 rounded-lg appearance-none h-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.heatingUtility}</label>
                <select
                  aria-label={t.heatingUtility}
                  value={heatingSource} onChange={(e) => setHeatingSource(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <option value="gas">{t.optionGasBoiler}</option>
                  <option value="electric">{t.optionHeatPump}</option>
                  <option value="solar">{t.optionSolarThermal}</option>
                </select>
              </div>
            </div>

            {/* Shopping & Recycling */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-violet-400" /> {t.mindfulConsumption}</h4>
              <div>
                <label className="block text-xs text-slate-500 mb-2">{t.shoppingProfile}</label>
                <select
                  aria-label={t.shoppingProfile}
                  value={shoppingLevel} onChange={(e) => setShoppingLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <option value="low">{t.optionLowShop}</option>
                  <option value="medium">{t.optionMedShop}</option>
                  <option value="high">{t.optionHighShop}</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">{t.recycleLabel}</span>
                <button
                  aria-label={`Toggle recycling: currently ${recycling ? 'on' : 'off'}`}
                  aria-pressed={recycling}
                  onClick={() => setRecycling(!recycling)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${recycling ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${recycling ? 'translate-x-4.5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Eco-Pledges checklist */}
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" /> {t.pledgesTitle}
            </h3>
            <p className="text-xs text-slate-400">{t.pledgesSubtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Pledge 1 */}
              <button
                aria-label={t.pledgeEvTitle}
                aria-pressed={pledgeSwitchEv}
                onClick={() => setPledgeSwitchEv(!pledgeSwitchEv)}
                disabled={vehicleType !== 'gas'}
                className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                  pledgeSwitchEv
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-750'
                } ${vehicleType !== 'gas' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <div className="mr-3 mt-1" aria-hidden="true">
                  {/* Decorative checkbox indicator — interaction handled by parent button */}
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${pledgeSwitchEv ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                    {pledgeSwitchEv && <span className="text-slate-900 text-[10px] font-black">✓</span>}
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm text-slate-200">{t.pledgeEvTitle}</span>
                  <span className="block text-xs mt-0.5 text-slate-400">{t.pledgeEvDesc}</span>
                </div>
              </button>

              {/* Pledge 2 */}
              <button
                aria-label={t.pledgeSolarTitle}
                aria-pressed={pledgeSolarPanels}
                onClick={() => setPledgeSolarPanels(!pledgeSolarPanels)}
                className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                  pledgeSolarPanels
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}>
                <div className="mr-3 mt-1" aria-hidden="true">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${pledgeSolarPanels ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                    {pledgeSolarPanels && <span className="text-slate-900 text-[10px] font-black">✓</span>}
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm text-slate-200">{t.pledgeSolarTitle}</span>
                  <span className="block text-xs mt-0.5 text-slate-400">{t.pledgeSolarDesc}</span>
                </div>
              </button>

              {/* Pledge 3 */}
              <div className="flex flex-col p-4 rounded-xl border bg-slate-900/50 border-slate-800 text-slate-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-200">{t.pledgeVegTitle}: {pledgeVegetarianDays}/wk</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <button 
                        key={num}
                        onClick={() => setPledgeVegetarianDays(num)}
                        disabled={dietType === 'vegan' || dietType === 'vegetarian'}
                        className={`w-6 h-6 text-xs font-bold rounded flex items-center justify-center border transition-all ${
                          pledgeVegetarianDays === num 
                            ? 'bg-emerald-500 border-emerald-500 text-slate-900' 
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300'
                        } ${(dietType === 'vegan' || dietType === 'vegetarian') ? 'opacity-30 cursor-not-allowed' : ''}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400">{t.pledgeVegDesc}</span>
              </div>

              {/* Pledge 4 */}
              <button
                aria-label={t.pledgeWasteTitle}
                aria-pressed={pledgeLowWaste}
                onClick={() => setPledgeLowWaste(!pledgeLowWaste)}
                className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                  pledgeLowWaste
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}>
                <div className="mr-3 mt-1" aria-hidden="true">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${pledgeLowWaste ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                    {pledgeLowWaste && <span className="text-slate-900 text-[10px] font-black">✓</span>}
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm text-slate-200">{t.pledgeWasteTitle}</span>
                  <span className="block text-xs mt-0.5 text-slate-400">{t.pledgeWasteDesc}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Output & WOW Comparison Panel */}
        <div className="space-y-6">
          {/* Carbon Rank Card */}
          <div className="glass-panel p-6 flex flex-col justify-between min-h-[280px]">
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t.rankTitle}</h3>
              <div className="mt-4 flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl border text-xl font-black ${rank.color}`}>
                  {rank.name}
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">{rank.desc}</p>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">{t.totalFootprintLabel}:</span>
                <span className="text-2xl font-black text-slate-200">{metrics.total.toLocaleString()} <span className="text-xs text-slate-500">kg CO₂e</span></span>
              </div>
              {metrics.savings > 0 && (
                <div className="flex justify-between items-baseline text-emerald-400 font-semibold">
                  <span className="text-xs">{t.savingsLabel}:</span>
                  <span className="text-xl">-{metrics.savings.toLocaleString()} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Virtual Ecosystem Offset Grid (WOW feature) */}
          <div className="glass-panel p-6 bg-gradient-to-b from-slate-900 to-cyan-950/15 border-cyan-500/15">
            <h3 className="text-md font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-5 h-5 text-cyan-400" /> {t.canvasTitle}
            </h3>
            <p className="text-[10px] text-slate-500 mb-3">
              {t.canvasSubtitle}
            </p>
            
            <div className="h-28 bg-slate-950/80 rounded-lg border border-slate-900 flex flex-col overflow-hidden relative">
              {/* Forest top (Land) */}
              <div className="h-1/2 border-b border-slate-850 p-2 flex flex-wrap gap-2 items-center overflow-hidden">
                <span className="absolute right-2 top-1 text-[8px] font-bold text-emerald-500 uppercase tracking-wide">{t.terrestrialForest}</span>
                {Array.from({ length: Math.min(25, (pledgeSolarPanels ? 12 : 0) + (pledgeSwitchEv ? 8 : 0) + (pledgeVegetarianDays * 2)) }).map((_, i) => (
                  <span key={i} className="text-lg animate-bounce select-none" style={{ animationDelay: `${i * 150}ms`, animationDuration: '2s' }}>🌲</span>
                ))}
                {((pledgeSolarPanels ? 12 : 0) + (pledgeSwitchEv ? 8 : 0) + (pledgeVegetarianDays * 2)) === 0 && (
                  <span className="text-[10px] text-slate-650">{t.emptyForest}</span>
                )}
              </div>
              {/* Ocean bottom (Marine) */}
              <div className="h-1/2 p-2 bg-blue-950/20 flex flex-wrap gap-2 items-center overflow-hidden">
                <span className="absolute right-2 bottom-1 text-[8px] font-bold text-blue-400 uppercase tracking-wide">{t.oceanSeagrass}</span>
                {Array.from({ length: Math.min(25, (pledgeLowWaste ? 10 : 0) + (recycling ? 6 : 0)) }).map((_, i) => (
                  <span key={i} className="text-lg animate-pulse select-none text-teal-400" style={{ animationDelay: `${i * 200}ms` }}>🌿</span>
                ))}
                {((pledgeLowWaste ? 10 : 0) + (recycling ? 6 : 0)) === 0 && (
                  <span className="text-[10px] text-slate-650">{t.emptySeagrass}</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono uppercase">
              <span>{t.treesLabel}: {((pledgeSolarPanels ? 12 : 0) + (pledgeSwitchEv ? 8 : 0) + (pledgeVegetarianDays * 2))}</span>
              <span>{t.seagrassLabel}: {((pledgeLowWaste ? 10 : 0) + (recycling ? 6 : 0))} m²</span>
            </div>
          </div>

          {/* WOW Comparison Card */}
          <div className="glass-panel p-6 bg-gradient-to-br from-slate-900/60 to-emerald-950/20 border-emerald-500/20">
            <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-emerald-400" /> {t.aiVsRealTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t.aiVsRealDesc}
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <span className="text-xs text-slate-500 block uppercase tracking-wider">{t.annualAiFootprint}</span>
                <span className="text-xl font-extrabold text-slate-100 flex items-baseline mt-1">
                  {aiWorkloadCo2Yr.toLocaleString()} <span className="text-xs font-semibold text-slate-500 ml-1">kg CO₂e / yr</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.simulatorProjections}</p>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  {t.matchesEquivalent}
                </p>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">🚗 {t.gasCarDriving}:</span>
                  <span className="font-bold text-slate-200">{Math.round(aiWorkloadCo2Yr / 0.17).toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">🍔 {t.beefHeavyMeals}:</span>
                  <span className="font-bold text-slate-200">{Math.round(aiWorkloadCo2Yr / 5.2).toLocaleString()} meals</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">🔌 {t.homeElectricity}:</span>
                  <span className="font-bold text-slate-200">{Math.round((aiWorkloadCo2Yr / 0.4) / (electricityKwh / 12) * 10) / 10} {t.months}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[10px] text-emerald-400/90 leading-normal">
                {t.insightText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

