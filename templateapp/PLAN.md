# Plan: Dataverse Template App with Business Process Flow

## Goal

A reusable demo template that runs as a Power Apps Code App in your sandbox, looks and feels like a model-driven app, and has a 4-stage Business Process Flow bar that you can rename per customer. Each phase below ends with a checkpoint — **you approve before the next phase starts**.

---

## Tech Decisions

| Concern | Choice | Reason |
|---|---|---|
| UI library | **Fluent UI v9** (`@fluentui/react-components`) | Same library used by Power Apps / Dynamics 365 |
| Icons | `@fluentui/react-icons` | Matches model-driven icon set |
| Routing | React state (no router) | Single-page app; no URL routing needed inside a Code App |
| Auth | Power Apps runtime | Tokens injected automatically by the host — no Azure AD setup |
| Deployment CLI | `power-apps push` (npm CLI) | Matches the project's existing `power.config.json` format |
| Data | Mock data by default → swap to generated Dataverse service | Demo works immediately; live data added in Phase 7 |

---

## The Key Abstraction: One Config File Per Customer

`src/config/customer.config.ts` is the **only file you change** for each customer demo:

```typescript
export const customerConfig = {
  appTitle: 'Template App',
  brandColor: '#0078d4',

  stages: [
    { id: 1, name: 'Qualify',  description: 'Identify and qualify the opportunity' },
    { id: 2, name: 'Develop',  description: 'Define and develop the solution' },
    { id: 3, name: 'Propose',  description: 'Deliver the proposal' },
    { id: 4, name: 'Close',    description: 'Close and win the deal' },
  ],

  entityDisplayName: 'Opportunity',
  entityDisplayNamePlural: 'Opportunities',

  formFields: [
    { name: 'name',           label: 'Name',        type: 'text',      required: true },
    { name: 'description',    label: 'Description', type: 'multiline', required: false },
    { name: 'estimatedvalue', label: 'Est. Value',  type: 'currency',  required: false },
    { name: 'closingdate',    label: 'Close Date',  type: 'date',      required: false },
  ],

  stageField: 'xen_stage',  // integer column (1–4) on the Dataverse table
};
```

---

## Final File Structure

```
src/
├── config/
│   └── customer.config.ts          ← EDIT THIS per customer
├── types/
│   └── index.ts                    ← DataverseRecord, Stage, FormField interfaces
├── services/
│   ├── mock.data.ts                ← Sample records (used until Phase 7)
│   └── dataverse.service.ts        ← Uniform CRUD wrapper (mock → live swap here)
├── hooks/
│   └── useDataverse.ts             ← React hook: getAll / get / save / delete
├── components/
│   ├── AppShell/
│   │   └── AppShell.tsx            ← Header + sidebar + content slot
│   ├── NavSidebar/
│   │   └── NavSidebar.tsx          ← Left-rail nav (collapsible, ~240 px)
│   ├── BusinessProcessFlow/
│   │   ├── BusinessProcessFlow.tsx ← 4 chevron stages (THE star component)
│   │   └── BusinessProcessFlow.css ← Chevron shape via CSS clip-path
│   ├── RecordCommandBar/
│   │   └── RecordCommandBar.tsx    ← Save / New / Delete / Back
│   ├── RecordList/
│   │   └── RecordList.tsx          ← DataGrid with stage badge column
│   └── RecordForm/
│       └── RecordForm.tsx          ← BPF bar + field grid + Next/Prev stage
├── App.tsx                         ← View-switching state (list ↔ form)
├── main.tsx                        ← FluentProvider wrapper
└── index.css                       ← Full-height layout reset
```

---

## Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  [App Title]                            [User: John Doe]   │  ← AppShell header
├──────────┬─────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────┐   │
│  NAV     │  │ ✓ Qualify  ▶  ✓ Develop  ▶  ● Propose  ▶  Close │  ← BPF bar
│          │  └─────────────────────────────────────────┘   │
│  ○ Records│  [Save]  [New]  [Delete]  [← Back]            │  ← CommandBar
│  ○ ...   │  ┌─────────────────────────────────────────┐   │
│          │  │  Name        [ Acme Corp            ]   │   │
│          │  │  Description [ ...                  ]   │   │  ← RecordForm
│          │  │  Est. Value  [ 50,000               ]   │   │
│          │  │  Close Date  [ 2026-08-01            ]   │   │
│          │  └─────────────────────────────────────────┘   │
│          │              [← Prev Stage]  [Next Stage →]     │
└──────────┴─────────────────────────────────────────────────┘
```

---

## Phase 0 — Prerequisites (You do this manually, no code)

Everything here is one-time setup in your sandbox. **Complete all steps before asking me to start Phase 1.**

### 0A — Verify tools
Run each command and confirm it returns a version:
```
node -v
npm -v
pac --version
```
If `pac` is missing: install the [Power Platform CLI](https://aka.ms/PowerAppsCLI).

### 0B — Authenticate PAC CLI against your sandbox
```bash
pac auth create
pac env list
# Copy the environment ID shown for your sandbox
pac env select --environment <your-sandbox-environment-id>
```
Confirm: `pac env list` shows your sandbox as selected (asterisk next to it).

### 0C — Create the Dataverse custom table
In [make.powerapps.com](https://make.powerapps.com) → **Tables** → **New table**:

| Setting | Value |
|---|---|
| Display name | `Demo Record` (or whatever fits your demo) |
| Plural name | `Demo Records` |
| Primary column display name | `Name` |

Then add these columns to the table:

| Column display name | Logical name (auto-set) | Type | Required |
|---|---|---|---|
| Description | `xen_description` | Multiline Text | No |
| Estimated Value | `xen_estimatedvalue` | Currency | No |
| Close Date | `xen_closedate` | Date Only | No |
| Stage | `xen_stage` | Whole Number | No |

> **Note:** The `xen_` prefix is your publisher prefix. If your publisher prefix is different (check Settings → Solutions → Publisher), replace `xen_` with your prefix in `customer.config.ts` later.

### 0D — Add sample data
Open the table → **Edit data in Excel** or use the **Data** tab to add 3–5 sample rows. Set `xen_stage` to 1, 2, or 3 for different records so the demo shows varied stages.

### 0E — Find your Dataverse connection ID
```bash
pac connection list
```
Look for the row with **shared_commondataserviceforapps** (Dataverse). Copy its **Connection ID** — you'll need it in Phase 7.

### Checkpoint 0
- [ ] `pac --version` returns a version
- [ ] `pac env list` shows your sandbox selected
- [ ] The `Demo Record` table exists in make.powerapps.com with all 5 columns
- [ ] At least 3 sample rows added with different `xen_stage` values
- [ ] Dataverse connection ID copied

---

## Phase 1 — Project Foundation

**What gets built:** Fluent UI installed, TypeScript types, customer config, mock data, service abstraction layer.

No visible UI yet — this is the data and config layer.

### Files created / modified
- `package.json` updated (`@fluentui/react-components`, `@fluentui/react-icons` added)
- `vite.config.ts` updated — add `server: { port: 3000 }` so dev server matches `power.config.json`'s `localAppUrl`
- `src/config/customer.config.ts`
- `src/types/index.ts`
- `src/services/mock.data.ts`
- `src/services/dataverse.service.ts`
- `src/hooks/useDataverse.ts`

### Checkpoint 1
Run:
```bash
npm install          # installs Fluent UI
npm run dev          # should start on http://localhost:3000
```
- [ ] Dev server starts at **port 3000** with no errors
- [ ] No TypeScript errors in the terminal
- [ ] (Default Vite page still shows — shell comes in Phase 2)

---

## Phase 2 — App Shell & Navigation

**What gets built:** Full model-driven app layout — header bar with app title and user name, collapsible left sidebar, and the content slot.

### Files created/modified
- `src/components/AppShell/AppShell.tsx`
- `src/components/NavSidebar/NavSidebar.tsx`
- `src/main.tsx` (wrap with `FluentProvider`)
- `src/App.tsx` (render AppShell, placeholder content)
- `src/index.css` (reset: full-height, no margin, white background)
- `src/App.css` (cleared)

### Checkpoint 2
Run `npm run dev` and verify:
- [ ] Page shows the header bar with the app title from `customer.config.ts`
- [ ] Left sidebar visible with a "Records" nav item
- [ ] Layout fills the full browser height
- [ ] No console errors

---

## Phase 3 — Business Process Flow Component

**What gets built:** The 4-stage chevron BPF bar that is the centrepiece of every record form.

Visual behaviour:
- Completed stages → green with a checkmark
- Active stage → blue (brand colour)
- Future stages → grey
- Clicking any stage fires `onStageClick`

### Files created
- `src/components/BusinessProcessFlow/BusinessProcessFlow.tsx`
- `src/components/BusinessProcessFlow/BusinessProcessFlow.css`

### Checkpoint 3
Run `npm run dev`. Temporarily mount `<BusinessProcessFlow>` in `App.tsx` with `activeStage={2}`:
- [ ] 4 chevron stages render side-by-side
- [ ] Stage 1 is green (completed)
- [ ] Stage 2 is blue (active)
- [ ] Stages 3–4 are grey (future)
- [ ] Stage names come from `customer.config.ts`
- [ ] No layout overflow or clipping

---

## Phase 4 — Record List View

**What gets built:** DataGrid showing all records from mock data with a stage badge column. Clicking a row will eventually open the form (wired in Phase 6).

### Files created
- `src/components/RecordList/RecordList.tsx`

### Checkpoint 4
Run `npm run dev`. Navigate so `RecordList` renders in the content area:
- [ ] Grid shows the mock records
- [ ] "Stage" column shows a coloured badge with the stage name (not a number)
- [ ] "+ New" button visible in the toolbar
- [ ] Clicking a row logs the record ID to the console (full navigation wired in Phase 6)

---

## Phase 5 — Record Form View

**What gets built:** The full form — command bar, BPF bar at top, two-column field grid, and Next/Previous Stage buttons at the bottom.

### Files created
- `src/components/RecordCommandBar/RecordCommandBar.tsx`
- `src/components/RecordForm/RecordForm.tsx`

### Checkpoint 5
Temporarily hard-code a mock record into `App.tsx` to render `RecordForm`:
- [ ] BPF bar shows at the top with the correct active stage highlighted
- [ ] All form fields from `customer.config.ts` render with their labels
- [ ] "Next Stage →" button advances `activeStage` visually
- [ ] "← Prev Stage" button goes back
- [ ] "Save" in command bar logs the current field values to console
- [ ] "← Back" button is present (navigation wired in Phase 6)

---

## Phase 6 — Wire App State

**What gets built:** `App.tsx` connects everything. List → click row → form opens for that record. Form → Back → returns to list. New → blank form opens. Save → updates record in mock data.

### Files modified
- `src/App.tsx` (full view-switching state machine)
- `src/hooks/useDataverse.ts` (connects to mock service)

### Checkpoint 6
Run `npm run dev` and walk through the full flow:
- [ ] App opens on the list view showing mock records
- [ ] Click a record → form opens with that record's data and correct BPF stage
- [ ] "← Back" → returns to list
- [ ] "+ New" → blank form opens, fill fields, Save → record appears in list
- [ ] "Next Stage →" on a record → stage advances, BPF bar updates, Save persists it
- [ ] "Delete" on a record → record removed from list
- [ ] No console errors throughout

**This is the demo-ready milestone.** At this point you have a fully working app with mock data that you can show locally.

---

## Phase 7 — Connect Live Dataverse

**What gets built:** Replace mock data with the real Dataverse table created in Phase 0.

### Steps (you run the CLI commands, I update the code)

**Step 7A — Generate the typed service**
```bash
pac code add-data-source -a shared_commondataserviceforapps -c <connectionId-from-Phase-0E> -t xen_demorecord
```
This generates:
- `src/generated/models/XenDemorecordModel.ts`
- `src/generated/services/XenDemorecordService.ts`
- Updates `power.config.json` with the data source metadata

**Step 7B — Update the service wrapper**
I update `src/services/dataverse.service.ts` to import and use `XenDemorecordService` instead of mock data. The rest of the app is untouched.

**Step 7C — Update customer config**
Update `stageField`, `entityDisplayName`, and `formFields` logical names to match the generated model.

### Checkpoint 7
Run `npm run dev`:
- [ ] App loads real records from your Dataverse sandbox table
- [ ] Stage badges reflect the `xen_stage` values you set in Phase 0D
- [ ] Save a field change → refresh → change persists in Dataverse
- [ ] Advance a stage → refresh → stage persists

---

## Phase 8 — Build & Deploy to Sandbox

**What gets built:** Production build pushed to your Power Apps sandbox environment as a runnable Code App.

### Steps
```bash
# 1. Final build check
npm run build
# Must complete with 0 errors

