# code-apps

Internal toolkit for Power Platform Code Apps development.

Contains:
- **Claude Code plugin** — skills and rules so the AI never makes the same mistakes twice
- **templateapp** — ready-to-run React + Vite + Fluent UI template that looks and feels like a model-driven app

---

## Getting started (send this to your colleague)

### 1. Prerequisites
Make sure you have these installed:
```
node -v       # Node.js 18+
npm -v
git --version
pac --version  # Power Platform CLI
```
If `pac` is missing: [Install Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)

### 2. Clone the repo
```
git clone https://github.com/dkyriakoglou/code-apps.git
cd code-apps/templateapp
```

### 3. Install dependencies
```
npm install
```

### 4. Open in VS Code
```
code .
```

### 5. Run locally
```
npm run dev
```
Open the URL printed in the terminal (usually `http://localhost:3000`).
You should see a blue header, a left nav, and a grid of 5 mock Opportunities.

---

## What you get automatically

### GitHub Copilot
`.github/copilot-instructions.md` is picked up automatically by Copilot when you open the folder.
It knows the stack, the Fluent UI import rules, and the useEffect pattern — no setup needed.

### Claude Code
`.claude/settings.json` registers this repo as a plugin marketplace and auto-installs the `power-apps` plugin.
Open the project in Claude Code and the skill loads automatically.

The skill gives Claude Code:
- The full scaffold-to-deploy workflow (`/power-apps:new-blank-code-app`)
- All known gotchas pre-loaded (blank page causes, lint rules, build checks)
- Instructions to create `CLAUDE.md` and `.github/copilot-instructions.md` in every new project

---

## Customising the template for a customer

The only file you change per customer is `templateapp/src/config/customer.config.ts`:

```typescript
export const customerConfig = {
  appTitle: 'Customer App Name',
  brandColor: '#0078d4',       // change to customer brand colour
  stages: [...],               // rename the BPF stages
  entityDisplayName: 'Lead',   // rename the entity
  formFields: [...],           // add/remove form fields
};
```

Everything else — the BPF bar, the grid, the form, the command bar — updates automatically.

---

## Deploying to Power Apps

```
npm run lint          # must pass
npx tsc --noEmit      # must pass
npm run build
pac auth create
pac env select --environment <your-environment-id>
pac code push --solutionName "YourSolutionName"
```

---

## Known gotchas (already fixed in this template)

| Issue | Symptom | Fix applied |
|---|---|---|
| Type-only Fluent UI imports | Blank white page on load | `type` modifier on all TS-only imports |
| setState in useEffect | ESLint build error | Version counter pattern in `useDataverse.ts` |
| powerApps() plugin in dev mode | Blank white page | Plugin is build-only in `vite.config.ts` |
| Blank page with no error | Silent JS crash | Check DevTools Console (F12) |
