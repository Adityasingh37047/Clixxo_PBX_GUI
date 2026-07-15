#!/usr/bin/env node
/**
 * Factor SipSipPage + SipMediaPage from monoliths into Factor-5 layout.
 * Run: node scripts/factor-e1-sip-settings.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, "(" + content.split("\n").length + " lines)");
}

function read(file) {
  return fs.readFileSync(path.join(SIP, file), "utf8").replace(/\r\n/g, "\n");
}

function readLines(file) {
  return read(file).split("\n");
}

function joinLines(lines, start1, end1) {
  return lines.slice(start1 - 1, end1).join("\n");
}

// ═══════════════════════════════════════════════════════════
// SipSipPage
// ═══════════════════════════════════════════════════════════
{
  const lines = readLines("SipSipPage.jsx");

  // TableHelpers: styles + C tokens (local to preserve cardShadow / accent)
  write(
    "components/SipSipTableHelpers.js",
    `/** Local page tokens (preserve SipSip visuals; chrome used for Btn elsewhere). */
export const C = {
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
  sectionHeading: "#30415A",
};

export const CARD_RADIUS = 4;
export const FIELD_RADIUS = 6;

export const SIP_SIP_COMPACT_MQ = "(max-width: 768px)";
export const SIP_SIP_SCROLL_CLASS = "sip-sip-scroll";
export const SIP_SIP_SECTION_HEADING_LEFT = -20;
export const SIP_FORM_PAD_X = 28;
export const SIP_SIP_LABEL_COL_WIDTH = 200;
export const SIP_SIP_CONTROL_COL_WIDTH = 220;
export const SIP_SIP_FIELD_COL_GAP = 8;
export const SIP_SIP_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

export const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

export const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

export const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
  boxSizing: "border-box",
};

export const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: \`1px solid \${C.cardBorder}\`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

export const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: \`1px solid \${C.divider}\`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const sipSipDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

export const sipSipColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? \`16px \${SIP_FORM_PAD_X}px 20px\`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

export const sipSipDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const sipSipDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const sipHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: \`1px solid \${C.divider}\`,
  boxSizing: "border-box",
};

export const formBodyStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  background: C.cardBg,
  boxSizing: "border-box",
};

export const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

export const sipSipFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

export const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

export const controlSlotStyle = {
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export const checkboxSx = {
  padding: "2px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const nativeRadioStyle = {
  width: 16,
  height: 16,
  accentColor: "#3E5475",
  cursor: "pointer",
};
`,
  );

  // Hook
  write(
    "hooks/useSipSipPage.js",
    `import { useEffect, useMemo, useState } from "react";
import { SIP_SIP_FIELDS, SIP_SIP_ERR_LOAD_FAILED, SIP_SIP_MSG_SETTINGS_UPDATED, SIP_SIP_ERR_SAVE_FAILED } from "../../../../constants/SipSipConstants";
import { listSipSettings, updateSipSettings } from "../../../../api/apiService";
import {
  getSipSipInitialState,
  getSipSipApiToUiKeyMap,
  mergeSipSipApiSettings,
  buildSipSipSettingsPayload,
  isSipSipFieldVisible,
} from "../utils/SipSipTransformers";
import { isValidSipSipIntegerInput } from "../utils/SipSipValidators";

export function useSipSipPage() {
  const [form, setForm] = useState(getSipSipInitialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const apiToUiKeyMap = useMemo(() => getSipSipApiToUiKeyMap(), []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await listSipSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        setForm(mergeSipSipApiSettings(settings, apiToUiKeyMap));
      } catch (e) {
        console.error("Failed to fetch SIP settings:", e);
        showMessage("error", SIP_SIP_ERR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiToUiKeyMap]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (isValidSipSipIntegerInput(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settingsPayload = buildSipSipSettingsPayload(form);
      const res = await updateSipSettings(settingsPayload);
      showMessage("success", res?.message || SIP_SIP_MSG_SETTINGS_UPDATED);
    } catch (e) {
      console.error("Failed to save SIP settings:", e);
      showMessage("error", e?.message || SIP_SIP_ERR_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(getSipSipInitialState());
  };

  const isFieldVisible = (field) => isSipSipFieldVisible(field, form);

  return {
    form,
    loading,
    saving,
    message,
    setMessage,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
    isFieldVisible,
  };
}
`,
  );

  console.log("SipSip hook + table helpers done; lines were", lines.length);
}

