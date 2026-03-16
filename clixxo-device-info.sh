#!/bin/bash
# pass_persist SNMP script for device info + PRI alarm + CPU + Memory + SIP status + ETH + Neighbors

JSON_FILE="/home/clixxo/server/config/web_version.json"

BASE_OID="1.3.6.1.4.1.39871.1.1"

# SIP / PRI
SIP_REG_STATUS_OID="1.3.6.1.4.1.39871.1.3.1.1.4"
PRI_STATUS_OID="1.3.6.1.4.1.39871.1.2.1.1.3.0"
PRI_ALARM_TEXT_OID="1.3.6.1.4.1.39871.6.3.0"

# CPU
CPU_USAGE_OID="1.3.6.1.4.1.39871.1.6.1.0"
CPU_ALARM_CODE_OID="1.3.6.1.4.1.39871.6.1.0"
CPU_ALARM_TEXT_OID="1.3.6.1.4.1.39871.6.2.0"

# MEMORY
MEM_TOTAL_OID="1.3.6.1.4.1.39871.1.6.2.0"
MEM_USED_OID="1.3.6.1.4.1.39871.1.6.3.0"

# ETH STATUS WITH TIME
ETH0_STATUS_OID="1.3.6.1.4.1.39871.2.1.1.9.1"
ETH1_STATUS_OID="1.3.6.1.4.1.39871.2.1.1.9.2"

# CHANNELS
TOTAL_CHANNELS_OID="1.3.6.1.4.1.39871.1.2.1.1.6.0"
ACTIVE_CALLS_APP_OID="1.3.6.1.4.1.39871.1.2.1.1.7.0"

# DEVICE UPTIME
DEVICE_UPTIME_TEXT_OID="1.3.6.1.4.1.39871.1.1.7.0"

# ETH MAC ADDRESS
ETH0_MAC_OID="1.3.6.1.4.1.39871.2.1.1.2"
ETH1_MAC_OID="1.3.6.1.4.1.39871.2.1.1.2.2"

# SIP DOMAIN
SIP_DOMAIN_OID="1.3.6.1.4.1.39871.1.3.1.1.2"

# SIP PORT (UDP)
SIP_PORT_OID="1.3.6.1.4.1.39871.1.3.1.1.3"

# SIP CLIENT IP (from IDENTIFY)
SIP_CLIENT_IP_OID="1.3.6.1.4.1.39871.2.1.1.3"

# STANDARD IP-MIB ARP TABLE OIDs
# 1.3.6.1.2.1.3.1.1.2 = ipNetToMediaPhysAddress (MAC address)
# Format: 1.3.6.1.2.1.3.1.1.2.IFINDEX.IPADDR
IP_NET_TO_MEDIA_PHYS_ADDR_BASE="1.3.6.1.2.1.3.1.1.2"

################################
# Device Model (uname -a)
################################
get_device_model() {
    uname -a 2>/dev/null || echo "Device model not available"
}

################################
# U-Boot version reader
################################
get_uboot_version() {
    uboot=$(cat /etc/uboot_version.txt)
    
    if [ -z "$uboot" ]; then
        echo "U-Boot version not found"
    else
        echo "$uboot"
    fi
}

################################
# JSON reader
################################
read_json_value() {
    local key="$1"
    
    # Special handling for uboot - read from mmcblk0 instead of JSON
    if [ "$key" = "uboot" ]; then
        get_uboot_version
        return
    fi
    
    [ ! -f "$JSON_FILE" ] && echo "" && return

    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import json; print(json.load(open('$JSON_FILE')).get('$key',''))" 2>/dev/null
    else
        grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$JSON_FILE" 2>/dev/null \
        | sed -n "s/.*\"\([^\"]*\)\"$/\1/p"
    fi
}

################################
# Output formatter
################################
format_cmd_output() {
    echo "$1" | tr '\n' ';' | sed 's/[[:space:]]\+/ /g; s/; */; /g'
}

################################
# ETH helpers
################################
get_eth_state() {
    ip link show "$1" 2>/dev/null | grep -q "LOWER_UP" && echo "UP" || echo "DOWN"
}

