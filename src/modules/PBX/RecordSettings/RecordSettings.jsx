import React, { useEffect, useState } from "react";
import {
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
  Alert,
} from "@mui/material";
import {
  listIvrDestinations,
  getRecordingSettings,
  updateRecordingSettings,
  resetRecordingSettings,
} from "../../../api/apiService";
import {
  RECORD_SETTINGS_DUAL_LIST_SECTIONS,
  RECORD_SETTINGS_FIELD_TOOLTIPS,
  RECORD_SETTINGS_FORM_FIELDS,
  RECORD_SETTINGS_TITLE,
} from "../../../constants/RecordSettingsConstants";
import {
  Btn,
  ExtensionBreadcrumb as RecordSettingsBreadcrumb,
  extensionPageWrapStyle as recordSettingsPageWrapStyle,
  extensionPageInnerStyle as recordSettingsPageInnerStyle,
  extensionCardStyle as recordSettingsCardStyle,
  ExtensionCodecDualList as RecordSettingsCodecDualList,
} from "../../../components/common";

const RECORD_SETTINGS_COMPACT_MQ = "(max-width: 768px)";
const RECORD_SETTINGS_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
const RECORD_SETTINGS_MAIN_SECTION_HEADING_LEFT = -20;

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
  placeholderText: "#94a3b8",
};


const RECORD_SETTINGS_CARD_RADIUS = 10;

const recordSettingsFormBodyStyle = {
  width: "100%",
  maxWidth: 920,
  margin: "0 auto",
  boxSizing: "border-box",
};

const recordSettingsFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 24px",
  width: "100%",
  marginBottom: 8,
};

const recordSettingsFormColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const recordSettingsHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: RECORD_SETTINGS_CARD_RADIUS,
  borderTopRightRadius: RECORD_SETTINGS_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const recordSettingsFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: "#ffffff",
  borderBottomLeftRadius: RECORD_SETTINGS_CARD_RADIUS,
  borderBottomRightRadius: RECORD_SETTINGS_CARD_RADIUS,
};

const recordSettingsFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  minWidth: 100,
  borderRadius: 4,
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const recordSettingsOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const recordSettingsFieldControlFullSx = {
  width: "100%",
  maxWidth: "100%",
  "& .MuiOutlinedInput-root": {
    ...recordSettingsOutlinedInputRootSx,
    minHeight: 34,
    height: 34,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: C.valueText,
    cursor: "text",
  },
};

const recordSettingsSelectFullSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  maxWidth: "100%",
  minHeight: 34,
  height: 34,
  ...recordSettingsOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
    cursor: "pointer",
  },
};

const RECORD_SETTINGS_TOOLTIP_PROPS = {
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

const RECORD_SETTINGS_FIELD_LABEL_WIDTH = 220;

const RecordSettingsFieldRow = ({
  label,
  tooltipKey,
  children,
  isCompact,
  stacked = false,
}) => {
  const vertical = isCompact || stacked;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? "stretch" : "center",
        padding: "8px 0",
        gap: vertical ? 6 : 12,
      }}
    >
      <Tooltip
        title={RECORD_SETTINGS_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...RECORD_SETTINGS_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: vertical ? "100%" : RECORD_SETTINGS_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: tooltipKey ? "help" : "default",
          }}
        >
          {label}
        </span>
      </Tooltip>
      <div style={{ minWidth: 0, width: vertical ? "100%" : undefined }}>
        {children}
      </div>
    </div>
  );
};

const RecordSettingsSectionHeading = ({
  title,
  isFirst = false,
  onClick,
  expanded,
}) => {
  const isLaptopNarrow = useMediaQuery(RECORD_SETTINGS_LAPTOP_NARROW_MQ);
  const inner = (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "24px 0 24px 0"
            : "20px 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : RECORD_SETTINGS_MAIN_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: C.sectionHeading,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {onClick ? (
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              color: C.accent,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          >
            ▶
          </span>
        ) : null}
        {title}
      </span>
    </div>
  );

  if (!onClick) return inner;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
      }}
    >
      {inner}
    </button>
  );
};

