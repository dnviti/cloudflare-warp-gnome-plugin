---
title: Configuration
description: Extension metadata, styling, and polling settings
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - metadata.json
  - stylesheet.css
  - extension.js
---

# Configuration

## metadata.json

The extension manifest required by GNOME Shell:

| Field | Value | Purpose |
|-------|-------|---------|
| `uuid` | `cloudflare-warp-indicator@dnviti` | Unique extension identifier (never change after publishing) |
| `name` | `Cloudflare WARP Indicator` | Display name in extensions list |
| `description` | System tray indicator and controls... | Shown on extensions.gnome.org |
| `shell-version` | `["45", "46", "47", "48", "49"]` | Supported GNOME Shell versions |
| `version` | `1` | Integer version, increment for each update |
| `url` | `https://github.com/dnviti/...` | Project homepage |

## Polling Interval

Defined as a constant in `extension.js`:

```javascript
const POLL_INTERVAL_SECONDS = 5;
```

The extension polls `warp-cli status`, `warp-cli registration show`, and `warp-cli tunnel stats` every 5 seconds. To change the interval, edit this constant and reload the extension.

## Styling (stylesheet.css)

CSS classes applied to the indicator and menu:

| Class | Purpose | Default |
|-------|---------|---------|
| `.warp-indicator` | Panel button container | Inherits panel defaults |
| `.warp-icon-connected` | Icon color when connected | `#26a269` (green) |
| `.warp-icon-disconnected` | Icon color when disconnected | `#c01c28` (red) |
| `.warp-icon-connecting` | Icon color when connecting | `#e5a50a` (yellow) |
| `.warp-info-heading` | Menu heading style | Bold, 1.1em |
| `.warp-info-label` | Info row label | Bold, min-width 120px |
| `.warp-info-value` | Info row value | `#deddda` (light gray) |
| `.warp-separator` | Menu separator | 4px vertical margin |

## Icons

Two SVG icons in the `icons/` directory:

| File | Used When |
|------|-----------|
| `warp-connected-symbolic.svg` | WARP is connected |
| `warp-disconnected-symbolic.svg` | WARP is disconnected or connecting |

Icons are loaded from the extension's installation path at runtime using `Gio.FileIcon`.

## systemd Service

The extension manages the `warp-svc.service` systemd unit:

- **Connect**: `pkexec systemctl enable --now warp-svc.service`
- **Disconnect**: `pkexec systemctl disable --now warp-svc.service`

This requires `polkit` to be configured. The user will be prompted for their password via the standard Polkit authentication dialog.
