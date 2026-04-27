---
name: create-mr
description: Create a GitLab merge request targeting Development, Staging, Ext-demo, Prod_productiontest, or Prod_live
user-invocable: true
argument-hint: GitLab project URL (required) | Target branch (Dev | Staging | Ext-demo | Prod_productiontest | Prod_live)
allowed-tools: Bash(git *)
---

Parse $ARGUMENTS to extract:

- **[gitlabUrl]** (REQUIRED): GitLab project URL (e.g. `https://git.operativeiq.com/ems-technology-solutions/task-list/task-list-fe`). If missing, **stop and ask the user** for the project's GitLab URL.
- **[target]** (REQUIRED): target branch — one of: `Development`, `Staging`, `Ext-demo`, `Prod_productiontest`, `Prod_live`.

Alias mapping (accept shorthand):
- `Dev` or `Development` → `Development`
- `Staging` → `Staging`
- `Ext-demo` or `ext-demo` → `Ext-demo`
- `Prod_productiontest` or `prodtest` → `Prod_productiontest`
- `Prod_live` or `prod` → `Prod_live`

If `[target]` is missing or doesn't match one of the five allowed branches, **stop and ask the user** which target branch to use.

## Project info

- **GitLab URL**: provided via `[gitlabUrl]` argument
- **Remote**: `origin`
- **Default main branch**: `main` (used for reference only — don't MR into it directly; use the promotion flow below)

---

## Workflow

### Step 1 — Validate state

```bash
# Current branch
git branch --show-current

# Uncommitted changes
git status --short

# Unpushed commits (vs tracked upstream)
git log @{u}..HEAD --oneline 2>/dev/null
```

Rules:
- **Never auto-commit.** If `git status --short` shows uncommitted changes, stop and tell the user to commit (or use `/commit`) first.
- **Submodule caveat.** `backoffice-shared-ui/` is a git submodule; a lone `M backoffice-shared-ui` line in `git status` means the submodule has been moved to a different commit. Ask the user before pushing — that change usually belongs in a separate submodule PR, not in this MR.
- If the branch has unpushed commits, push them first: `git push origin HEAD -u`.
- If the feature branch is behind `[target]`, mention it in the report — do NOT auto-rebase or merge.

### Step 2 — Gather MR context

```bash
# Commits on this branch that aren't on the target
git log origin/[target]..HEAD --oneline

# Diff summary against target
git diff origin/[target]..HEAD --stat
```

- Extract the Jira key from the branch name (e.g. `EMSP-13796`) as the MR title prefix.
- Build the MR title from the most descriptive commit subject(s). Prefer the Jira-ticket-style `EMSP-XXXXX: <short description>` format.

### Step 3 — Create the merge request

Use GitLab push options so the MR is created on push — no browser round-trip:

```bash
git push origin HEAD \
  -o merge_request.create \
  -o merge_request.target=[target] \
  -o merge_request.title="EMSP-XXXXX: <short description>" \
  -o merge_request.remove_source_branch
```

If the branch isn't yet tracked upstream, add `-u`:

```bash
git push -u origin HEAD \
  -o merge_request.create \
  -o merge_request.target=[target] \
  -o merge_request.title="EMSP-XXXXX: <short description>" \
  -o merge_request.remove_source_branch
```

Never pass `--force` / `--force-with-lease`. If GitLab rejects the push for non-fast-forward, **stop** and tell the user.

### Step 4 — Report the MR URL

After a successful push, GitLab's response contains the MR URL on stderr — extract and show it. Fallback link (construct from the provided `[gitlabUrl]`):

```
[gitlabUrl]/-/merge_requests
```

Report back with:
- Source → target branch
- MR title
- MR URL (from push output if present, otherwise the fallback link above)
- Commits included (one-line list)

---

## Branch Flow Reference

Standard promotion path:

```
Feature branch (EMSP-XXXXX)
  → Development         (integration)
    → Staging            (QA)
      → Ext-demo          (client demo)
        → Prod_productiontest (pre-prod)
          → Prod_live        (production)
```

Typical uses:
- Feature work from a Jira ticket → MR into `Development`.
- Promotion of finished features → MR from `Development` into `Staging`, then onward.
- Hotfixes follow the same path (bottom-up) so lower environments stay in sync.

---

## Rules

1. **Never force-push.** Regular `git push` only.
2. **Never auto-commit.** If there are uncommitted changes, stop and tell the user to commit first.
3. **Never touch the submodule silently.** A modified `backoffice-shared-ui` entry needs its own PR on the submodule repo before this MR is created.
4. MR title format: `EMSP-XXXXX: <short description>` — extract the Jira key from the branch name.
5. Always set `merge_request.remove_source_branch` for cleanup.
6. If the source branch isn't tracked upstream, add `-u` to the push.
7. If `[target]` doesn't match one of the five allowed branches, stop and ask.
8. If `[gitlabUrl]` is missing, stop and ask — never guess.
9. If GitLab rejects the push (non-fast-forward, hooks failing, permissions), surface the error verbatim — do NOT bypass hooks or retry destructively.
10. Never MR directly into `main` — promotion goes through the `Development → Staging → Ext-demo → Prod_productiontest → Prod_live` chain.
11. Skip Claude attribution in the MR description unless the user asks — follow the project's default commit/MR conventions.
