import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const POLL_INTERVAL_SECONDS = 5;

const WarpState = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    UNKNOWN: 'unknown',
};

const WarpIndicator = GObject.registerClass(
class WarpIndicator extends PanelMenu.Button {
    _init(extensionPath) {
        super._init(0.0, 'Cloudflare WARP Indicator');

        this._extensionPath = extensionPath;
        this._state = WarpState.UNKNOWN;
        this._statusData = {};
        this._accountData = {};
        this._statsData = {};
        this._pollSourceId = null;

        // Panel icon
        this._icon = new St.Icon({
            style_class: 'system-status-icon warp-icon-disconnected',
        });
        this._setIconName('warp-disconnected-symbolic');
        this.add_child(this._icon);

        // Build left-click info popup
        this._buildInfoMenu();

        // Build right-click action menu
        this._buildActionMenu();

        // Initial status fetch and start polling
        this._refreshStatus();
        this._startPolling();
    }

    _setIconName(iconName) {
        const iconFile = Gio.File.new_for_path(
            GLib.build_filenamev([this._extensionPath, 'icons', `${iconName}.svg`])
        );
        const gicon = new Gio.FileIcon({file: iconFile});
        this._icon.gicon = gicon;
    }

    _buildInfoMenu() {
        // Heading
        this._headingItem = new PopupMenu.PopupMenuItem('Cloudflare WARP', {reactive: false});
        this._headingItem.label.add_style_class_name('warp-info-heading');
        this.menu.addMenuItem(this._headingItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Info rows
        this._statusRow = this._addInfoRow('Status', 'Unknown');
        this._modeRow = this._addInfoRow('Mode', '—');
        this._networkRow = this._addInfoRow('Network', '—');
        this._accountRow = this._addInfoRow('Account', '—');
        this._endpointRow = this._addInfoRow('Endpoint', '—');
        this._protocolRow = this._addInfoRow('Protocol', '—');
    }

    _addInfoRow(labelText, valueText) {
        const item = new PopupMenu.PopupMenuItem('', {reactive: false});
        item.label.clutter_text.set_markup(
            `<b>${labelText}:</b>  ${GLib.markup_escape_text(valueText, -1)}`
        );
        this.menu.addMenuItem(item);
        return item;
    }

    _updateInfoRow(item, labelText, valueText) {
        item.label.clutter_text.set_markup(
            `<b>${labelText}:</b>  ${GLib.markup_escape_text(valueText, -1)}`
        );
    }

    _buildActionMenu() {
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._toggleItem = new PopupMenu.PopupMenuItem('Connect');
        this._toggleItem.connect('activate', () => {
            if (this._state === WarpState.CONNECTED)
                this._runWarpCommand(['warp-cli', 'disconnect']);
            else
                this._runWarpCommand(['warp-cli', 'connect']);
        });
        this.menu.addMenuItem(this._toggleItem);
    }

    _startPolling() {
        if (this._pollSourceId)
            return;

        this._pollSourceId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            POLL_INTERVAL_SECONDS,
            () => {
                this._refreshStatus();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _stopPolling() {
        if (this._pollSourceId) {
            GLib.source_remove(this._pollSourceId);
            this._pollSourceId = null;
        }
    }

    _refreshStatus() {
        this._runWarpCli(['warp-cli', 'status'], (output) => {
            this._parseStatus(output);
            this._updateIndicator();
        });

        this._runWarpCli(['warp-cli', 'account'], (output) => {
            this._parseAccount(output);
            this._updateIndicator();
        });

        this._runWarpCli(['warp-cli', 'warp-stats'], (output) => {
            this._parseStats(output);
            this._updateIndicator();
        });
    }

    _runWarpCli(argv, callback) {
        try {
            const proc = Gio.Subprocess.new(
                argv,
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (source, result) => {
                try {
                    const [, stdout] = source.communicate_utf8_finish(result);
                    if (callback && stdout)
                        callback(stdout.trim());
                } catch (_e) {
                    // warp-cli not available or errored
                }
            });
        } catch (_e) {
            // warp-cli not installed
        }
    }

    _runWarpCommand(argv) {
        try {
            Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE);
            // Refresh after a short delay to pick up the state change
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
                this._refreshStatus();
                return GLib.SOURCE_REMOVE;
            });
        } catch (_e) {
            // warp-cli not installed
        }
    }

    _parseStatus(output) {
        const data = {};
        for (const line of output.split('\n')) {
            const idx = line.indexOf(':');
            if (idx === -1)
                continue;
            const key = line.substring(0, idx).trim().toLowerCase();
            const value = line.substring(idx + 1).trim();
            data[key] = value;
        }
        this._statusData = data;

        const status = (data['status'] || '').toLowerCase();
        if (status.includes('connected') && !status.includes('disconnected'))
            this._state = WarpState.CONNECTED;
        else if (status.includes('connecting'))
            this._state = WarpState.CONNECTING;
        else
            this._state = WarpState.DISCONNECTED;
    }

    _parseAccount(output) {
        const data = {};
        for (const line of output.split('\n')) {
            const idx = line.indexOf(':');
            if (idx === -1)
                continue;
            const key = line.substring(0, idx).trim().toLowerCase();
            const value = line.substring(idx + 1).trim();
            data[key] = value;
        }
        this._accountData = data;
    }

    _parseStats(output) {
        const data = {};
        for (const line of output.split('\n')) {
            const idx = line.indexOf(':');
            if (idx === -1)
                continue;
            const key = line.substring(0, idx).trim().toLowerCase();
            const value = line.substring(idx + 1).trim();
            data[key] = value;
        }
        this._statsData = data;
    }

    _updateIndicator() {
        // Update icon and style
        switch (this._state) {
        case WarpState.CONNECTED:
            this._setIconName('warp-connected-symbolic');
            this._icon.remove_style_class_name('warp-icon-disconnected');
            this._icon.remove_style_class_name('warp-icon-connecting');
            this._icon.add_style_class_name('warp-icon-connected');
            break;
        case WarpState.CONNECTING:
            this._setIconName('warp-disconnected-symbolic');
            this._icon.remove_style_class_name('warp-icon-connected');
            this._icon.remove_style_class_name('warp-icon-disconnected');
            this._icon.add_style_class_name('warp-icon-connecting');
            break;
        default:
            this._setIconName('warp-disconnected-symbolic');
            this._icon.remove_style_class_name('warp-icon-connected');
            this._icon.remove_style_class_name('warp-icon-connecting');
            this._icon.add_style_class_name('warp-icon-disconnected');
            break;
        }

        // Update toggle menu item
        if (this._state === WarpState.CONNECTED)
            this._toggleItem.label.text = 'Disconnect';
        else
            this._toggleItem.label.text = 'Connect';

        // Update info rows
        const s = this._statusData;
        const a = this._accountData;
        const st = this._statsData;

        this._updateInfoRow(this._statusRow, 'Status', s['status'] || 'Unknown');
        this._updateInfoRow(this._modeRow, 'Mode', s['mode'] || s['warp'] || '—');
        this._updateInfoRow(this._networkRow, 'Network',
            a['organization'] || a['team'] || s['network'] || '—');
        this._updateInfoRow(this._accountRow, 'Account',
            a['account type'] || a['account'] || '—');
        this._updateInfoRow(this._endpointRow, 'Endpoint',
            st['endpoint'] || s['endpoint'] || '—');
        this._updateInfoRow(this._protocolRow, 'Protocol',
            st['protocol'] || s['protocol'] || '—');
    }

    destroy() {
        this._stopPolling();
        super.destroy();
    }
});

export default class CloudflareWarpExtension extends Extension {
    enable() {
        this._indicator = new WarpIndicator(this.path);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
