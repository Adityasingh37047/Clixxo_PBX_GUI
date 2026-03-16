#!/bin/bash

LOG_FILE="/tmp/snmp_remote_ops.log"
UPGRADE_DIR="/tmp/firmware"
TRAP_HOST="127.0.0.1"
COMMUNITY="public"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>&1 || echo "[$(date '+%Y-%m-%d %H:%M:%S')] LOG_ERROR: $1" >> /tmp/snmp_script_test.log 2>&1
}

send_trap() {
    local TRAP_OID="$1"
    local DESCRIPTION="$2"
    
    snmptrap -v2c -M "" -On -Ci -c "$COMMUNITY" "$TRAP_HOST" "" \
        "$TRAP_OID" \
        "1.3.6.1.4.1.39871.6.9.0" s "$DESCRIPTION" >/dev/null 2>&1 &
}

# Determine which OID is being accessed based on the request OID
REQUEST_OID="$2"
# Remove leading dot if present
REQUEST_OID="${REQUEST_OID#.}"

# Debug logging - write to test file first to verify script is called
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Script called with: $@" >> /tmp/snmp_script_test.log 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Normalized OID: $REQUEST_OID" >> /tmp/snmp_script_test.log 2>&1

log_message "=== SNMP Remote Management Script Called ==="
log_message "Command: $1"
log_message "Request OID (normalized): $REQUEST_OID"
log_message "All arguments: $@"

