# Install on Linux

## Node.js (needed for Road 1 and for the demo apps)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module, so nothing native compiles on your machine. Install the current **LTS, Node 24 or
newer** from https://nodejs.org or your version manager (distribution packages are often
older). Each demo app is one plain folder: run `npm install` once (needs internet), then
`node server.js`, and open http://localhost:3000. Node 24 is what this repo asks for:
its `node:sqlite` needs no flag.

Road 2 below, the native installer, needs no Node; Road 1 and the demo apps do.

```bash
# verify
node -v         # must be v24 or newer
claude --version
```

## Road 1: npm

```bash
npm install -g @anthropic-ai/claude-code
```

## Road 2: native installer (alternative, no Node needed)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## First run

```bash
claude
```

Sign in via the browser link it prints (Pro plan or higher; see
[pricing](https://claude.com/pricing)); on a headless server, copy the URL to any browser and
paste the code back. Yes, that means it runs on your own SERVER too: the exact point made on
stage with Remote Control.

## Python (optional: shown on stage, not required)

Some skills in `skills/` call a small Python helper. Nothing tonight depends on it. Nearly
every distribution ships it; any recent Python 3 works for this repo.

```bash
python3 --version   # any Python 3.9+ is fine; apt/dnf install python3 if missing
```
