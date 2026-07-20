import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchSystemInfo,
  postLinuxCmd,
} from "../../../../api/apiService";
import {
  extractRawLanInterfaces,
  filterAndNormalizeLanInterfaces,
  mapHardDrivesFromDetails,
  mapSystemResourcesFromDetails,
  parseAstLicenseSerial,
  parseWebVersionPayload,
  updateVersionEntry,
} from "../utils/SystemInfoTransformers";
import { getSystemInfoLoadErrorMessage } from "../utils/SystemInfoValidators";

/** Dedupe concurrent fetches (e.g. StrictMode remount, overlapping refresh). */
let systemInfoFetchPromise = null;

function fetchSystemInfoBundle() {
  if (!systemInfoFetchPromise) {
    systemInfoFetchPromise = Promise.allSettled([
      fetchSystemInfo(),
      postLinuxCmd({
        cmd: "cat /home/clixxo/server/config/web_version.json",
      }),
      postLinuxCmd({ cmd: "astlicense" }),
    ]).finally(() => {
      systemInfoFetchPromise = null;
    });
  }
  return systemInfoFetchPromise;
}

export function useSystemInfoPage() {
  const [details, setDetails] = useState(null);
  const [error, setErros] = useState("");
  const [licenseSerialNumber, setLicenseSerialNumber] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSystemInfo = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [systemData, versionInfoData, astLicData] =
        await fetchSystemInfoBundle();

      if (systemData.status === "fulfilled" && systemData.value.success) {
        const data = systemData.value;
        const baseDetails = data.details || {};

        let versionInfo = baseDetails.VERSION_INFO || [];

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

        setDetails({
          ...baseDetails,
          VERSION_INFO: versionInfo,
        });
        setErros("");
      } else {
        setErros(
          systemData.status === "rejected"
            ? "Failed to load system information"
            : systemData.value?.error || "Unknown error",
        );
        setDetails(null);
        setLicenseSerialNumber("");
      }
    } catch (err) {
      setErros(getSystemInfoLoadErrorMessage(err));
      setDetails(null);
      setLicenseSerialNumber("");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSystemInfo();
  }, [loadSystemInfo]);

  useEffect(() => {
    const mainEl = document.querySelector("main.app-main-scroll");
    if (!mainEl) return undefined;
    mainEl.classList.add("notepad-scrollbar");
    return () => {
      mainEl.classList.remove("notepad-scrollbar");
    };
  }, []);

  const LAN_INTERFACES = useMemo(
    () =>
      filterAndNormalizeLanInterfaces(
        extractRawLanInterfaces(details || {}),
      ),
    [details],
  );

  const SYSTEM_INFO = details?.SYSTEM_INFO || [];
  const VERSION_INFO = details?.VERSION_INFO || [];
  const systemResources = useMemo(
    () => mapSystemResourcesFromDetails(details || {}),
    [details],
  );
  const hardDrives = useMemo(
    () => mapHardDrivesFromDetails(details || {}),
    [details],
  );

  return {
    details,
    LAN_INTERFACES,
    SYSTEM_INFO,
    VERSION_INFO,
    systemResources,
    hardDrives,
    error,
    licenseSerialNumber,
    isRefreshing,
    loadSystemInfo,
  };
}
