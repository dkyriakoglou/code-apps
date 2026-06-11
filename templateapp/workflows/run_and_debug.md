# Workflow: Run and Debug the Template App Locally

## Objective
Start the dev server, verify the app renders, and diagnose common failures.

## Required inputs
- Node.js installed
- `npm install` already run (or run it now)

## Steps

### 1. Start the dev server
```
npm run dev
```
Default port is `3000`. If busy, Vite increments automatically (3001, 3002, …). The URL is printed in the terminal.

> **Note:** `power.config.json` has `localAppUrl: "http://localhost:3000"` hardcoded. This only matters when testing inside the Power Apps player — local browser dev is unaffected.

### 2. Verify the app renders
Open the printed URL in a browser. You should see:
- Blue header bar with "Template App" and "User: John Doe"
- Left nav sidebar listing "Opportunities"
- A data grid with 5 mock rows

### 3. Blank white page — diagnosis

If the page is completely white with no content:

**Fast path:** Open DevTools (F12) → Console tab. The error is there.

**If the console is hard to read**, temporarily add these listeners at the top of `src/main.tsx` (before `createRoot`) to surface the error in-page:

```typescript
window.addEventListener('error', (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px">${e.message}\n${e.error?.stack ?? ''}</pre>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px">Unhandled rejection:\n${e.reason}</pre>`;
});
```

Remove after diagnosing.

## Known failure modes and fixes

### `SyntaxError: does not provide an export named 'X'`
Vite's ES module resolver failed on a type-only export. Common culprit: `TableColumnDefinition` (and any other TypeScript interface) imported from `@fluentui/react-components` without the `type` modifier.

**Fix:** Add `type` to the import:
```tsx
// Before (crashes at runtime)
import { DataGrid, TableColumnDefinition } from '@fluentui/react-components';

// After
import { DataGrid, type TableColumnDefinition } from '@fluentui/react-components';
```

`tsc --noEmit` will NOT catch this — TypeScript strips types silently. Vite's native ESM does not.

### ESLint error: `react-hooks/set-state-in-effect`
`eslint-plugin-react-hooks` v7+ bans calling `setState` (or any function that calls it) synchronously inside `useEffect`.

**Fix:** Use a version counter to trigger re-fetches. Call `setState` only inside async `.then()` callbacks. Add a `cancelled` cleanup flag:

```typescript
const [version, setVersion] = useState(0);

useEffect(() => {
  let cancelled = false;
  service.getAll().then(data => {
    if (!cancelled) {
      setRecords(data);
      setLoading(false);
    }
  });
  return () => { cancelled = true; };
}, [version]);

const refresh = useCallback(() => setVersion(v => v + 1), []);
```

### Power Apps plugin making page blank
If `powerApps()` is added to the `plugins` array for the `dev` command, the app wraps in a canvas-only init and renders blank. The plugin is **build-only** by design:

```typescript
// vite.config.ts — keep it this way
plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],
```

## Expected outputs
- App renders at localhost with blue header, nav, and Opportunities grid
- `npm run lint` exits 0
- `npx tsc --noEmit` exits 0
