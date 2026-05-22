import React, { useState, useCallback, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import {
  DEFAULT_SERIAL,
  DEFAULT_STATUS,
  AUTH_STATUS,
} from "../../../constants/AuthorizationConstants";
import {
  getLicenseInfo,
  fetchSystemInfo,
  postLinuxCmd,
} from "../../../api/apiService";

// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as AccountManage) ─────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  component,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return C.primaryHover;
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  const Component = component || "button";

  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
      }}
    >
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "#94a3b8" },
  onMouseLeave: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = C.cardBorder },
};

const DEFAULT_DEVICE_TYPE = "IPPBX";
const DEFAULT_EXPIRY_DATE = "2027-04-10";
const DEFAULT_MAX_E1_PRI = "2";

function strOrEmpty(v) {
  return v === "" || v === undefined || v === null ? "" : String(v);
}

function parseLicensePayload(responseData) {
  if (responseData == null || responseData === "") {
    return {
      serial: "",
      deviceType: "",
      expireDate: "",
      sipExtensions: "",
      fxsPorts: "",
      maxFxoChannels: "",
      maxSipTrunkChannels: "",
      maxE1: "",
    };
  }
  let parsed = responseData;
  if (typeof responseData === "string") {
    try {
      parsed = JSON.parse(responseData);
    } catch {
      return {
        serial: String(responseData).trim(),
        deviceType: "",
        expireDate: "",
        sipExtensions: "",
        fxsPorts: "",
        maxFxoChannels: "",
        maxSipTrunkChannels: "",
        maxE1: "",
      };
    }
  }
  if (typeof parsed !== "object" || parsed === null) {
    return {
      serial: "",
      deviceType: "",
      expireDate: "",
      sipExtensions: "",
      fxsPorts: "",
      maxFxoChannels: "",
      maxSipTrunkChannels: "",
      maxE1: "",
    };
  }

  const sipExt =
    parsed.max_sip_extensions ??
    parsed.sip_extensions ??
    parsed.total_extensions ??
    parsed.max_extensions ??
    parsed.extension_count ??
    parsed.extensions ??
    parsed.num_extensions ??
    "";

  const fxs =
    parsed.max_fxs_ports ??
    parsed.fxs_ports ??
    parsed.number_of_fxs_ports ??
    parsed.fxs_port_count ??
    parsed.num_fxs ??
    "";

  const fxoCh =
    parsed.max_fxo_channels ??
    parsed.max_fxo ??
    parsed.fxo_channels ??
    parsed.number_of_fxo_channels ??
    parsed.num_fxo_channels ??
    parsed.fxo_channel_count ??
    "";

  const tr =
    parsed.max_trunks ??
    parsed.number_of_trunks ??
    parsed.trunks ??
    parsed.trunk_count ??
    parsed.num_trunks ??
    "";

  const sipTrunkCh =
    parsed.max_sip_trunk_channels ??
    parsed.sip_trunk_channels ??
    parsed.max_trunk_channels ??
    parsed.trunk_sip_channels ??
    parsed.sip_trunk_channel_count ??
    parsed.channels_sip_trunks ??
    "";

  /** Single SIP trunk capacity field: prefer channel count; else legacy trunk count from API */
  const sipTrunkDisplay = strOrEmpty(sipTrunkCh) || strOrEmpty(tr);

  const e1 =
    parsed.max_e1 ??
    parsed.max_e1_channels ??
    parsed.e1_channels ??
    parsed.number_of_e1 ??
    parsed.num_e1 ??
    parsed.e1 ??
    "";

  return {
    serial:
      parsed.license_key ||
      parsed.Serial_Number ||
      parsed.serial_number ||
      parsed.serial ||
      "",
    deviceType:
      parsed.device_type ||
      parsed.deviceType ||
      parsed.product_type ||
      parsed.model ||
      parsed.product ||
      "",
    expireDate:
      parsed.expire_date ||
      parsed.expiry_date ||
      parsed.expireDate ||
      parsed.expiration_date ||
      "",
    sipExtensions: strOrEmpty(sipExt),
    fxsPorts: strOrEmpty(fxs),
    maxFxoChannels: strOrEmpty(fxoCh),
    maxSipTrunkChannels: sipTrunkDisplay,
    maxE1: strOrEmpty(e1),
  };
}

