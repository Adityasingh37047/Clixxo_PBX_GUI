# Management Page - Linux CLI Integration

## Overview
The Management page has been modified to use the Linux CLI API (`/linuxcmd` endpoint) for executing Time Parameters configuration directly on the system via shell commands.

## 🆕 New Feature: Auto-Detect NTP Configuration

When you enable NTP (select "Yes"), the system will automatically detect and populate:
- **NTP Server Address** from the current Chrony configuration
- **Synchronizing Cycle** from the existing cron job (if configured)

This helps you see what's currently configured on your system without manually checking configuration files!

## How Auto-Detect Works

### Detection Commands

When you click "Yes" on NTP, these commands run:

1. **Detect NTP Server:**
   ```bash
   cat /etc/chrony/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}' || 
   cat /etc/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}'
   ```
   - Reads Chrony config file
   - Finds the first "server" line
   - Extracts the IP address/hostname

2. **Detect Synchronizing Cycle:**
   ```bash
   cat /etc/cron.d/chrony-sync 2>/dev/null | grep "chronyc makestep" | awk -F'/' '{print $2}' | awk '{print $1}'
   ```
   - Reads the cron job file
   - Extracts the minute interval
   - Converts to seconds (e.g., 60 minutes → 3600 seconds)

### What You'll See

✅ **If configuration is found:**
- Alert shows detected NTP server and cycle
- Fields are automatically populated
- You can modify the values if needed

⚠️ **If no configuration found:**
- Alert asks you to enter values manually
- Fields remain empty or show defaults

---

## Changes Made

### 1. Import Added
```javascript
import { postLinuxCmd } from '../api/apiService';
```

### 2. New Function: `detectNtpConfiguration()`
This function detects the current NTP configuration from the system.

### 3. New Function: `executeTimeParametersCommands()`
This function generates and executes Linux commands based on the Time Parameters form values.

## Linux Commands Being Executed

### SSH Configuration

#### When SSH is Enabled (Yes):

1. **Configure SSH Port:**
   ```bash
   sed -i 's/^#*Port.*/Port <SSH_PORT>/' /etc/ssh/sshd_config
   ```
   - Updates the Port directive in SSH config

2. **Enable SSH Service:**
   ```bash
   systemctl enable sshd 2>/dev/null || systemctl enable ssh
   ```

3. **Restart SSH Service:**
   ```bash
   systemctl restart sshd 2>/dev/null || systemctl restart ssh
   ```

4. **Open Firewall Port:**
   ```bash
   firewall-cmd --permanent --add-port=<SSH_PORT>/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport <SSH_PORT> -j ACCEPT
   firewall-cmd --reload 2>/dev/null || iptables-save
   ```

5. **Configure Whitelist IPs (if provided):**
   ```bash
   firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<IP>" port port="<PORT>" protocol="tcp" accept'
   ```
   - Adds firewall rule for each whitelisted IP

#### When SSH is Disabled (No):
```bash
systemctl stop sshd 2>/dev/null || systemctl stop ssh 2>/dev/null || true
systemctl disable sshd 2>/dev/null || systemctl disable ssh 2>/dev/null || true
firewall-cmd --permanent --remove-port=22/tcp 2>/dev/null || iptables -D INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
```

---

### Telnet Configuration

#### When Telnet is Enabled (Yes):

1. **Enable Telnet Service:**
   ```bash
   systemctl enable telnet.socket 2>/dev/null || systemctl enable xinetd
   systemctl start telnet.socket 2>/dev/null || systemctl start xinetd
   ```

2. **Open Firewall Port 23:**
   ```bash
   firewall-cmd --permanent --add-port=23/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport 23 -j ACCEPT
   firewall-cmd --reload
   ```

3. **Configure Whitelist IPs (if provided):**
   ```bash
   firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<IP>" port port="23" protocol="tcp" accept'
   ```
   - Adds firewall rule for each whitelisted IP

#### When Telnet is Disabled (No):
```bash
systemctl stop telnet.socket 2>/dev/null || systemctl stop xinetd 2>/dev/null || true
systemctl disable telnet.socket 2>/dev/null || systemctl disable xinetd 2>/dev/null || true
firewall-cmd --permanent --remove-port=23/tcp 2>/dev/null || iptables -D INPUT -p tcp --dport 23 -j ACCEPT 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
```

---

### NTP Configuration (Using Chrony)

#### When NTP is Enabled (Yes):

