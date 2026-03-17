---
name: commit-with-docs
description: Summarizes code changes, validates staged diffs, updates documentation (docs/, README, CLAUDE.md, changelog), and creates git commits with aligned docs. Use when completing a feature or fix that requires documentation updates alongside code changes, writing commit messages, or updating changelogs and README files.
allowed-tools: "git, Bash, Edit"
---

# Global Safety Constraints (Must Follow)
- Analyze only staged (git add) changes
- Modify only:
  - docs/**
  - CLAUDE.md (documentation links section only)
  - SESSION.md
- Never modify business code
- If session and diff conflict, explicitly flag the issue—do not proceed silently

# Context (Fact Sources)
- Staged status: `git status --porcelain`
- Staged name-status: `git diff --cached --name-status`
- Staged patch: `git diff --cached`
- SESSION.md: `cat SESSION.md 2>/dev/null || echo "NO_SESSION_FILE"`
- CLAUDE.md: `cat CLAUDE.md 2>/dev/null || echo "NO_CLAUDE_FILE"`
- docs overview: `find docs/ -name "*.md" 2>/dev/null || echo "No docs found"`

# Phase 1: Session + Diff → Plan (Analyze Only)

## If SESSION.md Does Not Exist: Create Template and Stop

### SESSION.md Template
```md
# Session Intent (commit-level)
## Why
*

## What changed (user/dev visible)
*

## New concepts / modules / configs
*

## Scope (paths/modules)
*

## Breaking / Migration
*
```

## Phase 1 Output
- **Session Summary** (≤6 lines): Why / What / Scope / New concepts / Migration / Test status
- **Doc Change Plan** (Checklist): Each item includes documentation path + reason (linked to SESSION) + diff evidence (file path) + confidence level
- **Conventional Commit Candidates** (2 options)

# Phase 2: Apply → Docs + Commit

## Prerequisites
- SESSION.md exists and is not purely a template

## Detection Rules (Heuristics)
- **Module paths**: `src/modules/<name>/`, `modules/<name>/`, or `packages/<name>/`
- **API changes**: `**/api/**`, `**/routes/**`, `**/controller/**`, `openapi*.{yml,yaml,json}`, `proto/**`, `sdk/**`
- **Directory restructuring**: name-status contains `R*` (rename/move)

## Execution Steps
1. Update docs according to Doc Plan (modify only `docs/**`, CLAUDE.md links section, SESSION.md)
2. Run: `git add docs/ CLAUDE.md SESSION.md`
3. Run: `git commit -m "<conventional commit message>"`

## Example Workflow

### Scenario: Add new API endpoint with docs
1. Check staged changes: `git diff --cached --name-status`
2. Read SESSION.md to understand intent
3. Identify docs that need updates (e.g., `docs/api.md`, `docs/endpoints.md`)
4. Update docs with new endpoint details, parameters, examples
5. Verify no business code was modified
6. Stage and commit: `git add docs/ && git commit -m "docs: add new endpoint documentation"`

### Scenario: Refactor module with breaking changes
1. Verify staged changes include module restructuring
2. Check SESSION.md for migration notes
3. Update `docs/migration.md` or `docs/changelog.md` with breaking change details
4. Update `CLAUDE.md` links if module paths changed
5. Commit: `git commit -m "docs: update migration guide for module refactor"`
