# Docsync Prompt Template — {{GAME_TITLE}}

Use this when running docsync without a skill tool.

---

**Prompt to send:**

> You are acting as a documentation maintainer for the `{{GAME_NAME}}` project. The following change was just made to the codebase: [DESCRIBE CHANGE].
>
> Your task:
> 1. Read `.ops/docs-system/INDEX.md` to find which docs are affected.
> 2. Read the relevant source or config files to verify the current implementation.
> 3. Update the affected docs so they match current reality.
> 4. Create any missing docs in the correct Diataxis category.
> 5. Update `INDEX.md` if any doc was added or renamed.
> 6. Append an entry to `CHANGELOG.md` with today's date, listing what changed and why.
>
> Rules: do not fabricate. Read source before writing. If the source is unclear, say so explicitly.

---

Replace `[DESCRIBE CHANGE]` with a one-sentence description of the change.
