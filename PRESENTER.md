# Presenter flow: which file, which command, at which moment

The stage script. Every UYGULAMA slide in the deck (v10, 28 slides) has a row here: the slide
tells the room WHAT is happening, this file tells the presenter exactly WHERE to go and WHAT
to type. Deck moments below are named with their slide number and title.

## Before doors

```bash
git -C claude-code-training pull      # the repo on stage is the repo on GitHub
node -v                               # must be v24 or newer
cd claude-code-training
cd showcase/data-dashboard && npm install
cd ../neon-breaker      && npm install
cd ../qr-menu           && npm install
cd ../..                              # back at the repo root
```

Then: terminal font size up (the back row has to read it), phone on the SAME network as the
laptop for the remote-control demo, and one browser window already open on
`http://localhost:3000` so the tab is ready.

## Stop 1 · Big Picture (slides 1 to 7)

No hands-on. Talk only. The one thing to have ready: the roadmap slide (2 · Bu akşamın yol
haritası) is where you promise the five stops, and slide 3 (Elleri görelim) is the show of
hands. Keep the terminal hidden until slide 10.

## Stop 2 · Setup (slides 8 to 13)

Slides 8 and 9 (Terminal, dosya, yol; Komut, repo, Git ve GitHub) are talk only: the
vocabulary lands before the terminal itself appears at slide 10.

| Deck moment | Do this |
|---|---|
| **10 · UYGULAMA · Kurulum: Node, Claude Code, giriş** | Open `docs/setup/macos.md`, `windows.md`, `linux.md` on screen, one after the other. Read the two lines that matter out loud: Node LTS from https://nodejs.org (macOS: `brew install node`, Windows: `winget install OpenJS.NodeJS.LTS`), then `npm install -g @anthropic-ai/claude-code` (native alternative: `curl -fsSL https://claude.ai/install.sh \| bash`). Verify live: `node -v`, then `claude --version`. Optional third line: `python3 --version`, and say it plainly, the skill scripts use it, Claude Code does not need it. The room installs along. |
| **11 · UYGULAMA · İlk açılış: claude, /help, ilk cümle** | From the folder that HOLDS the clone (`cd ~` first if you are still inside `showcase`): `cd claude-code-training/exercises/stage-2-hello` → `claude`. On a fresh machine the browser opens for login: let the room watch that, it is the only account step of the night. Then `/help`, scroll it slowly. Then paste, verbatim: `Read notes.txt in this folder and tell me in Turkish, in three sentences, what this person wants to do with AI.` Let it open the file on its own. Then `/context` (point at the meter), then `/clear`. |
| **13 · UYGULAMA · Telefondan bilgisayarımı çalıştırıyorum** | Phone: open the Claude app, connect to this machine, send one small task. Hold the phone up while the laptop moves. Nothing to prepare in the repo. |

Between them, slide 12 (Ne kadara mal oluyor) is talk only; the terminal can stay on screen.

## Stop 3 · Core Concepts (slides 14 to 20)

| Deck moment | Do this |
|---|---|
| **19 · UYGULAMA · Aynı soru, iki cevap** | `cd exercises/stage-3-context` → `claude` → paste: `Create a one-week meal plan from the menu.txt file in this folder.` Show the plain answer. Now CREATE the memory file live, in the same session: `Save the rules in rules.md into this folder's CLAUDE.md.` (or leave the session and run `mv rules.md CLAUDE.md`). Open the new `CLAUDE.md` and read its three rules aloud. `/clear`. Paste the SAME sentence. The answer comes back as a table with a budget line. Say the sentence that lands: you changed a file, not the model. Reset for the next run with `mv CLAUDE.md rules.md`. |
| **20 · UYGULAMA · Komut kartı ve hangi model** | Live-type in the open session: `/help`, `/context`, `/compact`, then `/model` (open the picker, name the ladder, close it without changing anything), then `/permissions`. The slide holds the 15 commands in three tiers; `commands.md` in the repo is the same card for people to take home. |

Slides 14 to 18 (prompt, token, context, Markdown and CLAUDE.md, under the hood) are talk
only, but keep the session from slide 11 alive: a `/context` on screen while you explain
tokens is worth a paragraph of slides.

## Stop 4 · Extending (slides 21 to 25)

Slide 21 is the break (Mola). Come back with the terminal at the repo root. Slide 22 (Skill, plugin, MCP, ajan) is talk only: name the four before you show two of them.

| Deck moment | Do this |
|---|---|
| **23 · UYGULAMA · Skill kur** | Repo root, inside Claude Code: `Install skills/pdf-summarizer into this project as a skill.` When it finishes, type `/` and find it in the list. Run `/pdf-summarizer` on any PDF in Downloads. The line to say: yesterday this was a prompt you kept re-typing, now it is a command and it brought its own script with it. |
| **24 · UYGULAMA · Plugin ve MCP** | Plugin first: `/plugin` → Discover tab → pick whatever lands well tonight → install → type `/` again, the new commands are there. Then MCP, in the terminal: `claude mcp add --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp` → start a new session → ask: `How do I set up a cron trigger for a Cloudflare Worker? Answer from the live docs.` → point at the tool calls as they run. Backups if the server or the network misbehaves: Context7 or DeepWiki, exact commands in `exercises/stage-4-extend/mcp.md`; the walkthroughs are `plugin.md` and `mcp.md` in the same folder. |

Slide 25 (Ajanlar) is the bridge into Stop 5: say it out loud, the next thing you see is not
one assistant, it is a team.

## Stop 5 · Live Build (slides 26 to 28)

| Deck moment | Do this |
|---|---|
| **26 · Şimdi siz seçin: üç aday** | Read the three out loud: Satış Analitik Paneli (`data-dashboard`), Neon Breaker (`neon-breaker`), QR Menü (`qr-menu`). Hands up per option, count out loud, announce the winner. |
| **27 · UYGULAMA · Reçete ve canlı kurulum** | Open `prompts/apps/<winner>.md` on screen and scroll it slowly: point at the team clause, the contract-first rule and the acceptance checklist. Then `mkdir demo && cd demo && claude`, paste everything between the two `---` lines, and type NOTHING else. While it builds, narrate the team: who got spawned, what each lead is doing, what each one returned. Ask the question from the recipe's stage note. When it finishes: `npm install`, then `node server.js`, open http://localhost:3000. Let the room ask for one change and type it as a single sentence. |
| **27 · fallback lane** | If the live build drags or the network dies: `cd showcase/<winner>` → `node server.js` (its `npm install` was done before doors) → open http://localhost:3000 → then open that folder's `BUILD-LOG.md` and read who did what. Same prompt, finished result. |
| **28 · Bu gece ne öğrendik, sorular** | Repo URL and the QR on screen. Point people at `after-training.md` for the first week and `exercises/stage-2-hello/` to redo tonight's first launch at home. |

## Pocket answers

- **The live build fails, drags, or the wifi dies mid-build:** `cd showcase/<winner>` and run
  `node server.js`, then show the app and its `BUILD-LOG.md`: "a team of agents built this
  from that exact prompt, here is the result and here is who did what." All three candidates
  are pre-built and tested under `showcase/`.
- **Wifi dies during MCP:** show `exercises/stage-4-extend/mcp.md` and narrate it; the skill
  and plugin demos work offline.
- **The build stalls on a question it should not ask:** reply `continue as planned, no more
  confirmations` and tighten the prompt file tomorrow.
- **Someone asks "can it see my files?":** `/permissions` on screen is the honest answer.
- **Port 3000 is busy:** `PORT=3001 node server.js`, and open http://localhost:3001.
