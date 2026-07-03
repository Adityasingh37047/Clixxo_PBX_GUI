import React, { useState, useCallback, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { Tooltip } from "@mui/material";
import {
  DEFAULT_SERIAL,
  AUTH_STATUS,
  AUTH_ERROR_LOAD_FAILED,
  AUTH_BREADCRUMB_ROOT,
  AUTH_BREADCRUMB_SECTION,
  AUTH_PAGE_TITLE,
  AUTH_BREADCRUMB_SEPARATOR,
  AUTH_BTN_REFRESH,
  AUTH_BTN_LOADING,
  AUTH_LICENSE_NOTE,
  AUTH_CARD_TITLE,
  DEFAULT_DEVICE_TYPE,
  DEFAULT_EXPIRY_DATE,
  DEFAULT_MAX_E1_PRI,
  AUTH_TOOLTIPS,
  AUTH_LABEL_SERIAL,
  AUTH_LABEL_STATUS,
  AUTH_LABEL_DEVICE_TYPE,
  AUTH_LABEL_EXPIRY_DATE,
  AUTH_LABEL_SIP_EXTENSIONS,
  AUTH_LABEL_FXS_CHANNELS,
  AUTH_LABEL_FXO_CHANNELS,
  AUTH_LABEL_SIP_TRUNK_CHANNELS,
  AUTH_LABEL_E1_PRI,
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
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;  
const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};


const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const systemToolsFieldInputStyleSmall = {
  ...systemToolsFieldInputStyle,
  fontSize: 12,
};
const inputStyle = systemToolsFieldInputStyleSmall;

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
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
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

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
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {startIcon && (
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const authorizationPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const authorizationPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};



/** Authorization read-only fields — 12px (original size) */
const inputStyleWithAuth = {
  ...inputStyle,
  textAlign: "center",
  cursor: "text",
};



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

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

  
const Authorization = () => {
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
      setError(err?.message || AUTH_ERROR_LOAD_FAILED);
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
      ? { color: "#166534", fontWeight: 600, fontSize: "12px" }
      : { color: "#991b1b", fontWeight: 600, fontSize: "12px" };

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
  return (
    <div style={authorizationPageWrapStyle} data-native-scroll>
      <div style={authorizationPageInnerStyle}>
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
    <span>{AUTH_BREADCRUMB_ROOT}</span>
<span>{AUTH_BREADCRUMB_SEPARATOR}</span>
<span>{AUTH_BREADCRUMB_SECTION}</span>
<span>{AUTH_BREADCRUMB_SEPARATOR}</span>
<span style={{ color: C.strongText, fontWeight: 600 }}>
  {AUTH_PAGE_TITLE}
</span>
        </div>

        {/* ── Content ── */}
        <div style={tableContainerStyle}>
        <div style={blueBarStyle}>
  <span>{AUTH_CARD_TITLE}</span>
</div>

          <div
            className="w-full px-5 pt-3 pb-0 flex flex-col items-center"
            style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
          >
            <div
              className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
              style={{ marginBottom: 12 }}
            >
              {rows.map((row) => (
                <React.Fragment key={row.label}>
           <Tooltip
  title={AUTH_TOOLTIPS[row.label] || ""}
  {...tooltipProps}
>
  <span style={labelStyle}>
    {row.label}
  </span>
</Tooltip>
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={row.value}
                      readOnly
                      style={{
                        ...inputStyleWithAuth,
                        color: row.isStatus ? statusStyle.color : C.valueText,
                        fontWeight: row.isStatus ? 700 : 500,
                      }}
                      {...inputInteraction}
                    />
                    {row.loading && (
                      <CircularProgress size={16} sx={{ flexShrink: 0 }} />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div
            style={{
              ...advancedFormInlineFooterStyle,
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
         <Btn
  type="button"
  variant="primary"
  onClick={refreshAll}
  disabled={busy}
  style={advancedFormBtnStyle}
>
  {busy ? AUTH_BTN_LOADING : AUTH_BTN_REFRESH}
</Btn>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
          }}
        >
         {AUTH_LICENSE_NOTE}
        </div>
      </div>
    </div>
  );
};

export default Authorization;
