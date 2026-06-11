# GitHub Copilot Instructions

## Project
Power Platform Code App — React 19, Vite 7, Fluent UI v9 (`@fluentui/react-components`), deployed via `pac code push`.

Reusable CRM-style demo shell. The only file that changes per customer is `src/config/customer.config.ts`.
All data is in-memory mock by default (`src/services/mock.data.ts`).

## Rules Copilot must follow

### 1. Fluent UI type-only imports
Always use `type` for TypeScript interfaces/type aliases imported from `@fluentui/react-components`.
Vite resolves named exports at runtime — types have no JS value and cause a blank white page with no error.

```tsx
// Wrong
import { createTableColumn, TableColumnDefinition } from '@fluentui/react-components';
// Correct
import { createTableColumn, type TableColumnDefinition } from '@fluentui/react-components';
```

### 2. useEffect + setState
Never call setState (or any function that calls it) synchronously inside useEffect.
Use a version counter to trigger re-fetches; setState only inside async callbacks; always clean up.

```typescript
const [version, setVersion] = useState(0);
useEffect(() => {
  let cancelled = false;
  fetchData().then(data => { if (!cancelled) setRecords(data); });
  return () => { cancelled = true; };
}, [version]);
const refresh = useCallback(() => setVersion(v => v + 1), []);
```

### 3. Vite config — powerApps() is build-only
The `powerApps()` plugin wraps the app in canvas-only init which makes localhost blank. Keep it out of dev:

```typescript
plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],
```

### 4. Before every `pac code push`
All three must pass:
```bash
npm run lint
npx tsc --noEmit
npm run build
```

### 5. Customer config is the only customisation point
Do not hardcode entity names, stage names, field lists, or brand colors anywhere in components.
Everything flows from `src/config/customer.config.ts`.