# 2. First-time push (creates the app in Power Apps, fills in appId in power.config.json)
power-apps push
# On success: CLI prints a URL — open it in your browser

# 3. Commit power.config.json (now has appId filled in)
# Subsequent deploys: npm run build && power-apps push
```

> **First push vs subsequent pushes:** The first `power-apps push` registers the app in your environment and writes the `appId` back into `power.config.json`. Save that file — every push after uses it to update the same app rather than creating a new one.

### Checkpoint 8
- [ ] `npm run build` completes with no TypeScript errors
- [ ] `power-apps push` completes with no errors
- [ ] CLI prints a Power Apps URL — open it
- [ ] App loads in Power Apps with the correct title and branding
- [ ] BPF stages show, navigation works, data loads from Dataverse
- [ ] Share the URL with a colleague to confirm it works outside your machine

---

## Per-Customer Demo Checklist (After the Template is Built)

Once the template is complete, adapting it for a new customer takes ~15 minutes:

| Step | Action | Time |
|---|---|---|
| 1 | Edit `src/config/customer.config.ts` — new `appTitle`, rename 4 stages, update field labels | 5 min |
| 2 | If using customer's own Dataverse table: run `pac code add-data-source` with their table, update `dataverse.service.ts` | 5 min |
| 3 | `npm run build && power-apps push` | 2 min |
| 4 | Share the URL | instant |

If the customer has no Dataverse environment, skip Step 2 — mock data is sufficient for a UI demo.

---

## Phase 9 — Azure DevOps CI/CD Pipeline

**What gets built:** A two-stage pipeline that automatically builds and deploys the app to Sandbox on `develop` pushes and to Production on `main` pushes. PRs get a build-and-lint check only.

---

### 9A — Branch Strategy

```
main        ──────────────────────────────────── → Production environment
  └── develop ────────────────────────────────── → Sandbox environment
        └── feature/xxx ──────────────────────── → Build + Lint only (no deploy)
