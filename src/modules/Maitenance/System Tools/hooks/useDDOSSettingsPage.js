import { useEffect, useState } from "react";
import { postLinuxCmd } from "../../../../api/apiService";
import {
  DDOS_INITIAL_FORM,
  DDOS_INFO_LOG,
  DDOS_LOCAL_STORAGE_KEY,
  DDOS_SERVICE_PORTS,
  DDOS_SIMULATION_IPS,
  DDOS_MESSAGE_DEFAULT,
  DDOS_MESSAGE_TIMEOUT_MS,
  DDOS_MESSAGES,
} from "../../../../constants/DDOSSettingsConstants";
import {
  createDdosInitialForm,
  parseIptablesRulesToForm,
  formatDdosLogEntry,
  formatDdosCommandLogEntry,
  buildDdosIptablesCommands,
  getDdosConfigureLogActions,
  DDOS_REMOVE_COMMANDS,
} from "../utils/DDOSSettingsTransformers";

export function useDDOSSettingsPage() {
  const [form, setForm] = useState(createDdosInitialForm);
  const [log, setLog] = useState(DDOS_INFO_LOG);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(DDOS_MESSAGE_DEFAULT);
  const [blacklistedIPs, setBlacklistedIPs] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(DDOS_MESSAGE_DEFAULT), DDOS_MESSAGE_TIMEOUT_MS);
  };

  const addLogEntry = (action, ip, port = null) => {
    setLog((prev) => prev + formatDdosLogEntry(action, ip, port));
  };

  const fetchCurrentProtectionStatus = async () => {
    try {
      const response = await postLinuxCmd({
        cmd: "iptables -L INPUT -n --line-numbers",
      });

      if (response.response && response.responseData) {
        const currentForm = parseIptablesRulesToForm(response.responseData);
        setForm(currentForm);
        addLogEntry("System", "Current DDOS protection status fetched");
      }
    } catch (error) {
      console.error("Error fetching current protection status:", error);
      setForm(createDdosInitialForm());
    }
  };

  useEffect(() => {
    const savedForm = localStorage.getItem(DDOS_LOCAL_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
        addLogEntry("System", "DDOS Settings loaded from saved state");
      } catch (error) {
        console.error("Error loading saved form state:", error);
        setForm(DDOS_INITIAL_FORM);
      }
    } else {
      fetchCurrentProtectionStatus();
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydrate, same as monolith
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(DDOS_LOCAL_STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, initialized]);

  const handleChange = (key, value, type) => {
    setForm((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !prev[key] : value,
    }));
  };

  const simulateAttackDetection = async () => {
    const serviceLimits = {
      web: form.webPortAttack ? form.webLimit : 0,
      ftp: form.ftpPortAttack ? form.ftpLimit : 0,
      ssh: form.sshPortAttack ? form.sshLimit : 0,
      telnet: form.telnetPortAttack ? form.telnetLimit : 0,
    };

    for (const [service, limit] of Object.entries(serviceLimits)) {
      if (limit > 0) {
        const servicePorts = DDOS_SERVICE_PORTS[service];
        const randomIP =
          DDOS_SIMULATION_IPS[
            Math.floor(Math.random() * DDOS_SIMULATION_IPS.length)
          ];
        const randomPort =
          servicePorts[Math.floor(Math.random() * servicePorts.length)];

        if (Math.random() > 0.3) {
          addLogEntry("Forbid", randomIP, randomPort);
          setBlacklistedIPs((prev) => new Set([...prev, randomIP]));

          if (
            form.blacklistValidityType === "inSetTime" &&
            form.blacklistTime
          ) {
            setTimeout(
              () => {
                addLogEntry("Release", randomIP);
                setBlacklistedIPs((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(randomIP);
                  return newSet;
                });
              },
              form.blacklistTime * 60 * 1000,
            );
          }
        }
      }
    }
  };

  const executeLinuxCommand = async (command) => {
    try {
      const response = await postLinuxCmd({ cmd: command });
      if (response.response && response.responseData !== undefined) {
        setLog(
          (prev) =>
            prev + formatDdosCommandLogEntry(command, response.responseData),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error executing Linux command:", error);
      return false;
    }
  };

  const removeAllDDOSProtection = async () => {
    try {
      for (const cmd of DDOS_REMOVE_COMMANDS) {
        await executeLinuxCommand(cmd);
      }
      addLogEntry("Configure", "All DDOS Protection rules removed");
    } catch (error) {
      console.error("Error removing DDOS protection:", error);
    }
  };

  const configureDDOSProtection = async () => {
    setLoading(true);
    try {
      await removeAllDDOSProtection();

      for (const entry of getDdosConfigureLogActions(form)) {
        addLogEntry(entry.action, entry.ip, entry.port);
      }

      const commands = buildDdosIptablesCommands(form);
      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      setTimeout(() => {
        simulateAttackDetection();
      }, 2000);

      showMessage("success", DDOS_MESSAGES.configureSuccess);
    } catch (error) {
      console.error("Error configuring DDOS protection:", error);
      showMessage("error", DDOS_MESSAGES.configureFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    await configureDDOSProtection();
  };

  const handleReset = () => {
    setForm(createDdosInitialForm());
    localStorage.removeItem(DDOS_LOCAL_STORAGE_KEY);
    showMessage("info", DDOS_MESSAGES.resetSuccess);
  };

  const handleSimulateAttack = () => {
    simulateAttackDetection();
    showMessage("info", DDOS_MESSAGES.simulateTriggered);
  };

  const handleClearLogs = () => {
    setLog("");
    setBlacklistedIPs(new Set());
    showMessage("info", DDOS_MESSAGES.logsCleared);
  };

  return {
    form,
    setForm,
    log,
    setLog,
    loading,
    message,
    setMessage,
    blacklistedIPs,
    setBlacklistedIPs,
    initialized,
    showMessage,
    fetchCurrentProtectionStatus,
    handleChange,
    addLogEntry,
    simulateAttackDetection,
    executeLinuxCommand,
    configureDDOSProtection,
    removeAllDDOSProtection,
    handleSave,
    handleReset,
    handleSimulateAttack,
    handleClearLogs,
  };
}
