// Copies the WalletMV website (one folder up) into www/ so the phone app ships the same app.
// Run this every time you change index.html:  npm run build
const fs = require('fs');
const path = require('path');
const site = path.resolve(__dirname, '..', '..');
const out = path.resolve(__dirname, '..', 'www');
const files = ['index.html', 'manifest.webmanifest', 'robots.txt'];
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) {
  const src = path.join(site, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, f));
}
fs.cpSync(path.join(site, 'icons'), path.join(out, 'icons'), { recursive: true });
console.log('WalletMV web files copied to mobile/www');
