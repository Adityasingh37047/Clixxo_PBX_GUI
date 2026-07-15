import { useEffect, useRef, useState } from "react";
import {
  NETWORK_CONFIRM_SAVE,
  NETWORK_ERR_INVALID_DATA,
  NETWORK_ERR_LOAD_TIMEOUT,
  NETWORK_ERR_LOAD_NOT_FOUND,
  NETWORK_ERR_LOAD_SERVER,
  NETWORK_ERR_LOAD_NETWORK,
  NETWORK_ERR_LOAD_FAILED,
  NETWORK_ERR_RESET_SUCCESS,
  NETWORK_ERR_RESET_FAILED,
  NETWORK_ERR_RESET_TIMEOUT,
  NETWORK_ERR_RESET_SERVER,
  NETWORK_ERR_RESET_NETWORK,
  NETWORK_ERR_RESET_FAILED_GENERIC,
  NETWORK_ERR_RESTART_TIMEOUT,
  NETWORK_ERR_REBOOT_FAILED,
  NETWORK_ERR_SAVE_FAILED,
  NETWORK_ERR_SAVE_FAILED_GENERIC,
  NETWORK_ERR_SAVE_TIMEOUT,
  NETWORK_ERR_SAVE_INVALID,
  NETWORK_ERR_SAVE_SERVER,
  NETWORK_ERR_SAVE_NETWORK,
  NETWORK_PROGRESS_CHECKING,
  NETWORK_PROGRESS_BACK_ONLINE,
  NETWORK_PROGRESS_SAVED_REBOOTING,
  NETWORK_PROGRESS_WAITING_REBOOT,
} from "../../../../constants/NetworkConstants";
import {
  fetchNetwork,
  resetNetworkSettings,
  saveNetworkSettings,
  postLinuxCmd,
  servicePing,
} from "../../../../api/apiService";
import { validateNetworkForm } from "../utils/NetworkValidators";
import {
  normalizeLanArray,
  applyStaticDefaults,
  filterAndNormalizeLanInterfaces,
  findPrimaryVlanIface,
  VLAN_CFG_GATEWAY_CMD,
  parseVlanCfgGateway,
  buildInitialVlanForm,
  emptyVlanForm,
  subnetMaskToCidr,
  buildNetworkSavePayload,
  buildVlanEnableCmd,
  buildVlanDisableCmd,
  NETWORK_REBOOT_CMD,
} from "../utils/NetworkTransformers";

