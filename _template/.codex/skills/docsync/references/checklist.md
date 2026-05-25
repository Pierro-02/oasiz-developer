# Docsync Checklist

Use this when running docsync manually without the skill tool.

## Pre-flight

- [ ] Read `.ops/docs-system/INDEX.md`
- [ ] Read the last 5 entries in `.ops/docs-system/CHANGELOG.md`
- [ ] Identify which systems changed

## Per Changed System

- [ ] Find the matching doc in `INDEX.md`
- [ ] Read the source or config files for the system
- [ ] Compare source to doc and identify stale content
- [ ] Update the doc to match the current implementation
- [ ] If no doc exists, create one in the right Diataxis category

## Post-update

- [ ] Update `INDEX.md` if a doc was added or renamed
- [ ] Append a dated entry to `CHANGELOG.md`
- [ ] Verify no doc references missing files or nonexistent systems
