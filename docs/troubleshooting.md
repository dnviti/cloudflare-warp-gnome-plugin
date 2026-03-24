---
title: Troubleshooting
description: Common errors, debugging, and FAQ
generated-by: claw-docs
generated-at: 2026-03-25T00:00:00Z
source-files:
  - extension.js
---

# Troubleshooting

## Common Issues

### Extension icon does not appear

**Cause:** Extension not installed correctly or not enabled.

**Fix:**
1. Verify the extension directory exists:
   ```bash
   ls ~/.local/share/gnome-shell/extensions/cloudflare-warp-indicator@dnviti/
   ```
2. Ensure it contains `extension.js`, `metadata.json`, `stylesheet.css`, and `icons/`
3. Enable it:
   ```bash
   gnome-extensions enable cloudflare-warp-indicator@dnviti
   ```
4. Restart GNOME Shell

### Icon is always red (disconnected)

**Cause:** `warp-cli` is not installed or `warp-svc.service` is not running.

**Fix:**
1. Verify `warp-cli` is in PATH:
   ```bash
   which warp-cli
   ```
2. Check if the service can start:
   ```bash
   sudo systemctl start warp-svc.service
   warp-cli status
   ```
3. If not registered:
   ```bash
   warp-cli registration new
   ```

### Connect button does nothing

**Cause:** `pkexec` (Polkit) authentication failed or was dismissed.

**Fix:**
- When clicking Connect, a password dialog should appear. If it doesn't, check that Polkit is running:
  ```bash
  systemctl status polkit.service
  ```
- On some desktop environments, a Polkit authentication agent must be running (GNOME Shell includes one by default).

### "Status update" shows Unknown

**Cause:** The `warp-cli status` output format may have changed in a newer WARP client version.

**Fix:**
- Run `warp-cli status` manually and check the output format
- The extension parses both `Status update:` and `Status:` keys for compatibility

### Extension crashes on startup

**Check logs:**
```bash
journalctl -o cat /usr/bin/gnome-shell | grep -i "warp\|error" | tail -50
```

Common causes:
- Missing icon files in the `icons/` directory
- GNOME Shell version not listed in `metadata.json` `shell-version` array
- `warp-cli` producing unexpected output

### pkexec prompts every time

This is expected behavior. The extension uses `pkexec` to run `systemctl enable/disable` which requires root privileges. Each connect/disconnect action will prompt for authentication unless you configure a custom Polkit policy.

## Debugging

### Viewing Extension Logs

```bash
# Live log stream
journalctl -f -o cat /usr/bin/gnome-shell

# Filter for extension messages
journalctl -o cat /usr/bin/gnome-shell | grep -i warp
```

### Checking WARP State Manually

```bash
warp-cli status
warp-cli registration show
warp-cli tunnel stats
systemctl status warp-svc.service
```

### Reloading After Changes

```bash
# Copy updated files
cp extension.js ~/.local/share/gnome-shell/extensions/cloudflare-warp-indicator@dnviti/

# Restart GNOME Shell (X11)
# Alt+F2 → r → Enter

# Restart GNOME Shell (Wayland)
# Log out and back in
```

## FAQ

**Q: Does this extension work on Wayland?**
A: Yes. All subprocess calls use `Gio.Subprocess` which works on both X11 and Wayland. The only difference is that GNOME Shell cannot be restarted in-place on Wayland -- you must log out and back in.

**Q: Can I use this with WARP Teams (Zero Trust)?**
A: Yes. The extension reads the organization/team name from `warp-cli registration show` and displays it in the Network info row.

**Q: Does the extension auto-connect on login?**
A: No. The extension explicitly disconnects WARP on startup for a clean state. You must click Connect manually after each login.

**Q: Why does the extension disconnect WARP on startup?**
A: To ensure a known clean state. If the WARP service was left running from a previous session, the extension starts fresh to avoid stale state.
