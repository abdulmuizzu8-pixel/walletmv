# WalletMV — App Guide

> **walletmv.com** · Budget app + MVSHOP shop tools, made in the Maldives.
> Keep this file in the project root. Open the folder in **VS Code**; this guide explains what the app is,
> how it's built, how to change it and how to publish it. If you use an AI helper in VS Code (Copilot, Claude),
> tell it: *"Read WALLETMV.md first and follow its rules."*

---

## 1. What WalletMV is

| Part | Who it's for | What it does |
|---|---|---|
| **Money app** | People & families | Safe-to-spend number every morning, income/expense tracking, bills & calendar, to-do list (Must do → Later), budgets, savings goals, groceries lists, reports, every world currency (about 150), member discount card, shared wallet |
| **MVSHOP** | Small shops & businesses | Point of sale, invoices / quotations / receipts, bill formats, stock & reordering, GST for MIRA, contacts, bill inbox (WhatsApp photos), AI shop assistant, loyalty discount cards |
| **Website** | Everyone | Home page, Services & packages (one page), Loyalty discount cards, checkout, Terms, Privacy, FAQ |
| **Admin** | Owner | Approve payments, packages editor, payment methods, WhatsApp orders, alert rules, problem reports |

Everything is in rufiyaa (MVR) first. GST is **8%** (prices include GST unless the shop sets otherwise).

---

## 2. Packages (by value)

| Package | Level | Price / 30 days | People | Scanning | Best for |
|---|---|---|---|---|---|
| **Boli** | Starter | MVR 149 (**first month free**) | 1 | — | Starting out — students, young workers |
| **Muraka** | Plus | MVR 249 | 3 | ✓ | Working adults & couples (*Recommended*) |
| **Atholhu** | Premium | MVR 499 | up to 9 | ✓ | Families (*Best value per person*) |
| **Dhoni** | Business Pro | MVR 699 | owner + 4 staff | ✓ + Bill inbox | Shops, cafés, guesthouses |
| **MVTAX** | Business Enterprise | MVR 799 | owner + 9 staff | ✓ + Bill inbox | Growing businesses: everything in Dhoni plus tax tools (*coming soon*) |

