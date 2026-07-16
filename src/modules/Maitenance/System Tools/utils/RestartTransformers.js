import {
  RESTART_MESSAGES,
  RESTART_TIMINGS,
  RESTART_API,
  RESTART_ROUTES,
  RESTART_NETWORK_ERRORS,
  RESTART_CONNECTION_CODES,
} from "../../../../constants/RestartConstants";

export function getIpFromInterfaceObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
    return obj["IP Address"][0];
  if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
    return obj["Ip Address"][0];
  if (Array.isArray(obj["ip_address"]) && obj["ip_address"][0])
    return obj["ip_address"][0];
  return null;
}

export function extractDeviceIpsFromSystemInfo(sysInfo) {
  const details = sysInfo?.details || {};
  const lanInterfaces =
    details.LAN_INTERFACES || details.lan_interfaces || null;
  const interfacesArray = Array.isArray(lanInterfaces)
    ? lanInterfaces
    : lanInterfaces && typeof lanInterfaces === "object"
      ? Object.entries(lanInterfaces).map(([name, data]) => ({ name, data }))
      : [];

  let lan1Ip = null;
  let lan2Ip = null;

  interfacesArray.forEach((iface) => {
    const name = String(iface.name || iface.Name || "").toLowerCase();
    if (
      name.includes("eth0") ||
      name.includes("lan 1") ||
      name.includes("lan1")
    ) {
      lan1Ip = lan1Ip || getIpFromInterfaceObject(iface.data || iface);
    }
    if (
      name.includes("eth1") ||
      name.includes("lan 2") ||
      name.includes("lan2")
    ) {
      lan2Ip = lan2Ip || getIpFromInterfaceObject(iface.data || iface);
    }
  });

  if (!lan1Ip)
    lan1Ip =
      getIpFromInterfaceObject(sysInfo?.network?.eth0) ||
      getIpFromInterfaceObject(sysInfo?.eth0);
  if (!lan2Ip)
    lan2Ip =
      getIpFromInterfaceObject(sysInfo?.network?.eth1) ||
      getIpFromInterfaceObject(sysInfo?.eth1);

  return { lan1Ip, lan2Ip };
}

export function getPingTargets(lan1Ip, lan2Ip) {
  const currentHost = (window.location.hostname || "").trim();
  const set = new Set([lan1Ip, lan2Ip, currentHost].filter(Boolean));
  return Array.from(set);
}

export function buildServicePingUrl(ip) {
  const protocol = window.location.protocol;
  const isSameHost = (ip || "").trim() === window.location.hostname;
  const port = isSameHost
    ? window.location.port
      ? `:${window.location.port}`
      : protocol === "https:"
        ? ":443"
        : ":80"
    : protocol === "https:"
      ? ":443"
      : ":80";
  return `${protocol}//${ip}${port}${RESTART_API.servicePingPath}`;
}

export function buildLoginUrl(respondedIp) {
  const protocol = window.location.protocol;
  const isSameHost = (respondedIp || "") === window.location.hostname;
  const portPart = isSameHost
    ? window.location.port
      ? `:${window.location.port}`
      : ""
    : protocol === "https:"
      ? ":443"
      : ":80";
  return `${protocol}//${respondedIp}${portPart}${RESTART_ROUTES.login}`;
}

export function isRestartConnectionError(apiError) {
  const status = apiError.response?.status;
  const code = apiError.code;
  const msg = apiError.message || "";
  const is500 = status >= 500;
  const isConnectionError =
    code === RESTART_CONNECTION_CODES.ECONNRESET ||
    code === RESTART_CONNECTION_CODES.ETIMEDOUT ||
    code === RESTART_CONNECTION_CODES.ECONNABORTED ||
    msg.includes(RESTART_NETWORK_ERRORS.networkError) ||
    msg.includes(RESTART_NETWORK_ERRORS.failedToFetch) ||
    msg.includes(RESTART_NETWORK_ERRORS.timeout);
  return { is500, isConnectionError, status };
}

export function mapServiceRestartError(error) {
  let errorMessage = RESTART_MESSAGES.serviceRestartFailed;
  if (
    error.code === RESTART_CONNECTION_CODES.ECONNABORTED ||
    error.message?.includes(RESTART_NETWORK_ERRORS.timeout)
  ) {
    errorMessage = RESTART_MESSAGES.serviceRestartTimeout;
  } else if (error.response?.status >= 500) {
    errorMessage = RESTART_MESSAGES.serviceRestartServerError;
  } else if (
    error.message?.includes(RESTART_NETWORK_ERRORS.networkError) ||
    error.message?.includes(RESTART_NETWORK_ERRORS.failedToFetch)
  ) {
    errorMessage = RESTART_MESSAGES.serverNotConnected;
  } else if (error.message) {
    errorMessage = error.message;
  }
  return errorMessage;
}

export { RESTART_TIMINGS, RESTART_MESSAGES };
