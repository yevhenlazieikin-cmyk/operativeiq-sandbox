---
name: implement-jira-task
description: Fetch a Jira task from the task-list-fe project, analyze its business requirements, draft an implementation plan, wait for user approval, then implement it — optionally guided by a user-provided implementation description
user-invocable: true
argument-hint: Jira task link (required) | Implementation description (optional)
allowed-tools: mcp__jira__jira_get Read Glob Grep Edit Write Bash(git *) Bash(npm *) Bash(npx *)
---

Fetch a Jira task, analyze its business requirements, draft an implementation plan, get explicit user approval, and then implement the task — reusing other skills (`/ng-page`, `/ng-component`, `/ng-grid`, `/ng-dialog`, `/apply-code-design`, `/apply-figma-design`) whenever they fit.

Parse $ARGUMENTS to extract:

- **[jiraLink]** (REQUIRED): Jira task URL (e.g. `https://operativeiq.atlassian.net/browse/EMSP-13796`) or bare issue key (e.g. `EMSP-13796`). Extract the issue key from the URL path segment after `/browse/`.
- **[description]** (OPTIONAL): free-form implementation hints from the user (e.g. "new grid page under OPERATION menu", "reuse BaseSelectEntityDialog for crew picker", a Figma URL, etc.). When present, use it to bias the plan toward the user's preferred approach.

If `[jiraLink]` is missing or the issue key cannot be extracted, **stop and ask the user** for a valid Jira link.

---

## Workflow

### Step 1 — Fetch the Jira task

Call `mcp__jira__jira_get` with the issue key. Filter to only the fields you need to keep token usage low:

```
path: /rest/api/3/issue/{{issueKey}}
queryParams: { fields: "summary,description,status,issuetype,priority,labels,components,assignee,reporter,issuelinks,subtasks,attachment" }
jq: "{ key: key, summary: fields.summary, status: fields.status.name, type: fields.issuetype.name, priority: fields.priority.name, labels: fields.labels, components: fields.components[*].name, description: fields.description, subtasks: fields.subtasks[*].{key: key, summary: fields.summary, status: fields.status.name}, links: fields.issuelinks[*].{type: type.name, inwardIssue: inwardIssue.key, outwardIssue: outwardIssue.key}, attachments: fields.attachment[*].{filename: filename, url: content} }"
```

Then fetch comments (often carry clarifications / acceptance criteria):

```
path: /rest/api/3/issue/{{issueKey}}/comment
queryParams: { maxResults: "50" }
jq: "comments[*].{author: author.displayName, created: created, body: body}"
```

If the `description` field uses Atlassian Document Format (ADF, JSON tree), flatten any nested `content[*].text` nodes to readable text.

### Step 2 — Analyze and summarize

Read the fetched data and produce a short, structured summary in chat (kept in context, not written to disk):

- **Ticket**: `[KEY] — [summary]` (type, priority, status)
- **Goal**: 1–3 sentences restating the business outcome the ticket is asking for
- **Acceptance criteria**: bullet list extracted from description/comments. If none are explicit, infer them from the goal and mark them as *inferred*
- **Open questions**: anything ambiguous or missing. If answers would change the implementation significantly, **ask the user before planning** — do not guess.
- **Linked artifacts**: Figma URLs found in description/comments/attachments, linked tickets, related docs

### Step 3 — Draft the implementation plan

Build a concrete, file-level plan. It must answer: *what to build, where, and which existing skill/pattern to reuse*.

Structure the plan as:

1. **Approach** — 2–4 sentences describing the shape of the change (new page? new component? service change? dialog? refactor?). Cite existing patterns from CLAUDE.md.
2. **Skill delegation** — pick the right existing skill for each piece of work:
   - Figma URL present → `/apply-figma-design`
   - No Figma but clear page description → `/apply-code-design`
   - Grid/list page → `/ng-grid` (invoked via `/ng-page`)
   - Details / edit form page → `/ng-page` (form kind — `bo-details-panel` + `FieldConfig[]`)
   - Composite details+grid+comments hub → `/ng-page` (hub kind — pattern from `task-management`)
   - Standalone dialog / picker → `/ng-dialog`
   - New reusable widget → `/ng-component` (page-local vs shared-ui per CLAUDE.md §4a)
   - Cross-cutting / small edits → implement directly, no skill
3. **Files to create / modify** — enumerate each file with a one-line purpose:
   - `src/app/pages/<name>/<name>.component.ts` — new page shell
   - `src/app/pages/<name>/<name>.schema.ts` — filter + cell schema OR form builder + field configs
   - `src/app/pages/<name>/<name>-service/<name>.service.ts` — HTTP facade
   - `src/app/pages/<name>/<name>.interface.ts` — view models / DTOs
   - `src/app/app.routes.ts` — new short path + `apps/task-list/<slug>` legacy redirect
   - `src/app/core/constants/permission.constants.ts` — new permission entries
   - `src/assets/data/messages.json` — new i18n keys (if any)
4. **Route guards & resolvers** — list `permissionGuard(PermissionConstants.xxx, false)` with the PageCodes you'll use (ask if unknown), and any data resolvers from `src/app/core/resolvers/` (`timeZoneResolver`, `supplyRoomResolver`, `unitResolver`).
5. **Data model** — mock data for UI-only tickets; DTO / endpoint path for backend-wired tickets. If new endpoints are required, call that out as a *backend dependency*.
6. **Open decisions** — explicit items needing user confirmation before you write code (naming, `menuType`, permission codes, module placement, shared-ui additions, etc.).
7. **Verification** — how you'll confirm it works: `npm run lint:all`, `npx tsc --noEmit`, manual browser walkthrough at `http://localhost:4200/<slug>` (and the legacy `apps/task-list/<slug>`), permission gating check.

