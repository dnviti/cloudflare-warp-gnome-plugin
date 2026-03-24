---
title: Cloudflare WARP Indicator for GNOME Shell
description: Documentation index and project overview
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - metadata.json
  - extension.js
  - CLAUDE.md
---

![Project Logo](assets/logo.svg)

# Cloudflare WARP Indicator for GNOME Shell

A GNOME Shell extension that adds a system tray indicator and controls for Cloudflare WARP VPN. Shows connection status, account info, tunnel stats, and provides a one-click connect/disconnect toggle via `warp-cli`.

## Table of Contents

- [Getting Started](getting-started.md) -- Installation, prerequisites, first run
- [Architecture](architecture.md) -- Extension structure, components, data flow
- [Configuration](configuration.md) -- Metadata, styling, polling settings
- [API Reference](api-reference.md) -- Classes, methods, warp-cli commands
- [Deployment](deployment.md) -- CI/CD pipeline, building the ZIP, publishing
- [Development](development.md) -- Contributing, local development, testing
- [Troubleshooting](troubleshooting.md) -- Common errors, debugging, FAQ
- [LLM Context](llm-context.md) -- Consolidated reference for AI/bot consumption

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dnviti/cloudflare-warp-gnome-plugin.git

# Install the extension
cp -r cloudflare-warp-gnome-plugin ~/.local/share/gnome-shell/extensions/cloudflare-warp-indicator@dnviti

# Restart GNOME Shell (X11)
Alt+F2 → r → Enter

# Or log out and back in (Wayland)
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | GNOME Shell (GJS / ES Modules) |
| UI Framework | St (Shell Toolkit), PanelMenu, PopupMenu |
| VPN Backend | Cloudflare WARP via `warp-cli` |
| Service Manager | systemd (`warp-svc.service`) |
| Privilege Escalation | `pkexec` (Polkit) |
| CI/CD | GitHub Actions |
| Supported GNOME | 45, 46, 47, 48, 49 |
