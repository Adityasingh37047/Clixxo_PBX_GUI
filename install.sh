#!/bin/sh

set -e  # Exit on any error
set -u  # Treat unset variables as errors
set -x  # start debug

echo "============== IP Details ======================"
ip -o -4 addr show | awk '/^[0-9]+: e/ {print $2, $4}' | cut -d/ -f1

echo "============== ROUTE Details ======================"
route -a

if ping -c 1 -W 2 google.com > /dev/null; then
    echo "Internet and DNS are working"
else
    echo "Internet or DNS is NOT working"
	exit 1
fi

sudo apt install psmisc

echo "============== Firmware Update Started ======================"
sudo apt update && sudo apt -y upgrade
echo "============== Firmware Update Completed ===================="
sleep 2

echo "============== OS Utility Installation Started =============="
sudo apt install -y pciutils cron ntp curl

# Ensure cron is enabled and running
sudo systemctl enable cron
sudo systemctl start cron

# Set timezone
sudo timedatectl set-timezone Asia/Kolkata

# Configure NTP servers
sudo bash -c 'cat > /etc/ntp.conf <<EOF
server 0.ubuntu.pool.ntp.org iburst
server 1.ubuntu.pool.ntp.org iburst
server 2.ubuntu.pool.ntp.org iburst
EOF'

sudo systemctl restart ntp

# Set hostname
echo "clixxo" | sudo tee /etc/hostname
sudo hostnamectl set-hostname clixxo

echo "127.0.0.1 localhost" > /etc/hosts
echo "127.0.0.1 clixxo" >> /etc/hosts



echo "============== OS Utility Installation Completed ============"
sleep 2

echo "============== Node.js Installation Started ================="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "============== Node.js Installation Completed ==============="
sleep 2

#echo "============== License   ==============="
#cp main /root/
#chmod 777 /root/main
#echo "============== License Set  ==============="


echo "============== Database Installation Started ================"
sudo apt install -y mysql-server
sudo apt install -y unixodbc unixodbc-dev libmariadb-dev-compat libmariadb-dev

# Enable MySQL to start on boot
sudo systemctl enable mysql
sudo systemctl start mysql

# Ensure required directories exist
sudo mkdir -p /usr/lib/aarch64-linux-gnu/odbc
sudo mkdir -p /usr/lib/asterisk/modules