Present the plan in the chat. **Do not start coding yet.**

### Step 4 — Wait for approval

Ask the user to approve, reject, or amend the plan. Accept one of three responses:

- **Approve** (`yes`, `go`, `lgtm`, `approved`) → proceed to Step 5
- **Amend** (specific changes) → update the plan, re-present, wait again
- **Reject** (`no`, `stop`) → stop and ask what they'd rather do

Do not proceed to implementation on ambiguous answers — ask for an explicit approve/amend/reject.

### Step 5 — Implement

Once the plan is approved:

1. **Create a branch** matching the Jira key if you're not already on one:
   ```bash
   git checkout -b {{issueKey}}
   ```
   Only create the branch if the current branch doesn't already reference the key. Never switch branches silently when there are uncommitted changes — stop and tell the user. Pay attention to the submodule: `backoffice-shared-ui/` has its own git history.

2. **Delegate to skills** from the plan. When invoking another skill, pass the page/component name, menuType, kind (grid/form/hub), permission code, Figma URL or code design description, etc., as structured arguments following that skill's `argument-hint`.

3. **Do direct edits** for anything the skills don't cover:
   - Route registration in `src/app/app.routes.ts` (short path + `apps/task-list/<slug>` legacy redirect, `permissionGuard`, `title`, `data.menuType`, resolvers).
   - Permission constants in `src/app/core/constants/permission.constants.ts`.
   - `src/assets/data/messages.json` entries for user-facing text (validation / toast / dialog bodies).

4. **Follow CLAUDE.md conventions** for every file you touch:
   - No `standalone: true` (Angular 20 default), `ChangeDetectionStrategy.OnPush`, `inject()`, signals, Angular 17+ control flow.
   - `styleUrl` (singular). `takeUntilDestroyed(this.destroyRef)` for cleanup — no `ReplaySubject<void>(1)`.
   - Pages render inside the existing `<bo-layout>` + `<router-outlet>` in `src/app/app.html` — do NOT wrap in another layout.
   - Headers via `<bo-action-buttons-panel [state]="menuType.operation | menuType.administration">`.
   - SCSS: `@use 'variables' as *;` + shared tokens (`$white`, `$error-red`, `$forest-green`, `$ocean-blue`, …). No raw hex where a token exists.
   - Dates: `SettingHelperService.getDate()` + `| customDateUtc: format : tzone?.Iana_TimeZoneName`. Never hardcoded.
   - URLs: `${environment.CLIENT_API}/…`. Services are `providedIn: 'root'`, thin (transport + `LoaderService` spinner).
   - SVG icon names are **camelCase** (e.g. `arrowLeftSlider`) — use `<bo-svg-icon name="key" />`.

5. **Reuse shared-ui.** Before adding any markup, check `@backoffice/shared-ui` public API: `bo-action-buttons-panel`, `bo-grid`, `bo-details-panel`, `bo-base-dialog`, `bo-configurable-dialog`, `BaseSelectEntityDialog`, `MultipleSelectEntityDialog`, `GenericSortDialog`, `bo-search-dropdown`, `bo-tabber`, `bo-progress-bar`, `bo-stacked-progress-bar`, `bo-slide-toggle`, `bo-date-picker`, `bo-time-picker`, `bo-counter`, `bo-info-tooltip`, `bo-loader`, etc. Generic widgets not yet in shared-ui → add to the submodule (separate PR) per CLAUDE.md §4a; ask when ambiguous.

6. **Verify**:
   - `npx tsc --noEmit` to confirm compilation.
   - `npm run lint:all` — fix what you can with `npm run lint:all:fix`; surface anything left to the user.
   - If `npm start` is already running, open the new route and walk through the golden path. Confirm permission gating, menuType colour scheme, resolvers, filter/column-setup persistence (for grid pages).

7. **Report back** with:
   - The Jira key + summary
   - List of created / modified files
   - The route(s) to exercise (short path + legacy `apps/task-list/<slug>`)
   - Permission codes used (mark any *needs backend confirmation*)
   - Follow-up items (backend endpoints missing, messages to translate, tests to add, shared-ui primitives to submit as submodule PR)

**Do not commit or push.** The user runs `/create-mr` separately when they're ready to open a merge request.

---

## Rules

1. **Never skip plan approval.** Step 4 is blocking — no edits until the user says go.
2. **Always cite the Jira key** in plan and report (e.g. `EMSP-13796`) so the ticket is traceable from chat and future commits.
3. **Reuse, don't reinvent.** Check `@backoffice/shared-ui`, `src/app/core/services/`, `src/app/core/resolvers/`, and other `.claude/skills/` before generating new code.
4. **Delegate to existing skills** whenever the scope matches — don't duplicate their logic inline.
5. **Convert ADF to plain text** when reading Jira descriptions/comments so you don't miss acceptance criteria buried in nested nodes.
6. **Ask, don't assume**, when ambiguity would change the implementation (permission codes, route placement, menuType, which page kind the ticket belongs to, shared-ui vs page-local placement).
7. **Flag backend dependencies** — if the ticket needs new API endpoints, mock the data with `of([...])`, call it out as a backend dependency, and keep implementing the frontend.
8. **No branch/commit churn** — create the feature branch once, don't force-push, don't commit without explicit user instruction. Watch for modified `backoffice-shared-ui` entries in `git status` — that's the submodule and needs its own PR.
9. **Stay in scope.** Only implement what the ticket asks for. Don't refactor adjacent code, add speculative features, rename unused variables, or clean up surrounding code.
10. **Route registration is mandatory.** Always add both the short path AND the legacy `apps/task-list/<slug>` redirect — the host shell depends on it.
