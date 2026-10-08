# WalletMV — walletmv.com

Budget app and MVSHOP shop tools for the Maldives. This repository is the live website and the installable phone app.
It is a ready-made static site: no build step, nothing to install.

| File | What it is |
|---|---|
| `index.html` | The whole website and app |
| `manifest.webmanifest`, `sw.js`, `icons/` | Make WalletMV installable on phones and open offline |
| `vercel.json` | Settings for Vercel (security headers) |
| `_headers` | The same settings, if you ever host on Cloudflare instead |
| `robots.txt`, `sitemap.xml` | Help Google find the site |

---

## Deploy in 4 steps (about 10 minutes, no coding)

### 1. Create the GitHub repository
1. Go to **github.com** → top-right **+** → **New repository**.
2. Name: `walletmv` · choose **Private** · leave everything else as it is → **Create repository**.

### 2. Upload these files
1. On the new, empty repository page click the link **"uploading an existing file"**.
2. Open this unzipped `walletmv-site` folder on your computer, select **everything inside it**
   (all files **and** the `icons` folder) and drag them into the GitHub page.
   Upload the *contents*, not the outer folder, so `index.html` sits at the top level.
3. Wait until every file shows in the list → at the bottom click **Commit changes**.

### 3. Publish on Vercel
1. Go to **vercel.com** → **Sign up / Log in** → **Continue with GitHub**.
2. **Add New… → Project** → find `walletmv` → **Import**
   (if it isn't listed, click *Adjust GitHub App Permissions* and allow the `walletmv` repository).
3. Framework Preset: **Other** · Root Directory: `./` · leave Build and Output settings empty → **Deploy**.
4. In about 30 seconds you get a live link such as `walletmv.vercel.app`. Open it on your phone to check.

### 4. Connect walletmv.com
1. In the Vercel project → **Settings → Domains** → type `walletmv.com` → **Add**, then add `www.walletmv.com`.
2. If you buy the domain on Vercel it connects by itself. If you bought it somewhere else, copy the
   DNS records Vercel shows you (an **A** record for `walletmv.com`, a **CNAME** for `www`) into your
   domain company's DNS settings. HTTPS is switched on automatically.

---

## Updating the site later
1. In the GitHub repository → **Add file → Upload files**.
2. Drag in the new `index.html` (and any other changed files) → **Commit changes**.
3. Vercel publishes the new version automatically within about a minute.
4. For a big update, open `sw.js` and change `walletmv-v3` to the next number (`walletmv-v4`)
   so phones with the app installed pick it up straight away.

## The phone app
Once the site is live on https://walletmv.com:
- **Android:** open the site in Chrome → tap **Get the app** (footer or More menu) → **Install**.
- **iPhone:** open in Safari → **Share** → **Add to Home Screen**.

## Before inviting real customers
- The admin login and the free test login are inside `index.html`, so anyone could read them on the live
  site. Move both to proper server sign-in before launch.
- Customer data is saved only in each person's browser until the database (Supabase) is connected.
- Never upload passwords, API keys or bank logins to this repository.
- Problems and concerns → WhatsApp **+960 798 7770**.
