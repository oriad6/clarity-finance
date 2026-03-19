/**
 * Clarity — Personal Finance & Savings Tracker
 * Stack: React + Tailwind CSS + Supabase + Lucide Icons + Recharts
 */

import { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut,
  ChevronRight, ChevronDown, DollarSign, Calendar, Repeat, Hash, X,
  Eye, EyeOff, BarChart3, List, Wallet, Loader2, CheckCircle,
  AlertCircle, Pencil, SplitSquareVertical, PiggyBank, Briefcase,
  Building2, Banknote, Gift, GraduationCap, ArrowDownCircle, Download, FileSpreadsheet
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// ─── Supabase ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rqjryuvqwahiyatbwodt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxanJ5dXZxd2FoaXlhdGJ3b2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDU5MDcsImV4cCI6MjA4OTQyMTkwN30.9TlvR_ddHoCGvZfgVmNazpL3eqUcWdTfVBkrTBtGK1I";

async function supabaseFetch(path, options = {}) {
  const token = localStorage.getItem("sb_token");
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`, Prefer: "return=representation", ...(options.headers || {}) },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Request failed"); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function authFetch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Auth failed");
  return data;
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const s = localStorage.getItem("sb_user"); if (s) setUser(JSON.parse(s));
    const n = localStorage.getItem("user_name"); if (n) setUserName(n);
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const data = await authFetch("/token?grant_type=password", { email, password });
    localStorage.setItem("sb_token", data.access_token); localStorage.setItem("sb_user", JSON.stringify(data.user)); setUser(data.user);
    const n = localStorage.getItem("user_name"); if (n) setUserName(n);
  };
  const signup = async (email, password, name) => {
    const data = await authFetch("/signup", { email, password });
    if (data.access_token) {
      localStorage.setItem("sb_token", data.access_token); localStorage.setItem("sb_user", JSON.stringify(data.user)); setUser(data.user);
      if (name) { localStorage.setItem("user_name", name); setUserName(name); }
    } else throw new Error("Check your email to confirm your account.");
  };
  const logout = () => { localStorage.removeItem("sb_token"); localStorage.removeItem("sb_user"); setUser(null); };
  return <AuthContext.Provider value={{ user, userName, login, signup, logout, loading }}>{children}</AuthContext.Provider>;
}

// ─── Language Context ─────────────────────────────────────────────────────────
const LanguageContext = createContext(null);
const STRINGS = {
  en: {
    appName: "Clarity", overview: "Overview", transactions: "Transactions", goals: "Goals", assets: "Assets", signOut: "Sign Out",
    monthlyIncome: "Monthly Income", totalExpenses: "Total Expenses", monthlySavings: "Monthly Savings", checkingBalance: "Checking Balance",
    savingsRate: "savings rate", expenseBreakdown: "Expense Breakdown", noExpenses: "No expenses yet", savingsGoals: "Savings Goals", viewAll: "View All",
    addCategory: "Add Category", addExpense: "Add Expense", addGoal: "Add Goal", totalExpensesLabel: "Total Expenses",
    edit: "Edit", delete: "Delete", language: "Language", currency: "Currency", theme: "Theme", light: "Light", dark: "Dark",
    incomeAmountLabel: "Income Amount", amountLabel: "Amount", targetAmountLabel: "Target Amount", targetDateLabel: "Target Date", goalNameLabel: "Goal Name",
    addSavingsGoal: "Add Savings Goal", editSavingsGoal: "Edit Savings Goal", addSavingsGoalCta: "Add Goal", editSavingsGoalCta: "Save Goal",
    addExpenseTitle: "Add Expense", editExpenseTitle: "Edit Expense", addExpenseCta: "Add Expense", editExpenseCta: "Save Changes",
    recurring: "Recurring", oneTime: "One-time", installments: "Installments", installmentsCount: "Number of Installments",
    onTrack: "On track with current savings", needMorePerMonth: "Need {amount} more/month to reach goal",
    donutTitle: "Monthly Expenses by Category", noDataForMonth: "No data for this period", noDataForMonthSub: "Try a different month or add transactions.",
    confirmDeleteExpense: "Delete this expense?", confirmDeleteGoal: "Delete this goal?",
    confirmDeleteAsset: "Delete this asset?", confirmDeleteIncome: "Delete this income entry?",
    confirmDeleteMsg: "This action cannot be undone.", cancel: "Cancel",
    confirmDeleteInstallments: "Delete all installments?",
    confirmDeleteInstallmentsMsg: "This will delete all monthly installments for this purchase.",
    totalOf: "of total",
    totalPurchaseAmount: "Total Purchase Amount",
    monthlyPayment: "Monthly payment",
    checkingBalanceLabel: "Current Checking Balance", editCheckingBalance: "Edit Balance",
    assetsTitle: "My Assets", addAsset: "Add Asset", editAsset: "Edit Asset",
    assetName: "Asset Name", assetType: "Asset Type", assetValue: "Current Value",
    assetTypePension: "Pension Fund (קופת גמל)", assetTypePortfolio: "Investment Portfolio",
    assetTypeMoney: "Money Market Fund (קרן כספית)", assetTypeChecking: "Checking Account",
    assetTypeSavings: "Savings Account", assetTypeOther: "Other",
    totalAssets: "Total Assets", netWorth: "Net Worth",
    additionalIncome: "Additional Income", addAdditionalIncome: "Add Income",
    incomeSource: "Source / Description", incomeType: "Income Type",
    incomeTypeBonus: "Bonus / Grant", incomeTypeScholarship: "Scholarship", incomeTypeFreelance: "Freelance",
    incomeTypeGift: "Gift", incomeTypeOther: "Other",
    additionalIncomeTitle: "Additional Income", totalAdditionalIncome: "Total Additional Income",
    noAssets: "No assets yet", noAdditionalIncome: "No additional income recorded",
    // Budget
    budgetVsActual: "Budget vs. Actual", setBudget: "Set Budget", budget: "Budget", actual: "Actual", variance: "Variance",
    noBudget: "No budget set", underBudget: "Under budget", overBudget: "Over budget",
    budgetedSavings: "Budgeted Savings", actualSavings: "Actual Savings",
    savingsProgress: "Savings Progress", vs: "vs",
    goalSaved: "Saved so far", goalRemaining: "Still needed",
    allocateSavings: "Allocate month savings to goals",
    monthClosed: "Month closed — savings allocated",
    saved: "saved", remaining: "remaining",
    addBudget: "Add Budget", editBudget: "Edit Budget",
    greeting: "Hello",
    checkingHistory: "Checking Account History",
    viewFullHistory: "View full history →",
    noHistory: "No history yet",
    exportData: "Export Data",
    exportDesc: "Download your financial data as CSV files, ready for Excel or Google Sheets.",
    exportExpenses: "Transactions",
    exportBudget: "Budget Summary",
    exportGoals: "Savings Goals",
    exportAssets: "Assets & Income",
    exportAll: "Export All (ZIP)",
    exportDownload: "Download",
    exportMonthly: "Monthly Summary",
  },
  he: {
    appName: "Clarity", overview: "סקירה", transactions: "תנועות", goals: "יעדים", assets: "נכסים", signOut: "יציאה",
    monthlyIncome: "הכנסה חודשית", totalExpenses: "הוצאות חודשיות", monthlySavings: "חיסכון חודשי", checkingBalance: "יתרה בעו\"ש",
    savingsRate: "אחוז חיסכון", expenseBreakdown: "פירוט הוצאות", noExpenses: "אין הוצאות עדיין", savingsGoals: "יעדי חיסכון", viewAll: "צפה בכל",
    addCategory: "הוסף קטגוריה", addExpense: "הוסף הוצאה", addGoal: "הוסף יעד", totalExpensesLabel: "סה\"כ הוצאות",
    edit: "עריכה", delete: "מחיקה", language: "שפה", currency: "מטבע", theme: "ערכת נושא", light: "בהיר", dark: "כהה",
    incomeAmountLabel: "גובה הכנסה", amountLabel: "סכום", targetAmountLabel: "סכום יעד", targetDateLabel: "תאריך יעד", goalNameLabel: "שם היעד",
    addSavingsGoal: "הוספת יעד חיסכון", editSavingsGoal: "עריכת יעד חיסכון", addSavingsGoalCta: "הוסף יעד", editSavingsGoalCta: "שמור יעד",
    addExpenseTitle: "הוספת הוצאה", editExpenseTitle: "עריכת הוצאה", addExpenseCta: "הוסף הוצאה", editExpenseCta: "שמור שינויים",
    recurring: "קבועה", oneTime: "חד פעמית", installments: "תשלומים", installmentsCount: "מספר תשלומים",
    onTrack: "אתה במסלול עם החיסכון הנוכחי", needMorePerMonth: "צריך עוד {amount} בחודש כדי לעמוד ביעד",
    donutTitle: "הוצאות חודשיות לפי קטגוריה", noDataForMonth: "אין נתונים לתקופה זו", noDataForMonthSub: "נסה חודש אחר או הוסף עסקאות חדשות.",
    confirmDeleteExpense: "למחוק את ההוצאה?", confirmDeleteGoal: "למחוק את היעד?",
    confirmDeleteAsset: "למחוק את הנכס?", confirmDeleteIncome: "למחוק את ההכנסה?",
    confirmDeleteMsg: "פעולה זו אינה ניתנת לביטול.", cancel: "ביטול",
    confirmDeleteInstallments: "למחוק את כל התשלומים?",
    confirmDeleteInstallmentsMsg: "פעולה זו תמחק את כל תשלומי החודשים של רכישה זו.",
    totalOf: "מסך",
    totalPurchaseAmount: "סכום הרכישה הכולל",
    monthlyPayment: "תשלום חודשי",
    checkingBalanceLabel: "יתרה נוכחית בעו\"ש", editCheckingBalance: "עדכן יתרה",
    assetsTitle: "הנכסים שלי", addAsset: "הוסף נכס", editAsset: "ערוך נכס",
    assetName: "שם הנכס", assetType: "סוג נכס", assetValue: "שווי נוכחי",
    assetTypePension: "קופת גמל", assetTypePortfolio: "תיק השקעות",
    assetTypeMoney: "קרן כספית", assetTypeChecking: "עובר ושב",
    assetTypeSavings: "חשבון חיסכון", assetTypeOther: "אחר",
    totalAssets: "סך הנכסים", netWorth: "שווי נטו",
    additionalIncome: "הכנסות נוספות", addAdditionalIncome: "הוסף הכנסה",
    incomeSource: "מקור / תיאור", incomeType: "סוג הכנסה",
    incomeTypeBonus: "בונוס / מענק", incomeTypeScholarship: "מלגה", incomeTypeFreelance: "פרילנס",
    incomeTypeGift: "מתנה", incomeTypeOther: "אחר",
    additionalIncomeTitle: "הכנסות חד-פעמיות ונוספות", totalAdditionalIncome: "סך הכנסות נוספות",
    noAssets: "אין נכסים עדיין", noAdditionalIncome: "אין הכנסות נוספות רשומות",
    // Budget
    budgetVsActual: "תקציב מול בפועל", setBudget: "הגדר תקציב", budget: "תקציב", actual: "בפועל", variance: "הפרש",
    noBudget: "אין תקציב מוגדר", underBudget: "תחת התקציב", overBudget: "חריגה מהתקציב",
    budgetedSavings: "חיסכון מתוכנן", actualSavings: "חיסכון בפועל",
    savingsProgress: "מצב החיסכון", vs: "מול",
    goalSaved: "נחסך עד כה", goalRemaining: "נותר לחסוך",
    allocateSavings: "הקצה חיסכון חודשי ליעדים",
    monthClosed: "החודש נסגר — החיסכון חולק",
    saved: "נחסך", remaining: "נותר",
    addBudget: "הוסף תקציב", editBudget: "ערוך תקציב",
    greeting: "שלום",
    checkingHistory: "היסטוריית העו\"ש",
    viewFullHistory: "צפה בהיסטוריה המלאה ←",
    noHistory: "אין היסטוריה עדיין",
    exportData: "ייצוא נתונים",
    exportDesc: "הורד את הנתונים הפיננסיים שלך כקבצי CSV, מוכנים לאקסל או Google Sheets.",
    exportExpenses: "עסקאות",
    exportBudget: "סיכום תקציב",
    exportGoals: "יעדי חיסכון",
    exportAssets: "נכסים והכנסות",
    exportAll: "ייצוא הכל (ZIP)",
    exportDownload: "הורדה",
    exportMonthly: "סיכום חודשי",
  },
};

function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const s = localStorage.getItem("lang") || "en";
    document.documentElement.dir = s === "he" ? "rtl" : "ltr";
    document.documentElement.lang = s;
    return s;
  });
  useEffect(() => { localStorage.setItem("lang", lang); document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; document.documentElement.lang = lang; }, [lang]);
  const t = useCallback((key, vars) => {
    const table = STRINGS[lang] || STRINGS.en;
    let str = table[key] || key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, String(v)); });
    return str;
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
function useLanguage() { return useContext(LanguageContext); }

// ─── Currency Context ─────────────────────────────────────────────────────────
const CurrencyContext = createContext(null);
function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "USD");
  useEffect(() => { localStorage.setItem("currency", currency); }, [currency]);
  const format = useCallback((amount) =>
    new Intl.NumberFormat(currency === "ILS" ? "he-IL" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount), [currency]);
  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, format]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
function useCurrency() { return useContext(CurrencyContext); }

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const s = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", s === "dark");
    return s;
  });
  useEffect(() => { localStorage.setItem("theme", theme); document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
function useTheme() { return useContext(ThemeContext); }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_INCOME = 8500;
const MOCK_CHECKING = 24300;
const MOCK_EXPENSES = [
  { id: "1", category: "Rent", amount: 2800, type: "recurring", created_at: "2026-03-01" },
  { id: "2", category: "Groceries", amount: 600, type: "recurring", created_at: "2026-03-02" },
  { id: "3", category: "Bills", amount: 350, type: "recurring", created_at: "2026-03-03" },
  { id: "4", category: "Going Out", amount: 400, type: "one-time", created_at: "2026-03-10" },
  // Flight Tickets: 1200 / 2 installments = 600/month. Month 1 = March, Month 2 = April.
  { id: "5a", category: "Flight Tickets", amount: 600, type: "installments", total_amount: 1200, installment_index: 1, installments_total: 2, installment_group_id: "grp5", created_at: "2026-03-05" },
  { id: "5b", category: "Flight Tickets", amount: 600, type: "installments", total_amount: 1200, installment_index: 2, installments_total: 2, installment_group_id: "grp5", created_at: "2026-04-05" },
];
const MOCK_GOALS = [
  { id: "g1", name: "Summer Trip to Thailand", target_amount: 5000, target_date: "2026-08-01", saved_amount: 800, created_at: "2026-03-01" },
  { id: "g2", name: "Emergency Fund", target_amount: 15000, target_date: "2026-12-31", saved_amount: 2400, created_at: "2026-03-01" },
];
const MOCK_CHECKING_HISTORY = [
  { year: 2025, month: 9,  balance: 20800, change: +1200, auto: true },
  { year: 2025, month: 10, balance: 21900, change: +1100, auto: true },
  { year: 2025, month: 11, balance: 22600, change: +700,  auto: true },
  { year: 2026, month: 0,  balance: 23100, change: +500,  auto: true },
  { year: 2026, month: 1,  balance: 23900, change: +800,  auto: true },
  { year: 2026, month: 2,  balance: 24300, change: +400,  auto: true },
];
const MOCK_BUDGETS = {
  "Rent": 2800, "Bills": 400, "Groceries": 700, "Going Out": 500,
  "Transport": 300, "Health": 200,
};
const MOCK_ASSETS = [
  { id: "a1", name: "קופת גמל מגדל", type: "pension", value: 48000, created_at: "2026-03-01" },
  { id: "a2", name: "תיק השקעות IBI", type: "portfolio", value: 32000, created_at: "2026-03-01" },
  { id: "a3", name: "קרן כספית מיטב", type: "money", value: 15000, created_at: "2026-03-01" },
];
const MOCK_ADDITIONAL_INCOME = [
  { id: "ai1", source: "University Scholarship", type: "scholarship", amount: 3200, created_at: "2026-03-01" },
];
const DEFAULT_CATEGORIES = ["Rent", "Bills", "Groceries", "Going Out", "Transport", "Health", "Subscriptions", "Miscellaneous"];

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmtWith = (n, fn) => fn ? fn(n) : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const monthsUntil = (date) => { const now = new Date(), t = new Date(date); return Math.max(1, (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth())); };
const ASSET_TYPES = ["pension", "portfolio", "money", "checking", "savings", "other"];
const INCOME_TYPES = ["bonus", "scholarship", "freelance", "gift", "other"];
const ASSET_ICONS = { pension: <PiggyBank size={16} />, portfolio: <TrendingUp size={16} />, money: <Banknote size={16} />, checking: <Wallet size={16} />, savings: <Building2 size={16} />, other: <Briefcase size={16} /> };
const INCOME_ICONS = { bonus: <Gift size={14} />, scholarship: <GraduationCap size={14} />, freelance: <Briefcase size={14} />, gift: <Gift size={14} />, other: <ArrowDownCircle size={14} /> };
const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES_HE = ["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => { const id = setTimeout(onDismiss, 3000); return () => clearTimeout(id); }, [onDismiss]);
  return (
    <div className={`fixed bottom-6 end-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium ${type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}{message}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400 ms-[52px]">{message}</p>
        </div>
        <div className="flex border-t border-sky-100 dark:border-zinc-800">
          <button onClick={onCancel} className="flex-1 py-3.5 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-sky-50 dark:hover:bg-zinc-800 transition border-e border-sky-100 dark:border-zinc-800">{t("cancel")}</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">{t("delete")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Month/Year Picker ────────────────────────────────────────────────────────
function MonthYearPicker({ selectedMonth, setSelectedMonth, monthLabel }) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedMonth.year);
  const { lang } = useLanguage();
  const monthNames = lang === "he" ? MONTH_NAMES_HE : MONTH_NAMES_EN;
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!e.target.closest("[data-monthpicker]")) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const prevM = () => setSelectedMonth(p => { const d = new Date(p.year, p.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const nextM = () => setSelectedMonth(p => { const d = new Date(p.year, p.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  return (
    <div className="flex items-center gap-2 mb-2">
      <button onClick={prevM} className="p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900/60 border border-sky-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition">
        <ChevronRight size={14} className={lang === "he" ? "" : "rotate-180"} />
      </button>
      <div className="relative" data-monthpicker>
        <button onClick={() => { setPickerYear(selectedMonth.year); setOpen(v => !v); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/60 border border-sky-200 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500 transition text-sm font-semibold text-slate-700 dark:text-zinc-200">
          <Calendar size={14} className="text-violet-500" />{monthLabel}
        </button>
        {open && (
          <div className="absolute top-full mt-2 z-50 w-72 bg-white dark:bg-zinc-900 border border-sky-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4"
            style={{ [lang === "he" ? "right" : "left"]: 0 }} data-monthpicker>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setPickerYear(y => y - 1)} className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-sky-50 dark:hover:bg-zinc-800 transition"><ChevronRight size={16} className={lang === "he" ? "" : "rotate-180"} /></button>
              <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{pickerYear}</span>
              <button onClick={() => setPickerYear(y => y + 1)} className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-sky-50 dark:hover:bg-zinc-800 transition"><ChevronRight size={16} className={lang === "he" ? "rotate-180" : ""} /></button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {monthNames.map((name, idx) => {
                const isSel = idx === selectedMonth.month && pickerYear === selectedMonth.year;
                return (
                  <button key={idx} onClick={() => { setSelectedMonth({ year: pickerYear, month: idx }); setOpen(false); }}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${isSel ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow" : "bg-sky-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-100 dark:hover:bg-zinc-700"}`}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <button onClick={nextM} className="p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900/60 border border-sky-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition">
        <ChevronRight size={14} className={lang === "he" ? "rotate-180" : ""} />
      </button>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const { login, signup } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") await login(email, password);
      else { await signup(email, password, name.trim()); setSuccess("Account created! You may need to verify your email."); }
    }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/60 dark:bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/50 dark:bg-cyan-500/8 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 mb-4 shadow-lg"><Wallet size={26} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Clarity</h1>
          <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Your personal finance companion</p>
        </div>
        <div className="bg-white/90 border border-sky-100 dark:bg-zinc-900/80 dark:border-zinc-800 rounded-2xl p-8 backdrop-blur shadow-sm">
          <div className="flex mb-6 bg-sky-50 dark:bg-zinc-800/60 rounded-xl p-1 gap-1">
            {["login","signup"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow" : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"}`}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <form onSubmit={handle} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Your name" className="w-full bg-sky-50 dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full bg-sky-50 dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? "text" : "password"} required placeholder="••••••••" className="w-full bg-sky-50 dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {error && <p className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2 shadow-lg">
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user, userName, logout } = useContext(AuthContext);
  const { t, lang, setLang } = useLanguage();
  const { format, currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();

  // ── Income model ──────────────────────────────────────────────────────────
  // selectedMonth must be declared first so getIncome can use it
  const [selectedMonth, setSelectedMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });

  // baseIncome: the default monthly income used for all months without an override
  // incomeOverrides: { "YYYY-M": amount } — specific overrides per month
  // incomeIsFixed: true = salary worker (base propagates), false = freelancer (edit per month)
  const [baseIncome, setBaseIncome] = useState(MOCK_INCOME);
  const [incomeOverrides, setIncomeOverrides] = useState({}); // e.g. { "2026-3": 9500 }
  const [incomeIsFixed, setIncomeIsFixed] = useState(true);
  // Helper: get effective income for a given {year, month}
  const getIncome = useCallback((year, month) => {
    const key = `${year}-${month}`;
    return incomeOverrides[key] !== undefined ? incomeOverrides[key] : baseIncome;
  }, [baseIncome, incomeOverrides]);
  // The income for the currently selected month
  const income = getIncome(selectedMonth.year, selectedMonth.month);
  const [checkingBalance, setCheckingBalance] = useState(MOCK_CHECKING);
  // checkingHistory: array of { year, month, balance, change, label }
  const [checkingHistory, setCheckingHistory] = useState(MOCK_CHECKING_HISTORY);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [additionalIncome, setAdditionalIncome] = useState(MOCK_ADDITIONAL_INCOME);
  const [budgets, setBudgets] = useState(MOCK_BUDGETS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  // Track the last month we auto-allocated so we don't double-allocate
  const [lastAllocatedMonth, setLastAllocatedMonth] = useState(() => {
    const s = localStorage.getItem("last_allocated_month");
    return s ? JSON.parse(s) : null;
  });
  const [checkingExpanded, setCheckingExpanded] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showCheckingModal, setShowCheckingModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });
  const askConfirm = (title, message, onConfirm) => setConfirmDialog({ title, message, onConfirm });

  // For the selected month: show actual expenses entered for that month,
  // PLUS auto-project recurring expenses from the most recent month they were entered
  // (if no expense of that category/type exists for the selected month yet)
  const filteredExpenses = useMemo(() => {
    const direct = expenses.filter(e => {
      const d = new Date(e.created_at);
      return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
    });
    // Get recurring expenses from any past month, deduplicated by category
    // (only add if not already present in the selected month)
    const directCategories = new Set(direct.filter(e => e.type === "recurring").map(e => e.category));
    const recurringFromPast = [];
    // Find the most recent instance of each recurring expense not already in this month
    const seen = new Set();
    [...expenses]
      .filter(e => e.type === "recurring")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // newest first
      .forEach(e => {
        const d = new Date(e.created_at);
        const isBeforeSelected = d.getFullYear() < selectedMonth.year ||
          (d.getFullYear() === selectedMonth.year && d.getMonth() < selectedMonth.month);
        if (isBeforeSelected && !directCategories.has(e.category) && !seen.has(e.category)) {
          seen.add(e.category);
          // Project into selected month as a virtual recurring entry
          const projectedDate = new Date(selectedMonth.year, selectedMonth.month, d.getDate());
          recurringFromPast.push({ ...e, id: `proj_${e.id}`, created_at: projectedDate.toISOString(), projected: true });
        }
      });
    return [...direct, ...recurringFromPast];
  }, [expenses, selectedMonth]);
  const filteredGoals = useMemo(() => goals.filter(g => { const d = new Date(g.created_at); return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month; }), [goals, selectedMonth]);
  const filteredAdditionalIncome = useMemo(() => additionalIncome.filter(i => { const d = new Date(i.created_at); return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month; }), [additionalIncome, selectedMonth]);

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalAdditionalIncome = filteredAdditionalIncome.reduce((s, i) => s + i.amount, 0);
  // Monthly savings = income - expenses only (additional income goes to checking separately)
  const monthlySavings = income - totalExpenses;
  const savingsRate = income > 0 ? Math.round((monthlySavings / income) * 100) : 0;
  // Budgeted savings = income - sum of all budgets
  const totalBudgeted = Object.values(budgets).reduce((s, v) => s + v, 0);
  const budgetedSavings = income - totalBudgeted;
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);

  const monthLabel = useMemo(() => {
    const date = new Date(selectedMonth.year, selectedMonth.month, 1);
    return date.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" });
  }, [selectedMonth, lang]);

  const monthlyCategoryData = useMemo(() => {
    const map = new Map();
    filteredExpenses.forEach(e => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const TABS = [
    { id: "dashboard", icon: BarChart3, label: t("overview") },
    { id: "transactions", icon: List, label: t("transactions") },
    { id: "goals", icon: Target, label: t("goals") },
    { id: "assets", icon: Briefcase, label: t("assets") },
  ];

  function deleteExpense(id) { setExpenses(prev => prev.filter(e => e.id !== id)); showToast("Expense removed"); }
  function deleteInstallmentGroup(groupId) { setExpenses(prev => prev.filter(e => e.installment_group_id !== groupId)); showToast("All installments removed"); }
  function deleteGoal(id) { setGoals(prev => prev.filter(g => g.id !== id)); showToast("Goal removed"); }

  // ── Excel Export (SheetJS) ────────────────────────────────────────────────
  function buildSheetData() {
    const dateFmt = (iso) => new Date(iso).toLocaleDateString("en-GB");
    const monthFmt = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
    const typeKeyMap = { pension: "Pension Fund", portfolio: "Investment Portfolio", money: "Money Market Fund", checking: "Checking Account", savings: "Savings Account", other: "Other" };

    // Sheet 1: Transactions
    const txSheet = [
      ["Date","Month","Category","Amount","Type","Installment","Total Amount"],
      ...expenses.map(e => [
        dateFmt(e.created_at), monthFmt(e.created_at), e.category, e.amount, e.type,
        e.installment_index ? `${e.installment_index}/${e.installments_total}` : "",
        e.total_amount || "",
      ]),
    ];

    // Sheet 2: Budget
    const budgetSheet = [
      ["Category","Monthly Budget","Has Budget"],
      ...categories.map(cat => [cat, budgets[cat] || 0, budgets[cat] ? "Yes" : "No"]),
      [],
      ["Total Budgeted", Object.values(budgets).reduce((s,v)=>s+v,0),""],
      ["Base Monthly Income", baseIncome,""],
      ["Budgeted Monthly Savings", baseIncome - Object.values(budgets).reduce((s,v)=>s+v,0),""],
    ];

    // Sheet 3: Goals
    const goalsSheet = [
      ["Goal Name","Target Amount","Saved Amount","Remaining","Target Date","Months Left","Monthly Needed"],
      ...goals.map(g => {
        const m = monthsUntil(g.target_date);
        const rem = Math.max(0, g.target_amount - (g.saved_amount||0));
        return [g.name, g.target_amount, g.saved_amount||0, rem, g.target_date, m, parseFloat((rem/m).toFixed(2))];
      }),
    ];

    // Sheet 4: Assets & Income
    const assetsSheet = [
      ["Asset Name","Type","Current Value"],
      ...assets.map(a => [a.name, typeKeyMap[a.type]||a.type, a.value]),
      [],
      ["Total Assets", assets.reduce((s,a)=>s+a.value,0),""],
      ["Checking Balance", checkingBalance,""],
      ["Net Worth", assets.reduce((s,a)=>s+a.value,0)+checkingBalance,""],
      [],
      ["--- Additional Income ---","",""],
      ["Date","Source","Type","Amount"],
      ...additionalIncome.map(i => [dateFmt(i.created_at), i.source, i.type, i.amount]),
    ];

    // Sheet 5: Monthly Summary
    const allMonths = new Set();
    expenses.forEach(e => { const d=new Date(e.created_at); allMonths.add(`${d.getFullYear()}-${d.getMonth()}`); });
    additionalIncome.forEach(i => { const d=new Date(i.created_at); allMonths.add(`${d.getFullYear()}-${d.getMonth()}`); });
    const sorted = [...allMonths].sort();
    const monthlySheet = [
      ["Month","Income","Total Expenses","Additional Income","Net Savings","Savings Rate %"],
      ...sorted.map(key => {
        const [yr,mo] = key.split("-").map(Number);
        const mInc = getIncome(yr,mo);
        const mExp = expenses.filter(e=>{const d=new Date(e.created_at);return d.getFullYear()===yr&&d.getMonth()===mo;}).reduce((s,e)=>s+e.amount,0);
        const mAdd = additionalIncome.filter(i=>{const d=new Date(i.created_at);return d.getFullYear()===yr&&d.getMonth()===mo;}).reduce((s,i)=>s+i.amount,0);
        const sav = mInc - mExp;
        const rate = mInc>0?Math.round((sav/mInc)*100):0;
        return [new Date(yr,mo,1).toLocaleDateString("en-US",{month:"long",year:"numeric"}), mInc, mExp, mAdd, sav, `${rate}%`];
      }),
    ];

    return { txSheet, budgetSheet, goalsSheet, assetsSheet, monthlySheet };
  }

  async function exportExcel() {
    // Dynamically load SheetJS from CDN
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const XLSX = window.XLSX;
    const { txSheet, budgetSheet, goalsSheet, assetsSheet, monthlySheet } = buildSheetData();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(txSheet), "Transactions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budgetSheet), "Budget");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(goalsSheet), "Goals");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(assetsSheet), "Assets & Income");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthlySheet), "Monthly Summary");
    XLSX.writeFile(wb, "clarity_finances.xlsx");
    showToast("Excel file downloaded ✓");
  }

  function exportGoogleSheets() {
    // Build a single CSV and open Google Sheets import URL
    // Google Sheets can directly import from a data: URL via the import flow
    // Best approach: download CSV and show instructions, OR encode all data as CSV and link
    const { txSheet } = buildSheetData();
    const bom = "\uFEFF";
    const csv = bom + txSheet.map(row =>
      row.map(c => { const s = String(c??""); return s.includes(",")||s.includes('"') ? `"${s.replace(/"/g,'""')}"` : s; }).join(",")
    ).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clarity_for_sheets.csv"; a.click();
    URL.revokeObjectURL(url);
    // Open Google Sheets import help
    window.open("https://sheets.new", "_blank");
    showToast("CSV downloaded — import into Google Sheets ✓");
  }

  // Auto-allocate savings when month changes (runs once per month)
  function runAutoAllocation(savingsAmount, addlIncome, currentGoals, currentChecking, year, month) {
    if (savingsAmount <= 0 && addlIncome <= 0) return { updatedGoals: currentGoals, newChecking: currentChecking };
    let remaining = savingsAmount + addlIncome;
    const updatedGoals = currentGoals.map(g => {
      const months = monthsUntil(g.target_date);
      const needed = Math.max(0, g.target_amount - (g.saved_amount || 0));
      const monthlyNeeded = months > 0 ? needed / months : needed;
      const allocate = Math.min(monthlyNeeded, Math.max(0, remaining));
      remaining = Math.max(0, remaining - allocate);
      return { ...g, saved_amount: (g.saved_amount || 0) + allocate };
    });
    const newChecking = currentChecking + remaining;
    return { updatedGoals, newChecking };
  }

  // Detect month rollover and auto-allocate previous month's savings
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // We allocate for the previous calendar month when a new month starts
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const alreadyDone = lastAllocatedMonth &&
      lastAllocatedMonth.year === prevYear && lastAllocatedMonth.month === prevMonth;
    if (!alreadyDone) {
      // Calculate prev month's savings
      const prevExpenses = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
      });
      const prevExpTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
      const prevAddl = additionalIncome.filter(i => {
        const d = new Date(i.created_at);
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
      }).reduce((s, i) => s + i.amount, 0);
      const prevIncome = getIncome(prevYear, prevMonth);
      const prevSavings = prevIncome - prevExpTotal;
      if (prevSavings > 0 || prevAddl > 0) {
        const { updatedGoals, newChecking } = runAutoAllocation(prevSavings, prevAddl, goals, checkingBalance, prevYear, prevMonth);
        setGoals(updatedGoals);
        // Record checking balance change
        const change = newChecking - checkingBalance;
        if (change !== 0) {
          setCheckingHistory(prev => [...prev, { year: prevYear, month: prevMonth, balance: newChecking, change, auto: true }]);
        }
        setCheckingBalance(newChecking);
        const newAlloc = { year: prevYear, month: prevMonth };
        setLastAllocatedMonth(newAlloc);
        localStorage.setItem("last_allocated_month", JSON.stringify(newAlloc));
      }
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 dark:bg-[#0d1117] dark:text-white transition-colors">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-sky-300/20 dark:bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 dark:bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative sticky top-0 z-40 border-b border-sky-200/80 bg-sky-50/80 dark:border-zinc-800/60 dark:bg-[#0d1117]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"><Wallet size={16} className="text-white" /></div>
            <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{t("appName")}</span>
            {userName && (
              <span className="hidden md:block text-sm text-slate-500 dark:text-zinc-400 border-s border-sky-200 dark:border-zinc-700 ps-3">
                {t("greeting")}, <span className="font-semibold text-slate-700 dark:text-zinc-200">{userName}</span>
              </span>
            )}
          </div>
          <nav className="hidden sm:flex items-center gap-1 bg-sky-100 dark:bg-zinc-900 rounded-xl p-1 border border-sky-200 dark:border-zinc-800">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === id ? "bg-sky-600 text-white dark:bg-zinc-700 dark:text-white" : "text-slate-600 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"}`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              {["en","he"].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md border text-xs transition-all ${lang === l ? "border-violet-500 text-violet-500 dark:text-violet-400" : "border-transparent text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"}`}>
                  {l === "en" ? "EN" : "עב"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[["USD","$"],["ILS","₪"]].map(([c,sym]) => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded-md border text-xs transition-all ${currency === c ? "border-violet-500 text-violet-500 dark:text-violet-400" : "border-transparent text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"}`}>
                  {sym}
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border border-sky-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-sky-400 dark:hover:border-zinc-500 transition-all">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setShowExportModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition px-2.5 py-1.5 rounded-xl border border-sky-200 dark:border-zinc-700 hover:border-sky-400 dark:hover:border-zinc-500">
              <Download size={14} /><span className="hidden md:block">{t("exportData")}</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition">
              <LogOut size={15} /><span className="hidden sm:block">{t("signOut")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="sm:hidden sticky top-16 z-30 bg-sky-50/90 dark:bg-[#0d1117]/90 border-b border-sky-200/60 dark:border-zinc-800/60 flex">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-all border-b-2 ${tab === id ? "text-violet-500 border-violet-500" : "text-slate-500 dark:text-zinc-600 border-transparent"}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>

      <main className="relative max-w-6xl mx-auto px-4 py-6 space-y-6">
        <MonthYearPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} monthLabel={monthLabel} />

        {/* ── Overview ── */}
        {tab === "dashboard" && (
          <>
            {/* Checking Balance Banner with expandable history */}
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-700 dark:to-blue-800 p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-sky-100 uppercase tracking-wide mb-1">{t("checkingBalance")}</div>
                  <div className="text-3xl font-bold text-white">{fmtWith(checkingBalance, format)}</div>
                  <div className="text-xs text-sky-200 mt-1">{t("checkingBalanceLabel")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition" onClick={() => setTab("assets")} title="Go to Assets">
                    <Wallet size={22} className="text-white" />
                  </div>
                  <button onClick={() => setShowCheckingModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all">
                    <Pencil size={13} />{t("edit")}
                  </button>
                  <button onClick={() => setCheckingExpanded(v => !v)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all">
                    <ChevronDown size={14} className={`transition-transform ${checkingExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
              {/* Expandable mini-history */}
              {checkingExpanded && (
                <div className="bg-white/95 dark:bg-zinc-900/95 border border-sky-200 dark:border-zinc-700 border-t-0 rounded-b-2xl p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-3">{t("checkingHistory")} — Last 6 months</div>
                  {checkingHistory.length === 0
                    ? <p className="text-xs text-slate-400 dark:text-zinc-600">{t("noHistory")}</p>
                    : (
                      <div className="space-y-2">
                        {[...checkingHistory].reverse().slice(0, 6).map((h, i) => {
                          const d = new Date(h.year, h.month, 1);
                          const label = d.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" });
                          return (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600 dark:text-zinc-300">{label}</span>
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-semibold ${h.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                  {h.change >= 0 ? "+" : ""}{fmtWith(h.change, format)}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-zinc-500">{fmtWith(h.balance, format)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  <button onClick={() => { setTab("assets"); setCheckingExpanded(false); }}
                    className="mt-3 text-xs text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition">
                    {t("viewFullHistory")}
                  </button>
                </div>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/80 border border-sky-100 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-2xl p-5 backdrop-blur shadow-sm dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 end-0 w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-violet-500 opacity-5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-white opacity-80"><TrendingUp size={18} /></div>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => setShowIncomeModal(true)} className="text-xs text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1 transition"><Pencil size={11} />{t("edit")}</button>
                    <button onClick={() => setIncomeIsFixed(v => !v)} className={`text-xs px-1.5 py-0.5 rounded-md font-medium transition-all ${incomeIsFixed ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"}`}>
                      {incomeIsFixed ? "Fixed" : "Variable"}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mt-3 mb-1 uppercase tracking-wide">{t("monthlyIncome")}</div>
                <div className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{fmtWith(income, format)}</div>
                {incomeOverrides[`${selectedMonth.year}-${selectedMonth.month}`] !== undefined && (
                  <div className="text-xs text-amber-500 dark:text-amber-400 mt-1">↑ Override for this month</div>
                )}
              </div>
              <KpiCard icon={<TrendingDown size={18} />} label={t("totalExpenses")} value={fmtWith(totalExpenses, format)} accent="rose" />
              <KpiCard icon={<PiggyBank size={18} />} label={t("budgetedSavings")} value={fmtWith(Math.abs(budgetedSavings), format)} subLabel={`${t("budget")}: ${fmtWith(totalBudgeted, format)}`} accent="cyan" negative={budgetedSavings < 0} />
              <KpiCard icon={<TrendingUp size={18} />} label={t("actualSavings")} value={fmtWith(Math.abs(monthlySavings), format)} subLabel={`${savingsRate}% ${t("savingsRate")}`} accent={monthlySavings >= budgetedSavings ? "emerald" : monthlySavings >= 0 ? "cyan" : "rose"} negative={monthlySavings < 0} />
            </div>

            {/* Savings progress bar: actual vs budgeted */}
            {budgetedSavings > 0 && (
              <Card title={t("savingsProgress")}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{fmtWith(monthlySavings, format)}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-500">{t("vs")} {fmtWith(budgetedSavings, format)} {t("budgetedSavings").toLowerCase()}</span>
                </div>
                <div className="h-3 bg-sky-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${monthlySavings >= budgetedSavings ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : monthlySavings >= 0 ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, budgetedSavings > 0 ? (monthlySavings / budgetedSavings) * 100 : 0)}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-zinc-500">
                  <span>{monthlySavings >= budgetedSavings ? `✓ ${t("underBudget")}` : monthlySavings < 0 ? t("overBudget") : `${Math.round((monthlySavings/budgetedSavings)*100)}% of target`}</span>
                  <span className="text-slate-400 dark:text-zinc-600 italic text-xs">Auto-allocated at month end</span>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title={t("donutTitle")}>
                {monthlyCategoryData.length === 0 ? <EmptyState icon={<DollarSign size={24} />} label={t("noExpenses")} /> : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={monthlyCategoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                          {monthlyCategoryData.map((_, i) => <Cell key={i} fill={["#a855f7","#22c55e","#0ea5e9","#f97316","#ef4444","#eab308","#6366f1"][i % 7]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(v, _n, p) => { const total = monthlyCategoryData.reduce((s, d) => s + d.value, 0); return [`${fmtWith(v, format)} • ${total ? Math.round((v / total) * 100) : 0}%`, p.payload.name]; }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
              <Card title={t("expenseBreakdown")}>
                {filteredExpenses.length === 0 ? <EmptyState icon={<DollarSign size={24} />} label={t("noExpenses")} /> : (
                  <div className="space-y-3">
                    {filteredExpenses.map(exp => {
                      const pct = income > 0 ? (exp.amount / income) * 100 : 0;
                      return (
                        <div key={exp.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700 dark:text-zinc-300">{exp.category}</span>
                              <TypeBadge type={exp.type} installment_index={exp.installment_index} installments_total={exp.installments_total} />
                              {exp.projected && <span className="text-xs text-violet-400 dark:text-violet-500">↺</span>}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{fmtWith(exp.amount, format)}</span>
                          </div>
                          <div className="h-1.5 bg-sky-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
            {goals.length > 0 && (
              <Card title={t("savingsGoals")} action={{ label: t("viewAll"), onClick: () => setTab("goals") }}>
                <div className="space-y-4">{goals.slice(0, 2).map(g => <GoalCard key={g.id} goal={g} savings={monthlySavings} compact />)}</div>
              </Card>
            )}
          </>
        )}

        {/* ── Transactions ── */}
        {tab === "transactions" && (
          <>
            {/* Budget vs Actual comparison */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t("budgetVsActual")}</h2>
              <IconBtn icon={<Plus size={15} />} label={t("addBudget")} onClick={() => { setBudgetCategory(null); setShowBudgetModal(true); }} secondary />
            </div>
            <Card>
              {categories.length === 0 ? (
                <EmptyState icon={<DollarSign size={24} />} label={t("noBudget")} />
              ) : (
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 pb-2 border-b border-sky-100 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wide">
                    <span>{t("addCategory")}</span>
                    <span className="text-end w-20">{t("budget")}</span>
                    <span className="text-end w-20">{t("actual")}</span>
                    <span className="text-end w-20">{t("variance")}</span>
                    <span className="w-6"></span>
                  </div>
                  {categories.map(cat => {
                    const budgeted = budgets[cat] || 0;
                    const actual = filteredExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                    const variance = budgeted - actual;
                    const pct = budgeted > 0 ? Math.min(100, (actual / budgeted) * 100) : actual > 0 ? 100 : 0;
                    const over = actual > budgeted && budgeted > 0;
                    return (
                      <div key={cat} className="py-2.5 border-b border-sky-50 dark:border-zinc-800/50 last:border-0">
                        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center mb-1.5">
                          <button onClick={() => { setBudgetCategory(cat); setShowBudgetModal(true); }} className="text-start text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 transition truncate">
                            {cat}
                          </button>
                          <span className="text-end text-xs text-slate-500 dark:text-zinc-500 w-20">{budgeted > 0 ? fmtWith(budgeted, format) : <span className="text-slate-300 dark:text-zinc-600">—</span>}</span>
                          <span className="text-end text-sm font-semibold text-slate-800 dark:text-white w-20">{actual > 0 ? fmtWith(actual, format) : <span className="text-slate-300 dark:text-zinc-600">—</span>}</span>
                          <span className={`text-end text-xs font-semibold w-20 ${budgeted === 0 ? "text-slate-400" : over ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"}`}>
                            {budgeted === 0 ? "—" : over ? `-${fmtWith(Math.abs(variance), format)}` : `+${fmtWith(variance, format)}`}
                          </span>
                          <button
                            onClick={() => askConfirm(
                              `Delete "${cat}" budget?`,
                              "This removes the budget allocation. Existing expenses are not affected.",
                              () => {
                                setCategories(prev => prev.filter(c => c !== cat));
                                setBudgets(prev => { const next = { ...prev }; delete next[cat]; return next; });
                                setConfirmDialog(null);
                                showToast(`"${cat}" removed`);
                              }
                            )}
                            className="w-6 flex items-center justify-center text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {budgeted > 0 && (
                          <div className="h-1.5 bg-sky-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${over ? "bg-rose-400" : pct > 80 ? "bg-amber-400" : "bg-gradient-to-r from-violet-400 to-cyan-400"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Totals row */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 pt-2 text-xs font-bold text-slate-700 dark:text-zinc-200">
                    <span>Total</span>
                    <span className="text-end w-20">{fmtWith(totalBudgeted, format)}</span>
                    <span className="text-end w-20">{fmtWith(totalExpenses, format)}</span>
                    <span className={`text-end w-20 ${totalExpenses > totalBudgeted ? "text-rose-500" : "text-emerald-500"}`}>
                      {totalExpenses > totalBudgeted ? `-${fmtWith(totalExpenses - totalBudgeted, format)}` : `+${fmtWith(totalBudgeted - totalExpenses, format)}`}
                    </span>
                    <span className="w-6"></span>
                  </div>
                </div>
              )}
            </Card>

            {/* Actual Transactions */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t("transactions")}</h2>
              <div className="flex gap-2">
                <IconBtn icon={<Plus size={15} />} label={t("addExpense")} onClick={() => { setEditingExpense(null); setShowExpenseModal(true); }} />
              </div>
            </div>
            <Card>
              {filteredExpenses.length === 0
                ? <EmptyState icon={<Calendar size={24} />} label={t("noDataForMonth")} subLabel={t("noDataForMonthSub")} action={{ label: t("addExpense"), onClick: () => setShowExpenseModal(true) }} />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-slate-500 dark:text-zinc-500 border-b border-sky-100 dark:border-zinc-800">
                        <th className="text-start py-2 pb-3 font-medium">Category</th><th className="text-start py-2 pb-3 font-medium">Type</th>
                        <th className="text-start py-2 pb-3 font-medium hidden sm:table-cell">Date</th><th className="text-end py-2 pb-3 font-medium">{t("amountLabel")}</th><th className="py-2 pb-3 w-16 text-end"></th>
                      </tr></thead>
                      <tbody className="divide-y divide-sky-50 dark:divide-zinc-800/60">
                        {filteredExpenses.map(exp => (
                          <tr key={exp.id} className={`transition ${exp.projected ? "opacity-70 bg-violet-50/40 dark:bg-violet-500/5" : "hover:bg-sky-50/80 dark:hover:bg-zinc-800/30"}`}>
                            <td className="py-3 text-start">
                              <div className="font-medium text-slate-700 dark:text-zinc-200">{exp.category}</div>
                              {exp.projected && <div className="text-xs text-violet-500 dark:text-violet-400">↺ Auto-recurring</div>}
                            </td>
                            <td className="py-3"><TypeBadge type={exp.type} installment_index={exp.installment_index} installments_total={exp.installments_total} /></td>
                            <td className="py-3 text-slate-400 dark:text-zinc-500 hidden sm:table-cell">{new Date(exp.created_at).toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "short", day: "numeric" })}</td>
                            <td className="py-3 text-end">
                              <div className="font-semibold text-slate-800 dark:text-white">{fmtWith(exp.amount, format)}</div>
                              {exp.type === "installments" && exp.total_amount && (
                                <div className="text-xs text-slate-400 dark:text-zinc-500">{t("totalOf")} {fmtWith(exp.total_amount, format)}</div>
                              )}
                            </td>
                            <td className="py-3 ps-2"><div className="flex justify-end gap-2">
                              {!exp.projected && (
                                <>
                                  <button onClick={() => { setEditingExpense(exp); setShowExpenseModal(true); }} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"><Pencil size={14} /></button>
                                  <button onClick={() => {
                                    if (exp.type === "installments" && exp.installment_group_id) {
                                      askConfirm(t("confirmDeleteInstallments"), t("confirmDeleteInstallmentsMsg"), () => { deleteInstallmentGroup(exp.installment_group_id); setConfirmDialog(null); });
                                    } else {
                                      askConfirm(t("confirmDeleteExpense"), t("confirmDeleteMsg"), () => { deleteExpense(exp.id); setConfirmDialog(null); });
                                    }
                                  }} className="text-slate-400 dark:text-zinc-600 hover:text-red-500 transition"><Trash2 size={14} /></button>
                                </>
                              )}
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr className="border-t border-sky-200 dark:border-zinc-700">
                        <td colSpan={3} className="pt-3 text-xs text-slate-500 dark:text-zinc-500 font-medium">{t("totalExpensesLabel")}</td>
                        <td className="pt-3 text-end font-bold text-slate-800 dark:text-white">{fmtWith(totalExpenses, format)}</td><td></td>
                      </tr></tfoot>
                    </table>
                  </div>
                )}
            </Card>
          </>
        )}

        {/* ── Goals ── */}
        {tab === "goals" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{t("savingsGoals")}</h2>
              <IconBtn icon={<Plus size={15} />} label={t("addGoal")} onClick={() => { setEditingGoal(null); setShowGoalModal(true); }} />
            </div>
            {goals.length === 0
              ? <Card><EmptyState icon={<Target size={24} />} label={t("noDataForMonth")} subLabel={t("noDataForMonthSub")} action={{ label: t("addGoal"), onClick: () => setShowGoalModal(true) }} /></Card>
              : <div className="grid gap-4 sm:grid-cols-2">{goals.map(g => <GoalCard key={g.id} goal={g} savings={monthlySavings} onDelete={() => askConfirm(t("confirmDeleteGoal"), t("confirmDeleteMsg"), () => { deleteGoal(g.id); setConfirmDialog(null); })} onEdit={() => { setEditingGoal(g); setShowGoalModal(true); }} />)}</div>}
          </>
        )}

        {/* ── Assets ── */}
        {tab === "assets" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard icon={<Briefcase size={18} />} label={t("totalAssets")} value={fmtWith(totalAssets, format)} accent="cyan" />
              <KpiCard icon={<Wallet size={18} />} label={t("checkingBalance")} value={fmtWith(checkingBalance, format)} accent="violet" action={{ label: t("edit"), onClick: () => setShowCheckingModal(true) }} />
              <KpiCard icon={<TrendingUp size={18} />} label={t("netWorth")} value={fmtWith(totalAssets + checkingBalance, format)} accent="emerald" />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t("assetsTitle")}</h2>
              <IconBtn icon={<Plus size={15} />} label={t("addAsset")} onClick={() => { setEditingAsset(null); setShowAssetModal(true); }} />
            </div>
            {assets.length === 0
              ? <Card><EmptyState icon={<Briefcase size={24} />} label={t("noAssets")} action={{ label: t("addAsset"), onClick: () => { setEditingAsset(null); setShowAssetModal(true); } }} /></Card>
              : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{assets.map(a => <AssetCard key={a.id} asset={a} onEdit={() => { setEditingAsset(a); setShowAssetModal(true); }} onDelete={() => askConfirm(t("confirmDeleteAsset"), t("confirmDeleteMsg"), () => { setAssets(prev => prev.filter(x => x.id !== a.id)); showToast("Asset removed"); setConfirmDialog(null); })} />)}</div>}

            <div className="flex items-center justify-between mt-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t("additionalIncomeTitle")}</h2>
              <IconBtn icon={<Plus size={15} />} label={t("addAdditionalIncome")} onClick={() => setShowAddIncomeModal(true)} />
            </div>
            <Card>
              {filteredAdditionalIncome.length === 0
                ? <EmptyState icon={<ArrowDownCircle size={24} />} label={t("noAdditionalIncome")} action={{ label: t("addAdditionalIncome"), onClick: () => setShowAddIncomeModal(true) }} />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-slate-500 dark:text-zinc-500 border-b border-sky-100 dark:border-zinc-800">
                        <th className="text-start py-2 pb-3 font-medium">{t("incomeSource")}</th><th className="text-start py-2 pb-3 font-medium">{t("incomeType")}</th>
                        <th className="text-start py-2 pb-3 font-medium hidden sm:table-cell">Date</th><th className="text-end py-2 pb-3 font-medium">{t("amountLabel")}</th><th className="py-2 pb-3 w-10"></th>
                      </tr></thead>
                      <tbody className="divide-y divide-sky-50 dark:divide-zinc-800/60">
                        {filteredAdditionalIncome.map(inc => (
                          <tr key={inc.id} className="hover:bg-sky-50/80 dark:hover:bg-zinc-800/30 transition">
                            <td className="py-3 font-medium text-slate-700 dark:text-zinc-200 text-start">{inc.source}</td>
                            <td className="py-3"><IncomeBadge type={inc.type} /></td>
                            <td className="py-3 text-slate-400 dark:text-zinc-500 hidden sm:table-cell">{new Date(inc.created_at).toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "short", day: "numeric" })}</td>
                            <td className="py-3 text-end font-semibold text-emerald-600 dark:text-emerald-400">+{fmtWith(inc.amount, format)}</td>
                            <td className="py-3 ps-2 text-end"><button onClick={() => askConfirm(t("confirmDeleteIncome"), t("confirmDeleteMsg"), () => { setAdditionalIncome(prev => prev.filter(i => i.id !== inc.id)); showToast("Income removed"); setConfirmDialog(null); })} className="text-slate-400 dark:text-zinc-600 hover:text-red-500 transition"><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr className="border-t border-sky-200 dark:border-zinc-700">
                        <td colSpan={3} className="pt-3 text-xs text-slate-500 dark:text-zinc-500 font-medium">{t("totalAdditionalIncome")}</td>
                        <td className="pt-3 text-end font-bold text-emerald-600 dark:text-emerald-400">+{fmtWith(totalAdditionalIncome, format)}</td><td></td>
                      </tr></tfoot>
                    </table>
                  </div>
                )}
            </Card>

            {/* Full Checking Account History */}
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t("checkingHistory")}</h2>
            </div>
            <Card>
              {checkingHistory.length === 0
                ? <EmptyState icon={<Wallet size={24} />} label={t("noHistory")} />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-slate-500 dark:text-zinc-500 border-b border-sky-100 dark:border-zinc-800">
                        <th className="text-start py-2 pb-3 font-medium">Month</th>
                        <th className="text-end py-2 pb-3 font-medium">Change</th>
                        <th className="text-end py-2 pb-3 font-medium">Balance</th>
                        <th className="text-end py-2 pb-3 font-medium hidden sm:table-cell">Type</th>
                      </tr></thead>
                      <tbody className="divide-y divide-sky-50 dark:divide-zinc-800/60">
                        {[...checkingHistory].reverse().map((h, i) => {
                          const d = new Date(h.year, h.month, 1);
                          const label = d.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" });
                          return (
                            <tr key={i} className="hover:bg-sky-50/80 dark:hover:bg-zinc-800/30 transition">
                              <td className="py-3 font-medium text-slate-700 dark:text-zinc-200">{label}</td>
                              <td className={`py-3 text-end font-semibold ${h.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                {h.change >= 0 ? "+" : ""}{fmtWith(h.change, format)}
                              </td>
                              <td className="py-3 text-end text-slate-700 dark:text-zinc-300">{fmtWith(h.balance, format)}</td>
                              <td className="py-3 text-end hidden sm:table-cell">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.auto ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" : "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"}`}>
                                  {h.auto ? "Auto" : "Manual"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </Card>
          </>
        )}
      </main>

      {/* Modals */}
      {showIncomeModal && <IncomeModal
        income={income}
        baseIncome={baseIncome}
        isFixed={incomeIsFixed}
        selectedMonth={selectedMonth}
        hasOverride={incomeOverrides[`${selectedMonth.year}-${selectedMonth.month}`] !== undefined}
        onSaveMonth={(v) => {
          // Override only this month
          setIncomeOverrides(prev => ({ ...prev, [`${selectedMonth.year}-${selectedMonth.month}`]: v }));
          setShowIncomeModal(false); showToast("Income updated for this month");
        }}
        onSaveBase={(v) => {
          // Change base salary — clears any override for selected month, future months use new base
          setBaseIncome(v);
          // Remove override for this month so it uses the new base
          setIncomeOverrides(prev => {
            const next = { ...prev };
            delete next[`${selectedMonth.year}-${selectedMonth.month}`];
            return next;
          });
          setShowIncomeModal(false); showToast("Base salary updated");
        }}
        onToggleFixed={(v) => setIncomeIsFixed(v)}
        onClose={() => setShowIncomeModal(false)}
      />}
      {showCheckingModal && <CheckingModal balance={checkingBalance} onSave={(v) => {
        const now = new Date();
        const change = v - checkingBalance;
        setCheckingHistory(prev => [...prev, { year: now.getFullYear(), month: now.getMonth(), balance: v, change, auto: false }]);
        setCheckingBalance(v);
        setShowCheckingModal(false);
        showToast("Balance updated");
      }} onClose={() => setShowCheckingModal(false)} />}
      {showExpenseModal && <ExpenseModal categories={categories} initial={editingExpense} onSave={(exp) => {
        if (editingExpense) {
          // Edit: if it was an installment, only update this single entry's amount/category
          setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...e, category: exp.category, amount: exp.amount } : e));
          showToast("Expense updated");
        } else if (exp.type === "installments" && exp.installments_total > 1) {
          // Generate one entry per month
          const groupId = `grp_${Date.now()}`;
          const perMonth = Math.round((exp.total_amount / exp.installments_total) * 100) / 100;
          const baseDate = new Date();
          const entries = Array.from({ length: exp.installments_total }, (_, i) => {
            const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
            return {
              id: `${Date.now()}_${i}`,
              category: exp.category,
              amount: perMonth,
              total_amount: exp.total_amount,
              type: "installments",
              installment_index: i + 1,
              installments_total: exp.installments_total,
              installment_group_id: groupId,
              created_at: d.toISOString(),
            };
          });
          setExpenses(prev => [...entries, ...prev]);
          showToast(`Added ${exp.installments_total} installments of ${fmtWith(perMonth, format)}/month`);
        } else {
          setExpenses(prev => [{ ...exp, id: Date.now().toString(), created_at: new Date().toISOString() }, ...prev]);
          showToast("Expense added");
        }
        setEditingExpense(null); setShowExpenseModal(false);
      }} onClose={() => { setEditingExpense(null); setShowExpenseModal(false); }} />}
      {showGoalModal && <GoalModal initial={editingGoal} onSave={(g) => { if (editingGoal) { setGoals(prev => prev.map(x => x.id === editingGoal.id ? { ...x, ...g } : x)); showToast("Goal updated!"); } else { setGoals(prev => [{ ...g, id: Date.now().toString(), created_at: new Date().toISOString() }, ...prev]); showToast("Goal added!"); } setEditingGoal(null); setShowGoalModal(false); }} onClose={() => { setEditingGoal(null); setShowGoalModal(false); }} />}
      {showCategoryModal && <CategoryModal categories={categories} onSave={(name) => { setCategories(prev => [...prev, name]); setShowCategoryModal(false); showToast(`Category "${name}" added`); }} onClose={() => setShowCategoryModal(false)} />}
      {showBudgetModal && <BudgetModal
        category={budgetCategory}
        budgets={budgets}
        onSave={(cat, amount) => {
          // Add to categories list if it's a new one
          if (!categories.includes(cat)) setCategories(prev => [...prev, cat]);
          setBudgets(prev => ({ ...prev, [cat]: amount }));
          setShowBudgetModal(false);
          showToast(`Budget set for "${cat}"`);
        }}
        onClose={() => setShowBudgetModal(false)}
      />}
      {showAssetModal && <AssetModal initial={editingAsset} onSave={(a) => { if (editingAsset) { setAssets(prev => prev.map(x => x.id === editingAsset.id ? { ...x, ...a } : x)); showToast("Asset updated"); } else { setAssets(prev => [...prev, { ...a, id: Date.now().toString(), created_at: new Date().toISOString() }]); showToast("Asset added"); } setEditingAsset(null); setShowAssetModal(false); }} onClose={() => { setEditingAsset(null); setShowAssetModal(false); }} />}
      {showAddIncomeModal && <AdditionalIncomeModal onSave={(inc) => { setAdditionalIncome(prev => [...prev, { ...inc, id: Date.now().toString(), created_at: new Date().toISOString() }]); showToast("Income added"); setShowAddIncomeModal(false); }} onClose={() => setShowAddIncomeModal(false)} />}
      {confirmDialog && <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />}
      {showExportModal && <ExportModal
        onExportExcel={exportExcel}
        onExportGoogleSheets={exportGoogleSheets}
        onClose={() => setShowExportModal(false)}
      />}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Card({ title, children, action }) {
  return (
    <div className="bg-white/80 border border-sky-100 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-2xl p-5 backdrop-blur shadow-sm dark:shadow-none">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{title}</h3>}
          {action && <button onClick={action.onClick} className="text-xs text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1 transition">{action.label} <ChevronRight size={12} /></button>}
        </div>
      )}
      {children}
    </div>
  );
}

const accentMap = { violet: "from-violet-600 to-violet-500", rose: "from-rose-600 to-rose-500", emerald: "from-emerald-600 to-emerald-500", cyan: "from-cyan-600 to-cyan-500" };

function KpiCard({ icon, label, value, subLabel, accent = "violet", action, negative }) {
  return (
    <div className="bg-white/80 border border-sky-100 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-2xl p-5 backdrop-blur shadow-sm dark:shadow-none relative overflow-hidden">
      <div className={`absolute top-0 end-0 w-32 h-32 rounded-full bg-gradient-to-br ${accentMap[accent]} opacity-5 -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center text-white opacity-80`}>{icon}</div>
        {action && <button onClick={action.onClick} className="text-xs text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1 transition"><Pencil size={11} />{action.label}</button>}
      </div>
      <div className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mt-3 mb-1 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${negative ? "text-rose-500 dark:text-rose-400" : "text-slate-800 dark:text-white"}`}>{value}</div>
      {subLabel && <div className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{subLabel}</div>}
    </div>
  );
}

function TypeBadge({ type, installment_index, installments_total }) {
  const { t } = useLanguage();
  const map = {
    recurring: { label: t("recurring"), cls: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400", icon: <Repeat size={10} /> },
    "one-time": { label: t("oneTime"), cls: "bg-slate-100 text-slate-600 dark:bg-zinc-700/60 dark:text-zinc-400", icon: <Hash size={10} /> },
    installments: { label: installments_total ? `${t("installments")} ${installment_index}/${installments_total}` : t("installments"), cls: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400", icon: <SplitSquareVertical size={10} /> },
  };
  const b = map[type] || map["one-time"];
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${b.cls}`}>{b.icon}{b.label}</span>;
}

function IncomeBadge({ type }) {
  const { t } = useLanguage();
  const keyMap = { bonus: "incomeTypeBonus", scholarship: "incomeTypeScholarship", freelance: "incomeTypeFreelance", gift: "incomeTypeGift", other: "incomeTypeOther" };
  const clsMap = { bonus: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400", scholarship: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400", freelance: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400", gift: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400", other: "bg-slate-100 text-slate-600 dark:bg-zinc-700/60 dark:text-zinc-400" };
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${clsMap[type] || clsMap.other}`}>{INCOME_ICONS[type]}{t(keyMap[type] || "incomeTypeOther")}</span>;
}

function AssetCard({ asset, onEdit, onDelete }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const typeKeyMap = { pension: "assetTypePension", portfolio: "assetTypePortfolio", money: "assetTypeMoney", checking: "assetTypeChecking", savings: "assetTypeSavings", other: "assetTypeOther" };
  const colorMap = { pension: "from-violet-500 to-purple-600", portfolio: "from-emerald-500 to-teal-600", money: "from-cyan-500 to-blue-600", checking: "from-sky-500 to-blue-600", savings: "from-amber-500 to-orange-600", other: "from-slate-500 to-zinc-600" };
  return (
    <div className="bg-white/80 border border-sky-100 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-2xl p-5 backdrop-blur shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[asset.type] || colorMap.other} flex items-center justify-center text-white`}>{ASSET_ICONS[asset.type] || ASSET_ICONS.other}</div>
        <div className="flex gap-1.5">
          <button onClick={onEdit} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"><Pencil size={14} /></button>
          <button onClick={onDelete} className="text-slate-400 dark:text-zinc-600 hover:text-red-500 transition"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">{t(typeKeyMap[asset.type] || "assetTypeOther")}</div>
      <div className="font-semibold text-slate-700 dark:text-zinc-200 text-sm mb-2">{asset.name}</div>
      <div className="text-xl font-bold text-slate-800 dark:text-white">{fmtWith(asset.value, format)}</div>
    </div>
  );
}

function GoalCard({ goal, savings, onDelete, onEdit, compact }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const months = monthsUntil(goal.target_date);
  const savedAmount = goal.saved_amount || 0;
  const remaining = Math.max(0, goal.target_amount - savedAmount);
  const monthlyNeeded = remaining > 0 ? remaining / months : 0;
  const progress = goal.target_amount > 0 ? Math.min(100, (savedAmount / goal.target_amount) * 100) : 0;
  const onTrack = savings >= monthlyNeeded;
  return (
    <div className="bg-white/80 border border-sky-100 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-2xl p-5 backdrop-blur shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{goal.name}</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">{months} month{months !== 1 ? "s" : ""} away · {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
        </div>
        {!compact && <div className="flex gap-1.5 mt-0.5">
          {onEdit && <button onClick={onEdit} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"><Pencil size={14} /></button>}
          {onDelete && <button onClick={onDelete} className="text-slate-400 dark:text-zinc-600 hover:text-red-500 transition"><Trash2 size={14} /></button>}
        </div>}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-sky-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : onTrack ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-gradient-to-r from-violet-400 to-sky-400"}`} style={{ width: `${progress}%` }} />
      </div>

      {/* Amounts row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">{t("goalSaved")}</div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{fmtWith(savedAmount, format)}</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl px-3 py-2">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-0.5">{t("goalRemaining")}</div>
          <div className="text-sm font-bold text-rose-700 dark:text-rose-300">{fmtWith(remaining, format)}</div>
        </div>
        <div className="bg-sky-50 dark:bg-sky-500/10 rounded-xl px-3 py-2">
          <div className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-0.5">Target</div>
          <div className="text-sm font-bold text-sky-700 dark:text-sky-300">{fmtWith(goal.target_amount, format)}</div>
        </div>
      </div>

      {/* Monthly needed */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${onTrack ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
          {fmtWith(monthlyNeeded, format)}<span className="font-normal text-slate-500 dark:text-zinc-500">/mo needed</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-zinc-500">{Math.round(progress)}% {t("saved")}</span>
      </div>
      {!compact && <p className={`text-xs mt-1.5 ${onTrack ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500 dark:text-zinc-500"}`}>
        {onTrack ? `✓ ${t("onTrack")}` : t("needMorePerMonth", { amount: fmtWith(monthlyNeeded - savings, format) })}
      </p>}
    </div>
  );
}

function EmptyState({ icon, label, subLabel, action }) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-600">{icon}</div>
      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">{label}</p>
      {subLabel && <p className="text-xs text-slate-400 dark:text-zinc-600 text-center max-w-xs">{subLabel}</p>}
      {action && <button onClick={action.onClick} className="text-xs text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition">{action.label}</button>}
    </div>
  );
}

function IconBtn({ icon, label, onClick, secondary }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${secondary ? "bg-sky-100 text-slate-600 hover:bg-sky-200 border border-sky-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:border-zinc-700" : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow"}`}>
      {icon}{label}
    </button>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-100 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">{label}</label>{children}</div>;
}

const inputCls = "w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-600";

function SaveBtn({ onClick, label = "Save" }) {
  return <button onClick={onClick} className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow">{label}</button>;
}

function IncomeModal({ income, baseIncome, isFixed, selectedMonth, hasOverride, onSaveMonth, onSaveBase, onToggleFixed, onClose }) {
  const { t, lang } = useLanguage(); const { currency } = useCurrency();
  const [val, setVal] = useState(String(income));
  const sym = currency === "ILS" ? "₪" : "$";
  const monthName = new Date(selectedMonth.year, selectedMonth.month, 1)
    .toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" });
  const n = parseFloat(val);
  const valid = !isNaN(n) && n >= 0;
  return (
    <Modal title={t("monthlyIncome")} onClose={onClose}>
      <div className="space-y-4">
        {/* Fixed / Variable toggle */}
        <div className="flex items-center justify-between bg-sky-50 dark:bg-zinc-800/60 rounded-xl p-3">
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{isFixed ? "Fixed Salary" : "Variable Income"}</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{isFixed ? "Same amount every month by default" : "Income varies month-to-month"}</div>
          </div>
          <button onClick={() => onToggleFixed(!isFixed)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isFixed ? "bg-violet-500" : "bg-slate-300 dark:bg-zinc-600"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isFixed ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <Field label={`${t("incomeAmountLabel")} — ${monthName} (${sym})`}>
          <input type="number" value={val} onChange={e => setVal(e.target.value)} className={inputCls} min={0} autoFocus />
        </Field>

        {/* Current base info */}
        {hasOverride && (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-3 py-2">
            Base salary: {fmtWith(baseIncome, null)} {sym} — this month has an override
          </div>
        )}

        {/* Save options */}
        <div className="space-y-2">
          <button onClick={() => valid && onSaveMonth(n)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${valid ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/20" : "border-sky-200 dark:border-zinc-700 text-slate-400 cursor-not-allowed"}`}>
            <span>Update for {monthName} only</span>
            <span className="text-xs opacity-70">Month override</span>
          </button>
          <button onClick={() => valid && onSaveBase(n)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${valid ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" : "border-sky-200 dark:border-zinc-700 text-slate-400 cursor-not-allowed"}`}>
            <span>Update base salary</span>
            <span className="text-xs opacity-70">All future months</span>
          </button>
          {hasOverride && (
            <button onClick={() => onSaveBase(baseIncome)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
              Remove override — revert to base ({fmtWith(baseIncome, null)} {sym})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function CheckingModal({ balance, onSave, onClose }) {
  const { t } = useLanguage(); const { currency } = useCurrency();
  const [val, setVal] = useState(String(balance));
  return (
    <Modal title={t("checkingBalance")} onClose={onClose}>
      <div className="space-y-4">
        <Field label={`${t("checkingBalanceLabel")} (${currency === "ILS" ? "₪" : "$"})`}>
          <input type="number" value={val} onChange={e => setVal(e.target.value)} className={inputCls} min={0} autoFocus />
        </Field>
        <SaveBtn onClick={() => { const n = parseFloat(val); if (!isNaN(n)) onSave(n); }} label={t("editExpenseCta")} />
      </div>
    </Modal>
  );
}

function ExpenseModal({ categories, onSave, onClose, initial }) {
  const { t } = useLanguage(); const { currency } = useCurrency();
  const [category, setCategory] = useState(initial?.category || categories[0]);
  // For installments: amount = total purchase price; for others: amount = monthly cost
  const [amount, setAmount] = useState(initial ? String(initial.type === "installments" ? (initial.total_amount || initial.amount) : initial.amount) : "");
  const [type, setType] = useState(initial?.type || "recurring");
  const [installments, setInstallments] = useState(initial?.installments_total || 3);

  const perMonth = type === "installments" && +amount > 0 && installments > 0
    ? Math.round((+amount / installments) * 100) / 100
    : null;

  const handle = () => {
    if (!amount || +amount <= 0) return;
    if (type === "installments") {
      onSave({ category, type, total_amount: +amount, installments_total: installments });
    } else {
      onSave({ category, amount: +amount, type });
    }
  };

  return (
    <Modal title={initial ? t("editExpenseTitle") : t("addExpenseTitle")} onClose={onClose}>
      <div className="space-y-4">
        <Field label={t("addCategory")}>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label={`${type === "installments" ? t("totalPurchaseAmount") : t("amountLabel")} (${currency === "ILS" ? "₪" : "$"})`}>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputCls} min={0} autoFocus={!initial} />
        </Field>
        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {[{ value: "recurring", icon: <Repeat size={13} />, label: t("recurring") }, { value: "one-time", icon: <Hash size={13} />, label: t("oneTime") }, { value: "installments", icon: <SplitSquareVertical size={13} />, label: t("installments") }].map(({ value, icon, label }) => (
              <button key={value} onClick={() => setType(value)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${type === value ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "border-sky-200 text-slate-500 hover:border-sky-400 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600"}`}>{icon}{label}</button>
            ))}
          </div>
        </Field>
        {type === "installments" && (
          <>
            <Field label={t("installmentsCount")}>
              <input type="number" value={installments} onChange={e => setInstallments(Math.max(2, +e.target.value))} className={inputCls} min={2} max={60} />
            </Field>
            {perMonth !== null && (
              <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">{t("monthlyPayment")}</span>
                <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{fmtWith(perMonth, null)} {currency === "ILS" ? "₪" : "$"}</span>
              </div>
            )}
          </>
        )}
        <SaveBtn onClick={handle} label={initial ? t("editExpenseCta") : t("addExpenseCta")} />
      </div>
    </Modal>
  );
}

function GoalModal({ onSave, onClose, initial }) {
  const { t } = useLanguage(); const { currency } = useCurrency();
  const [name, setName] = useState(initial?.name || "");
  const [amount, setAmount] = useState(initial ? String(initial.target_amount) : "");
  const [date, setDate] = useState(initial?.target_date || "");
  const [saved, setSaved] = useState(initial?.saved_amount ? String(initial.saved_amount) : "0");
  const handle = () => { if (!name || !amount || !date) return; onSave({ name, target_amount: +amount, target_date: date, saved_amount: +saved || 0 }); };
  return (
    <Modal title={initial ? t("editSavingsGoal") : t("addSavingsGoal")} onClose={onClose}>
      <div className="space-y-4">
        <Field label={t("goalNameLabel")}><input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "Trip to Japan"' className={inputCls} autoFocus /></Field>
        <Field label={`${t("targetAmountLabel")} (${currency === "ILS" ? "₪" : "$"})`}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5,000" className={inputCls} min={1} /></Field>
        <Field label={`${t("goalSaved")} (${currency === "ILS" ? "₪" : "$"})`}><input type="number" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" className={inputCls} min={0} /></Field>
        <Field label={t("targetDateLabel")}><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
        <SaveBtn onClick={handle} label={initial ? t("editSavingsGoalCta") : t("addSavingsGoalCta")} />
      </div>
    </Modal>
  );
}

function AssetModal({ onSave, onClose, initial }) {
  const { t } = useLanguage(); const { currency } = useCurrency();
  const [name, setName] = useState(initial?.name || ""); const [type, setType] = useState(initial?.type || "pension"); const [value, setValue] = useState(initial ? String(initial.value) : "");
  const typeKeyMap = { pension: "assetTypePension", portfolio: "assetTypePortfolio", money: "assetTypeMoney", checking: "assetTypeChecking", savings: "assetTypeSavings", other: "assetTypeOther" };
  const handle = () => { if (!name || !value || +value < 0) return; onSave({ name, type, value: +value }); };
  return (
    <Modal title={initial ? t("editAsset") : t("addAsset")} onClose={onClose}>
      <div className="space-y-4">
        <Field label={t("assetName")}><input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "קופת גמל מגדל"' className={inputCls} autoFocus /></Field>
        <Field label={t("assetType")}><select value={type} onChange={e => setType(e.target.value)} className={inputCls}>{ASSET_TYPES.map(at => <option key={at} value={at}>{t(typeKeyMap[at])}</option>)}</select></Field>
        <Field label={`${t("assetValue")} (${currency === "ILS" ? "₪" : "$"})`}><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0" className={inputCls} min={0} /></Field>
        <SaveBtn onClick={handle} label={initial ? t("editExpenseCta") : t("addAsset")} />
      </div>
    </Modal>
  );
}

function AdditionalIncomeModal({ onSave, onClose }) {
  const { t } = useLanguage(); const { currency } = useCurrency();
  const [source, setSource] = useState(""); const [type, setType] = useState("bonus"); const [amount, setAmount] = useState("");
  const typeKeyMap = { bonus: "incomeTypeBonus", scholarship: "incomeTypeScholarship", freelance: "incomeTypeFreelance", gift: "incomeTypeGift", other: "incomeTypeOther" };
  const handle = () => { if (!source || !amount || +amount <= 0) return; onSave({ source, type, amount: +amount }); };
  return (
    <Modal title={t("additionalIncomeTitle")} onClose={onClose}>
      <div className="space-y-4">
        <Field label={t("incomeSource")}><input value={source} onChange={e => setSource(e.target.value)} placeholder='e.g. "University Scholarship"' className={inputCls} autoFocus /></Field>
        <Field label={t("incomeType")}><select value={type} onChange={e => setType(e.target.value)} className={inputCls}>{INCOME_TYPES.map(it => <option key={it} value={it}>{t(typeKeyMap[it])}</option>)}</select></Field>
        <Field label={`${t("amountLabel")} (${currency === "ILS" ? "₪" : "$"})`}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={inputCls} min={0} /></Field>
        <SaveBtn onClick={handle} label={t("addAdditionalIncome")} />
      </div>
    </Modal>
  );
}

function BudgetModal({ category, budgets, onSave, onClose }) {
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const sym = currency === "ILS" ? "₪" : "$";
  // When editing an existing category, cat name is locked. When adding new, user types freely.
  const [catName, setCatName] = useState(category || "");
  const [amount, setAmount] = useState(category && budgets[category] ? String(budgets[category]) : "");
  const isEditing = !!category;
  const handleSave = () => {
    const name = catName.trim();
    const n = parseFloat(amount);
    if (!name || isNaN(n) || n < 0) return;
    onSave(name, n);
  };
  return (
    <Modal title={isEditing ? t("editBudget") : t("addBudget")} onClose={onClose}>
      <div className="space-y-4">
        {isEditing ? (
          /* Editing: show category name as a read-only label */
          <div className="bg-sky-50 dark:bg-zinc-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-zinc-400">{t("addCategory")}:</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{category}</span>
          </div>
        ) : (
          /* New budget: free-text input for any category name */
          <Field label={`${t("addCategory")} — type any name`}>
            <input
              type="text"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder='e.g. "Rent", "Netflix", "Gym"'
              className={inputCls}
              autoFocus
            />
          </Field>
        )}
        <Field label={`${t("budget")} per month (${sym})`}>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className={inputCls}
            min={0}
            autoFocus={isEditing}
          />
        </Field>
        <SaveBtn onClick={handleSave} label={t("editExpenseCta")} />
      </div>
    </Modal>
  );
}

function CategoryModal({ categories, onSave, onClose }) {
  const { t } = useLanguage(); const [name, setName] = useState("");
  return (
    <Modal title={t("addCategory")} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Category Name"><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pet Care" className={inputCls} autoFocus /></Field>
        <div className="flex flex-wrap gap-2 pt-1">{categories.map(c => <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-slate-600 border border-sky-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">{c}</span>)}</div>
        <SaveBtn onClick={() => name.trim() && onSave(name.trim())} label={t("addCategory")} />
      </div>
    </Modal>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ onExportExcel, onExportGoogleSheets, onClose }) {
  const { t } = useLanguage();
  const [excelLoading, setExcelLoading] = useState(false);

  const handleExcel = async () => {
    setExcelLoading(true);
    try { await onExportExcel(); }
    finally { setExcelLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{t("exportData")}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">5 sheets: Transactions · Budget · Goals · Assets · Monthly</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-3">
          {/* Excel option */}
          <button onClick={handleExcel} disabled={excelLoading}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-all text-start group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm text-xl font-bold">
              X
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">Export to Excel</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Downloads <strong>clarity_finances.xlsx</strong> — one file with 5 sheets</div>
            </div>
            {excelLoading
              ? <Loader2 size={16} className="animate-spin text-emerald-500 shrink-0" />
              : <Download size={16} className="text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 shrink-0 transition" />}
          </button>

          {/* Google Sheets option */}
          <button onClick={() => { onExportGoogleSheets(); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/60 transition-all text-start group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M19.9 3H14v2h5v14H5V5h5V3H4.1C3.5 3 3 3.5 3 4.1v15.8C3 20.5 3.5 21 4.1 21h15.8c.6 0 1.1-.5 1.1-1.1V4.1C21 3.5 20.5 3 19.9 3zM12 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-5 10h10v1H7v-1zm0 2.5h10v1H7v-1zM7 10h10v1H7v-1z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">Export for Google Sheets</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Downloads CSV + opens <strong>sheets.new</strong> — use File → Import to upload</div>
            </div>
            <Download size={16} className="text-sky-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 shrink-0 transition" />
          </button>

          {/* How-to note for Google Sheets */}
          <div className="bg-sky-50 dark:bg-zinc-800/50 rounded-xl p-3 text-xs text-slate-500 dark:text-zinc-400 space-y-1">
            <div className="font-semibold text-slate-600 dark:text-zinc-300">Google Sheets instructions:</div>
            <div>1. Click "Export for Google Sheets" above</div>
            <div>2. A new Google Sheets tab opens automatically</div>
            <div>3. Go to <strong>File → Import → Upload</strong></div>
            <div>4. Select the downloaded <strong>clarity_for_sheets.csv</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider><LanguageProvider><CurrencyProvider><AuthProvider><AppGate /></AuthProvider></CurrencyProvider></LanguageProvider></ThemeProvider>
  );
}

function AppGate() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-sky-50 dark:bg-[#0d1117] flex items-center justify-center"><Loader2 size={28} className="text-violet-400 animate-spin" /></div>;
  return user ? <Dashboard /> : <AuthScreen />;
}

export default App;

/*
═══════════════════════════════════════════════════════════
 SETUP & DEPLOYMENT GUIDE
═══════════════════════════════════════════════════════════

1. npm create vite@latest clarity-finance -- --template react
   cd clarity-finance && npm install lucide-react recharts
   npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p

2. tailwind.config.js:  content: ["./index.html","./src/**\/*.{js,jsx}"], darkMode: 'class'

3. index.css:  @tailwind base; @tailwind components; @tailwind utilities;

4. index.html <head>:
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap" rel="stylesheet">

5. SUPABASE SQL — add these new tables:
   create table assets (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users not null, name text not null, type text not null, value numeric not null, created_at timestamptz default now());
   create table additional_income (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users not null, source text not null, type text not null, amount numeric not null, created_at timestamptz default now());
   alter table assets enable row level security;
   alter table additional_income enable row level security;
   create policy "Own assets" on assets for all using (auth.uid() = user_id);
   create policy "Own additional_income" on additional_income for all using (auth.uid() = user_id);

6. Deploy: Push to GitHub → vercel.com → New Project → Vite → Deploy ✓
═══════════════════════════════════════════════════════════
*/