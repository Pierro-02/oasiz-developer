# How to Use Docsync

Docsync keeps `.ops/docs-system/**` in sync with the actual codebase after structural changes.

## When to run

Run docsync after any of the following:

- Adding or removing a top-level system (new folder, new module)
- Changing the AppPhase flow or screen routing
- Changing build or Vite config
- Adding new platform integration (new oasizBridge function)
- Changing the PlayroomTransport event contract
- Updating the audio or asset pipeline

You do **not** need to run it for: gameplay tuning, bug fixes inside an existing system, or CSS-only changes.

## Via Claude Code skill (recommended)

In the Claude Code chat:

```
Skill("docsync")
```

Claude reads the INDEX.md, checks affected source files, updates the relevant docs, and appends a CHANGELOG entry.

## Via Codex agent

In the Codex CLI:

```
/docsync
```

Uses `.codex/skills/docsync/SKILL.md` and the `openai.yaml` agent config.

## Manual fallback

1. Open `.ops/docs-system/DOCSYNC_PROMPT.md`
2. Fill in the `[DESCRIBE CHANGE]` placeholder
3. Run that prompt in any AI assistant

Or use the checklist at `.codex/skills/docsync/references/checklist.md`.

## Commit gate

The `.claude/settings.json` PreToolUse hook blocks `git commit` if code changes are staged without matching doc updates. If you're blocked:

1. Run `Skill("docsync")` to update the docs
2. Stage the updated doc files
3. Re-run the commit