get_eth_status_with_time() {
    iface="$1"
    state=$(get_eth_state "$iface")
    sf="/tmp/${iface}_state"
    tf="/tmp/${iface}_time"
    now=$(date +%s)

    if [ ! -f "$sf" ]; then
        echo "$state" > "$sf"
        echo "$now" > "$tf"
        echo "${state}/0s"
        return
    fi

    old_state=$(cat "$sf")
    old_time=$(cat "$tf")

    if [ "$state" != "$old_state" ]; then
        echo "$state" > "$sf"
        echo "$now" > "$tf"
        echo "${state}/0s"
    else
        echo "${state}/$((now - old_time))s"
    fi
}

################################
# ETH MAC address
################################
get_eth_mac() {
    iface="$1"
    cat /sys/class/net/$iface/address 2>/dev/null || echo "N/A"
}

################################
# Device uptime (human readable)
################################
get_device_uptime_text() {
    seconds=$(awk '{print int($1)}' /proc/uptime 2>/dev/null)

    days=$((seconds / 86400))
    hours=$(((seconds % 86400) / 3600))
    minutes=$(((seconds % 3600) / 60))
    secs=$((seconds % 60))

    output=""
    [ "$days" -gt 0 ] && output="${days} day(s) "
    [ "$hours" -gt 0 ] && output="${output}${hours} hour(s) "
    [ "$minutes" -gt 0 ] && output="${output}${minutes} minute(s) "
    output="${output}${secs} second(s)"

    echo "$output"
}

################################
# SIP registration status
################################
get_sip_reg_status_simple() {
    command -v asterisk >/dev/null 2>&1 || {
        echo "Asterisk not available"
        return
    }

    output=$(sudo asterisk -rx "pjsip show registrations" 2>/dev/null \
        | grep -E "(Registered|Unregistered|Rejected|No Response|Timeout)" \
        | sed 's/^[[:space:]]*//' \
        | head -20)

    [ -z "$output" ] && echo "No SIP registrations" || format_cmd_output "$output"
}

################################
# SIP domain name
################################
get_sip_domain_name() {
    command -v asterisk >/dev/null 2>&1 || {
        echo "Asterisk not available"
        return
    }

    domain=$(sudo asterisk -rx "pjsip show registrations" 2>/dev/null \
        | awk -F'sip:' '/sip:/ {print $2}' \
        | awk '{print $1}' \
        | head -1)

    [ -z "$domain" ] && echo "No SIP domain" || echo "$domain"
}

################################
# SIP UDP Port
################################
get_sip_udp_port() {
    command -v asterisk >/dev/null 2>&1 || {
        echo "Asterisk not available"
        return
    }

    port=$(sudo asterisk -rx "pjsip show transports" 2>/dev/null \
        | awk '$3=="udp" {split($NF,a,":"); print a[2]; exit}')

    [ -z "$port" ] && echo "No SIP UDP port" || echo "$port"
}

################################
# SIP client IP (Our device IP used for registration) - ROUTE BASED (BEST)
################################
get_sip_client_ip() {
    command -v asterisk >/dev/null 2>&1 || {
        echo "Asterisk not available"
        return
    }

    # 1) Get SIP Server from registrations
    # Example line: myreg/sip:10.191.15.200:5060   Registered
    server=$(sudo asterisk -rx "pjsip show registrations" 2>/dev/null \
        | awk -F'sip:' '/sip:/{print $2}' \
        | awk '{print $1}' \
        | sed 's/[]()<>",]//g' \
        | cut -d':' -f1 \
        | head -n 1)

    # if it is domain, resolve to IP
    if [ -n "$server" ] && echo "$server" | grep -q '[A-Za-z]'; then
        server_ip=$(getent ahosts "$server" 2>/dev/null | awk '{print $1; exit}')
    else
        server_ip="$server"
    fi

    [ -z "$server_ip" ] && {
        echo "No SIP server IP"
        return
    }

    # 2) Find local source IP used to reach SIP server
    srcip=$(ip route get "$server_ip" 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -n 1)

    [ -z "$srcip" ] && echo "No SIP client IP" || echo "$srcip"
}

################################
# PRI status
################################
get_pri_status() {
    command -v asterisk >/dev/null 2>&1 || {
        echo "Asterisk not available"
        return
    }

    output=$(sudo asterisk -rx "pri show spans" 2>/dev/null | head -50)
    [ -z "$output" ] && echo "No PRI status" || format_cmd_output "$output"
}