Prices include 8% GST. Set in October 2026 (owner's choice). **No yearly offer** — every package is paid every 30 days.
**Veli** (MVR 88) is switched off for new customers but kept in the code so anyone who already paid for it keeps it.

**Boli's free month:** every new account gets Boli free (with no limits) for 30 days from the day it was made. After that
Boli is MVR 149 every 30 days. If nothing is paid when the free month (or any paid package) ends, the app shows a
"choose a package" screen; My package and Settings stay open and no records are deleted. Paying for Boli during the free
month adds 30 days after it. The free days live on the package (`trial:30`), read by `trialPlan()` / `trialWindow()` in
`index.html`, and are editable in Admin → Packages ("Free days for new customers").

Prices, names and features are editable in **Admin → Packages** (no code change needed).
A free **all-access test account** exists for the owner — its login lives in the code and **must move to
server sign-in before launch** (see §8).

**How a payment is approved:** the customer pays by transfer, m-Faisaa or WhatsApp order and sends the reference (and slip).
It lands in **Admin → Payment requests from customers**; check it against the bank, then Approve (the package switches on
for that customer) or Decline with a note. Bank details shown at checkout are kept in the database (Admin → Payment methods),
never in the code.

**Payment methods:** local card (BML Connect), international card, BML transfer (slip upload),
Ooredoo m-Faisaa, Dhiraagu Pay, PayPal, Skrill, international transfer, **Order on WhatsApp**.

---

## 3. House rules (always follow)

1. **All problems and concerns go to WhatsApp +960 798 7770.** "Report a problem", app errors and owner
   alerts all send there.
2. **13 alert rules** (Admin → Alerts): problem reported · app error · package switched on (check bank) ·
   payment waiting · payment waiting > 24 h · package ending ≤ 5 days · package ended · problem open > 2 days ·
   new business offer · too many people on a wallet · low stock · GST threshold near (MVR 900k of 1M) ·
   budget 90% used.
3. Name and brand: **WalletMV** (logo: gold **W** in a circle on midnight navy). Member card numbers start **WM-**.
4. Colours: midnight navy `#0B1A2C`, champagne gold `#D4B26A` / `#C9A961`, ivory background. Fonts:
   *Cormorant Garamond* (headings), *Jost* (text).
5. **Never put passwords, API keys, bank logins or card numbers in the code or in GitHub.** Secrets go only
   in the hosting/database "secrets" settings.
6. Keep wording simple, friendly and short — customers aren't technical.
7. Every button must work on phone and computer. Test at phone width (360–390 px) before publishing.

---

## 4. How the code is organised

The whole app is **one file: `index.html`** (HTML + CSS + JavaScript, no build step).

```
walletmv/
├─ index.html              ← the app, website and admin
├─ manifest.webmanifest    ← makes it installable (name, icons, colours)
├─ sw.js                   ← offline support (bump VERSION after big updates)
├─ icons/                  ← app icons, favicon, share image
├─ vercel.json             ← Vercel settings (security headers)
├─ _headers                ← same, for Cloudflare
├─ robots.txt, sitemap.xml ← Google
├─ README.md               ← deploy steps
└─ WALLETMV.md             ← this guide
```

Inside `index.html` (search with **Ctrl+F**):

| Search for | What it controls |
|---|---|
| `const S=` / `plans:[` | All app data and the 4 packages |
| `function render(` | Which page is shown |
| `MNAV=` / `SHOPNAV=` | Money app and MVSHOP menus |
| `function Packages(` / `const SVC=` | Services & packages page (27 services) |
| `function Checkout(` / `payMethods` | Payment steps and methods |
| `BILL FORMATS` | Till receipt, Tax invoice, Cash bill, Payment receipt |
| `const RULES=` | The 13 alert rules |
| `function reportProblem(` | Report-a-problem → WhatsApp |
| `INSTALLABLE APP` | Install button, offline, home-screen shortcuts |
| `const FAQ=` | Website FAQ |

**Also built in:** PIN app lock (Settings, this device only, `PinLockCard`), bill and morning reminders (`billsTick`, shown while the app is open), a "newer copy found" guard when two devices save (`newerCopy`), and Excel/scanner libraries that load only when used (`loadLib`).

**How it works:** all data lives in one object `S`; every screen is a function that returns HTML; any change
calls `render()` to redraw. Data is saved in the browser for now (see §8).

---

## 5. Work on it in VS Code

1. Install **VS Code** and **Git**. Recommended extensions: *Live Server*, *Prettier*.
2. **File → Open Folder** → `walletmv`.
3. Preview: right-click `index.html` → **Open with Live Server** (opens on your computer only).
4. Make your change → save → check the preview on desktop **and** phone size
   (browser DevTools → toggle device toolbar).
5. **Source Control** (Ctrl+Shift+G) → write what you changed → **Commit** → **Sync / Push**.

First time linking the folder to GitHub (terminal in VS Code):

```bash
git init
git add .
git commit -m "WalletMV website and app"
git branch -M main
git remote add origin https://github.com/abdulmuizzu8-pixel/walletmv.git
git push -u origin main
```

---

## 6. Publish (GitHub → Vercel)

1. Repository: **github.com/abdulmuizzu8-pixel/walletmv** — keep it **Private**.
2. **vercel.com** → log in with GitHub → **Add New → Project** → import `walletmv` →
   Framework **Other**, no build command, root `./` → **Deploy**.
3. **Settings → Domains** → add `walletmv.com` and `www.walletmv.com` (HTTPS is automatic).
4. After that, every push to `main` goes live in about a minute. Other branches get a private preview link.
5. After a big update, change `VERSION` in `sw.js` (e.g. `walletmv-v3` → `walletmv-v4`) so installed apps refresh.

**Phone app:** once live, Android users tap **Get the app** → Install; iPhone users use Safari → Share →
**Add to Home Screen**. Play Store / App Store later via pwabuilder.com.

---

## 7. Common changes

| I want to… | Do this |
|---|---|
| Change a price or package name | Admin → Packages (or edit `plans:[` in `index.html`) |
| Change the WhatsApp number | Admin → WhatsApp orders, and `supportWhatsapp` / `ownerWhatsapp` in `const S=` |
| Add a service to the list | Add a row to `const SVC=` under the right group |
| Edit FAQ answers | `const FAQ=` |
| Change shop details on bills | In the app: open any bill → *Details printed on the bill* |
| Add a payment method | Admin → Payment methods |

---

## 8. Before real customers (must do)

- [ ] Buy **walletmv.com** and connect it on Vercel.
- [ ] Move **admin login** and the **free test login** out of `index.html` into real sign-in (Supabase Auth).
- [x] Save customer data in a database (Supabase) instead of each browser. *(done: each person's data, payment requests and document photos are in Supabase, private to them)*
- [ ] **BML Connect** approval for card payments (until then: transfer slip / WhatsApp order + Admin approval).
- [ ] WhatsApp via Twilio: second SIM for the bot, Meta business verification, 5 message templates approved
      (backend code is in the separate `backend/` folder of the project zip).
- [ ] Real Terms & Privacy pages, checked by a Maldives lawyer/accountant.
- [ ] Test on real phones with a few shops for a week.
- [ ] Google Search Console for walletmv.com.

---

## 9. Help

Problems or questions → **WhatsApp +960 798 7770**.
