---
title: Development
description: Contributing, local development workflow, and testing
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - extension.js
  - CLAUDE.md
  - .gitignore
---

# Development

## Project Structure

```
cloudflare-warp-gnome-plugin/
  extension.js          -- All extension logic
  metadata.json         -- GNOME Shell extension manifest
  stylesheet.css        -- UI styling
  icons/                -- SVG icons for panel indicator
  .github/workflows/    -- CI/CD pipeline
  docs/                 -- Generated documentation
```

## Local Development

### Prerequisites

- GNOME Shell (matching a supported version: 45-49)
- `warp-cli` installed and registered
- Git

### Development Loop

1. Edit `extension.js`, `stylesheet.css`, or icons
2. Copy the extension to the local extensions directory:

```bash
cp -r . ~/.local/share/gnome-shell/extensions/cloudflare-warp-indicator@dnviti/
```

3. Restart GNOME Shell:
   - **X11**: `Alt+F2` -> `r` -> `Enter`
   - **Wayland**: Log out and back in

4. Check logs for errors:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

Or filter for extension output:

```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep -i warp
```

### Debugging with Looking Glass

Press `Alt+F2`, type `lg`, press `Enter` to open GNOME Shell's built-in JavaScript console. Useful for inspecting objects at runtime.

## Branch Strategy

- **`main`**: Production branch, receives tagged releases
- **`release/X.X.X`**: Release preparation branches

## Code Style

- ES Module syntax (`import`/`export`)
- GObject class registration via `GObject.registerClass`
- Private methods prefixed with `_`
- Asynchronous subprocess calls via `Gio.Subprocess` + `communicate_utf8_async` or `wait_check_async`
- Constants in `UPPER_SNAKE_CASE`

## Key Patterns

### Subprocess Execution

The extension uses three patterns for running external commands:

| Pattern | Method | Use Case |
|---------|--------|----------|
| Capture stdout | `_runWarpCli()` | Reading `warp-cli` output for status/stats |
| Fire-and-forget | `_runWarpCommand()` | Issuing `warp-cli connect/disconnect` |
| Wait for completion | `_runCommandAsync()` | Running `pkexec systemctl` and chaining next steps |

### Output Parsing

All `warp-cli` output is parsed as key-value pairs split on the first `:` character. Keys are lowercased. This handles both older and newer `warp-cli` output formats by checking multiple key names (e.g., `status update` vs `status`).

## Testing

There is no automated test suite for GNOME Shell extensions. Testing is manual:

1. Install the extension locally
2. Enable it
3. Verify the panel icon appears
4. Test connect/disconnect
5. Check `journalctl` for errors
6. Test on each supported GNOME Shell version if possible