1. **Backup Existing Configuration:**
   ```bash
   cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak 2>/dev/null || cp /etc/chrony.conf /etc/chrony.conf.bak 2>/dev/null || true
   ```
   - Tries common paths: `/etc/chrony/chrony.conf` or `/etc/chrony.conf`

2. **Remove Old Server Entries:**
   ```bash
   sed -i '/^server /d' /etc/chrony/chrony.conf 2>/dev/null || sed -i '/^server /d' /etc/chrony.conf 2>/dev/null || true
   ```

3. **Add New NTP Server:**
   ```bash
   echo "server <NTP_SERVER_ADDRESS> iburst" >> /etc/chrony/chrony.conf
   ```
   - The `iburst` option speeds up initial synchronization

4. **Enable Chrony Service (with 5-second timeout):**
   ```bash
   timeout 5 systemctl enable chronyd 2>/dev/null || timeout 5 systemctl enable chrony 2>/dev/null || true
   ```
   - Uses `timeout 5` to prevent hanging if service is already enabled
   - Fails gracefully with `|| true` if timeout occurs

5. **Restart Chrony Service:**
   ```bash
   systemctl restart chronyd 2>/dev/null || systemctl restart chrony 2>/dev/null || true
   ```

6. **Force Immediate Synchronization:**
   ```bash
   chronyc makestep 2>/dev/null || true
   ```

7. **Set Synchronizing Cycle (Cron Job):**
   ```bash
   echo "*/<MINUTES> * * * * /usr/bin/chronyc makestep" > /etc/cron.d/chrony-sync
   chmod 644 /etc/cron.d/chrony-sync
   ```
   - The synchronizing cycle is converted from seconds to minutes
   - Example: If cycle is 3600 seconds → runs every 60 minutes
   - Chrony syncs automatically, but this forces periodic sync

#### When NTP is Disabled (No):

1. **Remove NTP Server from Config:**
   ```bash
   sed -i '/^server /d' /etc/chrony/chrony.conf 2>/dev/null || sed -i '/^server /d' /etc/chrony.conf 2>/dev/null || true
   ```
   - Removes all "server" lines from chrony config
   - This ensures detection shows "No" on next page load

2. **Stop Chrony Service:**
   ```bash
   systemctl stop chronyd 2>/dev/null || systemctl stop chrony 2>/dev/null || true
   ```

3. **Disable Chrony Service:**
   ```bash
   timeout 5 systemctl disable chronyd 2>/dev/null || timeout 5 systemctl disable chrony 2>/dev/null || true
   ```

4. **Remove Sync Cron Job:**
   ```bash
   rm -f /etc/cron.d/chrony-sync
   ```

---

### Daily Restart Configuration

#### When Daily Restart is Enabled (Yes):
1. **Create Cron Job for Daily Restart:**
   ```bash
   echo "<MINUTE> <HOUR> * * * /sbin/reboot" > /etc/cron.d/daily-restart
   chmod 644 /etc/cron.d/daily-restart
   ```
   - Example: To restart at 2:30 AM → `30 2 * * * /sbin/reboot`

#### When Daily Restart is Disabled (No):
```bash
rm -f /etc/cron.d/daily-restart
```

---

### System Time Modification

#### When "Modify" Checkbox is Checked:
1. **Set System Time:**
   ```bash
   date -s "YYYY-MM-DD HH:mm:ss"
   ```

2. **Sync Hardware Clock:**
   ```bash
   hwclock --systohc
   ```

3. **Navbar Time Update:**
   - After changing system time, the page automatically reloads
   - Navbar fetches new server time using: `date "+%Y-%m-%d %H:%M:%S"`
   - Displays server time with seconds (HH:MM:SS format)
   - Updates every second
   - Re-syncs with server every 30 seconds

---

### Time Zone Configuration

```bash
timedatectl set-timezone <TIMEZONE>
```
- Currently maps: `GMT+5:30` → `Asia/Kolkata`
- You can add more timezone mappings in the `tzMap` object

---

## How to Customize Commands

### If Your System Uses Different Commands:

1. **Open:** `src/components/Management.jsx`
2. **Find:** `executeTimeParametersCommands()` function (around line 308)
3. **Modify the commands** based on your system requirements:

#### Example Customizations:

**For ntpd instead of chrony:**
```javascript
// Replace:
commands.push(`systemctl enable chronyd 2>/dev/null || systemctl enable chrony`);
commands.push(`systemctl restart chronyd 2>/dev/null || systemctl restart chrony`);

// With:
commands.push(`systemctl enable ntpd`);
commands.push(`systemctl start ntpd`);
```

