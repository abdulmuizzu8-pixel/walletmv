# WalletMV — instructions for Claude Code

@WALLETMV.md

## How to work in this project
- The whole app is `index.html` (HTML + CSS + JS, no build step). Edit it in place; don't split it or add a framework unless asked.
- After changing anything, check it at phone width (360–390 px) and desktop width, and make sure every button still works.
- Keep the WalletMV brand: gold **W** logo, midnight navy `#0B1A2C`, champagne gold `#D4B26A`, ivory background, Cormorant Garamond + Jost.
- Prices are in MVR. GST is 8% and is included in prices unless a shop sets otherwise.
- All problems and concerns go to WhatsApp **+960 798 7770**.
- Never write passwords, API keys, bank details or card numbers into any file in this repo. Secrets belong in Vercel / Supabase settings only.
- After a big update, bump `VERSION` in `sw.js` (e.g. `walletmv-v3` → `walletmv-v4`).
- Write commit messages in plain English describing what changed for the customer.
- Ask before deleting files, changing package prices, or pushing to `main`.
