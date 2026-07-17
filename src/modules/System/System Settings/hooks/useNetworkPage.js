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
  fetchVlanSettings,
  saveVlanSettings,
} from "../../../../api/apiService";

import { validateNetworkForm } from "../utils/NetworkValidators";
import {
  normalizeLanArray,
  applyStaticDefaults,
  filterAndNormalizeLanInterfaces,
  emptyVlanForm,
  emptyVlanSlots,
  extractVlanSlots,
  buildVlanInterfaceOptions,
  buildVlanDraftsFromApi,
  buildVlanFormForParent,
  buildVlanEnablePayloadFromDrafts,
  buildNetworkSavePayload,
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
  const [vlanInterfaceOptions, setVlanInterfaceOptions] = useState([]);
  const vlanDraftsRef = useRef({});
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
          const filteredInterfaces = filterAndNormalizeLanInterfaces(
            data.data.interfaces,
          );

          setLanInterfaces(filteredInterfaces);
          setOriginalLanSnapshot(normalizeLanArray(filteredInterfaces));

          try {
            const vlanRes = await fetchVlanSettings();

            if (vlanRes?.response) {
              const enabled = Boolean(vlanRes.data?.enabled);
              const parents = vlanRes.data?.parents || [];
              const vlans = vlanRes.data?.vlans || [];
              const options = buildVlanInterfaceOptions(
                parents,
                filteredInterfaces,
              );
              setVlanInterfaceOptions(options);

              const drafts = buildVlanDraftsFromApi(vlans, parents);
              // Ensure every selectable parent has a draft entry
              options.forEach((opt) => {
                if (!drafts[opt.value]) drafts[opt.value] = emptyVlanSlots();
              });
              vlanDraftsRef.current = drafts;

              const preferredParent =
                vlans[0]?.parentInterface ||
                parents[0] ||
                options[0]?.value ||
                filteredInterfaces[0]?.interface ||
                "";

              setVlanEnabled(enabled);
              setVlanForm(
                buildVlanFormForParent(
                  preferredParent,
                  drafts,
                  filteredInterfaces,
                ),
              );
            } else {
              vlanDraftsRef.current = {};
              setVlanInterfaceOptions(
                buildVlanInterfaceOptions([], filteredInterfaces),
              );
              setVlanEnabled(false);
              setVlanForm(
                emptyVlanForm(filteredInterfaces[0]?.interface || ""),
              );
            }
          } catch (vlanErr) {
            console.warn("VLAN settings fetch failed:", vlanErr);
            vlanDraftsRef.current = {};
            setVlanInterfaceOptions(
              buildVlanInterfaceOptions([], filteredInterfaces),
            );
            setVlanEnabled(false);
            setVlanForm(emptyVlanForm(filteredInterfaces[0]?.interface || ""));
          }
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
    if (field === "selectInterface") {
      const prev = vlanForm;
      const nextDrafts = { ...vlanDraftsRef.current };
      if (prev.selectInterface) {
        nextDrafts[prev.selectInterface] = extractVlanSlots(prev);
      }
      if (!nextDrafts[value]) {
        nextDrafts[value] = emptyVlanSlots();
      }
      vlanDraftsRef.current = nextDrafts;
      setVlanForm(
        buildVlanFormForParent(value, nextDrafts, lanInterfaces),
      );
      return;
    }
    setVlanForm((prev) => {
      const next = { ...prev, [field]: value };
      if (next.selectInterface) {
        vlanDraftsRef.current = {
          ...vlanDraftsRef.current,
          [next.selectInterface]: extractVlanSlots(next),
        };
      }
      return next;
    });
  };

  const handleArpChange = (e) => {
    setHasChanges(true);
    setArpMode(e.target.value);
    setArpError("");
  };

  const handleEnableVlan = () => {
    try {
      const selectInterface =
        vlanForm.selectInterface ||
        vlanInterfaceOptions[0]?.value ||
        lanInterfaces[0]?.interface ||
        "";
      if (selectInterface && !vlanDraftsRef.current[selectInterface]) {
        vlanDraftsRef.current = {
          ...vlanDraftsRef.current,
          [selectInterface]: emptyVlanSlots(),
        };
      }
      setVlanForm(
        buildVlanFormForParent(
          selectInterface,
          vlanDraftsRef.current,
          lanInterfaces,
        ),
      );
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
      });

      let vlanEnablePayload = null;
      if (vlanEnabled) {
        const { vlans, error: vlanError } = buildVlanEnablePayloadFromDrafts(
          vlanDraftsRef.current,
          vlanForm,
        );
        if (vlanError) {
          setLoading(false);
          setError(vlanError);
          return;
        }
        vlanEnablePayload = { enabled: true, vlans };
        if (vlanForm.selectInterface) {
          vlanDraftsRef.current = {
            ...vlanDraftsRef.current,
            [vlanForm.selectInterface]: extractVlanSlots(vlanForm),
          };
        }
      }

      const vlanDisablePayload = { enabled: false };

      const response = await saveNetworkSettings(payload);

      if (response.response) {
        if (vlanEnabled) {
          await saveVlanSettings(vlanEnablePayload);
        } else {
          await saveVlanSettings(vlanDisablePayload);
        }

        setHasChanges(false);
        setLoading(false);
        await triggerNetworkRestart(pendingList);
        return;
      }

      throw new Error(response.message || NETWORK_ERR_SAVE_FAILED);
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
    vlanInterfaceOptions,
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