################################
# PRI alarm text
################################
get_pri_alarm_text() {
    alarm=$(dahdi show status 2>/dev/null | awk '$1==1 {print $4}')

    case "$alarm" in
        OK|"") echo "OK/0" ;;
        LOS) echo "LOS/1" ;;
        AIS|BLUE) echo "AIS/3" ;;
        YELLOW) echo "YELLOW/4" ;;
        RED) echo "RED/5" ;;
        UNCONFI) echo "UNCONFIGURED/-1" ;;
        *) echo "UNKNOWN/9" ;;
    esac
}

################################
# CPU usage
################################
get_cpu_usage_value() {
    top -bn1 | awk -F',' '/Cpu/ {print int(100-$4)}'
}

get_cpu_usage() {
    cpu=$(get_cpu_usage_value)
    echo "${cpu}%"
}

################################
# Channels / Calls
################################
get_total_pri_channels() {
   sudo asterisk -rx "dahdi show channels" 2>/dev/null \
    | grep -E '^[[:space:]]*[0-9]+' \
    | wc -l
}

get_active_calls_with_app() {
    output=$(sudo asterisk -rx "core show channels" 2>/dev/null)

    calls=$(echo "$output" | awk '/active call/ {print $1}')

    app=$(echo "$output" \
        | awk '/^[A-Z0-9]+\/|^PJSIP\// {print $(NF-0)}' \
        | head -1)

    [ -z "$calls" ] && calls=0
    [ -z "$app" ] && app="None"

    echo "${calls} | ${app}"
}

################################
# CPU alarm
################################
get_cpu_alarm_code() {
    cpu=$(get_cpu_usage_value)

    if [ "$cpu" -lt 70 ]; then
        echo 0
    elif [ "$cpu" -lt 85 ]; then
        echo 1
    elif [ "$cpu" -lt 95 ]; then
        echo 2
    else
        echo 3
    fi
}

get_cpu_alarm_text() {
    cpu=$(get_cpu_usage_value)

    if [ "$cpu" -lt 70 ]; then
        echo "OK/${cpu}%"
    elif [ "$cpu" -lt 85 ]; then
        echo "WARNING/${cpu}%"
    elif [ "$cpu" -lt 95 ]; then
        echo "MAJOR/${cpu}%"
    else
        echo "CRITICAL/${cpu}%"
    fi
}

################################
# Memory
################################
get_mem_total() {
    total=$(free -m | awk '/^Mem:/ {print $2}')
    echo "${total}MB"
}

get_mem_used() {
    used=$(free -m | awk '/^Mem:/ {print $2-$7}')
    echo "${used}MB"
}

################################
# STANDARD IP-MIB ARP TABLE (1.3.6.1.2.1.3.1.1.2)
################################

# Get interface index from interface name
get_ifindex() {
    local ifname="$1"
    cat /sys/class/net/"$ifname"/ifindex 2>/dev/null || echo "0"
}

