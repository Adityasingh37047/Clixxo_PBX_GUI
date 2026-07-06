import React, { useState, useCallback, useEffect } from "react";
import {
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  DEFAULT_SERIAL,
  AUTH_STATUS,
  AUTH_ERROR_LOAD_FAILED,
  AUTH_BREADCRUMB_ROOT,
  AUTH_BREADCRUMB_SECTION,
  AUTH_PAGE_TITLE,
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

const AUTH_COMPACT_MQ = "(max-width: 768px)";
const AUTH_CARD_RADIUS = 10;
const AUTH_LABEL_COL_WIDTH = 200;
const AUTH_CONTROL_COL_WIDTH = 220;
const AUTH_FIELD_COL_GAP = 8;
const AUTH_FORM_PAD_X = 28;
const AUTH_FIELDS_STACK_GAP = 10;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  accent: "#3E5475",
  sectionHeading: "#30415A",
  errorRed: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
        e.currentTarget.style.transform = "";
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = activeBg;
          e.currentTarget.style.transform = "translateY(1px) scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.transform = "";
        }
      }}
    >
      {children}
    </button>
  );
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

const authorizationCardStyle = {
  background: "#ffffff",
  borderRadius: AUTH_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const authorizationHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: AUTH_CARD_RADIUS,
  borderTopRightRadius: AUTH_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const authorizationFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: AUTH_CARD_RADIUS,
  borderBottomRightRadius: AUTH_CARD_RADIUS,
};

const authorizationFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const authorizationFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  gap: AUTH_FIELDS_STACK_GAP,
};

const authorizationFormBodyStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  padding: isCompact
    ? `16px ${AUTH_FORM_PAD_X}px 20px`
    : `16px ${AUTH_FORM_PAD_X}px 20px`,
  boxSizing: "border-box",
  background: C.cardBg,
});

const authorizationFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 420,
  boxShadow: 3,
};

const AUTH_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.readOnly) return;
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

const authReadOnlyInputStyle = {
  height: 32,
  width: AUTH_CONTROL_COL_WIDTH,
  minWidth: AUTH_CONTROL_COL_WIDTH,
  maxWidth: AUTH_CONTROL_COL_WIDTH,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#f8fafc",
  color: C.valueText,
  boxSizing: "border-box",
  textAlign: "center",
  cursor: "default",
};

const AuthorizationBreadcrumb = ({ section, current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{AUTH_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AuthorizationFieldRow = ({
  label,
  tooltip,
  loading,
  value,
  isStatus,
  statusColor,
  labelColWidth = AUTH_LABEL_COL_WIDTH,
}) => {
  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: AUTH_CONTROL_COL_WIDTH,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 2,
  };

  const controlSlotStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: AUTH_CONTROL_COL_WIDTH,
    minWidth: AUTH_CONTROL_COL_WIDTH,
    maxWidth: AUTH_CONTROL_COL_WIDTH,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: AUTH_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        <Tooltip title={tooltip || ""} {...AUTH_TOOLTIP_PROPS}>
          <label
            style={{
              fontSize: 12,
              color: C.labelText,
              fontWeight: 600,
              width: "100%",
              minWidth: 0,
              lineHeight: 1.35,
              wordBreak: "break-word",
              cursor: "help",
            }}
          >
            {label}
          </label>
        </Tooltip>
      </div>

      <div style={valueColStyle}>
        <div style={controlSlotStyle}>
          <input
            type="text"
            value={value}
            readOnly
            style={{
              ...authReadOnlyInputStyle,
              fontWeight: isStatus ? 700 : 500,
              color: isStatus ? statusColor : C.valueText,
            }}
            {...inputInteraction}
          />
          {loading && <CircularProgress size={16} sx={{ flexShrink: 0 }} />}
        </div>
      </div>
    </div>
  );
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
  const isCompact = useMediaQuery(AUTH_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : AUTH_LABEL_COL_WIDTH;
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

  return (
    <div
      style={{
        ...authorizationPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={authorizationPageInnerStyle}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              ...authorizationFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {error}
          </Alert>
        )}

        <AuthorizationBreadcrumb
          section={AUTH_BREADCRUMB_SECTION}
          current={AUTH_PAGE_TITLE}
        />

        <div style={authorizationCardStyle}>
          <div
            style={{
              ...authorizationHeaderStyle,
              padding: `10px ${AUTH_FORM_PAD_X}px`,
            }}
          >
            <span>{AUTH_CARD_TITLE}</span>
          </div>

          <div style={authorizationFormBodyStyle(isCompact)}>
            <div style={authorizationFieldsStackStyle}>
              {rows.map((row) => (
                <AuthorizationFieldRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  tooltip={AUTH_TOOLTIPS[row.label]}
                  loading={row.loading}
                  isStatus={row.isStatus}
                  statusColor={statusColor}
                  labelColWidth={labelColWidth}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              ...authorizationFooterStyle,
              ...(isCompact ? { padding: "10px 12px" } : {}),
            }}
          >
            <Btn
              type="button"
              variant="primary"
              onClick={refreshAll}
              disabled={busy}
              style={authorizationFooterBtnStyle}
            >
              {busy ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  {AUTH_BTN_LOADING}
                </>
              ) : (
                AUTH_BTN_REFRESH
              )}
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
            lineHeight: 1.5,
            padding: isCompact ? "0 4px" : 0,
            boxSizing: "border-box",
          }}
        >
          {AUTH_LICENSE_NOTE}
        </div>
      </div>
    </div>
  );
};

export default Authorization;
