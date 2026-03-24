---
title: API Reference
description: Classes, methods, and warp-cli commands used by the extension
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - extension.js
---

# API Reference

## Classes

### `CloudflareWarpExtension`

**File:** `extension.js:324`
**Extends:** `Extension` (from `resource:///org/gnome/shell/extensions/extension.js`)

| Method | Description |
|--------|-------------|
| `enable()` | Creates a `WarpIndicator` and adds it to the GNOME Shell panel status area |
| `disable()` | Destroys the indicator and cleans up |

### `WarpIndicator`

**File:** `extension.js:22`
**Extends:** `PanelMenu.Button`
**Registered via:** `GObject.registerClass`

#### Constructor

| Method | Parameters | Description |
|--------|-----------|-------------|
| `_init(extensionPath)` | `extensionPath: string` | Initializes icon, menus, disconnects WARP, starts polling |

#### UI Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `_setIconName(iconName)` | `iconName: string` | Loads SVG icon from `icons/` directory |
| `_buildInfoMenu()` | none | Creates the left-click info popup with status rows |
| `_addInfoRow(labelText, valueText)` | `labelText: string, valueText: string` | Adds a labeled info row to the menu |
| `_updateInfoRow(item, labelText, valueText)` | `item: PopupMenuItem, labelText: string, valueText: string` | Updates an existing info row's markup |
| `_buildActionMenu()` | none | Creates the Connect/Disconnect toggle menu item |
| `_updateIndicator()` | none | Updates icon, colors, toggle text, and info rows based on current state |

#### Connection Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `_connectWarp()` | none | Enables `warp-svc.service` via `pkexec`, waits 2s, runs `warp-cli connect` |
| `_disconnectWarp()` | none | Runs `warp-cli disconnect`, waits 1s, disables `warp-svc.service` via `pkexec` |

#### Polling Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `_startPolling()` | none | Starts a 5-second interval timer calling `_refreshStatus()` |
| `_stopPolling()` | none | Removes the polling timer |
| `_refreshStatus()` | none | Runs all three `warp-cli` queries in parallel |

#### CLI Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `_runWarpCli(argv, callback)` | `argv: string[], callback: (output: string) => void` | Spawns subprocess, captures stdout, calls callback with trimmed output |
| `_runCommandAsync(argv, callback)` | `argv: string[], callback: () => void` | Spawns subprocess without capturing output, calls callback on success |
| `_runWarpCommand(argv)` | `argv: string[]` | Fire-and-forget subprocess, refreshes status after 1.5s |

#### Parsing Methods

| Method | Input | Output | Key Fields |
|--------|-------|--------|------------|
| `_parseStatus(output)` | `warp-cli status` stdout | `this._statusData`, `this._state` | `status update`, `mode` |
| `_parseAccount(output)` | `warp-cli registration show` stdout | `this._accountData` | `organization`, `account type` |
| `_parseStats(output)` | `warp-cli tunnel stats` stdout | `this._statsData` | `endpoints`, `tunnel protocol` |

#### Lifecycle

| Method | Description |
|--------|-------------|
| `destroy()` | Stops polling, calls `super.destroy()` |

## warp-cli Commands

Commands invoked by the extension:

| Command | Purpose | When |
|---------|---------|------|
| `warp-cli status` | Get connection status | Every 5s poll |
| `warp-cli registration show` | Get account/organization info | Every 5s poll |
| `warp-cli tunnel stats` | Get tunnel endpoint and protocol | Every 5s poll |
| `warp-cli connect` | Establish WARP tunnel | User clicks Connect |
| `warp-cli disconnect` | Tear down WARP tunnel | User clicks Disconnect, extension startup |

## systemd Commands

| Command | Purpose | When |
|---------|---------|------|
| `pkexec systemctl enable --now warp-svc.service` | Start and enable the WARP daemon | User clicks Connect |
| `pkexec systemctl disable --now warp-svc.service` | Stop and disable the WARP daemon | User clicks Disconnect |

## State Constants

```javascript
const WarpState = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    UNKNOWN: 'unknown',
};
```
