# Install on Linux

## Road 1: native installer

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## Road 2: npm

```bash
npm install -g @anthropic-ai/claude-code
```

## First run

```bash
claude
```

Sign in via the browser link it prints (Pro plan or higher; see
[pricing](https://claude.com/pricing)); on a headless server, copy the URL to any browser and
paste the code back. Yes, that means it runs on your own SERVER too: the exact point made on
stage with Remote Control.

## Node.js (needed for the demo apps, not for Claude Code itself)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module. Install the current **LTS (Node 24 or newer)** from https://nodejs.org or your version
manager (distribution packages are often older): there `node:sqlite` is built in with no flag
and the demo apps start with a plain `npm run dev`. On Node 22.x the module is gated, so start
those apps with `node --experimental-sqlite server.js` instead.

```bash
# verify
node -v   # v24+ recommended (Node 22.x works with the flag above)
```

## Python (used by the skills' helper scripts)

Nearly every distribution ships it; any recent Python 3 works for this repo.

```bash
python3 --version   # any Python 3.9+ is fine; apt/dnf install python3 if missing
```
