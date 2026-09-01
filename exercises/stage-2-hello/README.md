# Stage 2: your first launch

Goal: open Claude Code for the first time, ask it one real question, and see where the
answer came from. No coding, no setup beyond the install you just did.

Time: 5 minutes.

## The exercise

1. **Step into this folder.** In your terminal:

   ```bash
   cd claude-code-training/exercises/stage-2-hello
   ```

   If you are already inside the repo, `cd exercises/stage-2-hello` is enough.

   The folder you are standing in is the workspace: Claude Code sees the files here.

2. **Start it.**

   ```bash
   claude
   ```

   On the very first run it opens your browser so you can sign in with your Claude account.
   Authorize there, come back to the terminal, and the welcome screen is waiting for you.

3. **Look around.** Type:

   ```
   /help
   ```

   That is the full command list. Scroll it slowly; you are not expected to memorize it.

4. **Ask your first question.** Paste this sentence exactly as it is and press Enter:

   ```
   Read notes.txt in this folder and tell me in Turkish, in three sentences, what this person wants to do with AI.
   ```

   Watch it open `notes.txt` on its own. You never told it how; you told it what.

5. **See the meter.** Type:

   ```
   /context
   ```

   This is the desk: how much room is left for the conversation, and what is taking up space.

6. **Wipe the desk.**

   ```
   /clear
   ```

   The conversation is gone, the meter is back at the start. The files stay untouched.

## What just happened

You opened a session (a conversation tied to this folder), gave it one prompt (a sentence in
your own words), and got an answer that was based on a real file it went and read for you.

Everything in that exchange, your sentence, the file it opened and its own answer, is stored
on the desk that `/context` shows, and `/clear` is how you clear the desk for the next job.
