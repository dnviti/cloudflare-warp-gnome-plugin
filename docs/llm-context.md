---
title: LLM Context
description: Consolidated single-file reference for LLM and bot consumption
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - extension.js
  - metadata.json
  - stylesheet.css
  - .github/workflows/ci.yml
---

# LLM Context -- Cloudflare WARP Indicator for GNOME Shell

## Project Summary

A GNOME Shell extension (UUID: `cloudflare-warp-indicator@dnviti`) that provides a system tray indicator for Cloudflare WARP VPN. Written in JavaScript (GJS/ES Modules). Supports GNOME Shell 45-49. Single-file architecture (`extension.js`).

## Architecture

- **Entry point:** `CloudflareWarpExtension` (extends `Extension`) creates `WarpIndicator` on `enable()`, destroys on `disable()`.
- **WarpIndicator:** A `PanelMenu.Button` with an icon, info popup (status, mode, network, account, endpoint, protocol), and a Connect/Disconnect toggle.
- **Polling:** Every 5 seconds, runs `warp-cli status`, `warp-cli registration show`, `warp-cli tunnel stats` via `Gio.Subprocess`.
- **Connect flow:** `pkexec systemctl enable --now warp-svc.service` -> wait 2s -> `warp-cli connect`.
- **Disconnect flow:** `warp-cli disconnect` -> wait 1s -> `pkexec systemctl disable --now warp-svc.service`.
- **Startup behavior:** Disconnects WARP for clean state.

## Key Files

| File | Purpose |
|------|---------|
| `extension.js` | All extension logic (~336 lines) |
| `metadata.json` | Extension manifest (uuid, shell-version, version) |
| `stylesheet.css` | CSS for icon colors (green/red/yellow) and menu styling |
| `icons/warp-connected-symbolic.svg` | Green state icon |
| `icons/warp-disconnected-symbolic.svg` | Red/yellow state icon |
| `.github/workflows/ci.yml` | Builds ZIP and creates GitHub Release on `v*` tags |

## State Machine

States: `CONNECTED`, `DISCONNECTED`, `CONNECTING`, `UNKNOWN`.
Determined by parsing `warp-cli status` output: checks `status update` key first, falls back to `status` key. Matching is case-insensitive substring search.

## External Dependencies

| Dependency | Purpose |
|------------|---------|
| `warp-cli` | Cloudflare WARP CLI client |
| `warp-svc.service` | systemd service for WARP daemon |
| `pkexec` | Privilege escalation for systemctl |

## Configuration

- `POLL_INTERVAL_SECONDS = 5` (hardcoded constant in extension.js)
- `metadata.json` version field is an integer (increment for each release)
- CSS colors: connected=#26a269, disconnected=#c01c28, connecting=#e5a50a

## Build

```bash
zip -r cloudflare-warp-indicator@dnviti.shell-extension.zip metadata.json extension.js stylesheet.css icons/
```

## Install

```bash
gnome-extensions install cloudflare-warp-indicator@dnviti.shell-extension.zip
gnome-extensions enable cloudflare-warp-indicator@dnviti
```