export function useNetworkPage() {
  const [lanInterfaces, setLanInterfaces] = useState([]);
  const [dnsServers, setDnsServers] = useState(["", ""]);
  const [arpMode, setArpMode] = useState("1");
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [resetting, setResetting] = useState(false);
  // Error states for each field
  const [ipErrors, setIpErrors] = useState([]);
  const [subnetErrors, setSubnetErrors] = useState([]);
  const [gatewayErrors, setGatewayErrors] = useState([]);
  const [dnsErrors, setDnsErrors] = useState(["", ""]);
  const [arpError, setArpError] = useState("");
  // VLAN state
  const [vlanEnabled, setVlanEnabled] = useState(false);
  const [vlanForm, setVlanForm] = useState(emptyVlanForm());
  // Removed showConfirm and pendingSave for native confirm
  const [hasChanges, setHasChanges] = useState(false);
  const [networkRestarting, setNetworkRestarting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [pendingIps, setPendingIps] = useState([]);

  const [originalLanSnapshot, setOriginalLanSnapshot] = useState([]);

  const pingIntervalRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const clearRestartPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRestartPolling();
    };
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchNetwork();

      if (data && data.data) {
        if (Array.isArray(data.data.interfaces)) {
          const allIfaces = data.data.interfaces;
          const filteredInterfaces = filterAndNormalizeLanInterfaces(allIfaces);

          setLanInterfaces(filteredInterfaces);
          setOriginalLanSnapshot(normalizeLanArray(filteredInterfaces));

          const lan1 = filteredInterfaces[0] || {};
          // Detect VLAN sub-interfaces (e.g. enp4s0.100, eth0.100) using the
          // primary interface's actual kernel name as the parent
          const primaryKernelName = lan1.interface || "eth0";
          const vlanIface = findPrimaryVlanIface(allIfaces, primaryKernelName);
          const hasVlan = Boolean(vlanIface);

          // Try to read VLAN gateway from vlan.cfg if it exists
          let vlanGateway = "";
          if (hasVlan) {
            try {
              const vlanCfgGwRes = await postLinuxCmd({
                cmd: VLAN_CFG_GATEWAY_CMD,
              });
              vlanGateway = parseVlanCfgGateway(vlanCfgGwRes);
              if (vlanGateway) {
                console.log(
                  "Read VLAN gateway from /etc/network/interfaces.d/vlan.cfg:",
                  vlanGateway,
                );
              }
            } catch (e) {
              console.warn("Failed to read VLAN gateway from vlan.cfg:", e);
            }
          }

          const initialVlan = buildInitialVlanForm({
            lan1,
            hasVlan,
            vlanIface,
            vlanGateway,
          });

          setVlanEnabled(hasVlan);
          setVlanForm((prev) => ({ ...prev, ...initialVlan }));
        }
        const dnsSnap = data.data.dnsServers || ["", ""];
        const arpSnap = data.data.defaultArpMode || "1";
        setDnsServers(dnsSnap);
        setArpMode(arpSnap);
      } else {
        throw new Error(NETWORK_ERR_INVALID_DATA);
      }
    } catch (err) {
      console.error("Network data fetch error:", err);

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(NETWORK_ERR_LOAD_TIMEOUT);
      } else if (err.response?.status === 404) {
        setError(NETWORK_ERR_LOAD_NOT_FOUND);
      } else if (err.response?.status >= 500) {
        setError(NETWORK_ERR_LOAD_SERVER);
      } else if (
        err.message?.includes("Network Error") ||
        err.message?.includes("Failed to fetch")
      ) {
        setError(NETWORK_ERR_LOAD_NETWORK);
      } else {
        setError(NETWORK_ERR_LOAD_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  // Update setHasChanges to true on any input change
  const handleLanChange = (index, field, value) => {
    setHasChanges(true);
    setLanInterfaces((prev) => {
      const updated = [...prev];
      const current = updated[index] || {};
      let next = { ...current, [field]: value };

      // When switching back to Static, apply sensible defaults if needed,
      // but DO NOT auto-change other interfaces any more.
      if (field === "ipv4Type" && value === "Static") {
        next = applyStaticDefaults(next);
      }

      updated[index] = next;
      return updated;
    });
    // Clear error for the changed field
    if (field === "ipAddress") {
      setIpErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "subnetMask") {
      setSubnetErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "defaultGateway") {
      setGatewayErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
    if (field === "ipv4Type") {
      setIpErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
      setSubnetErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
      setGatewayErrors((prev) => {
        const arr = [...prev];
        arr[index] = "";
        return arr;
      });
    }
  };

  const handleDnsChange = (idx, value) => {
    setHasChanges(true);
    setDnsServers((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
    setDnsErrors((prev) => {
      const arr = [...prev];
      arr[idx] = "";
      return arr;
    });
  };

  const handleVlanChange = (field, value) => {
    setHasChanges(true);
    setVlanForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArpChange = (e) => {
    setHasChanges(true);
    setArpMode(e.target.value);
    setArpError("");
  };

  const handleEnableVlan = () => {
    try {
      const lan1 =
        (lanInterfaces || []).find(
          (l) => l.name === "LAN 1" || l.interface === "eth0",
        ) || {};
      setVlanForm((prev) => ({
        ...prev,
        lan1Ip: lan1.ipAddress || prev.lan1Ip || "",
        lan1Mask: lan1.subnetMask || prev.lan1Mask || "",
        lan1Gw: lan1.defaultGateway || prev.lan1Gw || "",
      }));
    } catch {
      /* ignore */
    }
    setVlanEnabled(true);
    setHasChanges(true);
  };

  const handleDisableVlan = () => {
    setVlanEnabled(false);
    setHasChanges(true);
  };

  const handleReset = async () => {
    clearRestartPolling();
    setNetworkRestarting(false);
    setProgressMessage("");
    try {
      setResetting(true);
      setError("");

      const resp = await resetNetworkSettings();

      if (resp.response) {
        await loadNetworkData();
        showToast(NETWORK_ERR_RESET_SUCCESS, "success");
      } else {
        throw new Error(resp.message || NETWORK_ERR_RESET_FAILED);
      }
    } catch (error) {
      console.error("Network reset error:", error);

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setError(NETWORK_ERR_RESET_TIMEOUT);
      } else if (error.response?.status >= 500) {
        setError(NETWORK_ERR_RESET_SERVER);
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(NETWORK_ERR_RESET_NETWORK);
      } else {
        setError(error.message || NETWORK_ERR_RESET_FAILED_GENERIC);
      }
    } finally {
      setResetting(false);
    }
  };

  const pingDevice = async (targetIp) => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const base = targetIp
      ? `${protocol}//${targetIp}${port}`
      : window.location.origin;
    const url = `${base}/api/service-ping`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Ping failed");
      const data = await res.json();
      return data;
    } finally {
      clearTimeout(timeout);
    }
  };

  const checkDeviceOnline = async (targetIp = null) => {
    try {
      const res = targetIp ? await pingDevice(targetIp) : await servicePing();
      if (res?.response) return true;
      return false;
    } catch (err) {
      if (
        err?.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        return true;
      }
      return false;
    }
  };

  const beginNetworkPolling = (
    initialMessage = NETWORK_PROGRESS_CHECKING,
    targetIpList = [],
  ) => {
    clearRestartPolling();
    setProgressMessage(initialMessage);
    const sanitizedTargets = (
      targetIpList && targetIpList.length
        ? targetIpList
        : [window.location.hostname]
    )
      .map((ip) => (ip || "").trim())
      .filter(Boolean);
    const targets = Array.from(
      new Set(
        sanitizedTargets.length ? sanitizedTargets : [window.location.hostname],
      ),
    );

    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      for (const targetIp of targets) {
        const online = await checkDeviceOnline(targetIp);
        if (online) {
          clearRestartPolling();
          setProgressMessage(NETWORK_PROGRESS_BACK_ONLINE);
          setTimeout(() => {
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : "";
            const redirectHost = targetIp || window.location.hostname;
            window.location.href = `${protocol}//${redirectHost}${port}/login`;
          }, 3000);
          return;
        }
      }
      if (attempts >= 60) {
        clearRestartPolling();
        setNetworkRestarting(false);
        setProgressMessage("");
        setError(NETWORK_ERR_RESTART_TIMEOUT);
      }
    }, 5000);
  };

  const triggerNetworkRestart = async (targetsOverride = null) => {
    setNetworkRestarting(true);
    setProgressMessage(NETWORK_PROGRESS_SAVED_REBOOTING);
    try {
      await postLinuxCmd({ cmd: NETWORK_REBOOT_CMD });
    } catch (err) {
      console.error("Failed to initiate reboot:", err);
      setNetworkRestarting(false);
      setProgressMessage("");
      setError(err?.message || NETWORK_ERR_REBOOT_FAILED);
      return;
    }

    const targets =
      (targetsOverride && targetsOverride.length
        ? targetsOverride
        : pendingIps?.length
          ? pendingIps
          : null) || [window.location.hostname];

    restartTimeoutRef.current = setTimeout(() => {
      beginNetworkPolling(NETWORK_PROGRESS_WAITING_REBOOT, targets);
    }, 8000);
  };

  // Move actual save logic here
  const actuallySave = async () => {
    setLoading(true);
    setError("");

    const validation = validateNetworkForm({
      lanInterfaces,
      dnsServers,
      arpMode,
      originalLanSnapshot,
      currentHost: window.location.hostname,
    });

    if (validation.dhcpOnlyOne) {
      setLoading(false);
      showToast(validation.dhcpOnlyOneMessage, "warning");
      return;
    }

    setIpErrors(validation.ipErrs);
    setSubnetErrors(validation.subnetErrs);
    setGatewayErrors(validation.gatewayErrs);
    setDnsErrors(validation.dnsErrs);
    setArpError(validation.arpErr);
    setPendingIps(validation.pendingList);

    if (!validation.valid) {
      setLoading(false);
      return;
    }

    const pendingList = validation.pendingList;

    try {
      const payload = buildNetworkSavePayload({
        lanInterfaces,
        dnsServers,
        arpMode,
        vlanEnabled,
        vlanForm,
      });
      console.log(payload);

      const response = await saveNetworkSettings(payload);

      if (response.response) {
        // If VLAN is enabled, configure VLAN interface using Linux CLI
        try {
          if (vlanEnabled) {
            const vlanId = String(vlanForm.vlan1Id || "").trim();
            const vlanIp = String(vlanForm.vlan1Ip || "").trim();
            const vlanMask = String(vlanForm.vlan1Mask || "").trim();
            const vlanGw = String(vlanForm.vlan1Gw || "").trim();
            const cidr = subnetMaskToCidr(vlanMask);
            // Use actual kernel name of first LAN interface as VLAN parent
            const parentIface = lanInterfaces[0]?.interface || "eth0";
            if (vlanId && vlanIp && cidr !== null) {
              const cmd = buildVlanEnableCmd({
                parentIface,
                vlanId,
                vlanIp,
                vlanMask,
                vlanGw,
                cidr,
              });
              const vlanRes = await postLinuxCmd({ cmd });
              const out = String(vlanRes?.responseData || "").trim();
              if (!/VLAN_CREATED/.test(out)) {
                showToast(
                  `VLAN create command did not confirm success. Output:\n${out || "(no output)"}`,
                  "warning",
                );
              }
            }
          } else {
            // VLAN disabled: remove any VLAN sub-interfaces of the primary LAN interface
            const parentIface = lanInterfaces[0]?.interface || "eth0";
            const removeCmd = buildVlanDisableCmd(parentIface);
            await postLinuxCmd({ cmd: removeCmd });
          }
        } catch {
          /* ignore */
        }

        setHasChanges(false);
        setLoading(false);
        await triggerNetworkRestart(pendingList);
        return;
      } else {
        throw new Error(response.message || NETWORK_ERR_SAVE_FAILED);
      }
    } catch (error) {
      console.error("Network save error:", error);

      let errorMessage = NETWORK_ERR_SAVE_FAILED_GENERIC;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = NETWORK_ERR_SAVE_TIMEOUT;
      } else if (error.response?.status === 400) {
        errorMessage = NETWORK_ERR_SAVE_INVALID;
      } else if (error.response?.status >= 500) {
        errorMessage = NETWORK_ERR_SAVE_SERVER;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = NETWORK_ERR_SAVE_NETWORK;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      if (!networkRestarting) {
        setLoading(false);
      }
    }
  };

  // Use native browser confirm dialog
  const handleSave = async (e) => {
    e.preventDefault();
    if (hasChanges) {
      const confirmed = window.confirm(NETWORK_CONFIRM_SAVE);
      if (!confirmed) {
        return; // User cancelled, do nothing
      }
      await actuallySave(); // Proceed with save and redirect
      return;
    }
    // If no changes, do nothing or show a message
  };

  return {
    lanInterfaces,
    dnsServers,
    arpMode,
    loading,
    error,
    setError,
    toast,
    setToast,
    resetting,
    ipErrors,
    subnetErrors,
    gatewayErrors,
    dnsErrors,
    arpError,
    vlanEnabled,
    vlanForm,
    networkRestarting,
    progressMessage,
    handleLanChange,
    handleDnsChange,
    handleVlanChange,
    handleArpChange,
    handleEnableVlan,
    handleDisableVlan,
    handleReset,
    handleSave,
  };
}
