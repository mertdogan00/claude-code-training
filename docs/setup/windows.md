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

## Node.js (needed for the demo apps, not for Claude Code itself)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module. Install the current **LTS (Node 24 or newer)**: there `node:sqlite` is built in with
no flag and the demo apps start with a plain `npm run dev`. On Node 22.x the module exists but
is gated, so start those apps with `node --experimental-sqlite server.js` instead.

```powershell
# install (either): download the LTS from https://nodejs.org, or:
winget install OpenJS.NodeJS.LTS

# verify (new terminal)
node -v   # v24+ recommended (Node 22.x works with the flag above)
```

## Python (used by the skills' helper scripts)

```powershell
# install (either): download from https://python.org (check "Add to PATH"), or:
winget install Python.Python.3.12

# verify (new terminal)
python --version   # any Python 3.9+ is fine
```
