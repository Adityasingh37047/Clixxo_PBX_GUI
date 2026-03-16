# SNMP Device Setup - Installation Guide

## Overview
This guide explains how to include the SNMP device info script in your installation package so new devices are pre-configured.

## Files to Include in Installation Package

Your `clixxo.zip` installation package should include:

```
clixxo.zip
├── ui-build/                    (your React build)
├── clixxo-device-info.sh        (SNMP script - from this repo)
├── install.sh                   (your main installation script)
└── ...other files
```

## Installation Script Changes

Add these lines to your `install.sh`:

```bash
#!/bin/bash
# Main installation script

# ... your existing installation steps ...

echo "Installing SNMP device info script..."

# Copy the script to the correct location
cp clixxo-device-info.sh /usr/local/bin/clixxo-device-info.sh

# Make it executable
chmod +x /usr/local/bin/clixxo-device-info.sh

# Verify it was installed
if [ -f /usr/local/bin/clixxo-device-info.sh ] && [ -x /usr/local/bin/clixxo-device-info.sh ]; then
    echo "✓ SNMP device info script installed successfully"
else
    echo "✗ ERROR: Failed to install SNMP device info script"
    exit 1
fi

# Configure sudoers for SNMP to access Asterisk
echo "Configuring SNMP permissions..."
SNMP_USER=""
for user in snmp Debian-snmp daemon _snmp; do
    if id "$user" >/dev/null 2>&1; then
        SNMP_USER="$user"
        break
    fi
done

if [ -n "$SNMP_USER" ]; then
    mkdir -p /etc/sudoers.d
    cat > /etc/sudoers.d/snmp-asterisk <<EOF
# Allow $SNMP_USER to run asterisk commands for SNMP
$SNMP_USER ALL=(root) NOPASSWD: /usr/sbin/asterisk -rx *
Defaults:$SNMP_USER !requiretty
EOF
    chmod 0440 /etc/sudoers.d/snmp-asterisk
    echo "✓ SNMP sudoers configured for $SNMP_USER"
fi

# Restart SNMP service if it's already configured
if [ -f /etc/snmp/snmpd.conf ] && grep -q "pass_persist.*99999" /etc/snmp/snmpd.conf 2>/dev/null; then
    echo "Restarting SNMP service..."
    systemctl restart snmpd 2>/dev/null || service snmpd restart 2>/dev/null || true
fi

echo "Installation complete!"
```

## How It Works

### During Installation:
1. `clixxo-device-info.sh` is copied to `/usr/local/bin/`
2. Script is made executable
3. Sudoers file is created for SNMP access to Asterisk
4. SNMP service is restarted (if already configured)

### After Installation (via UI):
1. User opens the web UI
2. Goes to **Centralized Manage** page
3. Fills in SNMP settings:
   - Management Platform: Custom1 or Others
   - SNMP Server Address: (IP or "all")
   - Community String: public
   - SNMP Version: V2
4. Clicks **"Save"** button

### What Happens When "Save" is Clicked:
- ✅ Checks if `/usr/local/bin/clixxo-device-info.sh` exists (it should, from installation)
- ✅ Creates/updates `/etc/snmp/snmpd.conf` with:
  - Community string
  - Listen port
  - Access controls
  - `pass_persist` directive pointing to the script
- ✅ Creates `/etc/sudoers.d/snmp-asterisk` (if not already created during installation)
- ✅ Restarts snmpd service
- ✅ All 8 OIDs are immediately available!

## Available OIDs

After setup, these OIDs will be available:

```
.1.3.6.1.4.1.99999.1.1 = Serial Number
.1.3.6.1.4.1.99999.1.2 = Web Version
.1.3.6.1.4.1.99999.1.3 = Service
.1.3.6.1.4.1.99999.1.4 = U-Boot
.1.3.6.1.4.1.99999.1.5 = Kernel
.1.3.6.1.4.1.99999.1.6 = Firmware
.1.3.6.1.4.1.99999.1.7 = SIP Registration Status
.1.3.6.1.4.1.99999.1.8 = PRI/E1 Status
```

## Testing

After installation and UI configuration, test with:

```bash
# Test basic OID
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.1

# Test SIP status
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.7

# Test PRI status
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.8

# Walk all OIDs
snmpwalk -v2c -c public localhost .1.3.6.1.4.1.99999.1
```

## Troubleshooting

### Script not found error in UI
```bash
# Verify script exists and is executable
ls -la /usr/local/bin/clixxo-device-info.sh

# If missing, copy it manually
cp clixxo-device-info.sh /usr/local/bin/
chmod +x /usr/local/bin/clixxo-device-info.sh
```

### OIDs return "No SIP registrations" or "No PRI status"
```bash
# Check sudoers file
sudo cat /etc/sudoers.d/snmp-asterisk

# Test sudo access
sudo -u Debian-snmp sudo asterisk -rx "pjsip show registrations"

# If password is required, recreate sudoers file:
sudo bash -c 'cat > /etc/sudoers.d/snmp-asterisk <<EOF
Debian-snmp ALL=(root) NOPASSWD: /usr/sbin/asterisk -rx *
Defaults:Debian-snmp !requiretty
EOF'
sudo chmod 0440 /etc/sudoers.d/snmp-asterisk
```

### SNMP service not responding
```bash
# Check if snmpd is running
systemctl status snmpd

# Check if script is executable
/usr/local/bin/clixxo-device-info.sh
# Type: PING (should respond with PONG)
# Press Ctrl+D to exit

# Restart snmpd
sudo systemctl restart snmpd
```

## Benefits of This Approach

✅ **Pre-installed script** - No need to create it from UI
✅ **Consistent across devices** - Same script on all devices
✅ **Easy updates** - Update script in installation package
✅ **Simple UI** - UI only configures snmpd.conf and restarts service
✅ **Fast deployment** - Just click "Save" in UI
✅ **Version control** - Script is in your repo, easy to track changes

## File Locations

- Script: `/usr/local/bin/clixxo-device-info.sh`
- SNMP Config: `/etc/snmp/snmpd.conf`
- Sudoers: `/etc/sudoers.d/snmp-asterisk`
- JSON Data: `/home/clixxo/server/config/web_version.json`
