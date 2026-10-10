"use client";

import { FormEvent, useMemo, useState } from "react";

type PageKey =
  | "Dashboard"
  | "Transactions"
  | "Wallets"
  | "Budgets"
  | "Goals"
  | "Bills"
  | "Reports"
  | "Tax"
  | "AI Assistant"
  | "Settings";

type TransactionKind = "income" | "expense";
type Transaction = {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  kind: TransactionKind;
  date: string;
  wallet: string;
};
type Wallet = { id: number; name: string; kind: string; balance: number };
type Budget = { id: number; name: string; spent: number; limit: number; color: string };
type Goal = { id: number; name: string; target: number; saved: number; due: string };
type Bill = { id: number; name: string; due: string; amount: number; paid: boolean };
type FormMode = "transaction" | "goal" | "wallet" | null;

const navItems: { key: PageKey; icon: string }[] = [
  { key: "Dashboard", icon: "⌂" },
  { key: "Transactions", icon: "↕" },
  { key: "Wallets", icon: "▣" },
  { key: "Budgets", icon: "▤" },
  { key: "Goals", icon: "◎" },
  { key: "Bills", icon: "▧" },
  { key: "Reports", icon: "▥" },
  { key: "Tax", icon: "▦" },
  { key: "AI Assistant", icon: "✦" },
  { key: "Settings", icon: "⚙" },
];

const initialTransactions: Transaction[] = [
  { id: 1, merchant: "STO", category: "Food & Groceries", amount: 620, kind: "expense", date: "2026-10-10", wallet: "Bank Account" },
  { id: 2, merchant: "MWSC", category: "Bills & Utilities", amount: 410, kind: "expense", date: "2026-10-09", wallet: "Bank Account" },
  { id: 3, merchant: "Salary", category: "Income", amount: 12000, kind: "income", date: "2026-10-05", wallet: "Bank Account" },
  { id: 4, merchant: "Rent", category: "Housing", amount: 4500, kind: "expense", date: "2026-10-03", wallet: "Bank Account" },
  { id: 5, merchant: "Groceries", category: "Food & Groceries", amount: 1350, kind: "expense", date: "2026-10-02", wallet: "Cash" },
  { id: 6, merchant: "Transport", category: "Transport", amount: 420, kind: "expense", date: "2026-10-02", wallet: "Cash" },
  { id: 7, merchant: "Coffee shop", category: "Food & Groceries", amount: 165, kind: "expense", date: "2026-10-01", wallet: "Card" },
  { id: 8, merchant: "School fees", category: "Bills & Utilities", amount: 835, kind: "expense", date: "2026-10-01", wallet: "Bank Account" },
  { id: 9, merchant: "Freelance work", category: "Income", amount: 2200, kind: "income", date: "2026-10-01", wallet: "Bank Account" },
];

const initialWallets: Wallet[] = [
  { id: 1, name: "Bank Account", kind: "Bank", balance: 6300 },
  { id: 2, name: "Cash", kind: "Cash", balance: 4500 },
  { id: 3, name: "Card", kind: "Card", balance: 1700 },
];

const initialBudgets: Budget[] = [
  { id: 1, name: "Food & Groceries", spent: 2135, limit: 3500, color: "bg-cyan-600" },
  { id: 2, name: "Housing", spent: 4500, limit: 6000, color: "bg-blue-600" },
  { id: 3, name: "Transport", spent: 420, limit: 1500, color: "bg-violet-500" },
  { id: 4, name: "Bills & Utilities", spent: 1245, limit: 1500, color: "bg-amber-500" },
];

const initialGoals: Goal[] = [
  { id: 1, name: "Emergency Fund", target: 25000, saved: 18000, due: "Dec 2026" },
  { id: 2, name: "Holiday", target: 15000, saved: 7200, due: "Mar 2027" },
  { id: 3, name: "New Laptop", target: 14000, saved: 4900, due: "Feb 2027" },
];

