# Install on Windows

## Road 1: native installer (PowerShell)

```powershell
irm https://claude.ai/install.ps1 | iex
```

## Road 2: npm (if you already use Node.js)

```powershell
npm install -g @anthropic-ai/claude-code
```

Claude Code also runs great inside **WSL** (Windows Subsystem for Linux) if you prefer a
Linux environment; then follow the Linux guide inside WSL.

## First run

```powershell
claude
```

The browser opens to sign in with your Claude account (Pro plan or higher; see
[pricing](https://claude.com/pricing)). Authorize, return to the terminal, done.
