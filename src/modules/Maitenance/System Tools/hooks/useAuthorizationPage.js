import { useCallback, useEffect, useState } from "react";
import {
  getLicenseInfo,
  fetchSystemInfo,
  postLinuxCmd,
} from "../../../../api/apiService";
import {
  DEFAULT_SERIAL,
  AUTH_STATUS,
  AUTH_ERROR_LOAD_FAILED,
  DEFAULT_DEVICE_TYPE,
  DEFAULT_EXPIRY_DATE,
  DEFAULT_MAX_E1_PRI,
  AUTH_LABEL_SERIAL,
  AUTH_LABEL_STATUS,
  AUTH_LABEL_DEVICE_TYPE,
  AUTH_LABEL_EXPIRY_DATE,
  AUTH_LABEL_SIP_EXTENSIONS,
  AUTH_LABEL_FXS_CHANNELS,
  AUTH_LABEL_FXO_CHANNELS,
  AUTH_LABEL_SIP_TRUNK_CHANNELS,
  AUTH_LABEL_E1_PRI,
} from "../../../../constants/AuthorizationConstants";
import {
  parseLicensePayload,
  applyLicenseDefaults,
  formatDisplayDate,
  extractSerialFromSystemInfo,
  extractSerialFromAstLicense,
} from "../utils/AuthorizationTransformers";
import { isAuthorizedSerial } from "../utils/AuthorizationValidators";

export function useAuthorizationPage() {
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [deviceType, setDeviceType] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [sipExtensions, setSipExtensions] = useState("");
  const [fxsPorts, setFxsPorts] = useState("");
  const [maxFxoChannels, setMaxFxoChannels] = useState("");
  const [maxSipTrunkChannels, setMaxSipTrunkChannels] = useState("");
  const [maxE1, setMaxE1] = useState("");
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.UNAUTHORIZED);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState("");

  const applyParsedInfo = useCallback((parsed) => {
    const next = applyLicenseDefaults(parsed);
    setSerial(next.serial);
    setDeviceType(next.deviceType);
    setExpireDate(next.expireDate);
    setSipExtensions(next.sipExtensions);
    setFxsPorts(next.fxsPorts);
    setMaxFxoChannels(next.maxFxoChannels);
    setMaxSipTrunkChannels(next.maxSipTrunkChannels);
    setMaxE1(next.maxE1);
  }, []);

  const fetchLicenseInfo = useCallback(async () => {
    setLoadingInfo(true);
    setError("");
    try {
      const response = await getLicenseInfo();
      if (response?.response && response.responseData != null) {
        const parsed = parseLicensePayload(response.responseData);
        applyParsedInfo(parsed);
      }
    } catch (err) {
      console.error("Failed to load license info:", err);
      setError(err?.message || AUTH_ERROR_LOAD_FAILED);
    } finally {
      setLoadingInfo(false);
    }
  }, [applyParsedInfo]);

  const fetchSystemSerial = useCallback(async () => {
    try {
      const data = await fetchSystemInfo();
      const fromInfo = extractSerialFromSystemInfo(data);
      if (fromInfo) return fromInfo;

      const astLic = await postLinuxCmd({ cmd: "astlicense" });
      if (astLic?.response) {
        return extractSerialFromAstLicense(astLic.responseData);
      }
      return "";
    } catch (err) {
      console.error("Failed to fetch serial from system info:", err);
      return "";
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setError("");
    await fetchLicenseInfo();
    const sysSerial = await fetchSystemSerial();

    setSerial((prev) => {
      const nextSerial = sysSerial || prev || "";
      setAuthStatus(
        isAuthorizedSerial(nextSerial)
          ? AUTH_STATUS.AUTHORIZED
          : AUTH_STATUS.UNAUTHORIZED,
      );
      return nextSerial;
    });

    setDeviceType((prev) => prev || DEFAULT_DEVICE_TYPE);
    setExpireDate((prev) => prev || DEFAULT_EXPIRY_DATE);
    setMaxE1((prev) => prev || DEFAULT_MAX_E1_PRI);
  }, [fetchLicenseInfo, fetchSystemSerial]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const busy = loadingInfo;

  const statusColor =
    authStatus === AUTH_STATUS.AUTHORIZED ? "#166534" : "#991b1b";

  const rows = [
    {
      label: AUTH_LABEL_SERIAL,
      value: serial,
      loading: loadingInfo,
    },
    {
      label: AUTH_LABEL_STATUS,
      value: authStatus,
      loading: loadingInfo,
      isStatus: true,
    },
    {
      label: AUTH_LABEL_DEVICE_TYPE,
      value: deviceType,
    },
    {
      label: AUTH_LABEL_EXPIRY_DATE,
      value: formatDisplayDate(expireDate),
    },
    {
      label: AUTH_LABEL_SIP_EXTENSIONS,
      value: sipExtensions,
    },
    {
      label: AUTH_LABEL_FXS_CHANNELS,
      value: fxsPorts,
    },
    {
      label: AUTH_LABEL_FXO_CHANNELS,
      value: maxFxoChannels,
    },
    {
      label: AUTH_LABEL_SIP_TRUNK_CHANNELS,
      value: maxSipTrunkChannels,
    },
    {
      label: AUTH_LABEL_E1_PRI,
      value: maxE1,
    },
  ];

  return {
    error,
    setError,
    busy,
    statusColor,
    rows,
    refreshAll,
  };
}
