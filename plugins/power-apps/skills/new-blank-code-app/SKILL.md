---
description: Scaffold, configure, and deploy a new Power Platform Code App. Use when the user says they want to create a new code app, start a code app project, or set up a Power Apps code-first app.
---

# Create a Power Platform Code App

## When to use
User wants to create/scaffold a new Power Platform code app and wire it to data.

## Prerequisites (verify first)
Run and confirm each returns a version:
    node -v
    npm -v
    git --version
    pac --version
If `pac` is missing, install the Power Platform CLI before continuing.

## Steps

### 1. Scaffold the project
    npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-code-app

### 2. Move into the folder and open the editor
    cd my-code-app
    code . -r

### 3. Authenticate
    pac auth create
    pac env list
    pac env select --environment <environment-id>

### 4. Install dependencies and initialize
    npm install
    pac code init --displayname "My Code App"
    npm install @microsoft/power-apps

### 5. Add data sources (as needed)
Dataverse:
    pac code add-data-source -a shared_dataverse -c <connectionId> -t <table-logical-name>
SharePoint / SQL (common form):
    pac code add-data-source -a <apiName> -c <connectionId> -t <tableId> -d <datasetName>
List available connections / tables first:
    pac connection list
    pac code list-tables -a <apiName> -c <connectionId>

### 6. Create AI context files
After scaffolding, create these two files so Claude Code and GitHub Copilot both understand the project from the first prompt.

**CLAUDE.md** (project root):

```markdown
# Code App: <AppName>

## Stack
React 19 · Vite 7 · Fluent UI v9 (`@fluentui/react-components`) · Power Apps Code App (`@microsoft/power-apps-vite`)

## Key rules

### Fluent UI imports — always use `type` for TS-only exports
Vite's ES module resolver checks exports at runtime. Type-only exports (interfaces, type aliases)
from `@fluentui/react-components` must use the `type` modifier or the app crashes with a blank page.
`tsc --noEmit` will NOT catch this.

    // Wrong
    import { DataGrid, TableColumnDefinition } from '@fluentui/react-components';
    // Correct
    import { DataGrid, type TableColumnDefinition } from '@fluentui/react-components';

### useEffect + setState (eslint-plugin-react-hooks v7+)
Never call setState (or a function that calls it) synchronously inside useEffect.
Use a version counter to trigger re-fetches; setState only inside .then() / async callbacks.

    const [version, setVersion] = useState(0);
    useEffect(() => {
      let cancelled = false;
      service.getAll().then(data => { if (!cancelled) setRecords(data); });
      return () => { cancelled = true; };
    }, [version]);
    const refresh = useCallback(() => setVersion(v => v + 1), []);

### powerApps() plugin is build-only
Adding it to dev mode wraps the app in canvas-only init → blank page.

    plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],

### Blank page = silent JS crash
Check DevTools Console (F12). Temporarily add to main.tsx before createRoot to surface the error in-page:

    window.addEventListener('error', (e) => {
      document.body.innerHTML = `<pre style="color:red;padding:20px">${e.message}</pre>`;
    });

## Commands
    npm run dev          # local dev server
    npm run lint         # must pass before pushing
    npx tsc --noEmit     # must pass before pushing
    npm run build
    pac code push --solutionName "SolutionName"
```

**.github/copilot-instructions.md** (create .github folder if needed):

```markdown
# GitHub Copilot Instructions

## Project
Power Platform Code App — React 19, Vite 7, Fluent UI v9, deployed via `pac code push`.

## Rules

### 1. Fluent UI type-only imports
Always use `type` for TypeScript interfaces from `@fluentui/react-components`.
Vite resolves exports at runtime — types crash the app silently.

    // Wrong
    import { createTableColumn, TableColumnDefinition } from '@fluentui/react-components';
    // Correct
    import { createTableColumn, type TableColumnDefinition } from '@fluentui/react-components';

### 2. useEffect + setState
Never call setState synchronously inside useEffect. Use a version counter:

    const [version, setVersion] = useState(0);
    useEffect(() => {
      let cancelled = false;
      fetchData().then(data => { if (!cancelled) setState(data); });
      return () => { cancelled = true; };
    }, [version]);
    const refresh = useCallback(() => setVersion(v => v + 1), []);

### 3. Vite config — powerApps() is build-only
    plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],

### 4. Before every pac code push
    npm run lint && npx tsc --noEmit && npm run build
```

### 7. Run locally
    npm run dev

### 8. Build, then push (push ONLY if build succeeds)
    npm run build
    pac code push --solutionName "YourSolutionName"

Done when: `pac code push` completes with no errors and the app appears in the target environment.

---

## Known gotchas

| Issue | Symptom | Fix |
|---|---|---|
| Type-only Fluent UI import | Blank white page, `SyntaxError: does not provide export 'X'` | Add `type` to the import |
| setState in useEffect | ESLint error `react-hooks/set-state-in-effect` | Use version counter pattern |
| powerApps() in dev mode | Blank white page, no error | Keep plugin build-only in vite.config.ts |
| Blank page, no error overlay | Silent JS crash before React mounts | Check DevTools Console (F12) |
| Port busy | Vite auto-increments; power.config.json has hardcoded 3000 | Only matters for Power Apps player testing |
