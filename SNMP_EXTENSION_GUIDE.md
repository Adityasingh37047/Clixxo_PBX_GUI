# SNMP Extension Guide - Using Net-SNMP with Shell Scripts

## Overview

This guide explains how to extend SNMP OIDs using Net-SNMP's `pass_persist` feature with Linux shell scripts. This approach allows you to add custom OIDs without modifying the Net-SNMP source code.

## Current Implementation

Your system already implements 8 custom OIDs under the private enterprise number `99999`:

- **1.3.6.1.4.1.99999.1.1** - Serial Number (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.2** - Web Version (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.3** - Service Version (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.4** - Uboot Version (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.5** - Kernel Version (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.6** - Firmware Version (from `web_version.json`)
- **1.3.6.1.4.1.99999.1.7** - SIP Registration Status (from Asterisk)
- **1.3.6.1.4.1.99999.1.8** - PRI/E1 Status (from Asterisk)

## How It Works

### 1. The Shell Script (`/usr/local/bin/clixxo-device-info.sh`)

The script implements the `pass_persist` protocol, which is a simple text-based protocol:

- **PING** → Script responds with **PONG** (health check)
- **get** + OID → Script returns: `OID\nTYPE\nVALUE`
- **getnext** + OID → Script returns: `NEXT_OID\nTYPE\nVALUE`

### 2. SNMP Configuration (`/etc/snmp/snmpd.conf`)

The configuration includes:
```conf
pass_persist .1.3.6.1.4.1.99999.1 /usr/local/bin/clixxo-device-info.sh
```

This tells `snmpd` to:
- Handle all OIDs under `.1.3.6.1.4.1.99999.1` using the script
- Keep the script running persistently
- Forward SNMP requests to the script via stdin
- Read responses from the script via stdout

## Adding New OIDs

### Step 1: Add the OID Handler Function

In the shell script, add a function to retrieve your data:

```bash
get_my_new_data() {
    # Your logic here to get the data
    # Example: Read from a file, run a command, etc.
    local output=""
    
    # Example: Get data from a command
    if command -v my_command >/dev/null 2>&1; then
        output=$(my_command 2>/dev/null)
    fi
    
    if [ -z "$output" ]; then
        echo "No data available"
    else
        format_cmd_output "$output"
    fi
}
```

### Step 2: Add OID Mapping in `get_oid_value()`

Add a new case in the `get_oid_value()` function:

```bash
get_oid_value() {
    local oid="$1"
    oid=$(echo "$oid" | sed 's/^\.//')
    case "$oid" in
        # ... existing OIDs ...
        1.3.6.1.4.1.99999.1.8) echo $(get_pri_status); ;;
        1.3.6.1.4.1.99999.1.9) echo $(get_my_new_data); ;;  # NEW OID
        *) echo ""; return 1; ;;
    esac
    return 0
}
```

### Step 3: Add OID to `get_next_oid()`

Update the `get_next_oid()` function to include the new OID in the chain:

```bash
get_next_oid() {
    local oid="$1"
    oid=$(echo "$oid" | sed 's/^\.//')
    case "$oid" in
        # ... existing OIDs ...
        1.3.6.1.4.1.99999.1.7) echo ".1.3.6.1.4.1.99999.1.8"; ;;
        1.3.6.1.4.1.99999.1.8) echo ".1.3.6.1.4.1.99999.1.9"; ;;  # NEW: points to 1.9
        1.3.6.1.4.1.99999.1.9) echo ""; return 1; ;;  # NEW: last OID, return empty
        *) echo ""; return 1; ;;
    esac
    return 0
}
```

### Step 4: Update the Script

The script is automatically updated when you save settings in the Centralized Manage page. Alternatively, you can manually update `/usr/local/bin/clixxo-device-info.sh` and restart `snmpd`:

```bash
sudo systemctl restart snmpd
```

## Example: Adding a New OID

### Example 1: System Uptime

```bash
get_system_uptime() {
    if [ -f /proc/uptime ]; then
        local uptime_seconds=$(awk '{print int($1)}' /proc/uptime)
        local days=$((uptime_seconds / 86400))
        local hours=$(((uptime_seconds % 86400) / 3600))
        local minutes=$(((uptime_seconds % 3600) / 60))
        echo "${days}d ${hours}h ${minutes}m"
    else
        echo "Uptime unavailable"
    fi
}
```

Then add to `get_oid_value()`:
```bash
1.3.6.1.4.1.99999.1.9) echo $(get_system_uptime); ;;
```

### Example 2: Active Call Count

```bash
get_active_calls() {
    local count="0"
    if command -v asterisk >/dev/null 2>&1; then
        count=$(asterisk -rx "core show channels" 2>/dev/null | grep -c "active channels" || echo "0")
    fi
    echo "$count"
}
```

Then add to `get_oid_value()`:
```bash
1.3.6.1.4.1.99999.1.10) echo $(get_active_calls); ;;
```

## Testing Your OIDs

### Test with `snmpget`

```bash
# Test a specific OID
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.1

# Test the new OID
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.9
```

### Test with `snmpwalk`

```bash
# Walk all OIDs under the base
snmpwalk -v2c -c public localhost .1.3.6.1.4.1.99999.1
```

### Test the Script Directly

```bash
# Test PING
echo "PING" | /usr/local/bin/clixxo-device-info.sh

# Test GET
echo -e "get\n.1.3.6.1.4.1.99999.1.9" | /usr/local/bin/clixxo-device-info.sh

# Test GETNEXT
echo -e "getnext\n.1.3.6.1.4.1.99999.1.8" | /usr/local/bin/clixxo-device-info.sh
```

## Troubleshooting

### Script Not Responding

1. Check if script is executable:
   ```bash
   ls -l /usr/local/bin/clixxo-device-info.sh
   chmod +x /usr/local/bin/clixxo-device-info.sh
   ```

2. Test script manually:
   ```bash
   echo "PING" | /usr/local/bin/clixxo-device-info.sh
   ```

3. Check `snmpd` logs:
   ```bash
   journalctl -u snmpd -f
   # or
   tail -f /var/log/snmpd.log
   ```

### OID Returns "No Such Instance"

1. Verify the OID is in `get_oid_value()` function
2. Verify the OID is in `get_next_oid()` function
3. Check that the function returns a non-empty value
4. Restart `snmpd`:
   ```bash
   sudo systemctl restart snmpd
   ```

### Script Syntax Errors

Test the script syntax:
```bash
bash -n /usr/local/bin/clixxo-device-info.sh
```

## Best Practices

1. **Error Handling**: Always check if commands/files exist before using them
2. **Output Formatting**: Use `format_cmd_output()` for multi-line outputs
3. **Timeout Protection**: Use `timeout` command for long-running operations
4. **Empty Values**: Return a meaningful message instead of empty string
5. **OID Ordering**: Maintain sequential OID numbering for easier management
6. **Documentation**: Document what each OID represents

## Reference: Net-SNMP pass_persist Protocol

Based on the [Net-SNMP documentation](https://www.net-snmp.org/wiki/index.php/Tut:Extending_snmpd_using_shell_scripts):

### Protocol Commands

- **PING**: Single line, script must respond with "PONG"
- **get**: Two lines (command + OID), script responds with:
  ```
  OID
  TYPE
  VALUE
  ```
- **getnext**: Two lines (command + OID), script responds with:
  ```
  NEXT_OID
  TYPE
  VALUE
  ```

### Response Types

Common SNMP types:
- `string` - String value
- `integer` - Integer value
- `gauge` - Gauge (0-4294967295)
- `counter` - Counter (0-4294967295)
- `timeticks` - Time ticks (hundredths of seconds)

### Error Responses

- `NONE` - No such instance/object available

## Updating the MIB File

When you add new OIDs, you should also update the MIB file. The MIB is generated in `CentralizedManage.jsx` in the `handleDownloadMib()` function. Add your new OID definition:

```smi
clixxoMyNewOid OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Description of your new OID"
    ::= { clixxoDeviceInfoTable 9 }
```

## Summary

1. **Create a function** to retrieve your data
2. **Add OID mapping** in `get_oid_value()`
3. **Update `get_next_oid()`** to include the new OID
4. **Update the script** (automatic via UI or manual)
5. **Restart snmpd** to apply changes
6. **Test** with `snmpget` or `snmpwalk`
7. **Update MIB** file if needed

The beauty of this approach is that you don't need to modify Net-SNMP source code - just write shell scripts and configure `snmpd.conf`!
