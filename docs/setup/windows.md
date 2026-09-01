# Install on Windows

## Node.js (needed for Road 1 and for the demo apps)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module, so nothing native compiles on your machine. Install the current **LTS, Node 24 or
newer**. Each demo app is one plain folder: run `npm install` once (needs internet), then
`node server.js`, and open http://localhost:3000. Node 24 is what this repo asks for:
its `node:sqlite` needs no flag.

Road 2 below, the native installer, needs no Node; Road 1 and the demo apps do.

```powershell
# install (either): download the LTS from https://nodejs.org, or:
winget install OpenJS.NodeJS.LTS

# verify (new terminal)
node -v         # must be v24 or newer
claude --version
```

## Road 1: npm

```powershell
npm install -g @anthropic-ai/claude-code
```

## Road 2: native installer (alternative, no Node needed, PowerShell)

```powershell
irm https://claude.ai/install.ps1 | iex
```

Claude Code also runs great inside **WSL** (Windows Subsystem for Linux) if you prefer a
Linux environment; then follow the Linux guide inside WSL.

## First run

```powershell
claude
```

The browser opens to sign in with your Claude account (Pro plan or higher; see
[pricing](https://claude.com/pricing)). Authorize, return to the terminal, done.

## Python (optional: shown on stage, not required)

Some skills in `skills/` call a small Python helper. Nothing tonight depends on it.

```powershell
# install (either): download from https://python.org (check "Add to PATH"), or:
winget install Python.Python.3

# verify (new terminal)
python --version   # (python3 on macOS and Linux); any Python 3.9+ is fine
```
