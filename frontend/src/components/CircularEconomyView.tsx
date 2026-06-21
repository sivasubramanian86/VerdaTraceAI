import React, { useEffect, useState } from 'react';
import { Share2, Users, PlusCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { translations } from '../i18n/translations';

interface CircularEconomyViewProps {
  locale: string;
}

export const CircularEconomyView: React.FC<CircularEconomyViewProps> = ({ locale }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState('Drill');
  const [owner, setOwner] = useState('');
  const [action] = useState('lend');
  const [msg, setMsg] = useState('');

  const fetchCircularItems = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/loops/circular')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback mock
        setItems([
          {"id": "item_1", "name": "Power Drill", "owner": "Ravi K.", "status": "available", "embedded_co2e_saved_kg": 15.0},
          {"id": "item_2", "name": "Bicycle", "owner": "Sneha M.", "status": "borrowed", "embedded_co2e_saved_kg": 120.0},
          {"id": "item_3", "name": "Step Ladder", "owner": "John D.", "status": "available", "embedded_co2e_saved_kg": 25.0}
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCircularItems();
  }, []);

  const handleShareItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !owner) return;

    setMsg('Registering circular sharing transaction...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/loops/circular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: itemName, owner: owner, action: action })
      });
      const data = await res.json();
      
      setMsg(`Lent shared item registered successfully! Saved +${data.embedded_co2e_saved_kg}kg manufacturing carbon.`);
      setOwner('');
      fetchCircularItems();
    } catch (err) {
      // Offline fallback mock
      const footprintMap: Record<string, number> = {
        drill: 15.0,
        lawnmower: 80.0,
        bicycle: 120.0,
        ladder: 25.0,
        vacuum: 35.0
      };
      const co2 = footprintMap[itemName.toLowerCase()] || 10.0;
      
      const newItem = {
        id: `item_${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        owner: owner,
        status: "available",
        embedded_co2e_saved_kg: co2
      };
      setItems(prev => [...prev, newItem]);
      setMsg(`Offline Mode: Registered shared ${itemName}! Saved +${co2}kg manufacturing carbon.`);
      setOwner('');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const handleBorrowItem = async (itemId: string, name: string) => {
    setMsg(`Borrowing ${name} from neighborhood pool...`);
    try {
      await fetch('http://localhost:8000/api/v1/loops/circular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: name, action: "borrow" })
      });
      fetchCircularItems();
      setMsg(`Borrowed ${name}! Avoided purchasing new item. Saved emissions.`);
    } catch (err) {
      // Offline mock
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'borrowed' } : item));
      setMsg(`Offline Mode: Borrowed ${name}! Saved manufacturing emissions.`);
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const t = translations[locale]?.circular || translations["en"].circular;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="text-cyan-400 w-8 h-8" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchCircularItems}
          aria-label="Refresh Item Pool"
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
        {/* Share Item Form */}
        <div className="glass-panel p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" /> {t.formTitle}
          </h3>

          <form onSubmit={handleShareItem} className="space-y-4">
            <div>
              <label htmlFor="item-select" className="block text-xs text-slate-400 mb-1">{t.itemName}</label>
              <select
                id="item-select"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 uppercase font-semibold">
                <option value="Drill">Power Drill</option>
                <option value="Lawnmower">Lawnmower</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Ladder">Step Ladder</option>
                <option value="Vacuum">Vacuum Cleaner</option>
              </select>
            </div>

            <div>
              <label htmlFor="owner-input" className="block text-xs text-slate-400 mb-1">{t.owner}</label>
              <input
                id="owner-input"
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Share2 className="w-4 h-4" /> {t.submit}
            </button>
          </form>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-405" /> {t.listingsTitle}
          </h3>

          {loading ? (
            <p className="text-slate-455 animate-pulse">Loading shared tools listings...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-555 text-xs">No shared equipment listed in your loop.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    item.status === 'borrowed'
                      ? 'bg-slate-950/40 border-slate-900 opacity-60 text-slate-500'
                      : 'bg-slate-900 border-slate-850 text-slate-200 hover:border-slate-750'
                  }`}>
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-extrabold text-sm text-slate-200">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        item.status === 'available' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}>
                        {item.status === 'available' ? t.available : t.borrowed}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Owner: {item.owner}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase">{t.offsetTitle}</span>
                      <span className="text-xs font-bold text-cyan-400">{item.embedded_co2e_saved_kg} {t.co2Kg}</span>
                    </div>
                    {item.status === 'available' ? (
                      <button
                        onClick={() => handleBorrowItem(item.id, item.name)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors">
                        {t.borrowAction}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 uppercase">{t.borrowed}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-900 text-[10px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Avoiding Embedded Footprints</strong>: Purchasing new metal/plastic goods carries a high factory footprint. Sharing a lawnmower or drill machine with 5 neighbors cuts the lifecycle embedded manufacturing footprint by up to 80% per household.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
