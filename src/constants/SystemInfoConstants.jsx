
export const LAN_INTERFACES = [
  {
    name: 'LAN 1',
    data: {
      'MAC Address': '40:F3:85:C0:5C:D9',
      'IP Address': ['192.168.1.101', '255.255.255.0', '192.168.1.254'],
      'IPv6 Address': '-',
      'DNS Server': '0.0.0.0',
      'Receive Packets': ['All: 2951', 'Error: 0', 'Drop: 216'],
      'Transmit Packets': ['All: 2951', 'Error: 0', 'Drop: 0'],
      'Current Speed': ['Receive: 329 Bps', 'Transmit: 0 Bps'],
      'Work Mode': '100Mbps Full Duplex',
      'Network Type': 'Static'
    }
  },
  {
    name: 'LAN 2',
    data: {
      'MAC Address': '40:F3:85:C0:5C:D9',
      'IP Address': ['192.168.0.101', '255.255.255.0', '192.168.0.54'],
      'IPv6 Address': '-',
      'DNS Server': '0.0.0.0',
      'Receive Packets': ['All: 2831', 'Error: 0', 'Drop: 269'],
      'Transmit Packets': ['All: 2831', 'Error: 0', 'Drop: 0'],
      'Current Speed': ['Receive: 0 Bps', 'Transmit: 0 Bps'],
      'Work Mode': 'Disconnected',
      'Network Type': 'Static'
    }
  }
];

export const SYSTEM_INFO = [
  { label: 'Runtime', value: '10m 43s' },
  { label: 'Operating Mode', value: 'ISDN(user)' },
  { label: 'CPU Usage Rate', value: '45%' },
  { 
    label: 'Current RTP Message Data', 
    value: 'Packet Loss Rate in Reception 0.00%',
    extra: ['Total Transmit Packets: 0', 'Packet Lost in Reception: 0']
  },
  { label: 'DCMS Working Status', value: 'Requesting authentication' }
];

export const VERSION_INFO = [
  { label: 'Serial Number', value: '914223770(Cisco/IS-3001C)' },
  { label: 'WEB', value: '1.9.0_20241209114' },
  { label: 'Gateway', value: '1.9.0_20241209114(Default Config)' },
  { label: 'Uboot', value: '1.3.0_202404_cisco' },
  { label: 'Kernel', value: '#207 SMP PREEMPT Wed Sep 25 20:14:48 CST 2024' },
  { label: 'Firmware', value: '273' }
];