// ═══════════════════════════════════════════════════════════
// SipMediaPage utils + hook
// ═══════════════════════════════════════════════════════════
{
  write(
    "utils/SipMediaValidators.js",
    `/** Media settings currently rely on API/server validation; no client-only rules. */
export const validateSipMediaForm = () => null;
`,
  );

  write(
    "utils/SipMediaTransformers.js",
    `import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_INITIAL_FORM,
} from "../../../../constants/SipMediaConstants";

export const SIP_MEDIA_UI_TO_API = {
  dtmfTransmitMode: "dtmf_transmit_mode",
  rfc2833Payload: "rfc2833_payload",
  rtpPortRange: "rtp_port_range",
  silenceSuppression: "slience_suppression",
  noiseReduction: "noise_reduction",
  comfortNoise: "comfort_noise_generation",
  jitterMode: "jitter_mode",
  jitterBuffer: "jitter_buffer_ms",
  jitterUnderrunLead: "jitter_under_run_lead_ms",
  jitterOverrunLead: "jitter_over_run_lead_ms",
  ipOutputLevelControl: "ip_side_output_level_control_mode",
  voiceGainOutput: "voice_gain_output_from_ip_db",
  packTimeDefault: "pack_time_when_nego_fail_default_value",
  codecSetting: "codec_seq_setting",
};

export const getSipMediaApiToUi = () => {
  const r = {};
  Object.entries(SIP_MEDIA_UI_TO_API).forEach(([u, a]) => {
    r[a] = u;
  });
  return r;
};

export const mergeSipMediaApiSettings = (settings, apiToUi) => {
  const next = { ...SIP_MEDIA_INITIAL_FORM };
  Object.entries(settings).forEach(([k, v]) => {
    const uiKey = apiToUi[k];
    if (!uiKey) return;
    next[uiKey] = v ?? next[uiKey];
  });
  return next;
};

export const buildSipMediaPayload = (formData) => {
  const payload = { id: 1 };
  Object.entries(SIP_MEDIA_UI_TO_API).forEach(([u, a]) => {
    payload[a] = formData[u] ?? null;
  });
  return payload;
};

export const isSipMediaFieldVisible = (field, formData) => {
  if (!field.conditional) return true;
  const condVal = formData[field.conditional];
  if (field.conditionalValues) {
    return field.conditionalValues.includes(condVal);
  }
  if (field.conditionalValue) {
    return condVal === field.conditionalValue;
  }
  return true;
};

const MEDIA_COLUMN_SPLIT_INDEX = Math.ceil(SIP_MEDIA_FIELDS.length / 2);
export const MEDIA_LEFT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  0,
  MEDIA_COLUMN_SPLIT_INDEX,
);
export const MEDIA_RIGHT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  MEDIA_COLUMN_SPLIT_INDEX,
);
`,
  );

  write(
    "hooks/useSipMediaPage.js",
    `import { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_INITIAL_FORM,
  SIP_MEDIA_MSG_SETTINGS_UPDATED,
  SIP_MEDIA_MSG_SAVE_FAILED,
  SIP_MEDIA_MSG_LOAD_FAILED,
  SIP_MEDIA_MSG_NETWORK_SAVE_FAILED,
  SIP_MEDIA_MSG_RESET,
} from "../../../../constants/SipMediaConstants";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../../api/apiService";
import {
  getSipMediaApiToUi,
  mergeSipMediaApiSettings,
  buildSipMediaPayload,
  isSipMediaFieldVisible,
} from "../utils/SipMediaTransformers";

export function useSipMediaPage() {
  const [formData, setFormData] = useState(SIP_MEDIA_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const apiToUi = useMemo(() => getSipMediaApiToUi(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listMediaSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        setFormData(mergeSipMediaApiSettings(settings, apiToUi));
      } catch (e) {
        console.error("Failed to fetch media settings:", e);
        showMessage("error", SIP_MEDIA_MSG_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiToUi]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = buildSipMediaPayload(formData);
      const res = await updateMediaSettings(payload);
      if (res?.response) {
        showMessage("success", res?.message || SIP_MEDIA_MSG_SETTINGS_UPDATED);
      } else {
        showMessage("error", res?.message || SIP_MEDIA_MSG_SAVE_FAILED);
      }
    } catch (e) {
      console.error("Failed to save media settings:", e);
      showMessage("error", e?.message || SIP_MEDIA_MSG_NETWORK_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(SIP_MEDIA_INITIAL_FORM);
    showMessage("info", SIP_MEDIA_MSG_RESET);
  };

  const isFieldVisible = (field) => isSipMediaFieldVisible(field, formData);

  return {
    formData,
    loading,
    saving,
    message,
    setMessage,
    handleInputChange,
    handleSave,
    handleReset,
    isFieldVisible,
  };
}
`,
  );
}

console.log("settings utils/hooks complete");
