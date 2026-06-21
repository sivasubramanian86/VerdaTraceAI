import React, { useEffect, useState } from 'react';
import { ShoppingBag, Landmark, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { translations } from '../i18n/translations';

interface LocalCommerceViewProps {
  locale: string;
}

export const LocalCommerceView: React.FC<LocalCommerceViewProps> = ({ locale }) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const [amountSpent, setAmountSpent] = useState('');
  const [msg, setMsg] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/loops/commerce')
      .then(res => res.json())
      .then(data => {
        setTxs(data.transactions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback mock
        setTxs([
          {"id": "tx_1", "store_name": "Indiranagar Organic Market", "location": "Bengaluru, Karnataka", "is_local": 1, "amount_spent": 1200.0, "logistics_savings_kg": 1.35, "credits_earned": 650, "timestamp": "2026-06-18 10:30:00"},
          {"id": "tx_2", "store_name": "Super Import Depot", "location": "Noida, Delhi NCR", "is_local": 0, "amount_spent": 3500.0, "logistics_savings_kg": 0.0, "credits_earned": 350, "timestamp": "2026-06-17 14:15:00"},
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleLogPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !amountSpent) return;

    setMsg('Logging local transaction...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/loops/commerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          location: location,
          amount_spent: parseFloat(amountSpent)
        })
      });
      const data = await res.json();
      setTxs(prev => [data, ...prev]);
      setMsg(`Logged successfully! Earned +${data.credits_earned} Carbon Credits.`);
      setStoreName('');
      setAmountSpent('');
    } catch (err) {
      // Mock log offline fallback
      const localKeywords = ["bengaluru", "bangalore", "karnataka", "mysore", "kolar", "indiranagar", "koramangala"];
      const isLocal = localKeywords.some(kw => location.toLowerCase().includes(kw));
      const logisticsSaved = isLocal ? 1.35 : 0.0;
      const credits = Math.round(parseFloat(amountSpent) * (isLocal ? 0.5 : 0.1)) + (isLocal ? 50 : 0);

      const newItem = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        store_name: storeName,
        location: location,
        is_local: isLocal ? 1 : 0,
        amount_spent: parseFloat(amountSpent),
        logistics_savings_kg: logisticsSaved,
        credits_earned: credits,
        timestamp: "Just now"
      };

      setTxs(prev => [newItem, ...prev]);
      setMsg(`Offline Mode: Logged purchase! Earned +${credits} Carbon Credits.`);
      setStoreName('');
      setAmountSpent('');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const t = translations[locale]?.commerce || translations["en"].commerce;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="text-emerald-400 w-8 h-8" /> {t.title}
          </h2>
          <p className="text-slate-400 mt-2">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchTransactions}
          aria-label="Refresh Transactions"
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
        {/* Input Form */}
        <div className="glass-panel p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-855 pb-3 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" /> {t.formTitle}
          </h3>

          <form onSubmit={handleLogPurchase} className="space-y-4">
            <div>
              <label htmlFor="store-name-input" className="block text-xs text-slate-400 mb-1">{t.storeName}</label>
              <input
                id="store-name-input"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. BigBasket Grocer, Namma Yatri"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="location-input" className="block text-xs text-slate-400 mb-1">{t.location}</label>
              <input
                id="location-input"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Indiranagar, Bengaluru"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="amount-input" className="block text-xs text-slate-400 mb-1">{t.amount}</label>
              <input
                id="amount-input"
                type="number"
                required
                min="1"
                value={amountSpent}
                onChange={(e) => setAmountSpent(e.target.value)}
                placeholder="e.g. 850"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-4 h-4" /> {t.submit}
            </button>
          </form>
        </div>

        {/* Transactions Table Ledger */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-855 pb-3 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-cyan-400" /> {t.ledgerTitle}
          </h3>

          {loading ? (
            <p className="text-slate-455 animate-pulse">Loading transaction records...</p>
          ) : txs.length === 0 ? (
            <p className="text-slate-555 text-xs">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-855 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Merchant</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-right">{t.savings}</th>
                    <th className="py-2.5 text-right">{t.credits}</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx, idx) => (
                    <tr key={tx.id || idx} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-semibold text-slate-200">{tx.store_name}</td>
                      <td className="py-3 text-slate-400">{tx.location}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase border ${
                          tx.is_local 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                            : 'bg-slate-800 text-slate-400 border-slate-850'
                        }`}>
                          {tx.is_local ? t.local : t.imported}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-200 font-semibold">₹{tx.amount_spent.toLocaleString()}</td>
                      <td className="py-3 text-right text-cyan-400 font-bold">{tx.logistics_savings_kg > 0 ? `-${tx.logistics_savings_kg} kg` : '0 kg'}</td>
                      <td className="py-3 text-right text-emerald-450 font-black font-mono">+{tx.credits_earned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-900 text-[10px] text-slate-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>B2B2C Carbon Ledgers</strong>: Shopping local from regional farms or choosing low-carbon urban cabs (like Namma Yatri EVs) decreases Scope 3 logistics footprints by up to 90% by bypassing diesel freight hubs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
