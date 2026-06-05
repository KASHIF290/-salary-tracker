import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const load = (key, def) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; }
  catch { return def; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const today = () => new Date().toISOString().slice(0, 10);

const CATS = [
  { id: "food",         label: "Food",          emoji: "🍔", color: "#f59e0b" },
  { id: "rent",         label: "Rent",          emoji: "🏠", color: "#6366f1" },
  { id: "transport",    label: "Transport",     emoji: "🚗", color: "#3b82f6" },
  { id: "shopping",     label: "Shopping",      emoji: "🛍️", color: "#ec4899" },
  { id: "entertainment",label: "Entertainment", emoji: "🎬", color: "#8b5cf6" },
  { id: "health",       label: "Health",        emoji: "💊", color: "#10b981" },
  { id: "education",    label: "Education",     emoji: "📚", color: "#14b8a6" },
  { id: "utilities",    label: "Utilities",     emoji: "⚡", color: "#f97316" },
  { id: "emi",          label: "EMI",           emoji: "🏦", color: "#ef4444" },
  { id: "subscriptions",label: "Subscriptions", emoji: "📱", color: "#a855f7" },
  { id: "others",       label: "Others",        emoji: "📦", color: "#64748b" },
];

const CURRENCIES = [
  { symbol: "₹",   code: "INR", locale: "en-IN", label: "Indian Rupee" },
  { symbol: "$",   code: "USD", locale: "en-US", label: "US Dollar" },
  { symbol: "£",   code: "GBP", locale: "en-GB", label: "British Pound" },
  { symbol: "€",   code: "EUR", locale: "de-DE", label: "Euro" },
  { symbol: "د.إ", code: "AED", locale: "ar-AE", label: "UAE Dirham" },
  { symbol: "৳",   code: "BDT", locale: "bn-BD", label: "Bangladeshi Taka" },
];

const NL_CATEGORIES = {
  "swiggy|zomato|lunch|dinner|breakfast|food|restaurant|cafe|eat|meal|pizza|burger": "food",
  "uber|ola|petrol|fuel|auto|bus|metro|train|cab|travel|rapido": "transport",
  "rent|house|flat|pg|room|hostel|landlord": "rent",
  "netflix|spotify|prime|hotstar|youtube|subscription|zee|sony": "subscriptions",
  "medicine|doctor|hospital|pharmacy|health|clinic|chemist|medical": "health",
  "amazon|flipkart|shopping|clothes|shirt|shoes|myntra|meesho|dress": "shopping",
  "electricity|water|gas|wifi|internet|bill|recharge|utilities": "utilities",
  "emi|loan|bank|equitas|hdfc|icici|sbi": "emi",
  "movie|game|bowling|concert|event|fun|entertainment": "entertainment",
  "school|college|course|book|exam|tuition|education|udemy": "education",
};

const EMOJI_GRID = ["🎁","🐶","🐱","🚀","🌟","💡","🎸","🏋️","🎨","🌿","☕","🍕","🚂","🏖️","💼","🎯"];

const STORAGE_KEYS = [
  "expenses","budgets","goals","emis","subs",
  "splits","setup","pin","themeMode","customCats","currency","wishlist"
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
* { box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; }
.hide-scroll::-webkit-scrollbar { display: none; }
.hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes blob {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.1); }
  66% { transform: translate(-20px,20px) scale(0.95); }
}
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 20px #10b98155; }
  50%      { box-shadow: 0 0 40px #10b981aa; }
}
@keyframes bounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes badgeGlow {
  0%,100% { box-shadow: 0 0 8px var(--glow-color, #10b981); }
  50% { box-shadow: 0 0 16px var(--glow-color, #10b981); }
}
.blob1 { animation: blob 7s infinite ease-in-out; }
.blob2 { animation: blob 9s infinite ease-in-out 2s; }
.blob3 { animation: blob 11s infinite ease-in-out 4s; }
.slide-up { animation: slideUp 0.35s cubic-bezier(.32,2,.55,.89) both; }
.fade-in  { animation: fadeIn 0.3s ease both; }
.fade-out { animation: fadeOut 0.3s ease both; }
.fab-glow { animation: pulse-glow 2.5s infinite; }
.bounce-arrow { animation: bounce 1s infinite; }
.badge-glow { animation: badgeGlow 2s infinite; }
.btn-press:active { transform: scale(0.93); }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
`;

const DARK = {
  bg:      "#0a0f1e",
  bg2:     "#0d1117",
  bg3:     "#111827",
  card:    "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.08)",
  text:    "#f1f5f9",
  muted:   "#94a3b8",
  accent:  "#10b981",
  accent2: "#6366f1",
};
const LIGHT = {
  bg:      "#f0f4f8",
  bg2:     "#e8edf5",
  bg3:     "#ffffff",
  card:    "#ffffff",
  border:  "rgba(0,0,0,0.08)",
  text:    "#1e293b",
  muted:   "#64748b",
  accent:  "#059669",
  accent2: "#4f46e5",
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = load("themeMode", "device");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [themeMode, setThemeMode] = useState(() => load("themeMode", "device"));
  const T = darkMode ? DARK : LIGHT;

  const [currency, setCurrency] = useState(() => load("currency", CURRENCIES[0]));
  const [setup, setSetup] = useState(() => load("setup", null));
  const [pin, setPin] = useState(() => load("pin", null));
  const [pinUnlocked, setPinUnlocked] = useState(false);

  const [expenses,   setExpenses]   = useState(() => load("expenses", []));
  const [budgets,    setBudgets]    = useState(() => load("budgets", {}));
  const [goals,      setGoals]      = useState(() => load("goals", []));
  const [wishlist,   setWishlist]   = useState(() => load("wishlist", []));
  const [emis,       setEmis]       = useState(() => load("emis", []));
  const [subs,       setSubs]       = useState(() => load("subs", []));
  const [splits,     setSplits]     = useState(() => load("splits", []));
  const [customCats, setCustomCats] = useState(() => load("customCats", []));

  const [tab,           setTab]           = useState("home");
  const [moreTab,       setMoreTab]       = useState("emi");
  const [showAdd,       setShowAdd]       = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const fmt = useCallback((n) =>
    currency.symbol + Number(n || 0).toLocaleString(currency.locale),
    [currency]
  );

  // Mark app as ready after first mount — fixes blank screen on first load
  useEffect(() => { setIsReady(true); }, []);

  useEffect(() => { save("currency",   currency);   }, [currency]);
  useEffect(() => { save("expenses",   expenses);   }, [expenses]);
  useEffect(() => { save("budgets",    budgets);    }, [budgets]);
  useEffect(() => { save("goals",      goals);      }, [goals]);
  useEffect(() => { save("wishlist",   wishlist);   }, [wishlist]);
  useEffect(() => { save("emis",       emis);       }, [emis]);
  useEffect(() => { save("subs",       subs);       }, [subs]);
  useEffect(() => { save("splits",     splits);     }, [splits]);
  useEffect(() => { save("customCats", customCats); }, [customCats]);
  useEffect(() => { save("themeMode",  themeMode);  }, [themeMode]);

  useEffect(() => {
    const handleClick = () => { if (confirmDelete !== null) setConfirmDelete(null); };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [confirmDelete]);

  const handleTheme = (mode) => {
    setThemeMode(mode);
    if (mode === "dark")   setDarkMode(true);
    if (mode === "light")  setDarkMode(false);
    if (mode === "device") setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  // ALL useMemo hooks must be here — before any conditional return
  const allCats = useMemo(() =>
    [...CATS, ...customCats.map(c => ({ ...c, custom: true }))],
    [customCats]
  );

  const cycleStart = useMemo(() => {
    if (!setup) return today();
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), setup.creditDay);
    if (d > now) d = new Date(now.getFullYear(), now.getMonth() - 1, setup.creditDay);
    return d.toISOString().slice(0, 10);
  }, [setup]);

  const cycleEnd = useMemo(() => {
    if (!setup) return today();
    const cs = new Date(cycleStart);
    const d = new Date(cs.getFullYear(), cs.getMonth() + 1, setup.creditDay - 1);
    return d.toISOString().slice(0, 10);
  }, [cycleStart, setup]);

  const cycleExpenses = useMemo(() =>
    expenses.filter(e => e.date >= cycleStart && e.date <= cycleEnd),
    [expenses, cycleStart, cycleEnd]
  );

  const prevCycleExpenses = useMemo(() => {
    if (!setup) return [];
    const cs = new Date(cycleStart);
    const prevStart = new Date(cs.getFullYear(), cs.getMonth() - 1, setup.creditDay);
    const prevEnd   = new Date(cs.getFullYear(), cs.getMonth(),     setup.creditDay - 1);
    return expenses.filter(e =>
      e.date >= prevStart.toISOString().slice(0, 10) &&
      e.date <= prevEnd.toISOString().slice(0, 10)
    );
  }, [expenses, cycleStart, setup]);

  const totalSpent = useMemo(() =>
    cycleExpenses.reduce((a, e) => a + Number(e.amount), 0),
    [cycleExpenses]
  );

  const remaining = setup ? (setup.salary || 0) - totalSpent : 0;

  const daysLeft = useMemo(() => {
    const end = new Date(cycleEnd);
    const now = new Date();
    return Math.max(1, Math.ceil((end - now) / 86400000));
  }, [cycleEnd]);

  const paydayCountdown = useMemo(() => {
    if (!setup) return 0;
    const now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth(), setup.creditDay);
    if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, setup.creditDay);
    return Math.ceil((next - now) / 86400000);
  }, [setup]);

  const noSpendStreak = useMemo(() => {
    let streak = 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (expenses.some(e => e.date === ds)) break;
      streak++;
      d.setDate(d.getDate() - 1);
      if (streak > 365) break;
    }
    return streak;
  }, [expenses]);

  const spentByCat = useMemo(() => {
    const m = {};
    cycleExpenses.forEach(e => { m[e.category] = (m[e.category] || 0) + Number(e.amount); });
    return m;
  }, [cycleExpenses]);

  const todayCount = useMemo(() =>
    expenses.filter(e => e.date === today()).length,
    [expenses]
  );

  // All useCallback hooks here too — before any conditional return
  const addExpense = useCallback((exp) => {
    setExpenses(prev => [...prev, { ...exp, id: crypto.randomUUID() }]);
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleDeleteWithConfirm = useCallback((id, deleteFn, e) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      deleteFn(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }, [confirmDelete]);

  // Recurring expenses effect — runs after hooks are settled
  useEffect(() => {
    if (!setup) return;
    const recur = expenses.filter(e => e.recurring);
    const thisMonth = new Date().toISOString().slice(0, 7);
    recur.forEach(e => {
      const alreadyAdded = expenses.some(x => x.recurParent === e.id && x.date?.startsWith(thisMonth));
      if (!alreadyAdded && !e.date?.startsWith(thisMonth)) {
        const newExp = { ...e, id: crypto.randomUUID(), date: today(), recurParent: e.id, recurring: false };
        setExpenses(prev => [...prev, newExp]);
      }
    });
  }, [setup]);

  // Now safe to do conditional renders — all hooks already called above
  if (!isReady) {
    return (
      <div style={{ minHeight: "100vh", background: DARK.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#10b981", fontSize: 32 }}>💰</div>
      </div>
    );
  }

  if (pin && !pinUnlocked) {
    return <PinScreen T={T} pin={pin} onUnlock={() => setPinUnlocked(true)} />;
  }

  if (!setup) {
    return (
      <SetupScreen
        T={T}
        onDone={(s) => { setSetup(s); save("setup", s); }}
        currency={currency}
        setCurrency={setCurrency}
        fmt={fmt}
      />
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif", display: "flex", justifyContent: "center" }}>
      <style>{STYLES}</style>
      <div style={{ width: "100%", maxWidth: 448, position: "relative", minHeight: "100vh", background: T.bg }}>
        <div style={{ paddingBottom: 100 }} className="hide-scroll">
          {tab === "home"     && <HomeTab T={T} setup={setup} totalSpent={totalSpent} remaining={remaining} daysLeft={daysLeft} paydayCountdown={paydayCountdown} noSpendStreak={noSpendStreak} spentByCat={spentByCat} cycleExpenses={cycleExpenses} prevCycleExpenses={prevCycleExpenses} budgets={budgets} allCats={allCats} emis={emis} subs={subs} onSettings={() => setShowSettings(true)} fmt={fmt} cycleStart={cycleStart} cycleEnd={cycleEnd} goals={goals} dismissedAlerts={dismissedAlerts} setDismissedAlerts={setDismissedAlerts} />}
          {tab === "expenses" && <ExpensesTab T={T} expenses={expenses} allCats={allCats} onDelete={deleteExpense} onEdit={(id, data) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))} fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
          {tab === "budget"   && <BudgetTab T={T} budgets={budgets} setBudgets={(b) => { setBudgets(b); save("budgets", b); }} allCats={allCats} spentByCat={spentByCat} salary={setup.salary} fmt={fmt} currency={currency} />}
          {tab === "goals"    && <GoalsTab T={T} goals={goals} setGoals={setGoals} wishlist={wishlist} setWishlist={setWishlist} salary={setup.salary} fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
          {tab === "reports"  && <ReportsTab T={T} expenses={expenses} cycleExpenses={cycleExpenses} allCats={allCats} spentByCat={spentByCat} salary={setup.salary} fmt={fmt} subs={subs} emis={emis} remaining={remaining} noSpendStreak={noSpendStreak} />}
          {tab === "more"     && <MoreTab T={T} moreTab={moreTab} setMoreTab={setMoreTab} emis={emis} setEmis={setEmis} subs={subs} setSubs={setSubs} splits={splits} setSplits={setSplits} salary={setup.salary} fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
        </div>

        <button
          className="btn-press fab-glow"
          onClick={() => setShowAdd(true)}
          style={{
            position: "fixed", bottom: 88, right: "calc(50% - 208px)",
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none", cursor: "pointer", fontSize: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", zIndex: 40, boxShadow: "0 4px 20px #10b98166",
          }}
        >+</button>

        <BottomNav T={T} tab={tab} setTab={setTab} todayCount={todayCount} />

        {showAdd && (
          <AddExpenseModal T={T} allCats={allCats} budgets={budgets} spentByCat={spentByCat} onAdd={addExpense} onClose={() => setShowAdd(false)} customCats={customCats} setCustomCats={setCustomCats} fmt={fmt} currency={currency} />
        )}

        {showSettings && (
          <SettingsModal T={T} setup={setup} setSetup={(s) => { setSetup(s); save("setup", s); }} pin={pin} setPin={(p) => { setPin(p); save("pin", p); }} themeMode={themeMode} onTheme={handleTheme} expenses={expenses} setExpenses={setExpenses} budgets={budgets} goals={goals} emis={emis} subs={subs} onClose={() => setShowSettings(false)} darkMode={darkMode} currency={currency} setCurrency={setCurrency} fmt={fmt} setBudgets={setBudgets} setGoals={setGoals} setEmis={setEmis} setSubs={setSubs} setSplits={setSplits} splits={splits} wishlist={wishlist} setWishlist={setWishlist} setCustomCats={setCustomCats} />
        )}
      </div>
    </div>
  );
}

function SetupScreen({ T, onDone, currency, setCurrency, fmt }) {
  const [salary, setSalary] = useState("");
  const [creditDay, setCreditDay] = useState(1);
  const valid = Number(salary) > 0;
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 8 }}>Setup Your Wallet</div>
      <div style={{ color: T.muted, marginBottom: 32, textAlign: "center" }}>Enter your monthly take-home salary and salary credit date to get started.</div>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <Label T={T}>💱 Currency</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {CURRENCIES.map(c => (
            <button key={c.code} onClick={() => setCurrency(c)}
              style={{ padding: "8px 12px", borderRadius: 10, border: `2px solid ${currency.code === c.code ? T.accent : T.border}`, background: currency.code === c.code ? T.accent + "22" : T.card, color: currency.code === c.code ? T.accent : T.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
        <Label T={T}>Monthly Take-Home Salary</Label>
        <input type="number" placeholder="e.g. 50000" value={salary} onChange={e => setSalary(e.target.value)}
          style={{ ...inputStyle(T), width: "100%", marginBottom: 20 }} />
        <Label T={T}>Salary Credit Day (1–28)</Label>
        <input type="number" min={1} max={28} value={creditDay} onChange={e => setCreditDay(Number(e.target.value))}
          style={{ ...inputStyle(T), width: "100%", marginBottom: 32 }} />
        <button
          onClick={() => { if (!valid) return; onDone({ salary: Number(salary), creditDay: Number(creditDay) }); }}
          className="btn-press"
          style={{ width: "100%", padding: "16px", borderRadius: 16, background: valid ? "linear-gradient(135deg,#10b981,#059669)" : "#334155", color: "#fff", fontWeight: 700, fontSize: 17, border: "none", cursor: valid ? "pointer" : "not-allowed" }}>
          Get Started 🚀
        </button>
      </div>
    </div>
  );
}

function PinScreen({ T, pin, onUnlock }) {
  const [entered, setEntered] = useState("");
  const [err, setErr] = useState(false);
  const press = (d) => {
    const next = (entered + d).slice(0, 4);
    setEntered(next);
    setErr(false);
    if (next.length === 4) {
      if (next === pin) onUnlock();
      else { setErr(true); setEntered(""); }
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>Enter PIN</div>
      {err && <div style={{ color: "#ef4444", marginBottom: 8 }}>Wrong PIN, try again</div>}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: entered.length > i ? T.accent : T.border, border: `2px solid ${T.accent}` }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 240 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k === "⌫" ? setEntered(p => p.slice(0,-1)) : k !== "" ? press(String(k)) : null}
            style={{ padding: "18px 0", borderRadius: 14, background: T.card, border: `1px solid ${T.border}`, color: T.text, fontSize: 20, fontWeight: 600, cursor: k !== "" ? "pointer" : "default" }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ T, tab, setTab, todayCount }) {
  const tabs = [
    { id: "home",     icon: "🏠", label: "Home" },
    { id: "expenses", icon: "💸", label: "Expenses" },
    { id: "budget",   icon: "📊", label: "Budget" },
    { id: "goals",    icon: "🎯", label: "Goals" },
    { id: "reports",  icon: "📈", label: "Reports" },
    { id: "more",     icon: "⚙️", label: "More" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      background: T.bg3 === "#ffffff" ? "rgba(255,255,255,0.92)" : "rgba(13,17,23,0.92)",
      backdropFilter: "blur(20px)", borderRadius: 32, padding: "8px 12px",
      display: "flex", gap: 0, zIndex: 50, border: `1px solid ${T.border}`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: "calc(100% - 32px)", maxWidth: 416,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} className="btn-press"
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "6px 4px", border: "none", cursor: "pointer",
            background: tab === t.id ? (T.accent + "22") : "transparent",
            borderRadius: 20, transition: "all 0.2s", position: "relative",
          }}>
          <span style={{ fontSize: 18, position: "relative" }}>
            {t.icon}
            {t.id === "expenses" && todayCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -8, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{todayCount}</span>
            )}
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: tab === t.id ? T.accent : T.muted, letterSpacing: 0.3 }}>{t.label}</span>
          {tab === t.id && (
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent, marginTop: 2 }} />
          )}
        </button>
      ))}
    </div>
  );
}

function HomeTab({ T, setup, totalSpent, remaining, daysLeft, paydayCountdown, noSpendStreak, spentByCat, cycleExpenses, prevCycleExpenses, budgets, allCats, emis, subs, onSettings, fmt, cycleStart, cycleEnd, goals, dismissedAlerts, setDismissedAlerts }) {
  const pct = Math.min(100, (totalSpent / setup.salary) * 100);
  const dailyBudget = remaining > 0 ? remaining / daysLeft : 0;
  const emiTotal = emis.reduce((a, e) => a + Number(e.monthly || 0), 0);
  const subTotal = subs.reduce((a, s) => a + (s.cycle === "annual" ? s.amount / 12 : Number(s.amount || 0)), 0);
  const emiPct = setup.salary ? (emiTotal / setup.salary * 100).toFixed(0) : 0;

  const personality = useMemo(() => {
    if (pct < 30)  return { label: "🧘 Zen Saver",   color: "#10b981", msg: "Incredible discipline this cycle!" };
    if (pct < 60)  return { label: "⚖️ Balanced",    color: "#6366f1", msg: "Healthy spending habits this cycle." };
    if (pct < 80)  return { label: "⚠️ Watch Out",   color: "#f59e0b", msg: "Spending is picking up pace." };
    if (pct < 100) return { label: "🔥 Danger Zone", color: "#ef4444", msg: "Almost at your limit!" };
    return              { label: "💀 Overbudget",    color: "#dc2626", msg: "You've exceeded your salary!" };
  }, [pct]);

  const forecast = useMemo(() => {
    const csDate = new Date(cycleStart);
    const nowDate = new Date();
    const ceDate = new Date(cycleEnd);
    const daysGone = Math.max(1, Math.ceil((nowDate - csDate) / 86400000));
    const totalDays = Math.max(1, Math.ceil((ceDate - csDate) / 86400000));
    const dailyRate = totalSpent / daysGone;
    const projectedSpend = dailyRate * totalDays;
    const projectedOvershoot = projectedSpend - setup.salary;
    return { projectedSpend, projectedOvershoot };
  }, [cycleStart, cycleEnd, totalSpent, setup.salary]);

  const trendData = useMemo(() => {
    const prevTotal = prevCycleExpenses.reduce((a, e) => a + Number(e.amount), 0);
    const csDate = new Date(cycleStart);
    const nowDate = new Date();
    const daysGone = Math.max(1, Math.ceil((nowDate - csDate) / 86400000));
    const currDailyAvg = totalSpent / daysGone;
    const prevDailyAvg = prevTotal / 30;
    if (prevDailyAvg === 0) return { arrow: "→", color: T.muted, pctChange: 0 };
    const pctChange = ((currDailyAvg - prevDailyAvg) / prevDailyAvg * 100).toFixed(0);
    if (pctChange > 5)  return { arrow: "↑", color: "#ef4444", pctChange };
    if (pctChange < -5) return { arrow: "↓", color: "#10b981", pctChange: Math.abs(pctChange) };
    return { arrow: "→", color: T.muted, pctChange: 0 };
  }, [prevCycleExpenses, totalSpent, cycleStart, T.muted]);

  const badges = useMemo(() => {
    const catUnderBudget = allCats.filter(c => budgets[c.id] > 0 && (spentByCat[c.id] || 0) < budgets[c.id]).length;
    const goalComplete = goals.some(g => g.target > 0 && g.saved >= g.target);
    return [
      { icon: "🔥", label: "3-Day Streak",  earned: noSpendStreak >= 3 },
      { icon: "⚡", label: "Week Warrior",  earned: noSpendStreak >= 7 },
      { icon: "🏆", label: "Month Master",  earned: noSpendStreak >= 30 },
      { icon: "🎯", label: "Budget Hero",   earned: catUnderBudget >= 3 },
      { icon: "🌟", label: "Goal Crusher",  earned: goalComplete },
      { icon: "📋", label: "Diligent",      earned: cycleExpenses.length >= 20 },
      { icon: "💰", label: "Super Saver",   earned: remaining > setup.salary * 0.4 },
      { icon: "🚫", label: "No EMI Hero",   earned: emis.length === 0 },
    ];
  }, [noSpendStreak, budgets, spentByCat, allCats, goals, cycleExpenses.length, remaining, setup.salary, emis.length]);

  const exceededCats = useMemo(() =>
    allCats.filter(c => {
      const bud   = budgets[c.id] || 0;
      const spent = spentByCat[c.id] || 0;
      return bud > 0 && spent > bud && !dismissedAlerts.has(c.id);
    }),
    [allCats, budgets, spentByCat, dismissedAlerts]
  );

  const topCats = useMemo(() =>
    Object.entries(spentByCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amt]) => ({ ...allCats.find(c => c.id === id), amt }))
      .filter(Boolean),
    [spentByCat, allCats]
  );

  const barColor = pct < 70 ? "#10b981" : pct < 90 ? "#f59e0b" : "#ef4444";

  return (
    <div className="fade-in">
      {exceededCats.map(cat => (
        <div key={cat.id} style={{ background: "#ef4444", color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>🔴 {cat.emoji} {cat.label} budget exceeded! Spent {fmt(spentByCat[cat.id])} of {fmt(budgets[cat.id])}</span>
          <button onClick={() => setDismissedAlerts(prev => new Set([...prev, cat.id]))} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      ))}

      <div style={{ position: "relative", overflow: "hidden", padding: "48px 20px 32px", background: "linear-gradient(135deg, #0a0f1e 0%, #111827 100%)" }}>
        <div className="blob1" style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "#10b98133", filter: "blur(60px)" }} />
        <div className="blob2" style={{ position: "absolute", top: 20, right: -40, width: 180, height: 180, borderRadius: "50%", background: "#6366f133", filter: "blur(60px)" }} />
        <div className="blob3" style={{ position: "absolute", bottom: -20, left: "40%", width: 160, height: 160, borderRadius: "50%", background: "#ec489933", filter: "blur(50px)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Monthly Salary</div>
            <div style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{fmt(setup.salary)}</div>
            <div style={{ color: "#10b981", fontSize: 13, marginTop: 4 }}>💰 Payday in {paydayCountdown} day{paydayCountdown !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onSettings} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 12px", color: "#fff", cursor: "pointer", fontSize: 18 }}>⚙️</button>
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
          {[
            { label: "Spent",     val: fmt(totalSpent),           color: "#ef4444" },
            { label: "Remaining", val: fmt(Math.max(0,remaining)), color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#94a3b8", fontSize: 12 }}>
            <span>Budget used</span><span>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, borderRadius: 8, transition: "width 0.5s" }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: personality.color + "20", border: `1px solid ${personality.color}40`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ background: personality.color + "33", color: personality.color, padding: "4px 10px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>{personality.label}</span>
          <span style={{ color: T.text, fontSize: 13 }}>{personality.msg}</span>
        </div>

        {forecast.projectedSpend <= setup.salary * 0.8 && (
          <div style={{ background: "#10b98120", border: "1px solid #10b98140", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ color: T.text, fontSize: 14 }}>On track! Projected to spend <strong style={{ color: "#10b981" }}>{fmt(Math.round(forecast.projectedSpend))}</strong> this cycle — {fmt(Math.round(setup.salary - forecast.projectedSpend))} under budget.</span>
          </div>
        )}
        {forecast.projectedSpend > setup.salary * 0.8 && forecast.projectedSpend <= setup.salary && (
          <div style={{ background: "#f59e0b20", border: "1px solid #f59e0b40", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ color: T.text, fontSize: 14 }}>Heads up! Projected to spend <strong style={{ color: "#f59e0b" }}>{fmt(Math.round(forecast.projectedSpend))}</strong> this cycle — cutting it close.</span>
          </div>
        )}
        {forecast.projectedSpend > setup.salary && (
          <div style={{ background: "#ef444420", border: "1px solid #ef444440", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <span style={{ color: T.text, fontSize: 14 }}>Overspend Alert! At this pace you'll spend <strong style={{ color: "#ef4444" }}>{fmt(Math.round(forecast.projectedSpend))}</strong> — {fmt(Math.round(forecast.projectedOvershoot))} OVER your salary.</span>
          </div>
        )}

        <div style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}30`, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>You can spend <strong style={{ color: T.accent }}>{fmt(Math.floor(dailyBudget))}/day</strong> for the rest of this cycle</span>
        </div>

        {cycleExpenses.length === 0 ? (
          <Card T={T} style={{ marginBottom: 16, textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
            <div style={{ fontWeight: 700, color: T.text, fontSize: 18, marginBottom: 8 }}>No expenses yet</div>
            <div style={{ color: T.muted, fontSize: 14, marginBottom: 16 }}>Tap the + button below to add your first expense</div>
            <div className="bounce-arrow" style={{ fontSize: 24, color: T.accent }}>↓</div>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { icon: "💸", label: "Total Spent",    val: fmt(totalSpent) },
              { icon: "🏦", label: "Remaining",       val: fmt(Math.max(0, remaining)) },
              { icon: "📅", label: "Daily Budget",    val: fmt(Math.floor(dailyBudget)) },
              { icon: "🔥", label: "No-Spend Streak", val: `${noSpendStreak} day${noSpendStreak !== 1 ? "s" : ""}` },
            ].map(s => (
              <Card key={s.label} T={T} style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 2 }}>{s.label}</div>
                <div style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>{s.val}</div>
                {s.label === "Total Spent" && trendData.arrow !== "→" && (
                  <div style={{ color: trendData.color, fontSize: 10, marginTop: 2 }}>{trendData.arrow} {trendData.pctChange}% vs last cycle</div>
                )}
              </Card>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: T.text }}>🏅 Badges</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }} className="hide-scroll">
            {badges.map((b, i) => (
              <div key={i} className={b.earned ? "badge-glow" : ""} style={{ minWidth: 64, padding: "10px 8px", borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, textAlign: "center", opacity: b.earned ? 1 : 0.3, "--glow-color": T.accent }}>
                <div style={{ fontSize: 24 }}>{b.icon}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 600 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {topCats.length > 0 && (
          <Card T={T} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: T.text }}>Top Spending</div>
            {topCats.map(cat => {
              const bud  = budgets[cat.id] || 0;
              const pct2 = bud > 0 ? Math.min(100, (cat.amt / bud) * 100) : 0;
              return (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18, background: cat.color + "22", borderRadius: 8, padding: "2px 6px" }}>{cat.emoji}</span>
                      <span style={{ color: T.text, fontSize: 14 }}>{cat.label}</span>
                    </div>
                    <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{fmt(cat.amt)}</span>
                  </div>
                  {bud > 0 && (
                    <div style={{ height: 4, borderRadius: 4, background: T.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct2}%`, background: pct2 > 90 ? "#ef4444" : pct2 > 70 ? "#f59e0b" : cat.color, borderRadius: 4 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <Card T={T} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>🏦</div>
            <div style={{ color: T.muted, fontSize: 11 }}>EMI Burden</div>
            <div style={{ color: emiPct > 40 ? "#ef4444" : T.text, fontWeight: 700, fontSize: 16 }}>{emiPct}%</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{fmt(emiTotal)}/mo</div>
          </Card>
          <Card T={T} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>📱</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Sub Burn</div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{fmt(Math.round(subTotal))}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>per month</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ T, allCats, budgets, spentByCat, onAdd, onClose, customCats, setCustomCats, fmt, currency }) {
  const [amount,      setAmount]      = useState("");
  const [cat,         setCat]         = useState(allCats[0].id);
  const [date,        setDate]        = useState(today());
  const [method,      setMethod]      = useState("digital");
  const [note,        setNote]        = useState("");
  const [recurring,   setRecurring]   = useState(false);
  const [othersLabel, setOthersLabel] = useState("");
  const [success,     setSuccess]     = useState(null);
  const [showNewCat,  setShowNewCat]  = useState(false);
  const [newCatName,  setNewCatName]  = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🎁");
  const [nlInput,     setNlInput]     = useState("");
  const [nlParsed,    setNlParsed]    = useState(null);

  const selCat   = allCats.find(c => c.id === cat) || allCats[0];
  const spent    = spentByCat[cat] || 0;
  const bud      = budgets[cat] || 0;
  const afterAmt = spent + Number(amount || 0);
  const barPct   = bud > 0 ? Math.min(100, (afterAmt / bud) * 100) : 0;
  const barColor = barPct > 100 ? "#ef4444" : barPct > 70 ? "#f59e0b" : "#10b981";

  const parseNL = (input) => {
    if (!input.trim()) { setNlParsed(null); return; }
    const lowerInput  = input.toLowerCase();
    const amountMatch = input.match(/(\d+)/);
    const parsedAmount = amountMatch ? amountMatch[1] : "";
    let parsedCat = "others";
    for (const [pattern, catId] of Object.entries(NL_CATEGORIES)) {
      if (new RegExp(pattern, "i").test(lowerInput)) { parsedCat = catId; break; }
    }
    const noteText = input.replace(/\d+/g, "").trim();
    if (parsedAmount) {
      setAmount(parsedAmount);
      setCat(parsedCat);
      setNote(noteText);
      const catObj = allCats.find(c => c.id === parsedCat);
      setNlParsed({ amount: parsedAmount, catLabel: catObj?.label || parsedCat });
    }
  };

  const doAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    onAdd({ amount: Number(amount), category: cat, date, method, note, recurring, othersLabel: cat === "others" ? othersLabel : "" });
    setSuccess({ amount, cat: selCat.label });
    setTimeout(() => setSuccess(null), 2500);
    setAmount(""); setNote(""); setOthersLabel(""); setRecurring(false); setNlInput(""); setNlParsed(null);
  };

  const doAddCustomCat = () => {
    if (!newCatName.trim()) return;
    const id = "custom_" + crypto.randomUUID();
    const nc = { id, label: newCatName.trim(), emoji: newCatEmoji, color: "#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0"), custom: true };
    setCustomCats(prev => [...prev, nc]);
    setNewCatName(""); setShowNewCat(false); setCat(id);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div className="slide-up" style={{ position: "relative", background: T.bg3 === "#ffffff" ? "#fff" : "#111827", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${T.border}` }}>
        <div style={{ width: 40, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: T.text }}>Add Expense</div>
          <button onClick={onClose} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: T.muted, fontSize: 14 }}>✕ Close</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label T={T}>Quick add (e.g. 'swiggy 340' or 'rent 12000')</Label>
          <input type="text" placeholder="Type expense in plain English..." value={nlInput}
            onChange={e => { setNlInput(e.target.value); parseNL(e.target.value); }}
            style={{ ...inputStyle(T), width: "100%" }} />
          {nlParsed && (
            <div style={{ marginTop: 6, color: "#10b981", fontSize: 13, fontWeight: 600 }}>✓ Parsed: {fmt(nlParsed.amount)} in {nlParsed.catLabel}</div>
          )}
        </div>

        {bud > 0 && (
          <div style={{ background: barColor + "15", border: `1px solid ${barColor}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.text, marginBottom: 6 }}>
              <span>{selCat.emoji} {selCat.label} — {fmt(spent)} spent of {fmt(bud)}</span>
              <span style={{ color: barColor }}>After: {fmt(bud - afterAmt)}</span>
            </div>
            <div style={{ height: 5, borderRadius: 5, background: T.border, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 5, transition: "width 0.2s" }} />
            </div>
          </div>
        )}

        {success && (
          <div className="fade-in" style={{ background: "#10b98120", border: "1px solid #10b98140", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>Expense Added! {fmt(success.amount)} in {success.cat}</span>
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 6 }}>Amount</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: T.muted }}>{currency?.symbol || "₹"}</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{ fontSize: 40, fontWeight: 700, color: T.text, background: "transparent", border: "none", outline: "none", width: 180, textAlign: "center" }} />
          </div>
          <div style={{ height: 2, background: T.accent, maxWidth: 200, margin: "0 auto", borderRadius: 2 }} />
        </div>

        <Label T={T}>Category</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {allCats.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className="btn-press"
              style={{ padding: "10px 4px", borderRadius: 12, border: `2px solid ${cat === c.id ? c.color : T.border}`, background: cat === c.id ? c.color + "22" : T.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: T.text, textAlign: "center", lineHeight: 1.2 }}>{c.label}</span>
            </button>
          ))}
          <button onClick={() => setShowNewCat(true)} className="btn-press"
            style={{ padding: "10px 4px", borderRadius: 12, border: `2px dashed ${T.border}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 18 }}>➕</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: T.muted }}>New</span>
          </button>
        </div>

        {cat === "others" && (
          <div style={{ marginBottom: 12 }}>
            <Label T={T}>What is this expense?</Label>
            <input type="text" placeholder="e.g. Birthday gift" value={othersLabel} onChange={e => setOthersLabel(e.target.value)}
              style={{ ...inputStyle(T), width: "100%" }} />
          </div>
        )}

        {showNewCat && (
          <Card T={T} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 10, color: T.text }}>New Category</div>
            <input type="text" placeholder="Category name" value={newCatName} onChange={e => setNewCatName(e.target.value)}
              style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {EMOJI_GRID.map(em => (
                <button key={em} onClick={() => setNewCatEmoji(em)} style={{ fontSize: 20, background: newCatEmoji === em ? T.accent + "33" : "transparent", border: newCatEmoji === em ? `1px solid ${T.accent}` : "1px solid transparent", borderRadius: 8, padding: 4, cursor: "pointer" }}>{em}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn T={T} onClick={doAddCustomCat} style={{ flex: 1 }}>Add Category</Btn>
              <Btn T={T} onClick={() => setShowNewCat(false)} secondary style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <Label T={T}>Date</Label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle(T), width: "100%" }} />
          </div>
          <div>
            <Label T={T}>Payment</Label>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
              {["digital","cash"].map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: "10px 0", border: "none", background: method === m ? T.accent : T.card, color: method === m ? "#fff" : T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {m === "digital" ? "💳 Digital" : "💵 Cash"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Label T={T}>Note (optional)</Label>
        <input type="text" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)}
          style={{ ...inputStyle(T), width: "100%", marginBottom: 12 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ color: T.text, fontSize: 14 }}>🔄 Recurring monthly</span>
          <Toggle on={recurring} onToggle={() => setRecurring(p => !p)} T={T} />
        </div>

        <Btn T={T} onClick={doAdd} style={{ width: "100%", padding: 16, fontSize: 16 }}>✅ Add Expense</Btn>
      </div>
    </div>
  );
}

function ExpensesTab({ T, expenses, allCats, onDelete, onEdit, fmt, confirmDelete, handleDeleteWithConfirm }) {
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const filtered = useMemo(() =>
    expenses.filter(e => {
      const cat   = allCats.find(c => c.id === e.category);
      const label = (cat?.label || "") + " " + (e.note || "") + " " + (e.othersLabel || "");
      return (
        label.toLowerCase().includes(search.toLowerCase()) &&
        (filterCat    === "all" || e.category === filterCat) &&
        (filterMethod === "all" || e.method   === filterMethod)
      );
    }).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, search, filterCat, filterMethod, allCats]
  );

  const grouped = useMemo(() => {
    const m = {};
    filtered.forEach(e => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e); });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const dateLabel = (d) => {
    const t = today(); const y = new Date(t); y.setDate(y.getDate() - 1);
    if (d === t) return "Today";
    if (d === y.toISOString().slice(0, 10)) return "Yesterday";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const exportCSV = () => {
    const rows = [["Date","Category","Amount","Method","Note","Recurring"]];
    expenses.forEach(e => {
      const cat = allCats.find(c => c.id === e.category);
      rows.push([e.date, cat?.label || e.category, e.amount, e.method, e.note || "", e.recurring ? "Yes" : "No"]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "expenses.csv"; a.click();
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingTop: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>💸 Expenses</div>
        <button onClick={exportCSV} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 600 }}>⬇ CSV</button>
      </div>
      <input type="text" placeholder="🔍 Search expenses..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle(T), width: "100%", marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }} className="hide-scroll">
        {["all", ...allCats.map(c => c.id)].map(id => {
          const c = allCats.find(x => x.id === id);
          return (
            <button key={id} onClick={() => setFilterCat(id)}
              style={{ padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap", border: `1px solid ${filterCat === id ? T.accent : T.border}`, background: filterCat === id ? T.accent + "22" : T.card, color: filterCat === id ? T.accent : T.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {id === "all" ? "All" : `${c?.emoji} ${c?.label}`}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all","digital","cash"].map(m => (
          <button key={m} onClick={() => setFilterMethod(m)}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filterMethod === m ? T.accent : T.border}`, background: filterMethod === m ? T.accent + "22" : T.card, color: filterMethod === m ? T.accent : T.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {m === "all" ? "All" : m === "digital" ? "💳 Digital" : "💵 Cash"}
          </button>
        ))}
      </div>
      {grouped.length === 0 && <div style={{ textAlign: "center", color: T.muted, padding: 48 }}>No expenses found</div>}
      {grouped.map(([date, exps]) => (
        <div key={date} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: T.muted, fontSize: 13 }}>{dateLabel(date)}</span>
            <span style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{fmt(exps.reduce((a,e) => a + Number(e.amount), 0))}</span>
          </div>
          {exps.map(e => {
            const cat = allCats.find(c => c.id === e.category) || CATS.find(c => c.id === "others");
            const isConfirming = confirmDelete === e.id;
            return (
              <Card key={e.id} T={T} style={{ marginBottom: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: (cat?.color || "#64748b") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat?.emoji || "📦"}</div>
                    <div>
                      <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{e.othersLabel || cat?.label}</div>
                      <div style={{ color: T.muted, fontSize: 12 }}>{e.method === "digital" ? "💳" : "💵"} {e.note || ""} {e.recurring ? "🔄" : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{fmt(e.amount)}</div>
                    <button onClick={(ev) => handleDeleteWithConfirm(e.id, onDelete, ev)}
                      style={{ background: isConfirming ? "#ef4444" : "#ef444420", border: `1px solid ${isConfirming ? "#ef4444" : "#ef444440"}`, color: isConfirming ? "#fff" : "#ef4444", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: isConfirming ? 11 : 14, fontWeight: isConfirming ? 600 : 400, minWidth: isConfirming ? 60 : "auto" }}>
                      {isConfirming ? "Sure? ✓" : "🗑"}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BudgetTab({ T, budgets, setBudgets, allCats, spentByCat, salary, fmt, currency }) {
  const total = Object.values(budgets).reduce((a, b) => a + Number(b || 0), 0);
  const pct   = salary ? (total / salary * 100).toFixed(0) : 0;
  const sym   = currency?.symbol || "₹";

  const set503020 = () => {
    const cats50 = ["food","rent","utilities","transport"];
    const cats30 = ["shopping","entertainment","health","subscriptions"];
    const cats20 = ["education","emi","others"];
    const half = salary * 0.5, thirt = salary * 0.3, twent = salary * 0.2;
    const nb = {};
    cats50.forEach(c => nb[c] = Math.round(half  / cats50.length));
    cats30.forEach(c => nb[c] = Math.round(thirt / cats30.length));
    cats20.forEach(c => nb[c] = Math.round(twent / cats20.length));
    setBudgets(nb);
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 16, paddingTop: 8 }}>📊 Budget Planner</div>
      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: T.muted, fontSize: 13 }}>Total Budgeted</span>
          <span style={{ fontWeight: 700, color: T.text }}>{fmt(total)} / {fmt(salary)}</span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: T.border, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${Math.min(100,pct)}%`, background: pct > 100 ? "#ef4444" : "#10b981", borderRadius: 8 }} />
        </div>
        <button onClick={set503020} className="btn-press"
          style={{ width: "100%", padding: "10px", borderRadius: 12, background: T.accent + "22", border: `1px solid ${T.accent}40`, color: T.accent, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          ✨ Auto 50/30/20 Rule
        </button>
      </Card>
      {allCats.map(cat => {
        const bud    = budgets[cat.id] || 0;
        const spent  = spentByCat[cat.id] || 0;
        const barPct = bud > 0 ? Math.min(100, spent / bud * 100) : 0;
        const bc     = barPct > 100 ? "#ef4444" : barPct > 80 ? "#f59e0b" : "#10b981";
        return (
          <Card key={cat.id} T={T} style={{ marginBottom: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, background: cat.color + "22", borderRadius: 8, padding: "3px 7px" }}>{cat.emoji}</span>
                <div>
                  <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{cat.label}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{fmt(spent)} spent</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {barPct > 80 && <span style={{ fontSize: 14 }}>{barPct > 100 ? "🔴" : "⚠️"}</span>}
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 13 }}>{sym}</span>
                  <input type="number" value={bud || ""} placeholder="0"
                    onChange={e => setBudgets({ ...budgets, [cat.id]: Number(e.target.value) })}
                    style={{ ...inputStyle(T), width: 90, paddingLeft: 20, textAlign: "right" }} />
                </div>
              </div>
            </div>
            {bud > 0 && (
              <div style={{ height: 5, borderRadius: 5, background: T.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${barPct}%`, background: bc, borderRadius: 5, transition: "width 0.3s" }} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function GoalsTab({ T, goals, setGoals, wishlist, setWishlist, salary, fmt, confirmDelete, handleDeleteWithConfirm }) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [gForm, setGForm] = useState({ name: "", target: "", saved: "", monthly: "", emoji: "🎯" });
  const [wForm, setWForm] = useState({ name: "", price: "" });

  const addGoal = () => {
    if (!gForm.name || !gForm.target) return;
    setGoals(prev => [...prev, { ...gForm, id: crypto.randomUUID(), target: Number(gForm.target), saved: Number(gForm.saved||0), monthly: Number(gForm.monthly||0) }]);
    setGForm({ name: "", target: "", saved: "", monthly: "", emoji: "🎯" });
    setShowAddGoal(false);
  };

  const addEmergencyFund = () => {
    setGoals(prev => [...prev, { id: crypto.randomUUID(), name: "Emergency Fund", emoji: "🛡️", target: salary * 6, saved: 0, monthly: Math.round(salary * 0.1) }]);
  };

  const addWish = () => {
    if (!wForm.name) return;
    setWishlist(prev => [...prev, { ...wForm, id: crypto.randomUUID(), price: Number(wForm.price||0) }]);
    setWForm({ name: "", price: "" });
    setShowAddWish(false);
  };

  const deleteGoal = (id) => setGoals(prev => prev.filter(x => x.id !== id));
  const deleteWish = (id) => setWishlist(prev => prev.filter(x => x.id !== id));

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 16, paddingTop: 8 }}>🎯 Goals & Savings</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Btn T={T} onClick={() => setShowAddGoal(p => !p)} style={{ flex: 1 }}>+ New Goal</Btn>
        <Btn T={T} onClick={addEmergencyFund} secondary style={{ flex: 1 }}>🛡️ Emergency Fund</Btn>
      </div>
      {showAddGoal && (
        <Card T={T} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: T.text }}>New Savings Goal</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {EMOJI_GRID.map(em => (
              <button key={em} onClick={() => setGForm(f => ({...f, emoji: em}))} style={{ fontSize: 20, background: gForm.emoji === em ? T.accent+"33" : "transparent", border: gForm.emoji === em ? `1px solid ${T.accent}` : "1px solid transparent", borderRadius: 8, padding: 4, cursor: "pointer" }}>{em}</button>
            ))}
          </div>
          {[["name","Goal name","text"],["target","Target amount","number"],["saved","Already saved","number"],["monthly","Monthly contribution","number"]].map(([k,ph,tp]) => (
            <input key={k} type={tp} placeholder={ph} value={gForm[k]} onChange={e => setGForm(f => ({...f,[k]:e.target.value}))}
              style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          ))}
          <Btn T={T} onClick={addGoal} style={{ width: "100%" }}>Add Goal</Btn>
        </Card>
      )}
      {goals.length === 0 && !showAddGoal && <div style={{ textAlign: "center", color: T.muted, padding: 32 }}>No goals yet. Add one!</div>}
      {goals.map(g => {
        const pct = g.target > 0 ? Math.min(100, g.saved / g.target * 100) : 0;
        const monthsLeft = g.monthly > 0 ? Math.ceil((g.target - g.saved) / g.monthly) : null;
        const isConfirming = confirmDelete === g.id;
        return (
          <Card key={g.id} T={T} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 28 }}>{g.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, color: T.text }}>{g.name}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{fmt(g.saved)} of {fmt(g.target)}</div>
                  {monthsLeft && <div style={{ color: T.accent, fontSize: 12 }}>{monthsLeft} months to go</div>}
                </div>
              </div>
              <button onClick={(ev) => handleDeleteWithConfirm(g.id, deleteGoal, ev)}
                style={{ color: isConfirming ? "#fff" : "#ef4444", background: isConfirming ? "#ef4444" : "transparent", border: isConfirming ? "1px solid #ef4444" : "none", cursor: "pointer", fontSize: isConfirming ? 11 : 16, borderRadius: 6, padding: isConfirming ? "4px 8px" : 0, fontWeight: isConfirming ? 600 : 400 }}>
                {isConfirming ? "Sure? ✓" : "🗑"}
              </button>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: T.border, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.accent2})`, borderRadius: 8 }} />
            </div>
            <div style={{ textAlign: "right", color: T.muted, fontSize: 12, marginTop: 4 }}>{pct.toFixed(0)}%</div>
          </Card>
        );
      })}

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>🛒 Wishlist</div>
          <Btn T={T} onClick={() => setShowAddWish(p => !p)} small>+ Add</Btn>
        </div>
        {showAddWish && (
          <Card T={T} style={{ marginBottom: 12 }}>
            <input type="text" placeholder="Item name" value={wForm.name} onChange={e => setWForm(f => ({...f, name: e.target.value}))}
              style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
            <input type="number" placeholder="Price (optional)" value={wForm.price} onChange={e => setWForm(f => ({...f, price: e.target.value}))}
              style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
            <Btn T={T} onClick={addWish} style={{ width: "100%" }}>Add to Wishlist</Btn>
          </Card>
        )}
        {wishlist.map(w => {
          const isConfirming = confirmDelete === w.id;
          return (
            <Card key={w.id} T={T} style={{ marginBottom: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: T.text, fontWeight: 600 }}>{w.name}</div>
                {w.price > 0 && <div style={{ color: T.muted, fontSize: 12 }}>{fmt(w.price)}</div>}
              </div>
              <button onClick={(ev) => handleDeleteWithConfirm(w.id, deleteWish, ev)}
                style={{ color: isConfirming ? "#fff" : "#ef4444", background: isConfirming ? "#ef4444" : "transparent", border: isConfirming ? "1px solid #ef4444" : "none", cursor: "pointer", fontSize: isConfirming ? 11 : 16, borderRadius: 6, padding: isConfirming ? "4px 8px" : 0, fontWeight: isConfirming ? 600 : 400 }}>
                {isConfirming ? "Sure? ✓" : "🗑"}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ReportsTab({ T, expenses, cycleExpenses, allCats, spentByCat, salary, fmt, subs, emis, remaining, noSpendStreak }) {
  const [shareToast, setShareToast] = useState(null);

  const pieData = useMemo(() =>
    allCats.map(c => ({ name: c.label, value: spentByCat[c.id] || 0, color: c.color })).filter(d => d.value > 0),
    [spentByCat, allCats]
  );

  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key   = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("en-IN", { month: "short" });
      const total = expenses.filter(e => e.date?.startsWith(key)).reduce((a, e) => a + Number(e.amount), 0);
      months.push({ name: label, amount: total });
    }
    return months;
  }, [expenses]);

  const heatData = useMemo(() => {
    const now    = new Date();
    const days   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const prefix = now.toISOString().slice(0, 7);
    const amts   = Array.from({length: days}, (_, i) => {
      const d = `${prefix}-${String(i+1).padStart(2,"0")}`;
      return expenses.filter(e => e.date === d).reduce((a, e) => a + Number(e.amount), 0);
    });
    const maxSpend = Math.max(1, ...amts);
    return amts.map((amt, i) => ({ day: i+1, amt, pct: amt / maxSpend }));
  }, [expenses]);

  const totalSpent = useMemo(() =>
    cycleExpenses.reduce((a, e) => a + Number(e.amount), 0),
    [cycleExpenses]
  );

  const smartInsights = useMemo(() => {
    const insights = [];
    const byDate = {};
    cycleExpenses.forEach(e => { byDate[e.date] = (byDate[e.date] || 0) + Number(e.amount); });
    const dates = Object.entries(byDate).sort((a, b) => b[1] - a[1]);
    if (dates.length > 0) {
      insights.push({ icon: "📅", text: `Biggest day: ${new Date(dates[0][0]).toLocaleDateString("en-IN", {day:"numeric",month:"short"})} — ${fmt(dates[0][1])}` });
    }
    const cashTotal = cycleExpenses.filter(e => e.method === "cash").reduce((a,e) => a + Number(e.amount), 0);
    const cashPct   = totalSpent > 0 ? (cashTotal / totalSpent * 100).toFixed(0) : 0;
    if (totalSpent > 0) {
      if (cashPct > 50) insights.push({ icon: "💵", text: `${cashPct}% cash spending — consider going digital for better tracking` });
      else insights.push({ icon: "💳", text: `${100 - cashPct}% digital — great tracking discipline!` });
    }
    const unusedSubs = subs.filter(s => s.unused);
    if (unusedSubs.length > 0) {
      const unusedCost = unusedSubs.reduce((a,s) => a + (s.cycle === "annual" ? s.amount/12 : Number(s.amount)), 0);
      insights.push({ icon: "📱", text: `Wasting ${fmt(Math.round(unusedCost))}/month on ${unusedSubs.length} unused subscription(s)` });
    }
    const emiTotal = emis.reduce((a,e) => a + Number(e.monthly || 0), 0);
    const emiPct   = salary > 0 ? (emiTotal / salary * 100).toFixed(0) : 0;
    if (emiPct > 40) insights.push({ icon: "🏦", text: `EMI burden at ${emiPct}% — financial experts recommend keeping this under 40%` });
    else if (emiPct > 0) insights.push({ icon: "🏦", text: `EMI burden at ${emiPct}% — healthy range!` });
    const savingsRate = salary > 0 ? (Math.max(0, remaining) / salary * 100).toFixed(0) : 0;
    if (savingsRate >= 20) insights.push({ icon: "🌟", text: `Saving ${savingsRate}% of salary — excellent!` });
    else if (savingsRate >= 10) insights.push({ icon: "💰", text: `Saving ${savingsRate}% — try to reach 20%` });
    else if (salary > 0) insights.push({ icon: "⚠️", text: `Only saving ${savingsRate}% — consider cutting discretionary spending` });
    const catCounts = {};
    cycleExpenses.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
    const topCatByCount = Object.entries(catCounts).sort((a,b) => b[1]-a[1])[0];
    if (topCatByCount) {
      const cat = allCats.find(c => c.id === topCatByCount[0]);
      if (cat) insights.push({ icon: "🔁", text: `Most frequent: ${cat.emoji} ${cat.label} (${topCatByCount[1]} transactions)` });
    }
    return insights;
  }, [cycleExpenses, totalSpent, subs, emis, salary, remaining, allCats, fmt]);

  const handleShare = async () => {
    const now         = new Date();
    const monthName   = now.toLocaleString("en-IN", { month: "long" });
    const year        = now.getFullYear();
    const savingsRate = salary > 0 ? (Math.max(0, remaining) / salary * 100).toFixed(0) : 0;
    const topCat      = [...pieData].sort((a,b) => b.value - a.value)[0]?.name || "–";
    const text = `─────────────────────────
📊 ${monthName} ${year} Report
💰 Salary: ${fmt(salary)}
💸 Spent: ${fmt(totalSpent)}
🏦 Saved: ${fmt(Math.max(0, remaining))} (${savingsRate}%)
📋 Transactions: ${cycleExpenses.length}
🔥 No-Spend Streak: ${noSpendStreak} days
🏆 Top Category: ${topCat}
─────────────────────────
Tracked with Salary Tracker App
─────────────────────────`;
    try {
      if (navigator.share) { await navigator.share({ text }); setShareToast("Report shared! 🎉"); }
      else { await navigator.clipboard.writeText(text); setShareToast("Report copied to clipboard! 📋"); }
      setTimeout(() => setShareToast(null), 2500);
    } catch {
      try { await navigator.clipboard.writeText(text); setShareToast("Report copied to clipboard! 📋"); setTimeout(() => setShareToast(null), 2500); } catch {}
    }
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {shareToast && (
        <div className="fade-in" style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#fff", padding: "10px 20px", borderRadius: 12, fontWeight: 600, zIndex: 200 }}>{shareToast}</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingTop: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>📈 Reports</div>
        <button onClick={handleShare} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 600 }}>Share 📤</button>
      </div>

      {pieData.length > 0 && (
        <Card T={T} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Spending by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 11, color: T.muted }}>{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Last 6 Months</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 11 }} />
            <YAxis tick={{ fill: T.muted, fontSize: 10 }} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text }} />
            <Bar dataKey="amount" fill={T.accent} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Spending Heatmap — This Month</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {heatData.map(d => (
            <div key={d.day} title={`Day ${d.day}: ${fmt(d.amt)}`}
              style={{ width: 32, height: 32, borderRadius: 6, background: d.amt === 0 ? T.border : `rgba(16,185,129,${0.2 + d.pct * 0.8})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.muted, fontWeight: 600 }}>
              {d.day}
            </div>
          ))}
        </div>
      </Card>

      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>💡 Insights</div>
        {smartInsights.length === 0
          ? <div style={{ color: T.muted, textAlign: "center", padding: 16 }}>Add some expenses to see insights</div>
          : smartInsights.map((ins, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < smartInsights.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 18 }}>{ins.icon}</span>
              <span style={{ color: T.text, fontSize: 14 }}>{ins.text}</span>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

function MoreTab({ T, moreTab, setMoreTab, emis, setEmis, subs, setSubs, splits, setSplits, salary, fmt, confirmDelete, handleDeleteWithConfirm }) {
  return (
    <div className="fade-in" style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 16, paddingTop: 8 }}>⚙️ More</div>
      <div style={{ display: "flex", background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 20, overflow: "hidden" }}>
        {["emi","subs","splits"].map(t => (
          <button key={t} onClick={() => setMoreTab(t)}
            style={{ flex: 1, padding: "12px 0", border: "none", background: moreTab === t ? T.accent : "transparent", color: moreTab === t ? "#fff" : T.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            {t === "emi" ? "🏦 EMI" : t === "subs" ? "📱 Subs" : "🤝 Splits"}
          </button>
        ))}
      </div>
      {moreTab === "emi"    && <EMITab    T={T} emis={emis}       setEmis={setEmis}       salary={salary} fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
      {moreTab === "subs"   && <SubsTab   T={T} subs={subs}       setSubs={setSubs}                       fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
      {moreTab === "splits" && <SplitsTab T={T} splits={splits}   setSplits={setSplits}                   fmt={fmt} confirmDelete={confirmDelete} handleDeleteWithConfirm={handleDeleteWithConfirm} />}
    </div>
  );
}

function EMITab({ T, emis, setEmis, salary, fmt, confirmDelete, handleDeleteWithConfirm }) {
  const [form, setForm] = useState({ name: "", total: "", monthly: "", rate: "", startDate: today(), tenure: "" });
  const [show, setShow] = useState(false);
  const totalEMI = emis.reduce((a, e) => a + Number(e.monthly||0), 0);
  const emiPct   = salary ? (totalEMI / salary * 100).toFixed(1) : 0;

  const add = () => {
    if (!form.name || !form.monthly) return;
    setEmis(prev => [...prev, { ...form, id: crypto.randomUUID(), monthly: Number(form.monthly), total: Number(form.total||0), tenure: Number(form.tenure||0) }]);
    setForm({ name: "", total: "", monthly: "", rate: "", startDate: today(), tenure: "" });
    setShow(false);
  };

  const deleteEmi = (id) => setEmis(prev => prev.filter(x => x.id !== id));

  return (
    <div>
      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ color: T.muted, fontSize: 12 }}>Total EMI/month</div><div style={{ fontWeight: 700, fontSize: 22, color: T.text }}>{fmt(totalEMI)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ color: T.muted, fontSize: 12 }}>of salary</div><div style={{ fontWeight: 700, fontSize: 22, color: emiPct > 40 ? "#ef4444" : T.accent }}>{emiPct}%</div></div>
        </div>
        {emiPct > 40 && <div style={{ marginTop: 8, color: "#ef4444", fontSize: 12, fontWeight: 600 }}>⚠️ EMI exceeds 40% of salary — high debt burden!</div>}
      </Card>
      <Btn T={T} onClick={() => setShow(p => !p)} style={{ width: "100%", marginBottom: 12 }}>+ Add EMI</Btn>
      {show && (
        <Card T={T} style={{ marginBottom: 12 }}>
          {[["name","EMI name","text"],["total","Total loan amount","number"],["monthly","Monthly EMI","number"],["rate","Interest rate %","number"],["tenure","Tenure (months)","number"]].map(([k,ph,tp]) => (
            <input key={k} type={tp} placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
              style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          ))}
          <Label T={T}>Start Date</Label>
          <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <Btn T={T} onClick={add} style={{ width: "100%" }}>Add EMI</Btn>
        </Card>
      )}
      {emis.map(e => {
        const start = new Date(e.startDate);
        const end   = new Date(start); end.setMonth(end.getMonth() + e.tenure);
        const monthsLeft = Math.max(0, Math.ceil((end - new Date()) / 2592000000));
        const isConfirming = confirmDelete === e.id;
        return (
          <Card key={e.id} T={T} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{e.name}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{fmt(e.monthly)}/month · {monthsLeft} months left</div>
                {e.rate && <div style={{ color: T.muted, fontSize: 12 }}>{e.rate}% interest · Total: {fmt(e.total)}</div>}
              </div>
              <button onClick={(ev) => handleDeleteWithConfirm(e.id, deleteEmi, ev)}
                style={{ color: isConfirming ? "#fff" : "#ef4444", background: isConfirming ? "#ef4444" : "transparent", border: isConfirming ? "1px solid #ef4444" : "none", cursor: "pointer", fontSize: isConfirming ? 11 : 16, borderRadius: 6, padding: isConfirming ? "4px 8px" : 0, fontWeight: isConfirming ? 600 : 400 }}>
                {isConfirming ? "Sure? ✓" : "🗑"}
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SubsTab({ T, subs, setSubs, fmt, confirmDelete, handleDeleteWithConfirm }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", cycle: "monthly", renewal: today(), unused: false });
  const totalMonthly = subs.reduce((a, s) => a + (s.cycle === "annual" ? s.amount/12 : Number(s.amount||0)), 0);

  const add = () => {
    if (!form.name || !form.amount) return;
    setSubs(prev => [...prev, { ...form, id: crypto.randomUUID(), amount: Number(form.amount) }]);
    setForm({ name: "", amount: "", cycle: "monthly", renewal: today(), unused: false });
    setShow(false);
  };

  const renewalAlert = (d) => {
    const diff = (new Date(d) - new Date()) / 86400000;
    return diff >= 0 && diff <= 7;
  };

  const deleteSub = (id) => setSubs(prev => prev.filter(x => x.id !== id));

  return (
    <div>
      <Card T={T} style={{ marginBottom: 16 }}>
        <div style={{ color: T.muted, fontSize: 12 }}>Monthly Subscription Burn</div>
        <div style={{ fontWeight: 700, fontSize: 26, color: T.text }}>{fmt(Math.round(totalMonthly))}</div>
      </Card>
      <Btn T={T} onClick={() => setShow(p => !p)} style={{ width: "100%", marginBottom: 12 }}>+ Add Subscription</Btn>
      {show && (
        <Card T={T} style={{ marginBottom: 12 }}>
          <input type="text" placeholder="Name (e.g. Netflix)" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 8 }}>
            {["monthly","annual"].map(c => (
              <button key={c} onClick={() => setForm(f => ({...f, cycle: c}))} style={{ flex: 1, padding: "10px 0", border: "none", background: form.cycle === c ? T.accent : T.card, color: form.cycle === c ? "#fff" : T.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {c === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
          <Label T={T}>Renewal Date</Label>
          <input type="date" value={form.renewal} onChange={e => setForm(f => ({...f, renewal: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <Btn T={T} onClick={add} style={{ width: "100%" }}>Add Subscription</Btn>
        </Card>
      )}
      {subs.map(s => {
        const isConfirming = confirmDelete === s.id;
        return (
          <Card key={s.id} T={T} style={{ marginBottom: 10, opacity: s.unused ? 0.5 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text, textDecoration: s.unused ? "line-through" : "none" }}>{s.name}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{fmt(s.amount)}/{s.cycle} {s.cycle === "annual" ? `(${fmt(Math.round(s.amount/12))}/mo)` : ""}</div>
                {renewalAlert(s.renewal) && <div style={{ color: "#f59e0b", fontSize: 12 }}>⚠️ Renews soon: {new Date(s.renewal).toLocaleDateString("en-IN")}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setSubs(prev => prev.map(x => x.id === s.id ? {...x, unused: !x.unused} : x))} style={{ color: T.muted, background: "transparent", border: "none", cursor: "pointer", fontSize: 12 }}>{s.unused ? "Activate" : "Unused"}</button>
                <button onClick={(ev) => handleDeleteWithConfirm(s.id, deleteSub, ev)}
                  style={{ color: isConfirming ? "#fff" : "#ef4444", background: isConfirming ? "#ef4444" : "transparent", border: isConfirming ? "1px solid #ef4444" : "none", cursor: "pointer", fontSize: isConfirming ? 11 : 16, borderRadius: 6, padding: isConfirming ? "4px 8px" : 0, fontWeight: isConfirming ? 600 : 400 }}>
                  {isConfirming ? "Sure? ✓" : "🗑"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SplitsTab({ T, splits, setSplits, fmt, confirmDelete, handleDeleteWithConfirm }) {
  const [show,        setShow]        = useState(false);
  const [showSettled, setShowSettled] = useState(false);
  const [form, setForm] = useState({ desc: "", person: "", amount: "", direction: "i_owe" });

  const add = () => {
    if (!form.desc || !form.amount || !form.person) return;
    setSplits(prev => [...prev, { ...form, id: crypto.randomUUID(), amount: Number(form.amount), settled: false }]);
    setForm({ desc: "", person: "", amount: "", direction: "i_owe" });
    setShow(false);
  };

  const unsettled  = splits.filter(s => !s.settled);
  const settled    = splits.filter(s =>  s.settled);
  const deleteSplit = (id) => setSplits(prev => prev.filter(x => x.id !== id));

  return (
    <div>
      <Btn T={T} onClick={() => setShow(p => !p)} style={{ width: "100%", marginBottom: 12 }}>+ Add Split</Btn>
      {show && (
        <Card T={T} style={{ marginBottom: 12 }}>
          <input type="text"   placeholder="Description"  value={form.desc}   onChange={e => setForm(f => ({...f, desc:   e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <input type="text"   placeholder="Person name"  value={form.person} onChange={e => setForm(f => ({...f, person: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <input type="number" placeholder="Amount"       value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 8 }}>
            {["i_owe","they_owe"].map(d => (
              <button key={d} onClick={() => setForm(f => ({...f, direction: d}))} style={{ flex: 1, padding: "10px 0", border: "none", background: form.direction === d ? T.accent : T.card, color: form.direction === d ? "#fff" : T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {d === "i_owe" ? "I Owe" : "They Owe"}
              </button>
            ))}
          </div>
          <Btn T={T} onClick={add} style={{ width: "100%" }}>Add Split</Btn>
        </Card>
      )}
      {unsettled.length === 0 && <div style={{ textAlign: "center", color: T.muted, padding: 24 }}>No pending splits</div>}
      {unsettled.map(s => {
        const isConfirming = confirmDelete === s.id;
        return (
          <Card key={s.id} T={T} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{s.desc}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{s.direction === "i_owe" ? `You owe ${s.person}` : `${s.person} owes you`}</div>
                <div style={{ color: s.direction === "i_owe" ? "#ef4444" : "#10b981", fontWeight: 700 }}>{fmt(s.amount)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSplits(prev => prev.map(x => x.id === s.id ? {...x, settled: true} : x))} style={{ background: "#10b98120", border: "1px solid #10b98140", color: "#10b981", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Settle</button>
                <button onClick={(ev) => handleDeleteWithConfirm(s.id, deleteSplit, ev)}
                  style={{ color: isConfirming ? "#fff" : "#ef4444", background: isConfirming ? "#ef4444" : "transparent", border: isConfirming ? "1px solid #ef4444" : "none", cursor: "pointer", fontSize: isConfirming ? 11 : 16, borderRadius: 6, padding: isConfirming ? "4px 8px" : 0, fontWeight: isConfirming ? 600 : 400 }}>
                  {isConfirming ? "Sure? ✓" : "🗑"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}
      {settled.length > 0 && (
        <button onClick={() => setShowSettled(p => !p)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginTop: 8 }}>
          {showSettled ? "Hide" : "Show"} {settled.length} settled
        </button>
      )}
      {showSettled && settled.map(s => (
        <Card key={s.id} T={T} style={{ marginBottom: 8, opacity: 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: T.muted, fontSize: 13, textDecoration: "line-through" }}>{s.desc} — {s.person}</div>
            <span style={{ color: T.muted, fontSize: 13 }}>{fmt(s.amount)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SettingsModal({ T, setup, setSetup, pin, setPin, themeMode, onTheme, expenses, setExpenses, budgets, goals, emis, subs, onClose, darkMode, currency, setCurrency, fmt, setBudgets, setGoals, setEmis, setSubs, setSplits, splits, wishlist, setWishlist, setCustomCats }) {
  const [editSalary,    setEditSalary]    = useState(setup.salary);
  const [editDay,       setEditDay]       = useState(setup.creditDay);
  const [currentPin,    setCurrentPin]    = useState("");
  const [newPin,        setNewPin]        = useState("");
  const [pinError,      setPinError]      = useState("");
  const [clearConfirm,  setClearConfirm]  = useState(false);
  const [importConfirm, setImportConfirm] = useState(false);

  useEffect(() => {
    if (importConfirm) {
      const timer = setTimeout(() => setImportConfirm(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [importConfirm]);

  const exportJSON = () => {
    const data = { setup, expenses, budgets, goals, emis, subs, splits, wishlist, currency };
    const a = document.createElement("a"); a.href = "data:application/json," + encodeURIComponent(JSON.stringify(data));
    a.download = "salary_tracker_backup.json"; a.click();
  };

  const handleImportClick = () => {
    if (!importConfirm) { setImportConfirm(true); return; }
    importJSON();
  };

  const importJSON = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = (e) => {
        try {
          const d = JSON.parse(e.target.result);
          if (d.expenses) { setExpenses(d.expenses); save("expenses", d.expenses); }
          if (d.setup)    { setSetup(d.setup);        save("setup",    d.setup);    }
          if (d.budgets)  { setBudgets(d.budgets);    save("budgets",  d.budgets);  }
          if (d.goals)    { setGoals(d.goals);         save("goals",    d.goals);    }
          if (d.emis)     { setEmis(d.emis);           save("emis",     d.emis);     }
          if (d.subs)     { setSubs(d.subs);           save("subs",     d.subs);     }
          if (d.splits)   { setSplits(d.splits);       save("splits",   d.splits);   }
          if (d.wishlist) { setWishlist(d.wishlist);   save("wishlist", d.wishlist); }
          if (d.currency) { setCurrency(d.currency);   save("currency", d.currency); }
          setImportConfirm(false);
        } catch { alert("Invalid backup file"); }
      }; r.readAsText(f);
    };
    input.click();
  };

  const clearAll = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const handlePinChange = () => {
    if (pin && currentPin !== pin) { setPinError("Incorrect current PIN"); return; }
    setPinError("");
    setPin(newPin.length === 4 ? newPin : null);
    setNewPin(""); setCurrentPin("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div className="slide-up" style={{ position: "relative", background: T.bg3 === "#ffffff" ? "#fff" : "#111827", borderRadius: "24px 24px 0 0", padding: "20px 20px 48px", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>⚙️ Settings</div>
          <button onClick={onClose} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: T.muted }}>✕</button>
        </div>

        <Section T={T} title="💱 Currency">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => setCurrency(c)}
                style={{ padding: "8px 12px", borderRadius: 10, border: `2px solid ${currency.code === c.code ? T.accent : T.border}`, background: currency.code === c.code ? T.accent + "22" : T.card, color: currency.code === c.code ? T.accent : T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {c.symbol} {c.label}
              </button>
            ))}
          </div>
        </Section>

        <Section T={T} title="💰 Salary">
          <Label T={T}>Monthly Salary</Label>
          <input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <Label T={T}>Credit Day</Label>
          <input type="number" min={1} max={28} value={editDay} onChange={e => setEditDay(e.target.value)} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <Btn T={T} onClick={() => setSetup({ salary: Number(editSalary), creditDay: Number(editDay) })} style={{ width: "100%" }}>Save</Btn>
        </Section>

        <Section T={T} title="🔒 PIN Lock">
          {pin && <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>PIN is currently set.</div>}
          {pin && (
            <>
              <Label T={T}>Current PIN</Label>
              <input type="number" placeholder="Enter current PIN" value={currentPin} onChange={e => { setCurrentPin(e.target.value.slice(0,4)); setPinError(""); }}
                style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
              {pinError && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{pinError}</div>}
            </>
          )}
          <Label T={T}>New PIN (4 digits, blank to remove)</Label>
          <input type="number" placeholder="New 4-digit PIN" value={newPin} onChange={e => setNewPin(e.target.value.slice(0,4))} style={{ ...inputStyle(T), width: "100%", marginBottom: 8 }} />
          <Btn T={T} onClick={handlePinChange} style={{ width: "100%" }}>{newPin.length === 4 ? "Set PIN" : "Remove PIN"}</Btn>
        </Section>

        <Section T={T} title="🎨 Theme">
          <div style={{ display: "flex", gap: 8 }}>
            {["device","light","dark"].map(m => (
              <button key={m} onClick={() => onTheme(m)} className="btn-press"
                style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `2px solid ${themeMode === m ? T.accent : T.border}`, background: themeMode === m ? T.accent+"22" : T.card, color: themeMode === m ? T.accent : T.muted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {m === "device" ? "Auto" : m === "light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            ))}
          </div>
        </Section>

        <Section T={T} title="💾 Backup">
          <div style={{ display: "flex", gap: 8 }}>
            <Btn T={T} onClick={exportJSON} style={{ flex: 1 }}>⬇ Export</Btn>
            <Btn T={T} onClick={handleImportClick} secondary style={{ flex: 1, background: importConfirm ? "#f59e0b" : undefined, color: importConfirm ? "#fff" : undefined, border: importConfirm ? "1px solid #f59e0b" : undefined }}>
              {importConfirm ? "Tap again to confirm" : "⬆ Import"}
            </Btn>
          </div>
          {importConfirm && <div style={{ color: "#f59e0b", fontSize: 12, marginTop: 8 }}>⚠️ This will replace ALL your data</div>}
        </Section>

        <Section T={T} title="⚠️ Danger Zone">
          <button onClick={clearAll} className="btn-press"
            style={{ width: "100%", padding: "12px", borderRadius: 12, background: clearConfirm ? "#ef4444" : "#ef444420", border: "1px solid #ef444440", color: clearConfirm ? "#fff" : "#ef4444", fontWeight: 700, cursor: "pointer" }}>
            {clearConfirm ? "⚠️ Tap again to confirm — this is irreversible!" : "🗑 Clear All Data"}
          </button>
        </Section>

        <div style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 16 }}>Salary Expense Tracker v1.0</div>
      </div>
    </div>
  );
}

function Card({ T, children, style }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16, backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

function Label({ T, children }) {
  return <div style={{ color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 }}>{children}</div>;
}

function Section({ T, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, color: T.muted, fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

function Btn({ T, children, onClick, secondary, small, style }) {
  return (
    <button onClick={onClick} className="btn-press"
      style={{ padding: small ? "7px 14px" : "12px 20px", borderRadius: 12, border: secondary ? `1px solid ${T.border}` : "none", background: secondary ? T.card : `linear-gradient(135deg, ${T.accent}, ${T.accent}cc)`, color: secondary ? T.text : "#fff", fontWeight: 700, fontSize: small ? 12 : 14, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

function Toggle({ on, onToggle, T }) {
  return (
    <div onClick={onToggle} style={{ width: 48, height: 26, borderRadius: 13, background: on ? T.accent : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

const inputStyle = (T) => ({
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
  padding: "10px 14px", color: T.text, fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif",
});