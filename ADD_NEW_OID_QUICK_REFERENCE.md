# Quick Reference: Adding a New OID

## Current OIDs
- 1.3.6.1.4.1.99999.1.1 - Serial Number
- 1.3.6.1.4.1.99999.1.2 - Web Version
- 1.3.6.1.4.1.99999.1.3 - Service
- 1.3.6.1.4.1.99999.1.4 - Uboot
- 1.3.6.1.4.1.99999.1.5 - Kernel
- 1.3.6.1.4.1.99999.1.6 - Firmware
- 1.3.6.1.4.1.99999.1.7 - SIP Registration Status
- 1.3.6.1.4.1.99999.1.8 - PRI Status

## To Add OID 1.3.6.1.4.1.99999.1.9 (Example: System Uptime)

### Step 1: Add Function to Retrieve Data

In `CentralizedManage.jsx`, find the section where functions are defined (around line 532-594), and add:

```bash
get_system_uptime() {
    local output=""
    if [ -f /proc/uptime ]; then
        local uptime_seconds=$(awk '{print int($1)}' /proc/uptime)
        local days=$((uptime_seconds / 86400))
        local hours=$(((uptime_seconds % 86400) / 3600))
        local minutes=$(((uptime_seconds % 3600) / 60))
        output="${days}d ${hours}h ${minutes}m"
    fi
    if [ -z "$output" ]; then
        echo "Uptime unavailable"
    else
        format_cmd_output "$output"
    fi
}
```

### Step 2: Update `get_oid_value()` Function

Find `get_oid_value()` function (around line 596-641) and add the new case:

```bash
case "$oid" in
    # ... existing cases ...
    1.3.6.1.4.1.99999.1.8)
        value=$(get_pri_status)
        ;;
    1.3.6.1.4.1.99999.1.9)  # NEW OID
        value=$(get_system_uptime)
        ;;
    *)
        echo ""
        return 1
        ;;
esac
```

### Step 3: Update `get_next_oid()` Function

Find `get_next_oid()` function (around line 643-679) and add:

```bash
case "$oid" in
    # ... existing cases ...
    1.3.6.1.4.1.99999.1.7)
        echo ".1.3.6.1.4.1.99999.1.8"
        ;;
    1.3.6.1.4.1.99999.1.8)
        echo ".1.3.6.1.4.1.99999.1.9"  # NEW: points to 1.9
        ;;
    1.3.6.1.4.1.99999.1.9)
        echo ""  # NEW: last OID, return empty
        return 1
        ;;
    *)
        echo ""
        return 1
        ;;
esac
```

### Step 4: Update MIB Definition (Optional but Recommended)

In `handleDownloadMib()` function (around line 1069-1142), add the new OID definition:

```smi
clixxoSystemUptime OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "System uptime (days, hours, minutes)"
    ::= { clixxoDeviceInfoTable 9 }
```

### Step 5: Apply Changes

1. Save the `CentralizedManage.jsx` file
2. Go to the Centralized Manage page in the UI
3. Click "Save" - this will automatically:
   - Update the shell script on the device
   - Restart snmpd
   - Apply the new configuration

### Step 6: Test

```bash
# Test the new OID
snmpget -v2c -c public localhost .1.3.6.1.4.1.99999.1.9

# Or walk all OIDs
snmpwalk -v2c -c public localhost .1.3.6.1.4.1.99999.1
```

## Template for New OID Function

```bash
get_my_new_oid() {
    local output=""
    
    # Your data retrieval logic here
    # Example: Read from file
    if [ -f "/path/to/file" ]; then
        output=$(cat /path/to/file 2>/dev/null)
    fi
    
    # Example: Run a command
    if command -v my_command >/dev/null 2>&1; then
        output=$(my_command 2>/dev/null)
    fi
    
    # Example: Parse JSON
    if [ -f "/path/to/json" ]; then
        output=$(read_json_value "key_name")
    fi
    
    # Format and return
    if [ -z "$output" ]; then
        echo "No data available"
    else
        format_cmd_output "$output"
    fi
}
```

## Common Data Sources

### Read from JSON file
```bash
value=$(read_json_value "key_name")
```

### Run Asterisk command
```bash
if command -v asterisk >/dev/null 2>&1; then
    output=$(asterisk -rx "command" 2>/dev/null)
fi
```

### Read from system file
```bash
if [ -f "/proc/somefile" ]; then
    output=$(cat /proc/somefile 2>/dev/null)
fi
```

### Execute shell command
```bash
output=$(command_to_run 2>/dev/null)
```

## Important Notes

1. **Always check if commands/files exist** before using them
2. **Use `format_cmd_output()`** for multi-line outputs to convert to single line
3. **Handle empty values** - return a message instead of empty string
4. **Update both functions** - `get_oid_value()` AND `get_next_oid()`
5. **Test manually** before deploying:
   ```bash
   echo -e "get\n.1.3.6.1.4.1.99999.1.9" | /usr/local/bin/clixxo-device-info.sh
   ```

## File Locations

- **Script Location**: `/usr/local/bin/clixxo-device-info.sh`
- **SNMP Config**: `/etc/snmp/snmpd.conf`
- **Source Code**: `src/components/CentralizedManage.jsx`

## Restart SNMP Service

After manual script edits (if not using UI):
```bash
sudo systemctl restart snmpd
```
