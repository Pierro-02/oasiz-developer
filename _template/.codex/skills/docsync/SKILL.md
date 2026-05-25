---
name: docsync
description: Synchronises .ops/docs-system/** with current codebase state after structural changes.
---

# Docsync Skill

Reads the current codebase state and updates the live docs so they reflect reality.

## Mandatory Reads

1. `.ops/docs-system/INDEX.md`
2. `.ops/docs-system/CHANGELOG.md` (last 5 entries)
3. The relevant reference doc for the changed system

## Workflow

1. Identify affected docs via `INDEX.md`.
2. Read the changed source or config files to verify current implementation.
3. Update affected `.ops/docs-system/docs/**` files.
4. Create a new doc if a changed system does not have one yet.
5. Update `INDEX.md` for added or renamed docs.
6. Append a dated entry to `CHANGELOG.md`.

## Output Contract

- List of updated files with one-line summaries
- New `CHANGELOG.md` entry verbatim
- Flag any inaccurate doc found during review

## Guardrails

- Never fabricate. Read source first.
- Mark uncertainty explicitly.
- Keep prose technical and direct.
