import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSystemInfo,
  postLinuxCmd,
  getStorageUsage,
} from "../../../../api/apiService";
import { SYSTEM_INFO_REFRESH_INTERVAL_MS } from "../../../../constants/SystemInfoConstants";
import {
  extractRawLanInterfaces,
  filterAndNormalizeLanInterfaces,
  getSystemInfoMetric,
  parseAstLicenseSerial,
  parseWebVersionPayload,
  updateVersionEntry,
  mapStorageUsageToDetailRows,
  getStorageUsagePercent,
} from "../utils/SystemInfoTransformers";
import { getSystemInfoLoadErrorMessage } from "../utils/SystemInfoValidators";

export function useSystemInfoPage() {
  const [LAN_INTERFACES, setLAN_INTERFACES] = useState([]);
  const [SYSTEM_INFO, setSYSTEM_INFO] = useState([]);
  const [VERSION_INFO, setVERSION_INFO] = useState([]);
  const [storageDetails, setStorageDetails] = useState([]);
  const [error, setErros] = useState("");
  const [licenseSerialNumber, setLicenseSerialNumber] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const silentRefreshRef = useRef(false);

  const loadSystemInfo = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
    }

    try {
      // Fetch system info and serial (via astlicense) in parallel
      const [systemData, versionInfoData, astLicData, storageData] =
      await Promise.allSettled([
        fetchSystemInfo(),
        postLinuxCmd({
          cmd: "cat /home/clixxo/server/config/web_version.json",
        }),
        postLinuxCmd({ cmd: "astlicense" }),
        getStorageUsage(),
      ]);

      // Handle system info
      if (systemData.status === "fulfilled" && systemData.value.success) {
        const data = systemData.value;

        // Extract interfaces robustly from multiple possible response shapes
        const details = data.details || {};
        const rawInterfaces = extractRawLanInterfaces(details);

        // Filter out loopback and VPN virtual interfaces (tap*/tun*/vpn*) and normalize names
        const filteredInterfaces =
          filterAndNormalizeLanInterfaces(rawInterfaces);

        setLAN_INTERFACES(filteredInterfaces);
        setSYSTEM_INFO(data.details.SYSTEM_INFO);

        // Handle VERSION_INFO with serial number derived from astlicense
        let versionInfo = data.details.VERSION_INFO || [];

        let parsedSerial = "";
        if (
          versionInfoData.status === "fulfilled" &&
          versionInfoData.value?.response
        ) {
          try {
            const parsedJson = parseWebVersionPayload(
              versionInfoData.value.responseData,
            );
            if (parsedJson) {
              parsedSerial = parsedJson.serial_no || "";
              versionInfo = updateVersionEntry(
                versionInfo,
                "WEB",
                parsedJson.web_version,
              );
              versionInfo = updateVersionEntry(
                versionInfo,
                "Service",
                parsedJson.service,
              );
              versionInfo = updateVersionEntry(
                versionInfo,
                "Uboot",
                parsedJson.uboot,
              );
              versionInfo = updateVersionEntry(
                versionInfo,
                "Kernel",
                parsedJson.kernel,
              );
              versionInfo = updateVersionEntry(
                versionInfo,
                "Firmware",
                parsedJson.firmware,
              );
            }
          } catch (jsonError) {
            console.error("Failed to parse version info JSON:", jsonError);
          }
        }

        if (
          !parsedSerial &&
          astLicData.status === "fulfilled" &&
          astLicData.value?.response
        ) {
          parsedSerial = parseAstLicenseSerial(astLicData.value.responseData);
        }

        const finalSerial = parsedSerial || "Unavailable";
        setLicenseSerialNumber(
          finalSerial === "Unavailable" ? "" : finalSerial,
        );
        versionInfo = updateVersionEntry(
          versionInfo,
          "Serial Number",
          finalSerial,
        );

        setVERSION_INFO(versionInfo);
        setErros("");

        if (storageData.status === "fulfilled") {
          const usagePayload =
            storageData.value?.message ?? storageData.value ?? {};
          setStorageDetails(mapStorageUsageToDetailRows(usagePayload));
        } else {
          console.error("Failed to fetch storage details");
          setStorageDetails([]);
        }
      } else {
        setErros(
          systemData.status === "rejected"
            ? "Failed to load system information"
            : systemData.value?.error || "Unknown error",
        );
        setLAN_INTERFACES([]);
        setSYSTEM_INFO([]);
        setVERSION_INFO([]);
        setStorageDetails([]);
      }
    } catch (error) {
      // Handle different types of errors with user-friendly messages
      setErros(getSystemInfoLoadErrorMessage(error));
      setLAN_INTERFACES([]);
      setSYSTEM_INFO([]);
      setVERSION_INFO([]);
      setStorageDetails([]);
      setLicenseSerialNumber("");
    } finally {
      if (silent) {
        silentRefreshRef.current = false;
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSystemInfo(false);
    const interval = setInterval(
      () => loadSystemInfo(true),
      SYSTEM_INFO_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [loadSystemInfo]);

  useEffect(() => {
    const mainEl = document.querySelector("main.app-main-scroll");
    if (!mainEl) return undefined;
    mainEl.classList.add("notepad-scrollbar");
    return () => {
      mainEl.classList.remove("notepad-scrollbar");
    };
  }, []);

  const runtime = getSystemInfoMetric(SYSTEM_INFO, ["runtime", "uptime"]);
  const cpuUsage = getSystemInfoMetric(SYSTEM_INFO, ["cpu"]);
  const memoryUsage = getStorageUsagePercent(storageDetails);
  const packetLoss = getSystemInfoMetric(SYSTEM_INFO, [
    "packet loss",
    "packet_loss",
    "rx loss",
  ]);

  return {
    LAN_INTERFACES,
    SYSTEM_INFO,
    VERSION_INFO,
    error,
    licenseSerialNumber,
    isRefreshing,
    loadSystemInfo,
    runtime,
    cpuUsage,
    memoryUsage,
    packetLoss,
    storageDetails,
  };
}