```

Merge flow: `feature/xxx` → `develop` (sandbox validate) → `main` (production).

---

### 9B — Azure AD Service Principal (one-time, you do this)

The pipeline needs non-interactive Power Platform auth. Create a service principal:

1. **Azure portal → Azure Active Directory → App registrations → New registration**
   - Name: `templateapp-cicd`
   - Note the **Application (client) ID** and **Directory (tenant) ID**

2. **Certificates & secrets → New client secret**
   - Copy the secret value immediately (shown once only)

3. **Power Platform Admin Center → Environments → [your env] → Settings → Users + permissions → Application users → New app user**
   - Select your `templateapp-cicd` app registration
   - Assign role: **System Administrator**
   - Repeat for each environment (sandbox + production)

---

### 9C — Azure DevOps Variable Groups (you configure these)

In Azure DevOps → Pipelines → Library, create these variable groups:

**Group: `powerplatform-credentials`** (shared across environments)
| Variable | Value | Secret? |
|---|---|---|
| `TENANT_ID` | Your Azure AD tenant ID | No |
| `CLIENT_ID` | App registration client ID | No |
| `CLIENT_SECRET` | App registration client secret | **Yes** |

**Group: `powerplatform-sandbox`**
| Variable | Value |
|---|---|
| `ENVIRONMENT_ID` | Your sandbox environment ID (from `pac env list`) |
| `ENVIRONMENT_URL` | `https://orgXXXXXX.crm4.dynamics.com` |

**Group: `powerplatform-production`**
| Variable | Value |
|---|---|
| `ENVIRONMENT_ID` | Your production environment ID |
| `ENVIRONMENT_URL` | `https://orgYYYYYY.crm4.dynamics.com` |

---

### 9D — Approval Gate on Production (you configure this)