**For custom Chrony configuration path:**
```javascript
// If your system uses a different path:
commands.push(`echo "server ${form.ntpServerAddress} iburst" >> /etc/chrony.d/custom.conf`);
```

**For systemd timers instead of cron:**
```javascript
// Replace cron job with systemd timer
commands.push(`systemctl enable restart-daily.timer`);
```

---

## Testing

### To Test NTP Configuration:
1. Enable NTP in the UI
2. Enter NTP Server Address (e.g., `pool.ntp.org` or `time.google.com`)
3. Enter Synchronizing Cycle (e.g., `3600` for 1 hour)
4. Click Save
5. Check browser console for executed commands
6. Verify on system:
   ```bash
   # Check Chrony service status
   systemctl status chronyd
   
   # View Chrony configuration
   cat /etc/chrony/chrony.conf   # or /etc/chrony.conf
   
   # Check Chrony sources
   chronyc sources
   
   # Check sync status
   chronyc tracking
   
   # View cron job
   cat /etc/cron.d/chrony-sync
   ```

### To Test Daily Restart:
1. Enable Daily Restart in the UI
2. Set restart time (e.g., 2 hours, 30 minutes)
3. Click Save
4. Verify on system:
   ```bash
   cat /etc/cron.d/daily-restart
   ```

### To Test System Time Modification:
1. Check "Modify" checkbox
2. Select date and time
3. Click Save
4. Verify on system:
   ```bash
   date
   ```

---

## Error Handling

- Each command is executed sequentially
- Failed commands are logged to console
- If any command fails, you'll see an error message
- Failed commands don't stop the save process
- Settings are still saved to the database

---

## API Endpoint Used

```
POST /linuxcmd
Body: { "cmd": "<command_string>" }
```

Expected response:
```json
{
  "response": true,
  "responseData": "<command_output>"
}
```

---

## Important Notes

1. **Security:** Ensure your backend validates and sanitizes commands
2. **Permissions:** The backend service must have appropriate permissions to execute these commands
3. **System Compatibility:** Commands are Linux-specific and may need adjustment for your distribution
4. **Testing:** Test thoroughly in a development environment before production
5. **Backup:** Always backup your system before applying time/restart configurations

---

## Troubleshooting

### systemctl enable/disable Commands Timeout

**Problem:** Commands like `systemctl enable chronyd` timeout (10000ms exceeded)

**Causes:**
- Service is already enabled/disabled
- systemd is waiting for dependency locks
- System is slow to respond

**Solution (Already Implemented):**
```javascript
timeout 5 systemctl enable chronyd 2>/dev/null || timeout 5 systemctl enable chrony 2>/dev/null || true
```
- Uses `timeout 5` to limit command to 5 seconds
- Uses `|| true` failsafe to continue even if timeout occurs
- Commands with `|| true` won't be marked as failures

**Manual Check:**
```bash
# Check if chronyd is already enabled
systemctl is-enabled chronyd

# Check if chronyd is running
systemctl status chronyd

# If stuck, you can force it
systemctl daemon-reexec
systemctl reset-failed
```

### Command Not Found
- Check if Chrony is installed: `which chronyd` or `which chronyc`
- Install if missing: `yum install chrony` (RHEL/CentOS) or `apt install chrony` (Debian/Ubuntu)
- Verify the correct binary path (e.g., `/sbin/reboot` vs `/usr/sbin/reboot`)

### Permission Denied
- Ensure the backend service runs with sufficient privileges (root or sudo)
- Check file permissions for cron directories: `ls -la /etc/cron.d/`
- Check SELinux if enabled: `getenforce` and `ausearch -m avc -ts recent`

### Commands Not Taking Effect
- Check system logs: `journalctl -xe`
- Check Chrony logs: `journalctl -u chronyd`
- Verify cron service is running: `systemctl status cron` or `systemctl status crond`
- Check for syntax errors in generated commands (browser console)
- Verify Chrony is reaching the NTP server: `chronyc sources -v`

---

## Contact Your Backend Team

You may need to coordinate with your backend team on:
1. **NTP Service:** Currently configured for **Chrony** (chronyd)
   - If using ntpd or timesyncd, commands need to be adjusted
2. **Configuration Paths:** 
   - Chrony config: `/etc/chrony/chrony.conf` or `/etc/chrony.conf`
3. **Permissions:** Commands need sudo/root privileges
4. **Custom Scripts:** Any existing automation for time sync
5. **Task Scheduling:** Currently uses cron; can be changed to systemd timers if preferred
6. **Chrony Options:** Verify if additional chrony.conf settings are needed (e.g., `allow`, `bindaddress`)