# Copy ODBC files (assuming you're in the correct base directory)
sudo cp odbc/* /usr/lib/asterisk/modules/
sudo cp conf/odbc* /etc/
sudo cp odbc_lib/* /usr/lib/aarch64-linux-gnu/odbc/

# Restart Asterisk
sudo asterisk -rx "core restart now"

FILE="/etc/mysql/mysql.conf.d/mysqld.cnf"

# Replace the line starting with 'bind-address' to 'bind-address = 0.0.0.0'
sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' "$FILE"

# Create databases
sudo mysql -e "CREATE DATABASE IF NOT EXISTS astdb;"

# Import SQL files
sudo mysql astdb < DB/astdb.sql

#mysql -e "CREATE USER 'clixxo'@'%' IDENTIFIED BY 's@mp@rk@123'"
#mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'clixxo'@'%' WITH GRANT OPTION"
#mysql -e "FLUSH PRIVILEGES"

sudo systemctl restart mysql

echo "============== Database Installation Completed =============="
sleep 2

echo "============== UI Installation Started ======================"
sudo cp -r clixxo /home/
sudo chmod -R 777 /home/clixxo
echo "============== UI Installation Completed ===================="
sleep 2
openssl req -x509 -nodes -newkey rsa:2048 -keyout clixxokey.pem -out clixxo.pem -days 3650 -subj "/C=IN/ST=Uttar Pradesh/L=Noida/O=Clixxo Broadband Pvt. Ltd./OU=CLIXXO/CN=CLIXXO"

echo "============== Asterisk Config Copy and Restart ============="
cd asterisk/
sudo cp pjsip.conf extensions.conf  extensions_clixxo.conf asterisk.conf res_odbc.conf sorcery.conf func_odbc.conf extconfig.conf /etc/asterisk/
sudo asterisk -rx "core restart now"
echo "============== Asterisk Config Applied ======================="

systemctl stop ksnm.service
systemctl disable ksnm.service

mv /opt/go-admin/ /opt/go-admin_1/

mv /lib/systemd/system/ksnm.service /home/clixxo/

echo "============== Run WebServer ============="
cp /home/clixxo/scripts/node-server.service /etc/systemd/system/
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable node-server.service

sudo systemctl enable kswitch.service

echo "============== Enable SoftEther VPN Service ============="

sudo systemctl enable softethervpn


echo "============== SNMP Installation and Configuration Started ============="

# Install SNMP packages
echo "Installing SNMP packages..."
sudo apt install -y snmpd snmp libsnmp-dev snmptrapd

# Stop services before configuration
sudo systemctl stop snmpd 2>/dev/null || true
sudo systemctl stop snmptrapd 2>/dev/null || true

# Create log files
sudo touch /tmp/snmp_remote_ops.log
sudo chmod 666 /tmp/snmp_remote_ops.log
sudo touch /var/log/snmp_trap_monitor.log
sudo chmod 644 /var/log/snmp_trap_monitor.log

# Copy SNMP scripts to /usr/local/bin
echo "Copying SNMP scripts..."
cd ..
sudo cp clixxo-alarm-monitor.sh /usr/local/bin/
sudo cp clixxo-device-info.sh /usr/local/bin/
sudo cp snmp_remote_management.sh /usr/local/bin/

# Copy run_update_as_root.sh if it exists (optional helper script)
if [ -f "run_update_as_root.sh" ]; then
    sudo cp run_update_as_root.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/run_update_as_root.sh
    echo "✓ run_update_as_root.sh installed"
fi

# Make scripts executable
sudo chmod +x /usr/local/bin/clixxo-alarm-monitor.sh
sudo chmod +x /usr/local/bin/clixxo-device-info.sh
sudo chmod +x /usr/local/bin/snmp_remote_management.sh

# Copy SNMP configuration files
echo "Copying SNMP configuration files..."
sudo cp snmpd.conf /etc/snmp/snmpd.conf
sudo cp snmptrapd.conf /etc/snmp/snmptrapd.conf

# Set proper permissions for config files
sudo chmod 600 /etc/snmp/snmpd.conf
sudo chmod 600 /etc/snmp/snmptrapd.conf

# Configure sudo permissions for Debian-snmp user and ds-hx1x
echo "Configuring sudo permissions for SNMP operations..."
sudo mkdir -p /etc/sudoers.d

echo "Writing /etc/sudoers with CLIXXO SNMP entries (overwriting existing file)..."
sudo cp /etc/sudoers /etc/sudoers.bak.$(date +%s) 2>/dev/null || true
cat << 'EOF' | sudo tee /etc/sudoers >/dev/null
#
# This file MUST be edited with the 'visudo' command as root.
#
# Please consider adding local content in /etc/sudoers.d/ instead of
# directly modifying this file.
#
# See the man page for details on how to write a sudoers file.
#
Defaults	env_reset
Defaults	mail_badpass
Defaults	secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
Defaults	use_pty

# This preserves proxy settings from user environments of root
# equivalent users (group sudo)
#Defaults:%sudo env_keep += "http_proxy https_proxy ftp_proxy all_proxy no_proxy"

# This allows running arbitrary commands, but so does ALL, and it means
# different sudoers have their choice of editor respected.
#Defaults:%sudo env_keep += "EDITOR"

# Completely harmless preservation of a user preference.
#Defaults:%sudo env_keep += "GREP_COLOR"

# While you shouldn't normally run git as root, you need to with etckeeper
#Defaults:%sudo env_keep += "GIT_AUTHOR_* GIT_COMMITTER_*"

# Per-user preferences; root won't have sensible values for them.
#Defaults:%sudo env_keep += "EMAIL DEBEMAIL DEBFULLNAME"

# "sudo scp" or "sudo rsync" should be able to use your SSH agent.
#Defaults:%sudo env_keep += "SSH_AGENT_PID SSH_AUTH_SOCK"

# Ditto for GPG agent
#Defaults:%sudo env_keep += "GPG_AGENT_INFO"

# Host alias specification

# User alias specification

# Cmnd alias specification

# User privilege specification
root	ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo	ALL=(ALL:ALL) ALL

# See sudoers(5) for more information on "@include" directives:

@includedir /etc/sudoers.d


ds-hx1x ALL=(ALL) ALL

Debian-snmp ALL=(ALL) NOPASSWD: /usr/sbin/asterisk

# Allow SNMP user to copy config files and reload Asterisk
Debian-snmp ALL=(ALL) NOPASSWD: /bin/cp, /usr/bin/chown, /bin/chmod


# Allow snmpd user to reboot system
Debian-snmp ALL=(ALL) NOPASSWD: /sbin/reboot

Debian-snmp ALL=(ALL) NOPASSWD: /usr/local/bin/run_update_as_root.sh

Debian-snmp ALL=(ALL) NOPASSWD: /usr/bin/bash /tmp/Uclixxo/update.sh, /usr/bin/bash /tmp/*/update.sh

