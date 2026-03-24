---
title: Getting Started
description: Installation, prerequisites, and first run
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - metadata.json
  - extension.js
---

# Getting Started

## Prerequisites

- GNOME Shell **45, 46, 47, 48, or 49**
- Cloudflare WARP client installed (`warp-cli` available in `$PATH`)
- `systemd` (for `warp-svc.service` management)
- `polkit` / `pkexec` (for privilege escalation when enabling/disabling the service)

### Installing Cloudflare WARP

Follow the official Cloudflare documentation for your distribution:

```bash
# Fedora / RHEL
curl -fsSl https://pkg.cloudflareclient.com/cloudflare-warp-ascii.repo | sudo tee /etc/yum.repos.d/cloudflare-warp.repo
sudo dnf install cloudflare-warp

# Ubuntu / Debian
curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor -o /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list
sudo apt update && sudo apt install cloudflare-warp
```

After installation, register:

```bash
warp-cli registration new
```

## Installation

### From Source (Manual)

```bash
# Clone the repository
git clone https://github.com/dnviti/cloudflare-warp-gnome-plugin.git

# Copy to GNOME Shell extensions directory
mkdir -p ~/.local/share/gnome-shell/extensions/
cp -r cloudflare-warp-gnome-plugin ~/.local/share/gnome-shell/extensions/cloudflare-warp-indicator@dnviti
```

### From GitHub Release ZIP

1. Download the `.zip` from the [Releases page](https://github.com/dnviti/cloudflare-warp-gnome-plugin/releases)
2. Install via GNOME Extensions CLI:

```bash
gnome-extensions install cloudflare-warp-indicator@dnviti.shell-extension.zip
```

### From extensions.gnome.org

Once published, install directly from the GNOME Extensions website or via the Extension Manager app.

## Enabling the Extension

```bash
# Enable via CLI
gnome-extensions enable cloudflare-warp-indicator@dnviti

# Or use GNOME Extensions app / Extension Manager
```

### Restart GNOME Shell

- **X11**: Press `Alt+F2`, type `r`, press `Enter`
- **Wayland**: Log out and log back in

## First Run

Once enabled, a WARP icon appears in the top panel:

- **Red**: Disconnected
- **Yellow**: Connecting
- **Green**: Connected

**Left-click** the icon to see the info panel (status, mode, network, account, endpoint, protocol).

**Click "Connect"** to enable the WARP tunnel. The extension will:
1. Run `pkexec systemctl enable --now warp-svc.service` (prompts for password)
2. Wait 2 seconds for the service to start
3. Run `warp-cli connect`

**Click "Disconnect"** to tear down the tunnel and stop the service.
