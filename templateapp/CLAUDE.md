# Code App: Template App

## Stack
React 19 · Vite 7 · Fluent UI v9 (`@fluentui/react-components`) · Power Apps Code App (`@microsoft/power-apps-vite`)

## What this app is
Reusable CRM-style demo shell for Power Platform Code Apps. Mimics model-driven Dynamics 365 UX.
Configure once per customer by editing only `src/config/customer.config.ts` (brand color, entity name, stage names, form fields).
Ships with in-memory mock data — no real Dataverse connection needed for local dev.

## Key rules

### Fluent UI imports — always use `type` for TS-only exports
Vite's ES module resolver checks exports at runtime. Type-only exports (interfaces, type aliases)
from `@fluentui/react-components` must use the `type` modifier or the app crashes with a blank white page.
`tsc --noEmit` will NOT catch this.

```tsx
// Wrong — crashes at runtime
import { DataGrid, TableColumnDefinition } from '@fluentui/react-components';
// Correct
import { DataGrid, type TableColumnDefinition } from '@fluentui/react-components';
```

Known type-only exports: `TableColumnDefinition`, `TableColumnId`, any `*Props` interface.

### useEffect + setState (eslint-plugin-react-hooks v7+)
Never call setState (or a function that calls it) synchronously inside useEffect.
Use a version counter to trigger re-fetches; setState only inside `.then()` / async callbacks.

```typescript
const [version, setVersion] = useState(0);
useEffect(() => {
  let cancelled = false;
  service.getAll().then(data => { if (!cancelled) setRecords(data); });
  return () => { cancelled = true; };
}, [version]);
const refresh = useCallback(() => setVersion(v => v + 1), []);
```

### powerApps() plugin is build-only
Adding it to dev mode wraps the app in canvas-only init → blank page in the browser.

```typescript
// vite.config.ts — keep exactly like this
plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],
```

### Blank page = silent JS crash
Check DevTools Console (F12) first. To surface the error in-page, temporarily add to `main.tsx` before `createRoot`:

```typescript
window.addEventListener('error', (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px">${e.message}\n${e.error?.stack ?? ''}</pre>`;
});
```

Remove after diagnosing.

## Commands
```bash
npm run dev          # local dev server (auto-increments port if 3000 is busy)
npm run lint         # must exit 0 before pushing
npx tsc --noEmit     # must exit 0 before pushing
npm run build
pac code push --solutionName "YourSolutionName"
```

## File structure
```
src/
├── config/customer.config.ts   ← ONLY file to edit per customer
├── types/index.ts
├── services/
│   ├── dataverse.service.ts    ← swap mock → real Dataverse here
│   └── mock.data.ts
├── hooks/useDataverse.ts
└── components/
    ├── AppShell/
    ├── NavSidebar/
    ├── BusinessProcessFlow/
    ├── RecordList/
    ├── RecordForm/
    └── RecordCommandBar/
```