const initialBills: Bill[] = [
  { id: 1, name: "MWSC", due: "12 Oct", amount: 410, paid: false },
  { id: 2, name: "Ooredoo", due: "14 Oct", amount: 350, paid: false },
  { id: 3, name: "Home Internet", due: "15 Oct", amount: 1160, paid: false },
];

const money = (value: number) =>
  "MVR " + Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 });

const shortDate = (value: string) => {
  const date = new Date(value + "T12:00:00");
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function SectionHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
      {children}
    </button>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("Dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [transactionKind, setTransactionKind] = useState<TransactionKind>("expense");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Groceries");
  const [selectedWallet, setSelectedWallet] = useState("Bank Account");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [walletName, setWalletName] = useState("");
  const [walletKind, setWalletKind] = useState("Bank");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hello. I can help you explore this WalletMV demo. The figures are sample data, not connected to a real account yet." },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toast, setToast] = useState("");

  const balance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const income = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const budgetLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
  const budgetSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const safeToSpend = Math.max(0, budgetLimit - budgetSpent);
  const unpaidBills = bills.filter((bill) => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0);

  const filteredTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLowerCase();
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .filter((item) => !query || [item.merchant, item.category, item.wallet, item.kind].some((value) => value.toLowerCase().includes(query)));
  }, [transactions, transactionSearch]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const resetForm = () => {
    setFormMode(null);
    setMerchant("");
    setAmount("");
    setGoalName("");
    setGoalTarget("");
    setWalletName("");
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formMode === "transaction") {
      const numericAmount = Number(amount);
      if (!merchant.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        notify("Enter a description and an amount greater than zero.");
        return;
      }
      const newTransaction: Transaction = {
        id: Date.now(),
        merchant: merchant.trim(),
        category: transactionKind === "income" ? "Income" : category,
        amount: numericAmount,
        kind: transactionKind,
        date: new Date().toISOString().slice(0, 10),
        wallet: selectedWallet,
      };
      setTransactions((current) => [newTransaction, ...current]);
      setWallets((current) => current.map((wallet) => wallet.name === selectedWallet
        ? { ...wallet, balance: wallet.balance + (transactionKind === "income" ? numericAmount : -numericAmount) }
        : wallet));
      if (transactionKind === "expense") {
        setBudgets((current) => current.map((item) => item.name === category ? { ...item, spent: item.spent + numericAmount } : item));
      }
      setActivePage("Transactions");
      notify("Transaction added for this session.");
      resetForm();
      return;
    }
    if (formMode === "goal") {
      const target = Number(goalTarget);
      if (!goalName.trim() || !Number.isFinite(target) || target <= 0) {
        notify("Enter a goal name and a target greater than zero.");
        return;
      }
      setGoals((current) => [...current, { id: Date.now(), name: goalName.trim(), target, saved: 0, due: "Not set" }]);
      setActivePage("Goals");
      notify("Savings goal added for this session.");
      resetForm();
      return;
    }
    if (formMode === "wallet") {
      if (!walletName.trim()) {
        notify("Enter a wallet name.");
        return;
      }
      setWallets((current) => [...current, { id: Date.now(), name: walletName.trim(), kind: walletKind, balance: 0 }]);
      setSelectedWallet(walletName.trim());
      setActivePage("Wallets");
      notify("Wallet added for this session.");
      resetForm();
    }
  };

  const exportTransactions = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount (MVR)", "Wallet"],
      ...filteredTransactions.map((item) => [item.date, item.merchant, item.category, item.kind, String(item.amount), item.wallet]),
    ];
    const csv = rows.map((row) => row.map((cell) => '"' + cell.replaceAll('"', '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "walletmv-transactions-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Transaction CSV exported.");
  };

  const askAssistant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    let answer = "This demo assistant doesn't connect to a live AI service yet. Once WalletMV's secure backend is connected, it can answer using your permitted financial data.";
    if (/spend|expense|cost/i.test(question)) answer = "Based on the current demo entries, listed expenses total " + money(expenses) + ". These are sample figures and will reset when the page reloads.";
    else if (/income|earn/i.test(question)) answer = "The demo transaction list includes " + money(income) + " in income entries. These figures are examples, not bank-linked data.";
    else if (/budget|safe/i.test(question)) answer = "The demo budgets have " + money(safeToSpend) + " remaining across the categories shown. This is a basic total, not personalized financial advice.";
    setChatMessages((current) => [...current, { role: "user", text: question }, { role: "assistant", text: answer }]);
    setChatInput("");
  };

  const addBudget = () => {
    const name = window.prompt("Name this budget:");
    if (!name?.trim()) return;
    const limitText = window.prompt("Monthly limit in MVR:", "1000");
    if (limitText === null) return;
    const limit = Number(limitText);
    if (!Number.isFinite(limit) || limit <= 0) {
      notify("Enter a valid budget limit.");
      return;
    }
    setBudgets((current) => [...current, { id: Date.now(), name: name.trim(), spent: 0, limit, color: "bg-cyan-600" }]);
    notify("Budget added for this session.");
  };

  const contributeToGoal = (goalId: number) => {
    setGoals((current) => current.map((goal) => goal.id === goalId
      ? { ...goal, saved: Math.min(goal.target, goal.saved + 250) }
      : goal));
    notify("Added MVR 250 to the demo goal.");
  };

  const renderTransactions = (compact = false) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
          <tr><th className="px-2 py-3 font-bold">Description</th><th className="px-2 py-3 font-bold">Category</th><th className="px-2 py-3 font-bold">Date</th><th className="px-2 py-3 text-right font-bold">Amount</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(compact ? filteredTransactions.slice(0, 5) : filteredTransactions).map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-2 py-3.5">
                <div className="font-bold text-slate-800">{item.merchant}</div>
                <div className="text-xs text-slate-400">{item.wallet}</div>
              </td>
              <td className="px-2 py-3.5 text-slate-500">{item.category}</td>
              <td className="px-2 py-3.5 text-slate-500">{shortDate(item.date)}</td>
              <td className={"px-2 py-3.5 text-right font-black " + (item.kind === "income" ? "text-emerald-600" : "text-slate-800")}>
                {item.kind === "income" ? "+" : "−"} {money(item.amount)}
              </td>
            </tr>
          ))}
          {filteredTransactions.length === 0 && <tr><td colSpan={4} className="px-2 py-10 text-center text-slate-500">No matching transactions.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-cyan-800 via-cyan-700 to-blue-700 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <div className="text-sm font-semibold text-cyan-100">Total wallet balance · Demo data</div>
            <div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{money(balance)}</div>
            <p className="mt-3 text-sm text-cyan-100">Track today. Plan ahead. Feel more in control.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs text-cyan-100">Income entries</div>
              <div className="mt-1 text-xl font-extrabold">{money(income)}</div>
              <div className="mt-1 text-xs text-cyan-100">In this demo list</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs text-cyan-100">Expense entries</div>
              <div className="mt-1 text-xl font-extrabold">{money(expenses)}</div>
              <div className="mt-1 text-xs text-cyan-100">In this demo list</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Safe-to-Spend", value: money(safeToSpend), note: "Remaining across demo budgets", icon: "↗" },
          { label: "Budget progress", value: budgetLimit ? Math.round((budgetSpent / budgetLimit) * 100) + "%" : "0%", note: money(budgetSpent) + " spent", icon: "▤" },
          { label: "Savings goals", value: String(goals.length), note: "Active demo goals", icon: "◎" },
          { label: "Upcoming bills", value: money(unpaidBills), note: bills.filter((bill) => !bill.paid).length + " unpaid demo bills", icon: "▧" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{stat.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-lg font-black text-cyan-700">{stat.icon}</span>
            </div>
            <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">{stat.value}</div>
            <div className="mt-2 text-xs font-medium text-slate-500">{stat.note}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Budget progress" description="Spent against each demo monthly limit" action={<button onClick={() => setActivePage("Budgets")} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">Manage budgets →</button>} />
          <div className="space-y-5">
            {budgets.map((budget) => {
              const percent = Math.min(100, Math.round((budget.spent / Math.max(1, budget.limit)) * 100));
              return <div key={budget.id}>
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-slate-700">{budget.name}</span>
                  <span className="text-slate-500">{money(budget.spent)} / {money(budget.limit)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={"h-full rounded-full " + budget.color} style={{ width: percent + "%" }} /></div>
              </div>;
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Savings goals" description="Small steps add up" action={<button onClick={() => setFormMode("goal")} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">+ Add goal</button>} />
          <div className="space-y-5">
            {goals.slice(0, 3).map((goal) => {
              const percent = Math.min(100, Math.round((goal.saved / Math.max(1, goal.target)) * 100));
              return <div key={goal.id}>
                <div className="flex items-center justify-between gap-3"><span className="font-bold text-slate-800">{goal.name}</span><span className="text-xs font-bold text-cyan-700">{percent}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-600" style={{ width: percent + "%" }} /></div>
                <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{money(goal.saved)} saved</span><span>Target {money(goal.target)}</span></div>
              </div>;
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Recent transactions" description="Latest entries in this browser session" action={<button onClick={() => setActivePage("Transactions")} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">View all →</button>} />
        {renderTransactions(true)}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Add transaction", note: "Record income or an expense", action: () => setFormMode("transaction"), icon: "+" },
          { title: "Create savings goal", note: "Set a target and track progress", action: () => setFormMode("goal"), icon: "◎" },
          { title: "Ask WalletMV assistant", note: "Explore what the demo data says", action: () => setActivePage("AI Assistant"), icon: "✦" },
        ].map((item) => <button key={item.title} onClick={item.action} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-xl font-black text-cyan-700">{item.icon}</span>
          <div className="mt-4 font-black text-slate-900">{item.title}</div>
          <div className="mt-1 text-sm text-slate-500">{item.note}</div>
        </button>)}
      </section>
    </div>
  );

  const renderPage = () => {
    if (activePage === "Dashboard") return renderDashboard();

    if (activePage === "Transactions") return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading title="Transactions" description="Search, add and export your demo transactions." action={<div className="flex gap-2"><button onClick={exportTransactions} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Export CSV</button><PrimaryButton onClick={() => setFormMode("transaction")}>+ Add transaction</PrimaryButton></div>} />
      <label className="mb-4 block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Search transactions</span><input value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} placeholder="Search merchant, category, wallet…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label>
      {renderTransactions()}
    </section>;

    if (activePage === "Wallets") return <section>
      <SectionHeading title="Your wallets" description="Balances in these demo wallets update when you add a transaction." action={<PrimaryButton onClick={() => setFormMode("wallet")}>+ Add wallet</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{wallets.map((wallet) => <div key={wallet.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="rounded-xl bg-cyan-50 px-3 py-2 text-lg text-cyan-700">▣</span><span className="text-xs font-bold uppercase tracking-wide text-slate-400">{wallet.kind}</span></div><h3 className="mt-5 text-lg font-black">{wallet.name}</h3><p className="mt-1 text-sm text-slate-500">Available demo balance</p><p className="mt-2 text-2xl font-black">{money(wallet.balance)}</p><button onClick={() => { setSelectedWallet(wallet.name); setFormMode("transaction"); }} className="mt-5 text-sm font-bold text-cyan-700 hover:text-cyan-900">Add transaction →</button></div>)}</div>
    </section>;

    if (activePage === "Budgets") return <section>
      <SectionHeading title="Budgets" description="Adjust your spending plan with demo data." action={<PrimaryButton onClick={addBudget}>+ Add budget</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-2">{budgets.map((budget) => { const percent = Math.min(100, Math.round(budget.spent / Math.max(1, budget.limit) * 100)); return <div key={budget.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h3 className="font-black">{budget.name}</h3><p className="mt-1 text-sm text-slate-500">Monthly limit</p></div><span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold">{percent}% used</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className={"h-full rounded-full " + budget.color} style={{ width: percent + "%" }} /></div><div className="mt-3 flex justify-between text-sm"><span className="font-bold">{money(budget.spent)} spent</span><span className="text-slate-500">{money(Math.max(0, budget.limit - budget.spent))} left</span></div><p className="mt-2 text-xs text-slate-400">Limit: {money(budget.limit)}</p></div>; })}</div>
    </section>;

    if (activePage === "Goals") return <section>
      <SectionHeading title="Savings goals" description="Track progress and add demo contributions." action={<PrimaryButton onClick={() => setFormMode("goal")}>+ Add goal</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{goals.map((goal) => { const percent = Math.min(100, Math.round(goal.saved / Math.max(1, goal.target) * 100)); return <div key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-xl font-black text-cyan-700">◎</div><h3 className="mt-4 text-lg font-black">{goal.name}</h3><p className="mt-1 text-sm text-slate-500">Target date: {goal.due}</p><div className="mt-4 flex justify-between text-sm"><span className="font-bold">{money(goal.saved)}</span><span className="text-slate-500">of {money(goal.target)}</span></div><div className="mt-2 h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-cyan-600" style={{ width: percent + "%" }} /></div><button onClick={() => contributeToGoal(goal.id)} disabled={goal.saved >= goal.target} className="mt-5 w-full rounded-xl border border-cyan-100 px-3 py-2.5 text-sm font-bold text-cyan-800 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40">Add MVR 250</button></div>; })}</div>
    </section>;

    if (activePage === "Bills") return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading title="Bills" description="Mark demo bills as paid to update your outstanding total." />
      <div className="mb-5 rounded-2xl bg-amber-50 p-5"><p className="text-sm font-bold text-amber-800">Outstanding demo bills</p><p className="mt-1 text-2xl font-black text-amber-900">{money(unpaidBills)}</p></div>
      <div className="space-y-3">{bills.map((bill) => <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"><div><div className="font-black">{bill.name}</div><div className="mt-1 text-xs text-slate-500">Due {bill.due} · {money(bill.amount)}</div></div><button onClick={() => { setBills((current) => current.map((item) => item.id === bill.id ? { ...item, paid: !item.paid } : item)); notify(bill.paid ? "Bill marked unpaid." : "Bill marked paid."); }} className={"rounded-xl px-4 py-2 text-sm font-bold " + (bill.paid ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}>{bill.paid ? "Mark unpaid" : "Mark paid"}</button></div>)}</div>
    </section>;

    if (activePage === "Reports") return <section className="space-y-6">
      <SectionHeading title="Reports" description="A quick breakdown from this session's demo entries." action={<button onClick={exportTransactions} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Export transactions CSV</button>} />
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Income entries</p><p className="mt-2 text-2xl font-black text-emerald-600">{money(income)}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Expense entries</p><p className="mt-2 text-2xl font-black">{money(expenses)}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Net from listed entries</p><p className={"mt-2 text-2xl font-black " + (income - expenses >= 0 ? "text-emerald-600" : "text-rose-600")}>{income - expenses < 0 ? "− " : "+ "}{money(income - expenses)}</p></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black">Budget category breakdown</h3><div className="mt-5 space-y-5">{budgets.map((budget) => <div key={budget.id}><div className="mb-2 flex justify-between text-sm"><span className="font-bold">{budget.name}</span><span className="text-slate-500">{money(budget.spent)}</span></div><div className="h-3 rounded-full bg-slate-100"><div className={"h-3 rounded-full " + budget.color} style={{ width: Math.min(100, budget.spent / Math.max(1, Math.max(...budgets.map((item) => item.spent))) * 100) + "%" }} /></div></div>)}</div></div>
    </section>;

    if (activePage === "Tax") return <section className="space-y-5">
      <SectionHeading title="Maldives tax workspace" description="Organize figures for review; this demo does not file returns." />
      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-sm leading-6 text-cyan-900"><strong>Preparation only:</strong> figures below are derived from demo entries. Verify applicable MIRA guidance and obtain professional advice where needed. WalletMV is not submitting tax returns.</div>
      <div className="grid gap-4 md:grid-cols-3">{[{ title: "Income records", amount: money(income), note: "Sample income entries" }, { title: "Expense records", amount: money(expenses), note: "Sample expense entries" }, { title: "Bills pending", amount: money(unpaidBills), note: "Outstanding demo bills" }].map((card) => <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">{card.title}</p><p className="mt-2 text-2xl font-black">{card.amount}</p><p className="mt-2 text-xs text-slate-400">{card.note}</p></div>)}</div>
    </section>;

    if (activePage === "AI Assistant") return <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <SectionHeading title="WalletMV Assistant" description="Basic local demo responses—no external AI service is connected." />
      <div className="mb-5 space-y-3" aria-live="polite">{chatMessages.map((message, index) => <div key={index} className={"max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 " + (message.role === "user" ? "ml-auto bg-cyan-700 text-white" : "bg-slate-100 text-slate-700")}><div className="mb-1 text-[10px] font-black uppercase tracking-wider opacity-70">{message.role === "user" ? "You" : "WalletMV demo"}</div>{message.text}</div>)}</div>
      <form onSubmit={askAssistant} className="flex flex-col gap-2 sm:flex-row"><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Try: how much did I spend?" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /><PrimaryButton type="submit">Ask</PrimaryButton></form>
      <div className="mt-3 flex flex-wrap gap-2">{["How much did I spend?", "How is my budget?", "How much income is listed?"].map((prompt) => <button key={prompt} onClick={() => setChatInput(prompt)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-cyan-300 hover:text-cyan-800">{prompt}</button>)}</div>
    </section>;

    return <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <SectionHeading title="Settings" description="Local prototype preferences." />
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4"><div><p className="font-bold">Demo notifications</p><p className="mt-1 text-sm text-slate-500">Local toggle only; no emails or push notifications are sent.</p></div><button role="switch" aria-checked={notificationsEnabled} onClick={() => setNotificationsEnabled((current) => !current)} className={"relative h-7 w-12 rounded-full transition " + (notificationsEnabled ? "bg-cyan-700" : "bg-slate-300")}><span className={"absolute top-1 h-5 w-5 rounded-full bg-white transition " + (notificationsEnabled ? "left-6" : "left-1")} /></button></div>
      <div className="border-b border-slate-100 py-4"><p className="font-bold">Default currency</p><p className="mt-1 text-sm text-slate-500">MVR — Maldivian Rufiyaa</p></div>
      <div className="py-4"><p className="font-bold">Data and privacy</p><p className="mt-1 text-sm leading-6 text-slate-500">This build uses sample data held in the current page session. Adding Supabase authentication and database storage is the next backend task. Do not enter real financial details into this prototype.</p></div>
    </section>;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-6"><div className="text-2xl font-black tracking-tight text-cyan-800">WalletMV</div><div className="mt-1 text-xs font-medium text-slate-500">Track. Plan. Prosper.</div></div>
          <nav aria-label="Main navigation" className="flex-1 space-y-1 p-4">{navItems.map((item) => <button key={item.key} onClick={() => setActivePage(item.key)} aria-current={activePage === item.key ? "page" : undefined} className={"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition " + (activePage === item.key ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-800")}><span className="w-5 text-center text-lg">{item.icon}</span>{item.key}</button>)}</nav>
          <div className="m-4 rounded-2xl bg-gradient-to-br from-cyan-700 to-blue-700 p-4 text-white"><div className="text-sm font-black">WalletMV Preview</div><p className="mt-1 text-xs leading-5 text-cyan-50">A working UI prototype. Secure account storage comes next.</p><span className="mt-3 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Demo mode</span></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">WalletMV · Personal finance</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{activePage === "Dashboard" ? "Your money, at a glance" : activePage}</h1></div>
              <div className="flex items-center gap-2"><span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 sm:inline-flex">Demo data</span><PrimaryButton onClick={() => { setTransactionKind("expense"); setFormMode("transaction"); }}>+ Add transaction</PrimaryButton></div>
            </div>
            <nav aria-label="Mobile navigation" className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">{navItems.map((item) => <button key={item.key} onClick={() => setActivePage(item.key)} className={"shrink-0 rounded-full px-3 py-2 text-xs font-bold " + (activePage === item.key ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600")}>{item.key}</button>)}</nav>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {renderPage()}
            <footer className="pb-5 pt-2 text-center text-xs text-slate-400">WalletMV · MVR-first finance prototype · Demo changes reset when you reload</footer>
          </div>
        </section>
      </div>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}

      {formMode && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
          <div className="mb-5 flex items-start justify-between"><div><h2 id="form-title" className="text-xl font-black">{formMode === "transaction" ? "Add transaction" : formMode === "goal" ? "Create savings goal" : "Add wallet"}</h2><p className="mt-1 text-sm text-slate-500">Changes apply to this demo session only.</p></div><button aria-label="Close dialog" onClick={resetForm} className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button></div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formMode === "transaction" && <>
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setTransactionKind("expense")} className={"rounded-xl border p-3 text-sm font-bold " + (transactionKind === "expense" ? "border-cyan-700 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-500")}>Expense</button><button type="button" onClick={() => setTransactionKind("income")} className={"rounded-xl border p-3 text-sm font-bold " + (transactionKind === "income" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-500")}>Income</button></div>
              <label className="block text-sm font-bold">Description<input autoFocus value={merchant} onChange={(event) => setMerchant(event.target.value)} required placeholder="e.g. Groceries" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label>
              <label className="block text-sm font-bold">Amount (MVR)<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label>
              <label className="block text-sm font-bold">Category<select value={category} onChange={(event) => setCategory(event.target.value)} disabled={transactionKind === "income"} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600 disabled:bg-slate-50"><option>Food & Groceries</option><option>Housing</option><option>Transport</option><option>Bills & Utilities</option><option>Health</option><option>Shopping</option><option>Other</option></select></label>
              <label className="block text-sm font-bold">Wallet<select value={selectedWallet} onChange={(event) => setSelectedWallet(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600">{wallets.map((wallet) => <option key={wallet.id} value={wallet.name}>{wallet.name}</option>)}</select></label>
            </>}
            {formMode === "goal" && <><label className="block text-sm font-bold">Goal name<input autoFocus value={goalName} onChange={(event) => setGoalName(event.target.value)} required placeholder="e.g. Emergency fund" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600" /></label><label className="block text-sm font-bold">Target amount (MVR)<input type="number" min="1" step="1" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} required placeholder="10000" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600" /></label></>}
            {formMode === "wallet" && <><label className="block text-sm font-bold">Wallet name<input autoFocus value={walletName} onChange={(event) => setWalletName(event.target.value)} required placeholder="e.g. Savings account" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600" /></label><label className="block text-sm font-bold">Wallet type<select value={walletKind} onChange={(event) => setWalletKind(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-cyan-600"><option>Bank</option><option>Cash</option><option>Card</option><option>Savings</option><option>Other</option></select></label></>}
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={resetForm} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button><PrimaryButton type="submit">Save {formMode === "transaction" ? "transaction" : formMode === "goal" ? "goal" : "wallet"}</PrimaryButton></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
