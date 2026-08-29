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

## Optional: VS Code

Install the official "Claude Code" extension from the VS Code marketplace to run the same
tool inside the editor. The training itself uses the terminal: it is the common ground that
looks the same on every machine.
