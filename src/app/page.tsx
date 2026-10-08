const navItems = [
  ["Dashboard", "#dashboard"],
  ["Transactions", "#transactions"],
  ["Wallets", "#wallets"],
  ["Budgets", "#budgets"],
  ["Goals", "#goals"],
  ["Bills", "#bills"],
  ["Reports", "#reports"],
  ["Tax", "#tax"],
  ["AI Assistant", "#ai"],
  ["Settings", "#settings"],
];

const stats = [
  { label: "Total Balance", value: "MVR 12,500", note: "+4.8% this month" },
  { label: "Income", value: "MVR 14,200", note: "+8.1% vs last month" },
  { label: "Expenses", value: "MVR 8,300", note: "-3.4% vs last month" },
  { label: "Safe-to-Spend", value: "MVR 4,150", note: "Comfortable for 18 days" },
];

const transactions = [
  { merchant: "STO", category: "Groceries", amount: "- MVR 620", date: "Today" },
  { merchant: "MWSC", category: "Utilities", amount: "- MVR 410", date: "Yesterday" },
  { merchant: "Salary", category: "Income", amount: "+ MVR 12,000", date: "Oct 5" },
  { merchant: "Fuvahmulah Coffee", category: "Food & Dining", amount: "- MVR 165", date: "Oct 4" },
];

export default function Home() {
  return (
    <main id="dashboard" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-6">
            <div className="text-2xl font-black tracking-tight text-cyan-700">WalletMV</div>
            <div className="mt-1 text-xs font-medium text-slate-500">Track. Plan. Prosper.</div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={[
                  "block rounded-xl px-4 py-3 text-sm font-semibold transition",
                  index === 0
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-cyan-700",
                ].join(" ")}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="m-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-4 text-white">
            <div className="text-sm font-bold">Premium</div>
            <div className="mt-1 text-xs text-cyan-50">Smart insights, family finance and AI planning.</div>
            <button className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-xs font-bold text-cyan-700">
              Explore Premium
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Personal Finance</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Good evening</h1>
              </div>
              <button className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700">
                + Add transaction
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="rounded-3xl bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 p-6 text-white shadow-lg">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                <div>
                  <div className="text-sm font-semibold text-cyan-100">Available balance</div>
                  <div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">MVR 12,500</div>
                  <div className="mt-2 text-sm text-cyan-100">Across your connected wallets</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-cyan-100">This month</div>
                    <div className="mt-1 text-xl font-extrabold">MVR 14,200</div>
                    <div className="mt-1 text-xs text-cyan-100">income</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-cyan-100">This month</div>
                    <div className="mt-1 text-xl font-extrabold">MVR 8,300</div>
                    <div className="mt-1 text-xs text-cyan-100">expenses</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-500">{stat.label}</div>
                  <div className="mt-2 text-2xl font-black tracking-tight">{stat.value}</div>
                  <div className="mt-2 text-xs font-semibold text-cyan-700">{stat.note}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Budget progress</h2>
                    <p className="mt-1 text-sm text-slate-500">October spending</p>
                  </div>
                  <div className="text-sm font-bold text-cyan-700">60%</div>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[60%] rounded-full bg-cyan-600" />
                </div>
                <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
                  <span>MVR 8,300 spent</span>
                  <span>MVR 5,700 remaining</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Financial Health</h2>
                    <p className="mt-1 text-sm text-slate-500">Your current score</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-cyan-100 bg-cyan-50 text-lg font-black text-cyan-700">
                    82
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Healthy — your cash flow is on track.</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Savings goals</h2>
                    <p className="mt-1 text-sm text-slate-500">Keep your plans moving</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-700">3 goals</span>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    ["Emergency Fund", "MVR 18,000", "72%"],
                    ["Holiday", "MVR 7,500", "48%"],
                    ["New Laptop", "MVR 5,000", "35%"],
                  ].map(([name, target, progress]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{name}</span>
                        <span className="text-slate-500">{target}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-cyan-600" style={{ width: progress }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Upcoming bills</h2>
                    <p className="mt-1 text-sm text-slate-500">Next 7 days</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">MVR 1,920</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["MWSC", "Oct 12", "MVR 410"],
                    ["Ooredoo", "Oct 14", "MVR 350"],
                    ["Internet", "Oct 15", "MVR 1,160"],
                  ].map(([name, date, amount]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-bold">{name}</div>
                        <div className="text-xs text-slate-500">{date}</div>
                      </div>
                      <div className="text-sm font-black">{amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Recent transactions</h2>
                  <p className="mt-1 text-sm text-slate-500">Your latest activity</p>
                </div>
                <a href="#transactions" className="text-sm font-bold text-cyan-700 hover:text-cyan-800">View all</a>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <div key={transaction.merchant} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-bold">{transaction.merchant}</div>
                      <div className="text-xs text-slate-500">{transaction.category} · {transaction.date}</div>
                    </div>
                    <div className={transaction.amount.startsWith("+") ? "font-black text-emerald-600" : "font-black text-slate-900"}>
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                ["Add Expense", "Record a purchase quickly"],
                ["Scan Bill", "Capture receipt details"],
                ["Ask WalletMV AI", "Get a clear financial answer"],
              ].map(([title, note]) => (
                <button key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">
                  <div className="text-base font-black">{title}</div>
                  <div className="mt-1 text-sm text-slate-500">{note}</div>
                </button>
              ))}
            </section>

            <footer className="pb-4 pt-2 text-center text-xs font-medium text-slate-400">
              WalletMV · MVR-first personal finance
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