Defaults:Debian-snmp !requiretty

EOF
sudo chmod 440 /etc/sudoers

# Verify sudoers syntax
echo "Verifying sudoers file syntax..."
if sudo visudo -c >/dev/null 2>&1; then
    echo "✓ Sudoers file is valid"
else
    echo "⚠ WARNING: Sudoers file may have syntax errors - please check manually"
fi

# Create snmptrapd systemd service file if it doesn't exist
if [ ! -f /lib/systemd/system/snmptrapd.service ]; then
    echo "Creating snmptrapd service file..."
    sudo bash -c 'cat > /lib/systemd/system/snmptrapd.service << EOF
[Unit]
Description=Simple Network Management Protocol (SNMP) Trap Daemon.
After=network.target
ConditionPathExists=/etc/snmp/snmptrapd.conf

[Service]
Type=simple
ExecStartPre=/bin/mkdir -p /var/run/agentx
ExecStart=/usr/sbin/snmptrapd -Lsd -f
ExecReload=/bin/kill -HUP \$MAINPID

[Install]
WantedBy=multi-user.target
EOF'
fi

# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable and start SNMP services
echo "Enabling and starting SNMP services..."
sudo systemctl enable snmpd
sudo systemctl start snmpd
sudo systemctl enable snmptrapd
sudo systemctl start snmptrapd

# Wait for services to start
sleep 3

# Verify SNMP services are running
if sudo systemctl is-active --quiet snmpd; then
    echo "✓ snmpd service is running"
else
    echo "✗ snmpd service failed to start"
fi

if sudo systemctl is-active --quiet snmptrapd; then
    echo "✓ snmptrapd service is running"
else
    echo "✗ snmptrapd service failed to start"
fi

# Add cron jobs for alarm monitoring (runs every 30 seconds)
echo "Configuring cron jobs for SNMP monitoring..."
(sudo crontab -l 2>/dev/null || true; echo "# SNMP Alarm Monitoring - runs every 30 seconds") | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/clixxo-alarm-monitor.sh") | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "* * * * * sleep 30; /usr/local/bin/clixxo-alarm-monitor.sh") | sudo crontab -

# Verify cron jobs were added
echo "Verifying cron jobs..."
sudo crontab -l | grep clixxo-alarm-monitor

# Test SNMP is responding
echo "Testing SNMP connectivity..."
if snmpget -v2c -c public localhost SNMPv2-MIB::sysDescr.0 >/dev/null 2>&1; then
    echo "✓ SNMP is responding correctly"
else
    echo "✗ SNMP test failed - may need manual configuration"
fi

echo "============== SNMP Installation and Configuration Completed ============="
sleep 2
echo "================: Root Password Change :================="


# Prompt securely for the new password (hidden input)
passwd

killall go-admin


set +x  # stop debug
