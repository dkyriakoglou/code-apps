# code-apps — Claude Code Plugin Marketplace

Claude Code plugin marketplace for Power Platform Code Apps development.

## Plugins

### `power-apps`
Skills and instructions for scaffolding, running, debugging, and deploying Power Platform Code Apps (React + Vite + Fluent UI v9).

Includes known gotchas that cause blank white pages and lint errors, pre-baked so you never hit them again.

## Install for a colleague

### Option A — one-time install (any project)
Open Claude Code and run:
```
/plugin marketplace add dkyriakoglou/code-apps
/plugin install power-apps@code-apps
```

### Option B — auto-install via project settings
Add to your project's `.claude/settings.json`:
```json
{
  "extraKnownMarketplaces": {
    "code-apps": {
      "source": {
        "source": "github",
        "repo": "dkyriakoglou/code-apps"
      }
    }
  },
  "enabledPlugins": {
    "power-apps@code-apps": true
  }
}
```

The skill `/power-apps:new-blank-code-app` is then available in any project that has this settings file.
