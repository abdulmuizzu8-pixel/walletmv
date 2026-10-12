# WalletMV — set up Claude Code on Windows
# How to run: open this folder (the one with index.html) in VS Code → Terminal → New Terminal, then:
#   powershell -ExecutionPolicy Bypass -File .\setup-claude-code.ps1

Write-Host "1/4  Installing Claude Code..." -ForegroundColor Yellow
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    irm https://claude.ai/install.ps1 | iex
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
} else { Write-Host "     Claude Code is already installed." }

Write-Host "2/4  Checking Git (optional, recommended)..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id Git.Git -e --source winget
    } else { Write-Host "     Install Git for Windows from https://git-scm.com/downloads/win" }
} else { Write-Host "     Git is installed." }

Write-Host "3/4  Linking this folder to GitHub..." -ForegroundColor Yellow
if ((Get-Command git -ErrorAction SilentlyContinue) -and -not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "WalletMV website and app"
    git branch -M main
    git remote add origin https://github.com/abdulmuizzu8-pixel/walletmv.git
    Write-Host "     Ready. Run 'git push -u origin main' when you want to upload to GitHub."
} else { Write-Host "     Already linked (or Git missing) - skipped." }

Write-Host "4/4  Checking Claude Code..." -ForegroundColor Yellow
claude --version
Write-Host ""
Write-Host "Done! Type  claude  and press Enter to start. The first time, log in with your Claude account in the browser." -ForegroundColor Green
Write-Host "Claude Code reads CLAUDE.md and WALLETMV.md in this folder automatically."
