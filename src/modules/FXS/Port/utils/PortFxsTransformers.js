import { PORT_FXS_TOTAL_PORTS } from "../../../../constants/PortFxsPageConstants";

export const FWD_TYPE_TO_UI = {
  no_reply: "No Reply",
  unconditional: "Unconditional",
  busy: "Busy",
};

export const mapApiPortToRow = (item) => ({
  port: item.port ?? item.id,
  type: "FXS",
  sipAccount: item.sipAccount || "---",
  displayName: item.displayName || "---",
  autoDialNum: item.autoDialNumber || "---",
  dnd: item.dnd ? "Enable" : "Disable",
  forward: item.callForwardEnabled ? "Enable" : "Disable",
  fwdType: FWD_TYPE_TO_UI[item.forwardType] || item.forwardType || "---",
  fwdNumber: item.forwardNumber || "---",
  cid: item.cidEnabled ? "Enable" : "Disable",
  callWaiting: item.callWaiting ? "Enable" : "Disable",
  regStatus: item.enabled ? "Registered" : "Unregistered",
  echoCanceller: item.echoCanceller ? "Enable" : "Disable",
  colorRing: "---",
  colorRingIndex: "---",
  inputGain: item.inputGain ?? 0,
  outputGain: item.outputGain ?? 0,
  raw: item,
});

export const normalizeFxsPortsResponse = (res) => {
  const data = Array.isArray(res?.data) ? res.data : [];
  const apiMaxPorts = res?.maxPorts || data.length || PORT_FXS_TOTAL_PORTS;
  return {
    ports: data.map(mapApiPortToRow),
    maxPorts: apiMaxPorts,
  };
};

export const buildBatchInitialPorts = (ports, totalPorts = PORT_FXS_TOTAL_PORTS) => {
  if (ports && ports.length > 0) {
    return {
      startingPort: String(ports[0].port),
      endingPort: String(ports[ports.length - 1].port),
    };
  }
  return {
    startingPort: "1",
    endingPort: String(totalPorts),
  };
};
