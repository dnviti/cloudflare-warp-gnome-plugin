---
title: Architecture
description: Extension structure, component interactions, and data flow
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - extension.js
  - metadata.json
  - stylesheet.css
  - icons/warp-connected-symbolic.svg
  - icons/warp-disconnected-symbolic.svg
---

# Architecture

## Overview

The extension is a single-file GNOME Shell panel button (`extension.js`) that communicates with Cloudflare WARP through the `warp-cli` command-line tool and manages the `warp-svc` systemd service.

## Component Diagram

```mermaid
flowchart TD
    subgraph GNOME Shell
        EXT[CloudflareWarpExtension] -->|creates| IND[WarpIndicator]
        IND -->|contains| ICON[St.Icon]
        IND -->|contains| INFO[Info Menu - PopupMenu]
        IND -->|contains| TOGGLE[Connect/Disconnect Toggle]
    end

    subgraph System
        CLI[warp-cli]
        SVC[warp-svc.service]
        PKEXEC[pkexec]
    end

    IND -->|polls every 5s| CLI
    TOGGLE -->|connect| PKEXEC -->|systemctl enable --now| SVC
    SVC -->|service ready| CLI
    TOGGLE -->|disconnect| CLI -->|then| PKEXEC
    PKEXEC -->|systemctl disable --now| SVC
```

## Extension Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Disabled
    Disabled --> Enabled: enable()
    Enabled --> Polling: _startPolling()
    Polling --> Polling: every 5s _refreshStatus()
    Enabled --> Disabled: disable()
    Polling --> Disabled: disable() / _stopPolling()
    Disabled --> [*]
```

## Key Classes

### `CloudflareWarpExtension`

The entry point. Extends `Extension` from GNOME Shell's extension API. Responsible for creating and destroying the `WarpIndicator` on enable/disable.

### `WarpIndicator`

A `PanelMenu.Button` subclass registered via `GObject.registerClass`. Contains all UI and logic:

| Responsibility | Method(s) |
|----------------|-----------|
| Panel icon | `_setIconName()`, `_updateIndicator()` |
| Info popup (left-click) | `_buildInfoMenu()`, `_addInfoRow()`, `_updateInfoRow()` |
| Action menu (toggle) | `_buildActionMenu()`, `_connectWarp()`, `_disconnectWarp()` |
| Status polling | `_startPolling()`, `_stopPolling()`, `_refreshStatus()` |
| CLI interaction | `_runWarpCli()`, `_runWarpCommand()`, `_runCommandAsync()` |
| Output parsing | `_parseStatus()`, `_parseAccount()`, `_parseStats()` |

## State Machine

```mermaid
stateDiagram-v2
    [*] --> UNKNOWN
    UNKNOWN --> CONNECTED: status includes "connected"
    UNKNOWN --> DISCONNECTED: status includes "disconnected" or other
    UNKNOWN --> CONNECTING: status includes "connecting"
    CONNECTED --> DISCONNECTED: user clicks Disconnect
    DISCONNECTED --> CONNECTING: user clicks Connect
    CONNECTING --> CONNECTED: warp-cli reports connected
    CONNECTED --> UNKNOWN: poll error
    DISCONNECTED --> UNKNOWN: poll error
```

## Data Flow

```mermaid
flowchart LR
    A[warp-cli status] -->|stdout| B[_parseStatus]
    C[warp-cli registration show] -->|stdout| D[_parseAccount]
    E[warp-cli tunnel stats] -->|stdout| F[_parseStats]
    B --> G[_updateIndicator]
    D --> G
    F --> G
    G --> H[Icon color + Info rows]
```

## File Structure

```
cloudflare-warp-indicator@dnviti/
  extension.js       -- All extension logic (single file)
  metadata.json      -- Extension metadata (uuid, name, shell versions)
  stylesheet.css     -- CSS classes for icon colors and info panel
  icons/
    warp-connected-symbolic.svg
    warp-disconnected-symbolic.svg
```