const Authorization = () => {
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [deviceType, setDeviceType] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [sipExtensions, setSipExtensions] = useState("");
  const [fxsPorts, setFxsPorts] = useState("");
  const [maxFxoChannels, setMaxFxoChannels] = useState("");
  const [maxSipTrunkChannels, setMaxSipTrunkChannels] = useState("");
  const [maxE1, setMaxE1] = useState("");
  const [authStatus, setAuthStatus] = useState(DEFAULT_STATUS);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState("");

  const applyParsedInfo = useCallback((parsed) => {
    setSerial(parsed.serial || "");
    setDeviceType(parsed.deviceType || DEFAULT_DEVICE_TYPE);
    setExpireDate(parsed.expireDate || DEFAULT_EXPIRY_DATE);
    setSipExtensions(parsed.sipExtensions || "");
    setFxsPorts(parsed.fxsPorts || "");
    setMaxFxoChannels(parsed.maxFxoChannels || "");
    setMaxSipTrunkChannels(parsed.maxSipTrunkChannels || "");
    setMaxE1(parsed.maxE1 || DEFAULT_MAX_E1_PRI);
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
      setError(err?.message || "Failed to load license information.");
    } finally {
      setLoadingInfo(false);
    }
  }, [applyParsedInfo]);

  const fetchSystemSerial = useCallback(async () => {
    try {
      const data = await fetchSystemInfo();
      if (data?.success && data?.details) {
        const versionInfo = Array.isArray(data.details.VERSION_INFO)
          ? data.details.VERSION_INFO
          : [];
        const serialEntry = versionInfo.find((item) => {
          const label = String(item?.label || "")
            .trim()
            .toLowerCase();
          return (
            label === "serial number" ||
            label === "serial" ||
            label === "serial no"
          );
        });
        const serialValue = String(serialEntry?.value || "").trim();
        if (serialValue && serialValue.toLowerCase() !== "unavailable")
          return serialValue;
      }

      // Fallback mirrors System Info page behavior (astlicense output).
      const astLic = await postLinuxCmd({ cmd: "astlicense" });
      if (astLic?.response) {
        const out = String(astLic.responseData || "");
        const lines = out.split(/\r?\n/);
        const astLicLine =
          lines.find((l) => l.trim().toLowerCase().startsWith("astlic:")) || "";
        if (astLicLine) {
          const afterColon = astLicLine.split(":").slice(1).join(":");
          const fields = afterColon.split(",").map((s) => s.trim());
          if (fields.length >= 2 && fields[1]) return fields[1];
        }
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
      // Requested behavior: if serial exists, show Authorized.
      setAuthStatus(
        nextSerial ? AUTH_STATUS.AUTHORIZED : AUTH_STATUS.UNAUTHORIZED,
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

  const formatDisplayDate = (v) => {
    if (!v) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) return String(v).trim();
    try {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    } catch (_) {}
    return String(v);
  };

  const busy = loadingInfo;

  const statusStyle =
    authStatus === AUTH_STATUS.AUTHORIZED
      ? { color: "#166534", fontWeight: 600, fontSize: "14px" }
      : { color: "#991b1b", fontWeight: 600, fontSize: "14px" };

  const rows = [
    { label: "Serial Number:", value: serial, loading: loadingInfo },
    {
      label: "Authorization Status:",
      value: authStatus,
      loading: loadingInfo,
      isStatus: true,
    },
    { label: "Device Type:", value: deviceType },
    { label: "Expiry Date:", value: formatDisplayDate(expireDate) },
    { label: "Maximum Number of SIP Extensions:", value: sipExtensions },
    { label: "Maximum Number of FXS Channels:", value: fxsPorts },
    { label: "Maximum Number of FXO Channels:", value: maxFxoChannels },
    {
      label: "Maximum Number of SIP Trunk Channels:",
      value: maxSipTrunkChannels,
    },
    { label: "Maximum Number of E1-PRI:", value: maxE1 },
  ];

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ── Breadcrumb ── */}
      <div className="w-full" style={{ maxWidth: 1000 }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Authorization
          </span>
        </div>

        {/* ── Content ── */}
        <div style={{ ...tableContainerStyle, marginBottom: 12 }}>
          <div style={blueBarStyle}>
            <span>Authorization Information</span>
          </div>

          <div className="w-full flex flex-col gap-0 px-5 py-4 rounded-b-lg">
            <div className="w-full max-w-3xl mx-auto">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {rows.map((row) => (
                  <React.Fragment key={row.label}>
                    <div className="flex items-center text-[13px] font-semibold text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>{row.label}</span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={row.value}
                          readOnly
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 12,
                            width: "100%",
                            maxWidth: 300,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: row.isStatus
                              ? statusStyle.color
                              : C.valueText,
                            fontWeight: row.isStatus ? 700 : 500,
                            textAlign: "center",
                            cursor: "text",
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                        {row.loading && (
                          <CircularProgress size={16} sx={{ flexShrink: 0 }} />
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row justify-center mt-6 pt-4"
                style={{ borderTop: `1px solid ${C.divider}` }}
              >
                <Btn
                  type="button"
                  variant="primary"
                  onClick={refreshAll}
                  disabled={busy}
                  style={{ minWidth: 120, height: 34 }}
                >
                  {busy ? "Loading…" : "Refresh"}
                </Btn>
              </div>

              <div className="text-center mt-3 pt-1">
                <span
                  style={{ color: C.errorRed, fontSize: 12, fontWeight: 500 }}
                >
                  Note - The information above is a summary of your license. For
                  any change, contact your vendor or authorized supplier.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authorization;