const normalizeDestinationList = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number") {
        const value = String(item).trim();
        return value ? { value, label: value } : null;
      }
      const value = String(
        item.value ?? item.extension ?? item.id ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

const resolveDestinationLabel = (available, id) => {
  const found = available.find((entry) => entry.value === String(id));
  return found?.label || String(id);
};

const toValueArray = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  if (raw == null || raw === "") return [];
  return String(raw)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const truthy = (v) =>
  v === true ||
  ["true", "yes", "1", "on", "enabled"].includes(String(v).toLowerCase());

const DIRECTION_TO_API = { both: "both", incoming: "in", outgoing: "out" };
const DIRECTION_FROM_API = { both: "both", in: "incoming", out: "outgoing" };

const apiToForm = (msg = {}) => ({
  enableRecording: truthy(msg.enabled) ? "enabled" : "disabled",
  internalPrompt: msg.internal_prompt ?? "none",
  outboundInboundPrompt: msg.external_prompt ?? "none",
  recordStart: msg.record_start ?? "after_answer",
  recordDirection: DIRECTION_FROM_API[msg.record_direction] ?? "both",
  recordSampleRate: String(msg.sample_rate ?? "8000"),
  recordingFileFormat: msg.file_format ?? "wav",
  recordpath: msg.record_path ?? "",
});

const formToApi = (form, trunks, extensions, conferences) => ({
  enabled: form.enableRecording === "enabled",
  internal_prompt: form.internalPrompt,
  external_prompt: form.outboundInboundPrompt,
  record_start: form.recordStart,
  record_direction: DIRECTION_TO_API[form.recordDirection] ?? "both",
  sample_rate: Number(form.recordSampleRate) || 8000,
  file_format: form.recordingFileFormat,
  record_path: form.recordpath || "",
  record_trunks: trunks,
  record_extensions: extensions,
  record_conferences: conferences,
});

const buildInitialForm = () => {
  const form = apiToForm();
  RECORD_SETTINGS_FORM_FIELDS.forEach((field) => {
    form[field.key] = field.defaultValue;
  });
  return form;
};

const CollapsibleSection = ({
  title,
  expanded,
  onToggle,
  available,
  selected,
  onChange,
  isCompact,
  isFirst = false,
}) => (
  <div style={{ marginBottom: 8 }}>
    <RecordSettingsSectionHeading
      title={title}
      isFirst={isFirst}
      onClick={onToggle}
      expanded={expanded}
    />
    {expanded && (
      <div style={{ marginTop: 8 }}>
        <RecordSettingsCodecDualList
          allOptions={available}
          selected={selected}
          onChange={onChange}
          getLabel={(id) => resolveDestinationLabel(available, id)}
          emptyTextAvailable="No available items"
          emptyTextSelected="No selected items"
          isCompact={isCompact}
        />
      </div>
    )}
  </div>
);

const RecordSettings = () => {
  const isCompact = useMediaQuery(RECORD_SETTINGS_COMPACT_MQ);
  const [form, setForm] = useState(buildInitialForm);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [selectedConferences, setSelectedConferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [expandedSections] = useState({
    trunks: true,
    extensions: true,
    conferences: true,
  });
  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const loadDestinations = async () => {
    try {
      const data = await listIvrDestinations();
      const msg = data?.message ?? data?.data ?? data ?? {};
      setAvailableTrunks(normalizeDestinationList(msg.Trunks || msg.trunks));
      setAvailableExtensions(
        normalizeDestinationList(msg.Extensions || msg.extensions),
      );
      setAvailableConferences(
        normalizeDestinationList(
          msg.ConferenceRooms || msg.Conferences || msg.conferences,
        ),
      );
    } catch (error) {
      console.error("Failed to load destinations:", error);
      setAvailableTrunks([]);
      setAvailableExtensions([]);
      setAvailableConferences([]);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getRecordingSettings();
      const msg = res?.message ?? res?.data ?? null;
      if (res?.response !== false && msg && typeof msg === "object") {
        setForm(apiToForm(msg));
        setSelectedTrunks(toValueArray(msg.record_trunks));
        setSelectedExtensions(toValueArray(msg.record_extensions));
        setSelectedConferences(toValueArray(msg.record_conferences));
      }
    } catch (error) {
      showMsg("error", error?.message || "Failed to load recording settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations().finally(loadSettings);
  }, []);

  const dualListConfig = {
    trunks: {
      available: availableTrunks,
      selected: selectedTrunks,
      onChange: setSelectedTrunks,
      expanded: expandedSections.trunks,
    },
    extensions: {
      available: availableExtensions,
      selected: selectedExtensions,
      onChange: setSelectedExtensions,
      expanded: expandedSections.extensions,
    },
    conferences: {
      available: availableConferences,
      selected: selectedConferences,
      onChange: setSelectedConferences,
      expanded: expandedSections.conferences,
    },
  };

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = formToApi(
        form,
        selectedTrunks,
        selectedExtensions,
        selectedConferences,
      );
      const res = await updateRecordingSettings(payload);
      if (res?.response === false) {
        showMsg("error", res?.message || "Failed to save recording settings.");
        return;
      }
      const msg = res?.message ?? res?.data ?? null;
      if (msg && typeof msg === "object") {
        setForm(apiToForm(msg));
        setSelectedTrunks(toValueArray(msg.record_trunks));
        setSelectedExtensions(toValueArray(msg.record_extensions));
        setSelectedConferences(toValueArray(msg.record_conferences));
      }
      showMsg("success", "Recording settings saved successfully.");
    } catch (error) {
      showMsg("error", error?.message || "Failed to save recording settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await resetRecordingSettings();
      if (res?.response === false) {
        showMsg("error", res?.message || "Failed to reset recording settings.");
        return;
      }
      const msg = res?.message ?? res?.data ?? null;
      if (msg && typeof msg === "object") {
        setForm(apiToForm(msg));
        setSelectedTrunks(toValueArray(msg.record_trunks));
        setSelectedExtensions(toValueArray(msg.record_extensions));
        setSelectedConferences(toValueArray(msg.record_conferences));
      } else {
        setForm(buildInitialForm());
        setSelectedTrunks([]);
        setSelectedExtensions([]);
        setSelectedConferences([]);
      }
      showMsg("success", "Recording settings reset to defaults.");
    } catch (error) {
      showMsg("error", error?.message || "Failed to reset recording settings.");
    } finally {
      setSaving(false);
    }
  };

  const recordSettingsLeftFields = RECORD_SETTINGS_FORM_FIELDS.slice(0, 4);
  const recordSettingsRightFields = RECORD_SETTINGS_FORM_FIELDS.slice(4, 8);

  const renderRecordSettingsField = (field, stacked = false) => (
    <RecordSettingsFieldRow
      key={field.key}
      label={field.label}
      tooltipKey={field.tooltipKey}
      isCompact={isCompact}
      stacked={stacked}
    >
      {field.type === "text" ? (
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          sx={recordSettingsFieldControlFullSx}
        />
      ) : (
        <FormControl size="small" fullWidth variant="outlined">
          <MuiSelect
            variant="outlined"
            value={form[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            sx={recordSettingsSelectFullSx}
          >
            {field.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
      )}
    </RecordSettingsFieldRow>
  );

  return (
    <div
      style={{
        ...recordSettingsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={recordSettingsPageInnerStyle}>
        <RecordSettingsBreadcrumb
          section={RECORD_SETTINGS_TITLE}
          current={RECORD_SETTINGS_TITLE}
        />

        <div style={recordSettingsCardStyle}>
          <div style={recordSettingsHeaderStyle}>
            <span>{RECORD_SETTINGS_TITLE}</span>
          </div>

          {message.text ? (
            <div style={{ padding: "12px 20px 0", boxSizing: "border-box" }}>
              <Alert
                severity={message.type || "info"}
                onClose={() => setMessage({ type: "", text: "" })}
                sx={{ fontSize: 13 }}
              >
                {message.text}
              </Alert>
            </div>
          ) : null}

          <div style={{ padding: "20px 20px 0", boxSizing: "border-box" }}>
            <div
              style={{
                ...recordSettingsFormBodyStyle,
                paddingTop: 4,
                paddingBottom: 16,
              }}
            >
              {isCompact ? (
                RECORD_SETTINGS_FORM_FIELDS.map((field) =>
                  renderRecordSettingsField(field, true),
                )
              ) : (
                <div style={recordSettingsFormGridStyle}>
                  <div style={recordSettingsFormColumnStyle}>
                    {recordSettingsLeftFields.map((field) =>
                      renderRecordSettingsField(field, true),
                    )}
                  </div>
                  <div style={recordSettingsFormColumnStyle}>
                    {recordSettingsRightFields.map((field) =>
                      renderRecordSettingsField(field, true),
                    )}
                  </div>
                </div>
              )}

              {RECORD_SETTINGS_DUAL_LIST_SECTIONS.map((section, idx) => {
                const config = dualListConfig[section.key];
                return (
                  <CollapsibleSection
                    key={section.key}
                    title={section.title}
                    isFirst={idx === 0}
                    expanded={config.expanded}
                    available={config.available}
                    selected={config.selected}
                    onChange={config.onChange}
                    isCompact={isCompact}
                  />
                );
              })}
            </div>
          </div>

          <div style={recordSettingsFooterStyle}>
            <Btn
              variant="primary"
              style={recordSettingsFooterBtnStyle}
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? "Saving..." : "Save"}
            </Btn>
            <Btn
              variant="cancel"
              style={recordSettingsFooterBtnStyle}
              onClick={handleReset}
              disabled={loading || saving}
            >
              Reset Defaults
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordSettings;
