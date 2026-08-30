# Install on macOS

Two roads; both end at the same `claude` command in your terminal.

## Road 1: native installer (recommended, no prerequisites)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## Road 2: npm (if you already use Node.js)

```bash
npm install -g @anthropic-ai/claude-code
```

## First run

```bash
claude
```

On first start it opens your browser to sign in with your Claude account (Pro plan or higher;
see [pricing](https://claude.com/pricing)). After authorizing, come back to the terminal:
you are in.

## Node.js (needed for the demo apps, not for Claude Code itself)

The training's example applications run on Node.js and use its built-in `node:sqlite`
module, which needs **Node 22.5 or newer**; any current LTS qualifies.

```bash
# install (either): download the LTS from https://nodejs.org, or:
brew install node

# verify
node -v   # must print v22.5 or newer
```

## Python (used by the skills' helper scripts)

macOS ships a `python3`; any recent Python 3 works for this repo.

```bash
python3 --version   # any Python 3.9+ is fine; brew install python if missing
```

## Optional: VS Code

Install the official "Claude Code" extension from the VS Code marketplace to run the same
tool inside the editor. The training itself uses the terminal: it is the common ground that
looks the same on every machine.
