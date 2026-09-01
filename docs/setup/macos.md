# Install on macOS

Two roads; both end at the same `claude` command in your terminal.

## Node.js (needed for Road 1 and for the demo apps)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module, so nothing native compiles on your machine. Install the current **LTS, Node 24 or
newer**. Each demo app is one plain folder: run `npm install` once (needs internet), then
`node server.js`, and open http://localhost:3000. Node 24 is what this repo asks for:
its `node:sqlite` needs no flag.

Road 2 below, the native installer, needs no Node; Road 1 and the demo apps do.

```bash
# install (either): download the LTS from https://nodejs.org, or:
brew install node

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

On first start it opens your browser to sign in with your Claude account (Pro plan or higher;
see [pricing](https://claude.com/pricing)). After authorizing, come back to the terminal:
you are in.

## Python (optional: shown on stage, not required)

Some skills in `skills/` call a small Python helper. Nothing tonight depends on it. macOS
ships a `python3` anyway; any recent Python 3 works for this repo.

```bash
python3 --version   # any Python 3.9+ is fine; brew install python if missing
```

## Optional: VS Code

Install the official "Claude Code" extension from the VS Code marketplace to run the same
tool inside the editor. The training itself uses the terminal: it is the common ground that
looks the same on every machine.