############################
# REMOTE CONFIGURATION
# OID: 1.3.6.1.4.1.39871.3.1.0
############################
if [[ "$REQUEST_OID" == *"3.1.0" ]] || [[ "$REQUEST_OID" == "1.3.6.1.4.1.39871.3.1.0" ]]; then
    case "$1" in
        -g)
            echo "1.3.6.1.4.1.39871.3.1.0"
            echo "string"
            echo "idle"
            ;;
        -s)
            INPUT_VALUE="$4"
            log_message "Remote Configuration: Received input: $INPUT_VALUE"
            
            TEMP_FILE=""
            
            # Check if input is a URL (http:// or https://)
            if [[ "$INPUT_VALUE" =~ ^https?:// ]]; then
                log_message "Detected URL: $INPUT_VALUE"
                
                # Create temp file with timestamp
                TEMP_FILE="/tmp/pjsip_config_$(date +%s).conf"
                
                # Try curl first, then wget
                if command -v curl >/dev/null 2>&1; then
                    log_message "Downloading config from URL using curl..."
                    DOWNLOAD_OUTPUT=$(curl -f -s -w "\n%{http_code}" -o "$TEMP_FILE" "$INPUT_VALUE" 2>&1)
                    HTTP_CODE=$(echo "$DOWNLOAD_OUTPUT" | tail -n 1)
                    if [ "$HTTP_CODE" = "200" ] && [ -f "$TEMP_FILE" ]; then
                        log_message "Successfully downloaded config from URL to $TEMP_FILE (HTTP $HTTP_CODE)"
                    else
                        log_message "ERROR: Failed to download from URL using curl: $INPUT_VALUE (HTTP $HTTP_CODE)"
                        log_message "Curl output: $DOWNLOAD_OUTPUT"
                        rm -f "$TEMP_FILE"
                        exit 1
                    fi
                elif command -v wget >/dev/null 2>&1; then
                    log_message "Downloading config from URL using wget..."
                    if wget -q -O "$TEMP_FILE" "$INPUT_VALUE" 2>&1; then
                        log_message "Successfully downloaded config from URL to $TEMP_FILE"
                    else
                        log_message "ERROR: Failed to download from URL using wget: $INPUT_VALUE"
                        rm -f "$TEMP_FILE"
                        exit 1
                    fi
                else
                    log_message "ERROR: Neither curl nor wget available. Cannot download from URL."
                    exit 1
                fi
                
                # Verify downloaded file exists and is not empty
                if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
                    log_message "ERROR: Downloaded file is empty or missing: $TEMP_FILE"
                    rm -f "$TEMP_FILE"
                    exit 1
                fi
                
                FILE_PATH="$TEMP_FILE"
            else
                # It's a local file path
                FILE_PATH="$INPUT_VALUE"
            fi
            
            # Verify file exists
            if [ ! -f "$FILE_PATH" ]; then
                log_message "ERROR: Configuration file not found: $FILE_PATH"
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            log_message "Applying configuration from: $FILE_PATH"
            
            # Backup existing configuration (with sudo)
            BACKUP_FILE="/etc/asterisk/pjsip_registrations.conf.backup.$(date +%Y%m%d_%H%M%S)"
            if sudo cp /etc/asterisk/pjsip_registrations.conf "$BACKUP_FILE" 2>/dev/null; then
                log_message "Backup created: $BACKUP_FILE"
            else
                log_message "WARNING: Could not create backup (file may not exist yet)"
            fi
            
            # Apply new configuration (with sudo)
            if sudo cp "$FILE_PATH" /etc/asterisk/pjsip_registrations.conf; then
                log_message "Configuration file copied successfully"
            else
                log_message "ERROR: Failed to copy configuration file. Check permissions."
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            # Set proper permissions (with sudo)
            if sudo chown asterisk:asterisk /etc/asterisk/pjsip_registrations.conf && \
               sudo chmod 640 /etc/asterisk/pjsip_registrations.conf; then
                log_message "File permissions set successfully"
            else
                log_message "ERROR: Failed to set file permissions"
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            # Reload Asterisk (with sudo)
            if sudo asterisk -rx "pjsip reload" 2>/dev/null; then
                log_message "Asterisk reloaded successfully"
            else
                log_message "WARNING: Asterisk reload command may have failed"
            fi
            
            # Clean up temp file if it was downloaded
            [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
            
            send_trap "1.3.6.1.4.1.39871.0.14" "Remote Config: pjsip_registrations.conf applied from $INPUT_VALUE"
            log_message "Configuration applied successfully and Asterisk reloaded"
            
            echo "1.3.6.1.4.1.39871.3.1.0"
            echo "string"
            echo "Configuration applied: $INPUT_VALUE"
            ;;
        -n)
            echo "1.3.6.1.4.1.39871.3.2.0"
            ;;
    esac

############################
# REMOTE FIRMWARE UPGRADE (Server Code Deployment)
# OID: 1.3.6.1.4.1.39871.3.2.0
############################
elif [[ "$REQUEST_OID" == *"3.2.0" ]] || [[ "$REQUEST_OID" == "1.3.6.1.4.1.39871.3.2.0" ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] OID MATCHED - Firmware upgrade section" >> /tmp/snmp_script_test.log 2>&1
    log_message "Matched firmware upgrade OID: $REQUEST_OID"
    case "$1" in
        -g)
            echo "1.3.6.1.4.1.39871.3.2.0"
            echo "string"
            if [ -f "/etc/firmware_version" ]; then
                cat /etc/firmware_version
            else
                echo "unknown"
            fi
            ;;
        -s)
            INPUT_VALUE="$4"
            log_message "=== FIRMWARE UPGRADE SET REQUEST ==="
            log_message "Remote Firmware/Server Upgrade: Received input: $INPUT_VALUE"
            log_message "All SET arguments: $@"
            
            TEMP_FILE=""
            EXTRACT_DIR=""
            
            # Check if input is a URL (http:// or https://)
            if [[ "$INPUT_VALUE" =~ ^https?:// ]]; then
                log_message "Detected URL: $INPUT_VALUE"
                
                mkdir -p "$UPGRADE_DIR"
                
                # Determine file extension from URL
                if [[ "$INPUT_VALUE" =~ \.(zip|ZIP)$ ]]; then
                    TEMP_FILE="$UPGRADE_DIR/server_update_$(date +%s).zip"
                    FILE_TYPE="zip"
                elif [[ "$INPUT_VALUE" =~ \.(tar|TAR)$ ]]; then
                    TEMP_FILE="$UPGRADE_DIR/server_update_$(date +%s).tar"
                    FILE_TYPE="tar"
                elif [[ "$INPUT_VALUE" =~ \.(tar\.gz|tgz|TAR\.GZ|TGZ)$ ]]; then
                    TEMP_FILE="$UPGRADE_DIR/server_update_$(date +%s).tar.gz"
                    FILE_TYPE="targz"
                else
                    # Default to zip
                    TEMP_FILE="$UPGRADE_DIR/server_update_$(date +%s).zip"
                    FILE_TYPE="zip"
                    log_message "WARNING: File type not detected, assuming ZIP"
                fi
                
                # Test network connectivity first
                URL_HOST=$(echo "$INPUT_VALUE" | sed -E 's|https?://([^:/]+).*|\1|')
                log_message "Testing connectivity to URL host: $URL_HOST"
                if ping -c 1 -W 2 "$URL_HOST" >/dev/null 2>&1; then
                    log_message "Network connectivity to $URL_HOST: OK"
                else
                    log_message "WARNING: Cannot ping $URL_HOST, but will try download anyway"
                fi
                
                # Try curl first, then wget
                if command -v curl >/dev/null 2>&1; then
                    log_message "Downloading server package from URL using curl..."
                    log_message "URL: $INPUT_VALUE"
                    log_message "Target file: $TEMP_FILE"
                    
                    # Use verbose mode to capture all errors
                    DOWNLOAD_OUTPUT=$(curl -v -f -s -w "\nHTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}" -o "$TEMP_FILE" "$INPUT_VALUE" 2>&1)
                    CURL_EXIT=$?
                    HTTP_CODE=$(echo "$DOWNLOAD_OUTPUT" | grep "HTTP_CODE:" | cut -d: -f2)
                    TIME_TOTAL=$(echo "$DOWNLOAD_OUTPUT" | grep "TIME_TOTAL:" | cut -d: -f2)
                    
                    log_message "Curl exit code: $CURL_EXIT"
                    log_message "HTTP response code: $HTTP_CODE"
                    log_message "Download time: $TIME_TOTAL seconds"
                    
                    if [ "$CURL_EXIT" -eq 0 ] && [ "$HTTP_CODE" = "200" ] && [ -f "$TEMP_FILE" ] && [ -s "$TEMP_FILE" ]; then
                        FILE_SIZE=$(stat -c%s "$TEMP_FILE" 2>/dev/null || echo "unknown")
                        log_message "Successfully downloaded server package to $TEMP_FILE (Size: $FILE_SIZE bytes, HTTP $HTTP_CODE)"
                    else
                        log_message "ERROR: Failed to download from URL using curl"
                        log_message "Curl exit code: $CURL_EXIT"
                        log_message "HTTP code: $HTTP_CODE"
                        log_message "File exists: $([ -f "$TEMP_FILE" ] && echo "YES" || echo "NO")"
                        log_message "File size: $([ -f "$TEMP_FILE" ] && stat -c%s "$TEMP_FILE" 2>/dev/null || echo "0") bytes"
                        log_message "Full curl output:"
                        echo "$DOWNLOAD_OUTPUT" | while IFS= read -r line; do
                            log_message "  $line"
                        done
                        rm -f "$TEMP_FILE"
                        exit 1
                    fi
                elif command -v wget >/dev/null 2>&1; then
                    log_message "Downloading server package from URL using wget..."
                    log_message "URL: $INPUT_VALUE"
                    WGET_OUTPUT=$(wget -v -O "$TEMP_FILE" "$INPUT_VALUE" 2>&1)
                    WGET_EXIT=$?
                    if [ "$WGET_EXIT" -eq 0 ] && [ -f "$TEMP_FILE" ] && [ -s "$TEMP_FILE" ]; then
                        FILE_SIZE=$(stat -c%s "$TEMP_FILE" 2>/dev/null || echo "unknown")
                        log_message "Successfully downloaded server package to $TEMP_FILE (Size: $FILE_SIZE bytes)"
                    else
                        log_message "ERROR: Failed to download from URL using wget"
                        log_message "Wget exit code: $WGET_EXIT"
                        log_message "Wget output: $WGET_OUTPUT"
                        rm -f "$TEMP_FILE"
                        exit 1
                    fi
                else
                    log_message "ERROR: Neither curl nor wget available. Cannot download from URL."
                    exit 1
                fi
                
                # Verify downloaded file exists and is not empty
                if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
                    log_message "ERROR: Downloaded file is empty or missing: $TEMP_FILE"
                    rm -f "$TEMP_FILE"
                    exit 1
                fi
                
                ARCHIVE_PATH="$TEMP_FILE"
            else
                # It's a local file path
                ARCHIVE_PATH="$INPUT_VALUE"
                
                # Determine file type from extension
                if [[ "$ARCHIVE_PATH" =~ \.(zip|ZIP)$ ]]; then
                    FILE_TYPE="zip"
                elif [[ "$ARCHIVE_PATH" =~ \.(tar|TAR)$ ]]; then
                    FILE_TYPE="tar"
                elif [[ "$ARCHIVE_PATH" =~ \.(tar\.gz|tgz|TAR\.GZ|TGZ)$ ]]; then
                    FILE_TYPE="targz"
                else
                    FILE_TYPE="zip"
                    log_message "WARNING: File type not detected, assuming ZIP"
                fi
            fi
            
            # Verify file exists
            if [ ! -f "$ARCHIVE_PATH" ]; then
                log_message "ERROR: Archive file not found: $ARCHIVE_PATH"
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            log_message "Starting server code deployment from: $ARCHIVE_PATH"
            send_trap "1.3.6.1.4.1.39871.0.12" "Server Upgrade: Starting deployment from $INPUT_VALUE"
            
            # Verify source archive exists before copying
            if [ ! -f "$ARCHIVE_PATH" ]; then
                log_message "ERROR: Source archive file does not exist: $ARCHIVE_PATH"
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            SOURCE_SIZE=$(stat -c%s "$ARCHIVE_PATH" 2>/dev/null || echo "unknown")
            log_message "Source archive size: $SOURCE_SIZE bytes"
            
            # Copy tar file to /tmp (Debian-snmp can write here)
            TMP_TAR_FILE="/tmp/Uclixxo.tar"
            log_message "Copying archive to /tmp: $TMP_TAR_FILE"
            log_message "Source archive path: $ARCHIVE_PATH"
            
            # Simple copy to /tmp - no sudo needed
            if cp "$ARCHIVE_PATH" "$TMP_TAR_FILE" 2>&1; then
                # Verify the file was copied
                if [ -f "$TMP_TAR_FILE" ]; then
                    FILE_SIZE=$(stat -c%s "$TMP_TAR_FILE" 2>/dev/null || echo "unknown")
                    log_message "Archive copied to /tmp successfully (Size: $FILE_SIZE bytes)"
                else
                    log_message "ERROR: Copy failed - file not found at $TMP_TAR_FILE"
                    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                    exit 1
                fi
            else
                log_message "ERROR: Failed to copy archive to /tmp"
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                exit 1
            fi
            
            # Extract to /tmp (will create /tmp/Uclixxo/ folder)
            EXTRACT_DIR="/tmp"
            log_message "Extracting archive to /tmp: $EXTRACT_DIR"
            
            # Extract based on file type to /tmp (simple, no sudo)
            case "$FILE_TYPE" in
                zip)
                    if command -v unzip >/dev/null 2>&1; then
                        if unzip -q -o "$TMP_TAR_FILE" -d "$EXTRACT_DIR" 2>&1; then
                            log_message "Successfully extracted ZIP archive to /tmp"
                        else
                            log_message "ERROR: Failed to extract ZIP archive"
                            rm -f "$TMP_TAR_FILE"
                            [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                            exit 1
                        fi
                    else
                        log_message "ERROR: unzip command not available"
                        rm -f "$TMP_TAR_FILE"
                        [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                        exit 1
                    fi
                    ;;
                tar)
                    if tar -xf "$TMP_TAR_FILE" -C "$EXTRACT_DIR" 2>&1; then
                        log_message "Successfully extracted TAR archive to /tmp"
                    else
                        log_message "ERROR: Failed to extract TAR archive"
                        rm -f "$TMP_TAR_FILE"
                        [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                        exit 1
                    fi
                    ;;
                targz)
                    if tar -xzf "$TMP_TAR_FILE" -C "$EXTRACT_DIR" 2>&1; then
                        log_message "Successfully extracted TAR.GZ archive to /tmp"
                    else
                        log_message "ERROR: Failed to extract TAR.GZ archive"
                        rm -f "$TMP_TAR_FILE"
                        [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                        exit 1
                    fi
                    ;;
                *)
                    log_message "ERROR: Unknown file type: $FILE_TYPE"
                    rm -f "$TMP_TAR_FILE"
                    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                    exit 1
                    ;;
            esac
            
            # Look for update.sh script in extracted files (should be in /tmp/Uclixxo/update.sh)
            UPDATE_SCRIPT=""
            
            # Check in /tmp/Uclixxo/ folder first (most common)
            if [ -f "/tmp/Uclixxo/update.sh" ]; then
                UPDATE_SCRIPT="/tmp/Uclixxo/update.sh"
                log_message "Found update.sh in /tmp/Uclixxo/: $UPDATE_SCRIPT"
            # Check in /tmp directory
            elif [ -f "$EXTRACT_DIR/update.sh" ]; then
                UPDATE_SCRIPT="$EXTRACT_DIR/update.sh"
                log_message "Found update.sh in /tmp: $UPDATE_SCRIPT"
            else
                # Check in subdirectories
                for dir in "$EXTRACT_DIR"/*; do
                    if [ -d "$dir" ] && [ -f "$dir/update.sh" ]; then
                        UPDATE_SCRIPT="$dir/update.sh"
                        log_message "Found update.sh in subdirectory: $UPDATE_SCRIPT"
                        break
                    fi
                done
            fi
            
            # If update.sh exists, run it instead of default deployment (simple, no sudo)
            if [ -n "$UPDATE_SCRIPT" ] && [ -f "$UPDATE_SCRIPT" ]; then
                log_message "Found update.sh script, executing custom deployment..."
                
                # Convert Windows line endings to Unix (remove \r characters)
                log_message "Converting line endings in update.sh (Windows to Unix)..."
                sed -i 's/\r$//' "$UPDATE_SCRIPT" 2>/dev/null || {
                    # If sed -i doesn't work, use a temporary file
                    sed 's/\r$//' "$UPDATE_SCRIPT" > "${UPDATE_SCRIPT}.tmp" && mv "${UPDATE_SCRIPT}.tmp" "$UPDATE_SCRIPT"
                }
                
                # Make update.sh executable
                chmod +x "$UPDATE_SCRIPT"
                
                # Determine the base directory for update.sh (usually /tmp/Uclixxo/ or /tmp)
                if [ -d "/tmp/Uclixxo" ]; then
                    BASE_DIR="/tmp/Uclixxo"
                else
                    BASE_DIR="$EXTRACT_DIR"
                fi
                
                # Run update.sh as root using sudo (script will use SCRIPT_DIR to find its location)
                log_message "Executing: $UPDATE_SCRIPT as root"
                
                # Execute update.sh as root using sudo
                if sudo bash "$UPDATE_SCRIPT" >> "$LOG_FILE" 2>&1; then
                    EXEC_SUCCESS=1
                else
                    EXEC_SUCCESS=0
                fi
                
                if [ "$EXEC_SUCCESS" -eq 1 ]; then
                    log_message "update.sh executed successfully"
                    
                    # Check if update.sh created/updated firmware version file
                    if [ -f "/etc/firmware_version" ]; then
                        NEW_VERSION=$(cat /etc/firmware_version)
                        log_message "Firmware version updated to: $NEW_VERSION"
                    fi
                    
                    send_trap "1.3.6.1.4.1.39871.0.13" "Server Upgrade: Deployment completed successfully via update.sh from $INPUT_VALUE"
                    
                    log_message "Server upgrade completed via update.sh script"
                    
                    echo "1.3.6.1.4.1.39871.3.2.0"
                    echo "string"
                    echo "Server upgrade completed via update.sh: Files deployed successfully"
                else
                    log_message "ERROR: update.sh script failed with exit code $?"
                    # Clean up /tmp files
                    rm -f "$TMP_TAR_FILE"
                    rm -rf "/tmp/Uclixxo" 2>/dev/null || true
                    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                    exit 1
                fi
            else
                # No update.sh found - this is required
                log_message "ERROR: update.sh script not found in extracted archive"
                log_message "The archive must contain an update.sh script in the root or Uclixxo folder"
                log_message "Extracted files are in: $EXTRACT_DIR"
                log_message "Please include update.sh in your archive to handle deployment"
                
                # Clean up
                rm -f "$TMP_TAR_FILE"
                rm -rf "/tmp/Uclixxo" 2>/dev/null || true
                [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
                
                send_trap "1.3.6.1.4.1.39871.0.12" "Server Upgrade: FAILED - update.sh script not found in archive"
                
                echo "1.3.6.1.4.1.39871.3.2.0"
                echo "string"
                echo "ERROR: update.sh script not found in archive"
                exit 1
            fi
            
            # Keep files in /tmp for debugging/verification
            # Clean up: Remove tar file and extracted folder from /tmp (commented out for debugging)
            log_message "Deployment completed. Files kept in /tmp for verification:"
            log_message "  - Tar file: $TMP_TAR_FILE"
            log_message "  - Extracted folder: /tmp/Uclixxo/"
            # Uncomment below lines to enable automatic cleanup:
            # log_message "Cleaning up /tmp files..."
            # rm -f "$TMP_TAR_FILE" 2>/dev/null || log_message "WARNING: Could not remove $TMP_TAR_FILE"
            # rm -rf "/tmp/Uclixxo" 2>/dev/null || log_message "WARNING: Could not remove /tmp/Uclixxo directory"
            [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
            log_message "=== FIRMWARE UPGRADE COMPLETED ==="
            ;;
        -n)
            echo "1.3.6.1.4.1.39871.3.3.0"
            ;;
    esac

############################
# REMOTE REBOOT
# OID: 1.3.6.1.4.1.39871.3.3.0
############################
elif [[ "$REQUEST_OID" == *"3.3.0" ]] || [[ "$REQUEST_OID" == "1.3.6.1.4.1.39871.3.3.0" ]]; then
    case "$1" in
        -g)
            echo "1.3.6.1.4.1.39871.3.3.0"
            echo "integer"
            echo "0"
            ;;
        -s)
            ACTION="$4"
            log_message "Remote Reboot: Received action code: $ACTION"
            
            case "$ACTION" in
                1)
                    log_message "IMMEDIATE REBOOT requested via SNMP"
                    send_trap "1.3.6.1.4.1.39871.0.11" "System Reboot: Rebooting NOW via SNMP request"
                    
                    # Create temporary reboot script
                    cat > /tmp/.snmp_reboot_now.sh << 'EOF'
#!/bin/bash
sleep 2
/sbin/reboot
EOF
                    chmod +x /tmp/.snmp_reboot_now.sh
                    
                    # Execute with nohup
                    nohup /tmp/.snmp_reboot_now.sh >/dev/null 2>&1 &
                    
                    log_message "Immediate reboot script created and launched"
                    
                    echo "1.3.6.1.4.1.39871.3.3.0"
                    echo "integer"
                    echo "1"
                    ;;

                    2)
                    log_message "SCHEDULED REBOOT (15 seconds) requested via SNMP"
                    send_trap "1.3.6.1.4.1.39871.0.11" "System Reboot: Rebooting in 15 seconds via SNMP request"
                    
                    # Create temporary reboot script with sudo
                    cat > /tmp/.snmp_reboot_scheduled.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/snmp_remote_ops.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reboot script: Starting 15 second countdown..." >> "$LOG_FILE"
sleep 15
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reboot script: Executing reboot now" >> "$LOG_FILE"
sudo /sbin/reboot
EOF
                    chmod +x /tmp/.snmp_reboot_scheduled.sh
                    
                    # Execute with nohup and save PID
                    nohup /tmp/.snmp_reboot_scheduled.sh >/dev/null 2>&1 &
                    echo $! > /tmp/snmp_reboot.pid
                    
                    log_message "Scheduled reboot script created and launched, PID: $!"
                    
                    echo "1.3.6.1.4.1.39871.3.3.0"
                    echo "integer"
                    echo "2"
                    ;;
                3)
                    log_message "REBOOT CANCELLED via SNMP"
                    
                    # Kill using PID file
                    if [ -f /tmp/snmp_reboot.pid ]; then
                        REBOOT_PID=$(cat /tmp/snmp_reboot.pid)
                        kill $REBOOT_PID 2>/dev/null
                        log_message "Killed reboot process PID: $REBOOT_PID"
                        rm -f /tmp/snmp_reboot.pid
                    fi
                    
                    # Kill any running reboot scripts
                    pkill -f ".snmp_reboot" 2>/dev/null
                    
                    # Remove script files
                    rm -f /tmp/.snmp_reboot_now.sh
                    rm -f /tmp/.snmp_reboot_scheduled.sh
                    
                    log_message "Reboot cancelled - all processes terminated and scripts removed"
                    
                    echo "1.3.6.1.4.1.39871.3.3.0"
                    echo "integer"
                    echo "3"
                    ;;
                *)
                    log_message "ERROR: Invalid reboot action: $ACTION"
                    exit 1
                    ;;
            esac
            ;;
        -n)
            echo "NONE"
            ;;
    esac
else
    # Unknown OID
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] OID NOT MATCHED - Unknown OID: $REQUEST_OID" >> /tmp/snmp_script_test.log 2>&1
    log_message "ERROR: Unknown OID requested: $REQUEST_OID"
    exit 1
fi

exit 0
