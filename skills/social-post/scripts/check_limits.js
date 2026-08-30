#!/usr/bin/env node
// Deterministic guard for drafted posts: language models miscount characters,
// this script does not. Zero dependencies, Node 18+.
//
// Usage: node check_limits.js <linkedin|instagram|x> <draft-file>
// Exit 0 = draft fits the platform rules, exit 1 = violations listed below.

const fs = require("node:fs");

const [, , platform, file] = process.argv;
const platforms = ["linkedin", "instagram", "x"];
if (!platforms.includes(platform) || !file) {
  console.error("usage: node check_limits.js <linkedin|instagram|x> <draft-file>");
  process.exit(2);
}

const text = fs.readFileSync(file, "utf8").trim();
const lines = text.split("\n");
const hashtags = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
const problems = [];

if (platform === "x") {
  if (text.length > 280) problems.push(`${text.length} characters, hard cap is 280`);
  else if (text.length > 240) problems.push(`${text.length} characters, aim under 240 so quotes have room`);
  if (hashtags.length > 0) problems.push(`${hashtags.length} hashtag(s), X version uses none`);
}

if (platform === "linkedin") {
  if (hashtags.length > 3) problems.push(`${hashtags.length} hashtags, LinkedIn caps at 3`);
  const paragraphs = text.split(/\n\s*\n/).length;
  if (paragraphs < 4 || paragraphs > 6) problems.push(`${paragraphs} paragraphs, rule says 4-6`);
  if (/^(merhaba|selam|hello|hi)\b/i.test(lines[0])) problems.push("first line is a greeting, lead with a claim or a number");
}

if (platform === "instagram") {
  if (hashtags.length !== 5) problems.push(`${hashtags.length} hashtags, Instagram version uses exactly 5`);
  const lastLineTags = (lines.at(-1).match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
  if (lastLineTags !== hashtags.length) problems.push("hashtags must all sit on the last line");
}

if (problems.length === 0) {
  console.log(`OK: ${platform} draft fits (${text.length} characters, ${hashtags.length} hashtags)`);
} else {
  for (const p of problems) console.log(`FAIL: ${p}`);
  process.exit(1);
}
