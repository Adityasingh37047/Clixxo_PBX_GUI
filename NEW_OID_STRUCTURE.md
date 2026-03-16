# New OID Structure - Updated Configuration

## Changes Made

### OID Structure Changed
- **Old OID**: `1.3.6.1.4.1.99999.1.x`
- **New OID**: `1.3.6.1.4.1.39871.1.1.x.0`

### New OID Mappings

```
.1.3.6.1.4.1.39871.1.1.2.0 = Serial Number
.1.3.6.1.4.1.39871.1.1.3.0 = Web Version
.1.3.6.1.4.1.39871.1.1.4.0 = Service
.1.3.6.1.4.1.39871.1.1.5.0 = U-Boot
.1.3.6.1.4.1.39871.1.1.6.0 = Kernel
.1.3.6.1.4.1.39871.1.1.7.0 = Firmware
.1.3.6.1.4.1.39871.1.1.8.0 = SIP Registration Status
.1.3.6.1.4.1.39871.1.1.9.0 = PRI/E1 Status
```

## What the UI Does Now

When you click **"Save"** in the Centralized Manage page:

1. ✅ **Checks** if `/usr/local/bin/clixxo-device-info.sh` exists (shows error if missing)
2. ✅ **Creates** `/etc/sudoers.d/snmp-asterisk` for Asterisk access
3. ✅ **Writes** `/etc/snmp/snmpd.conf` with:
   - Community string
   - Listen port
   - Access controls
   - **`pass_persist .1.3.6.1.4.1.39871 /usr/local/bin/clixxo-device-info.sh`**
4. ✅ **Restarts** snmpd service
5. ✅ **Tests** the OIDs

## Your Manual Script

Your script at `/usr/local/bin/clixxo-device-info.sh` should contain:

```bash
#!/bin/bash
# pass_persist SNMP script for device info

JSON_FILE="/home/clixxo/server/config/web_version.json"
BASE_OID="1.3.6.1.4.1.39871.1.1"

# ... (rest of your script)
```

## snmpd.conf Entry

The UI will automatically add this line to `/etc/snmp/snmpd.conf`:

```
pass_persist .1.3.6.1.4.1.39871 /usr/local/bin/clixxo-device-info.sh
```

## Testing Commands

After clicking "Save", test with:

```bash
# Test serial number
snmpget -v2c -c public localhost .1.3.6.1.4.1.39871.1.1.2.0

# Test SIP status
snmpget -v2c -c public localhost .1.3.6.1.4.1.39871.1.1.8.0

# Test PRI status
snmpget -v2c -c public localhost .1.3.6.1.4.1.39871.1.1.9.0

# Walk all OIDs
snmpwalk -v2c -c public localhost .1.3.6.1.4.1.39871
```

## Important Notes

1. **Script is NOT created by UI** - You manage it manually
2. **Script must be pre-installed** at `/usr/local/bin/clixxo-device-info.sh`
3. **UI only configures** snmpd.conf and sudoers
4. **OID base changed** from `99999` to `39871`
5. **OID format changed** - now includes `.1.1.x.0` suffix

## Deployment Workflow

1. **Edit** your script manually (change OIDs as needed)
2. **Include** script in `clixxo.zip` installation package
3. **Copy** to `/usr/local/bin/clixxo-device-info.sh` during installation
4. **Users click "Save"** in UI → Configures SNMP with new OID structure

## Files Updated

- ✅ `src/components/CentralizedManage.jsx` - Updated all OID references from `99999` to `39871`
- ✅ All test commands updated to use new OID structure
- ✅ All comments updated with new OID mappings
- ✅ MIB definition updated to use enterprise number `39871`