In Azure DevOps → Environments → Create two environments: `sandbox` and `production`.
On the `production` environment → Approvals and checks → Add **Approvals** → add yourself as approver. The pipeline will pause and wait for your approval before deploying to production.

---

### 9E — Pipeline File

**File created:** `azure-pipelines.yml` (project root)

```yaml
trigger:
  branches:
    include: [main, develop]
  paths:
    exclude: ['*.md', PLAN.md]

pr:
  branches:
    include: [main, develop]

pool:
  vmImage: ubuntu-latest

variables:
  NODE_VERSION: '20.x'

stages:

# ── Stage 1: Build & Lint (all branches) ─────────────────────────────────────
- stage: Build
  displayName: Build & Lint
  jobs:
  - job: Build
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(NODE_VERSION)
      displayName: Use Node $(NODE_VERSION)

    - script: npm ci
      displayName: Install dependencies

    - script: npm run lint
      displayName: Lint

    - script: npm run build
      displayName: TypeScript check + Vite build

    - publish: dist
      artifact: dist
      displayName: Publish dist

# ── Stage 2: Deploy → Sandbox (develop branch only) ──────────────────────────
- stage: DeploySandbox
  displayName: Deploy → Sandbox
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
  variables:
  - group: powerplatform-credentials
  - group: powerplatform-sandbox
  jobs:
  - deployment: Deploy
    environment: sandbox
    strategy:
      runOnce:
        deploy:
          steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: Install dependencies

          - script: npm install -g @microsoft/power-apps
            displayName: Install power-apps CLI

          - script: |
              pac auth create \
                --applicationId $(CLIENT_ID) \
                --clientSecret $(CLIENT_SECRET) \
                --tenant $(TENANT_ID) \
                --url $(ENVIRONMENT_URL)
              pac env select --environment $(ENVIRONMENT_ID)
            displayName: Authenticate with Power Platform

          - script: npm run build && power-apps push
            displayName: Build and push to Sandbox

# ── Stage 3: Deploy → Production (main branch only, requires approval) ───────
- stage: DeployProduction
  displayName: Deploy → Production
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  variables:
  - group: powerplatform-credentials
  - group: powerplatform-production
  jobs:
  - deployment: Deploy
    environment: production        # approval gate configured here in Azure DevOps
    strategy:
      runOnce:
        deploy:
          steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: Install dependencies

          - script: npm install -g @microsoft/power-apps
            displayName: Install power-apps CLI

          - script: |
              pac auth create \
                --applicationId $(CLIENT_ID) \
                --clientSecret $(CLIENT_SECRET) \
                --tenant $(TENANT_ID) \
                --url $(ENVIRONMENT_URL)
              pac env select --environment $(ENVIRONMENT_ID)
            displayName: Authenticate with Power Platform

          - script: npm run build && power-apps push
            displayName: Build and push to Production
```

---

### Checkpoint 9
- [ ] `azure-pipelines.yml` file committed to the repo
- [ ] Pipeline created in Azure DevOps and linked to the repo
- [ ] Variable groups exist and all secrets are filled in
- [ ] Push to `develop` → pipeline runs → app updates in sandbox automatically
- [ ] Raise a PR to `main` → merge → approval prompt appears → approve → production updates

---

## Summary: What You Approve at Each Checkpoint

| Phase | Who acts | Checkpoint | Approval unlocks |
|---|---|---|---|
| 0 | **You** | Table + auth set up in sandbox | Phase 1 |
| 1 | Me (code) | Dev server starts cleanly | Phase 2 |
| 2 | Me (code) | App shell renders — header + sidebar | Phase 3 |
| 3 | Me (code) | BPF chevrons render correctly | Phase 4 |
| 4 | Me (code) | Record list shows mock data | Phase 5 |
| 5 | Me (code) | Record form fully functional | Phase 6 |
| 6 | Me (code) | End-to-end flow works with mock data | **Local demo ready** |
| 7 | Me (code) + **You** (CLI) | Live Dataverse data loads | Phase 8 |
| 8 | **You** (first push) | App live in Power Apps sandbox | Phase 9 |
| 9 | Me (code) + **You** (ADO config) | Pipeline auto-deploys on push | **Done** |