# Get interface name from interface index
get_ifname() {
    local ifindex="$1"
    for iface in /sys/class/net/*; do
        idx=$(cat "$iface/ifindex" 2>/dev/null)
        if [ "$idx" = "$ifindex" ]; then
            basename "$iface"
            return
        fi
    done
    echo ""
}

# Convert MAC address to SNMP hex format (required for ipNetToMediaPhysAddress)
mac_to_hex() {
    local mac="$1"
    if [ -z "$mac" ] || [ "$mac" = "N/A" ]; then
        echo ""
        return
    fi
    # Convert XX:XX:XX:XX:XX:XX to hex string with spaces (SNMP Hex-STRING format)
    # Example: C8:4F:86:C4:3E:A5 -> C8 4F 86 C4 3E A5
    echo "$mac" | tr ':' ' ' | tr '[:lower:]' '[:upper:]'
}

# Get MAC address for IP address and interface - SIMPLE VERSION
get_ip_net_to_media_phys_addr() {
    local ifindex="$1"
    local ipaddr="$2"
    
    # Get interface name from index
    local ifname=$(get_ifname "$ifindex")
    [ -z "$ifname" ] && return 1
    
    # Search all entries and find matching IP and interface
    # Format: IP dev INTERFACE lladdr MAC STATE
    local line=$(ip neigh show 2>/dev/null | grep -E "^${ipaddr} " | grep " dev ${ifname} " | head -1)
    
    # If not found with exact interface match, try without interface restriction
    [ -z "$line" ] && line=$(ip neigh show 2>/dev/null | grep -E "^${ipaddr} " | head -1)
    
    [ -z "$line" ] && return 1
    
    # Extract MAC address - look for lladdr keyword first
    local mac_addr=$(echo "$line" | awk '/lladdr/ {for(i=1;i<=NF;i++) if($i=="lladdr") print $(i+1)}')
    
    # If not found, try pattern matching
    [ -z "$mac_addr" ] && mac_addr=$(echo "$line" | grep -oE '([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}' | head -1)
    
    [ -z "$mac_addr" ] && return 1
    
    # Convert to hex format with spaces (SNMP Hex-STRING format)
    mac_to_hex "$mac_addr"
}

# Parse standard IP-MIB OID: 1.3.6.1.2.1.3.1.1.2.IFINDEX.NETADDRTYPE.IPADDR
parse_ip_net_to_media_oid() {
    local oid="$1"
    local base="${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}"
    
    # Remove base OID to get IFINDEX.NETADDRTYPE.IPADDR
    local suffix="${oid#$base.}"
    
    # Check if it matches the pattern (IFINDEX.NETADDRTYPE.IP.IP.IP.IP)
    if [[ ! "$suffix" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        return 1
    fi
    
    # Extract IFINDEX (first number), NETADDRTYPE (second number), and IPADDR (remaining)
    local ifindex=$(echo "$suffix" | cut -d'.' -f1)
    local netaddrtype=$(echo "$suffix" | cut -d'.' -f2)
    local ipaddr=$(echo "$suffix" | cut -d'.' -f3- | tr '.' ' ')
    
    # Convert IP address parts to dotted decimal
    local ip_parts=($ipaddr)
    local ip_dotted="${ip_parts[0]}.${ip_parts[1]}.${ip_parts[2]}.${ip_parts[3]}"
    
    echo "$ifindex|$ip_dotted"
}

# Get all ARP entries for GETNEXT iteration - SIMPLE VERSION
get_all_arp_entries() {
    # Just run ip neigh show and format each entry as IFINDEX.NETADDRTYPE.IPADDR
    # NETADDRTYPE = 1 for IPv4. Sort for deterministic GETNEXT walk.
    ip neigh show 2>/dev/null | grep -E "^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | while IFS= read -r line; do
        ip_addr=$(echo "$line" | awk '{print $1}')
        interface=$(echo "$line" | awk '{print $3}')
        
        # Skip if no interface or no MAC (FAILED entries)
        [ -z "$interface" ] && continue
        echo "$line" | grep -q "lladdr" || continue
        
        # Get interface index
        ifindex=$(get_ifindex "$interface")
        [ "$ifindex" = "0" ] && continue
        
        # Format: IFINDEX.1.IPADDR (1 = IPv4 address type)
        ip_parts=($(echo "$ip_addr" | tr '.' ' '))
        echo "${ifindex}.1.${ip_parts[0]}.${ip_parts[1]}.${ip_parts[2]}.${ip_parts[3]}"
    done | sort -t. -k1,1n -k2,2n -k3,3n -k4,4n -k5,5n -k6,6n -k7,7n -k8,8n
}

# Get next ARP entry OID for GETNEXT - SIMPLE VERSION
get_next_arp_entry_oid() {
    local current_oid="$1"
    local base="${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}"
    
    # If requesting base OID, return first entry
    if [ "$current_oid" = "$base" ] || [ "$current_oid" = "$base.0" ]; then
        local first_entry=$(get_all_arp_entries | head -n 1)
        [ -n "$first_entry" ] && echo ".${base}.${first_entry}" && return 0
        return 1
    fi
    
    # Find current entry and return next one
    local found=0
    while IFS= read -r entry; do
        [ -z "$entry" ] && continue
        
        if [ "$found" -eq 1 ]; then
            echo ".${base}.${entry}"
            return 0
        fi
        
        # Check if this is the current entry
        [ "${base}.${entry}" = "$current_oid" ] && found=1
    done < <(get_all_arp_entries)
    
    return 1
}

################################
# GET handler
################################
get_oid_value() {
    oid=$(echo "$1" | sed 's/^\.//')

    case "$oid" in
        ${BASE_OID}.1.0) get_device_model ;;
        ${BASE_OID}.2.0) read_json_value "serial_no" ;;
        ${BASE_OID}.3.0) read_json_value "web_version" ;;
        ${BASE_OID}.4.1) read_json_value "service" ;;
        ${BASE_OID}.4.0) read_json_value "uboot" ;;
        ${BASE_OID}.5.0) read_json_value "kernel" ;;
        ${BASE_OID}.6.1) read_json_value "firmware" ;;
	${DEVICE_UPTIME_TEXT_OID}) get_device_uptime_text ;;
        ${SIP_REG_STATUS_OID}) get_sip_reg_status_simple ;;
        ${PRI_STATUS_OID}) get_pri_status ;;
        ${TOTAL_CHANNELS_OID}) get_total_pri_channels ;;
        ${ACTIVE_CALLS_APP_OID}) get_active_calls_with_app ;;
        ${CPU_USAGE_OID}) get_cpu_usage ;;
        ${CPU_ALARM_CODE_OID}) get_cpu_alarm_code ;;
        ${CPU_ALARM_TEXT_OID}) get_cpu_alarm_text ;;
        ${MEM_TOTAL_OID}) get_mem_total ;;
        ${MEM_USED_OID}) get_mem_used ;;
        ${PRI_ALARM_TEXT_OID}) get_pri_alarm_text ;;
        ${ETH0_STATUS_OID}) get_eth_status_with_time eth0 ;;
        ${ETH1_STATUS_OID}) get_eth_status_with_time eth1 ;;
        ${ETH0_MAC_OID}) get_eth_mac eth0 ;;
	${ETH1_MAC_OID}) get_eth_mac eth1 ;;
	${SIP_DOMAIN_OID}) get_sip_domain_name ;;
	${SIP_PORT_OID}) get_sip_udp_port ;;
	${SIP_CLIENT_IP_OID}) get_sip_client_ip ;;
        *) 
            # Check if it's standard IP-MIB ARP table OID
            if [ "$oid" = "${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}" ] || [ "$oid" = "${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}.0" ]; then
                # Base OID - return first entry via GETNEXT
                return 1  # GET on base OID should use GETNEXT
            elif [[ "$oid" =~ ^${IP_NET_TO_MEDIA_PHYS_ADDR_BASE//./\\.}\. ]]; then
                # It's a sub-OID with IFINDEX.NETADDRTYPE.IPADDR
                parsed=$(parse_ip_net_to_media_oid "$oid")
                if [ -n "$parsed" ]; then
                    ifindex=$(echo "$parsed" | cut -d'|' -f1)
                    ipaddr=$(echo "$parsed" | cut -d'|' -f2)
                    get_ip_net_to_media_phys_addr "$ifindex" "$ipaddr"
                else
                    return 1
                fi
            else
                return 1
            fi
            ;;
    esac
}

################################
# GETNEXT handler
################################
get_next_oid() {
    oid=$(echo "$1" | sed 's/^\.//')

    case "$oid" in
        ${BASE_OID}|${BASE_OID}.0) echo ".${BASE_OID}.1.0" ;;
        ${BASE_OID}.1.0) echo ".${BASE_OID}.2.0" ;;
        ${BASE_OID}.2.0) echo ".${BASE_OID}.3.0" ;;
        ${BASE_OID}.3.0) echo ".${BASE_OID}.4.0" ;;
        ${BASE_OID}.4.0) echo ".${BASE_OID}.5.0" ;;
        ${BASE_OID}.5.0) echo ".${BASE_OID}.6.0" ;;
        ${BASE_OID}.6.0) echo ".${BASE_OID}.6.1" ;;
        ${BASE_OID}.6.1) echo ".${DEVICE_UPTIME_TEXT_OID}" ;;
	${DEVICE_UPTIME_TEXT_OID}) echo ".${SIP_REG_STATUS_OID}" ;;
        ${SIP_REG_STATUS_OID}) echo ".${SIP_DOMAIN_OID}" ;;
	${SIP_DOMAIN_OID}) echo ".${SIP_PORT_OID}" ;;
	${SIP_PORT_OID}) echo ".${SIP_CLIENT_IP_OID}" ;;
	${SIP_CLIENT_IP_OID}) echo ".${PRI_STATUS_OID}" ;;
        ${PRI_STATUS_OID}) echo ".${TOTAL_CHANNELS_OID}" ;;
        ${TOTAL_CHANNELS_OID}) echo ".${ACTIVE_CALLS_APP_OID}" ;;
        ${ACTIVE_CALLS_APP_OID}) echo ".${CPU_USAGE_OID}" ;;
        ${CPU_USAGE_OID}) echo ".${CPU_ALARM_CODE_OID}" ;;
        ${CPU_ALARM_CODE_OID}) echo ".${CPU_ALARM_TEXT_OID}" ;;
        ${CPU_ALARM_TEXT_OID}) echo ".${MEM_TOTAL_OID}" ;;
        ${MEM_TOTAL_OID}) echo ".${MEM_USED_OID}" ;;
        ${MEM_USED_OID}) echo ".${PRI_ALARM_TEXT_OID}" ;;
        ${PRI_ALARM_TEXT_OID}) echo ".${ETH0_STATUS_OID}" ;;
        ${ETH0_STATUS_OID}) echo ".${ETH1_STATUS_OID}" ;;
	${ETH1_STATUS_OID}) echo ".${ETH0_MAC_OID}";;
	${ETH0_MAC_OID}) echo ".${ETH1_MAC_OID}";;
	${ETH1_MAC_OID}) 
            # After custom OIDs, go to standard IP-MIB ARP table
            next_arp=$(get_next_arp_entry_oid "${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}")
            [ -n "$next_arp" ] && echo "$next_arp" || return 1
            ;;
        *)
            # Check if it's standard IP-MIB ARP table OID
            if [[ "$oid" =~ ^${IP_NET_TO_MEDIA_PHYS_ADDR_BASE//./\\.} ]]; then
                # It's the base OID or a sub-OID
                next_arp=$(get_next_arp_entry_oid "$oid")
                [ -n "$next_arp" ] && echo "$next_arp" || return 1
            elif [[ "$oid" == "1.3.6.1.2.1.3.1.1" ]] || \
                 [[ "$oid" == "1.3.6.1.2.1.3.1.1.1" ]] || \
                 [[ "$oid" == "1.3.6.1.2.1.3.1" ]] || \
                 [[ "$oid" == "1.3.6.1.2.1.3" ]] || \
                 [[ "$oid" == "1.3.6.1.2.1" ]] || \
                 [[ "$oid" == "1.3.6.1.2" ]] || \
                 [[ "$oid" == "1.3.6.1" ]] || \
                 [[ "$oid" == "1.3.6" ]] || \
                 [[ "$oid" == "1.3" ]] || \
                 [[ "$oid" == "1" ]]; then
                # Request is before the base OID, return first entry
                next_arp=$(get_next_arp_entry_oid "${IP_NET_TO_MEDIA_PHYS_ADDR_BASE}")
                [ -n "$next_arp" ] && echo "$next_arp" || return 1
            else
                return 1
            fi
            ;;
    esac
}

################################
# pass_persist main loop
################################
while true; do
    read -r cmd || exit 0

    [ "$cmd" = "PING" ] && echo "PONG" && continue

    if [ "$cmd" = "get" ] || [ "$cmd" = "getnext" ]; then
        read -r oid || { echo "NONE"; continue; }

        if [ "$cmd" = "get" ]; then
            value=$(get_oid_value "$oid") || { echo "NONE"; continue; }
            echo "$oid"

            if [ "$(echo "$oid" | sed 's/^\.//')" = "$CPU_ALARM_CODE_OID" ] || \
               [ "$(echo "$oid" | sed 's/^\.//')" = "$TOTAL_CHANNELS_OID" ]; then
                echo "integer"
            else
                echo "string"
            fi

            echo "$value"
        else
            next_oid=$(get_next_oid "$oid") || { echo "NONE"; continue; }
            value=$(get_oid_value "$next_oid") || { echo "NONE"; continue; }
            echo "$next_oid"

            if [ "$(echo "$next_oid" | sed 's/^\.//')" = "$CPU_ALARM_CODE_OID" ] || \
               [ "$(echo "$next_oid" | sed 's/^\.//')" = "$TOTAL_CHANNELS_OID" ]; then                
                echo "integer"
            else
                echo "string"
            fi

            echo "$value"
        fi
    else
        echo "NONE"
    fi
done
