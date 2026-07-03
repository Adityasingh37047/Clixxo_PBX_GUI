import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
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

const RECORD_SETTINGS_COMPACT_MQ = "(max-width: 768px)";
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
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
  codecStripBg: "#ffffff",
  codecStripBorder: "#ced4de",
  codecStripSelectedBg: "#f1f5f9",
  codecStripSelectedBorder: "#8fa3b8",
  codecBtnBorder: "#c9d0d9",
  codecBtnBg: "#d9dde3",
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
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      outline: "#d1d9e6",
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
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </button>
  );
};

const RECORD_SETTINGS_CARD_RADIUS = 10;

const recordSettingsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const recordSettingsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

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

const recordSettingsCardStyle = {
  background: "#ffffff",
  borderRadius: RECORD_SETTINGS_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
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
  borderRadius: 10,
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
  borderRadius: 10,
  minWidth: 100,
};

const RecordSettingsBreadcrumb = ({ section, current }) => (
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
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

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
  const inner = (
    <div
      style={{
        margin: isFirst ? "20px 0 24px 0" : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: RECORD_SETTINGS_MAIN_SECTION_HEADING_LEFT,
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

const RECORD_CODEC_LIST_BOX_HEIGHT = 188;
const RECORD_CODEC_BTN_COL_WIDTH = 40;
const RECORD_CODEC_BTN_GAP = 6;
const RECORD_CODEC_BTN_HEIGHT =
  (RECORD_CODEC_LIST_BOX_HEIGHT - RECORD_CODEC_BTN_GAP * 3) / 4;
const RECORD_CODEC_LIST_LABEL_OFFSET = 28;

const recordCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
  marginBottom: 8,
};

const getRecordCodecListBoxStyle = (isEmpty) => ({
  width: "100%",
  minHeight: RECORD_CODEC_LIST_BOX_HEIGHT,
  height: RECORD_CODEC_LIST_BOX_HEIGHT,
  border: `1px solid ${C.codecBoxBorder}`,
  background: C.codecBoxAvailableBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 8px",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 4,
});

const recordCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const recordCodecStripStyle = (isSelected) => ({
  display: "block",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 400,
  color: C.valueText,
  textAlign: "center",
  background: isSelected ? C.codecStripSelectedBg : C.codecStripBg,
  border: `1px solid ${isSelected ? C.codecStripSelectedBorder : C.codecStripBorder}`,
  cursor: "pointer",
  userSelect: "none",
  boxSizing: "border-box",
  lineHeight: 1.35,
  flexShrink: 0,
  transition: "background 0.12s ease, border-color 0.12s ease",
});

const recordCodecDualListBtnStyle = {
  width: RECORD_CODEC_BTN_COL_WIDTH,
  height: RECORD_CODEC_BTN_HEIGHT,
  borderRadius: 6,
  border: `1px solid ${C.codecBtnBorder}`,
  background: C.codecBtnBg,
  color: "#111827",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  boxShadow: "none",
  transition:
    "background 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease",
  userSelect: "none",
};

const recordCodecDualListReorderBtnStyle = {
  ...recordCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
};

const recordCodecDualListReorderDownBtnStyle = {
  ...recordCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const recordCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: RECORD_CODEC_BTN_GAP,
  height: RECORD_CODEC_LIST_BOX_HEIGHT,
  width: RECORD_CODEC_BTN_COL_WIDTH,
};

const RecordCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
    style={
      down
        ? recordCodecDualListReorderDownBtnStyle
        : reorder
          ? recordCodecDualListReorderBtnStyle
          : recordCodecDualListBtnStyle
    }
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = C.codecBtnBg;
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.background = "#b3bac4";
      e.currentTarget.style.transform = "translateY(1px) scale(0.96)";
      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </button>
);

const getItemValue = (item) => {
  if (typeof item === "object" && item !== null) {
    const raw = item.value ?? item.extension ?? item.id ?? "";
    return String(raw).trim();
  }
  return String(item ?? "").trim();
};

const getItemLabel = (item, available = []) => {
  if (typeof item === "object" && item !== null) {
    return item.label || getItemValue(item);
  }
  const found = available.find((entry) => getItemValue(entry) === getItemValue(item));
  return found?.label || String(item);
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

const RecordCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  onDragSelect,
  onClearHighlight,
  emptyText,
  getLabel,
}) => {
  const isEmpty = items.length === 0;
  const listRef = useRef(null);
  const isDragSelectingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragAnchorIndexRef = useRef(null);
  const lastClickIndexRef = useRef(null);

  const getItemId = (item) => getItemValue(item);
  const itemIds = useMemo(() => items.map(getItemId), [items]);

  const applyRangeToIndex = (currIdx) => {
    if (currIdx < 0) return;
    if (dragAnchorIndexRef.current === null) {
      dragAnchorIndexRef.current = currIdx;
    }
    const anchor = dragAnchorIndexRef.current;
    const from = Math.min(anchor, currIdx);
    const to = Math.max(anchor, currIdx);
    onDragSelect?.(itemIds.slice(from, to + 1));
  };

  const applyRangeBetween = (fromIdx, toIdx) => {
    if (fromIdx < 0 || toIdx < 0) return;
    const from = Math.min(fromIdx, toIdx);
    const to = Math.max(fromIdx, toIdx);
    onDragSelect?.(itemIds.slice(from, to + 1));
  };

  const applyRangeAtPoint = (clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const strip = el?.closest?.("[data-codec-strip-id]");
    if (!strip || !listRef.current?.contains(strip)) return;
    const id = strip.getAttribute("data-codec-strip-id");
    if (!id) return;
    applyRangeToIndex(itemIds.indexOf(id));
  };

  const autoScrollList = (clientY) => {
    const container = listRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const edge = 28;
    const speed = 10;
    if (clientY < rect.top + edge) {
      container.scrollTop -= speed;
    } else if (clientY > rect.bottom - edge) {
      container.scrollTop += speed;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragSelectingRef.current || !(e.buttons & 1)) return;
      didDragRef.current = true;
      autoScrollList(e.clientY);
      applyRangeAtPoint(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isDragSelectingRef.current = false;
      dragAnchorIndexRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [itemIds, onDragSelect]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    isDragSelectingRef.current = true;
    didDragRef.current = false;
    dragAnchorIndexRef.current = null;

    const strip = e.target.closest?.("[data-codec-strip-id]");
    if (strip && listRef.current?.contains(strip)) {
      const id = strip.getAttribute("data-codec-strip-id");
      const idx = itemIds.indexOf(id);
      if (idx !== -1) {
        dragAnchorIndexRef.current = idx;
        applyRangeToIndex(idx);
        lastClickIndexRef.current = idx;
      }
    }
  };

  const handleClick = (id, e) => {
    if (didDragRef.current) {
      e.preventDefault();
      didDragRef.current = false;
      const idx = itemIds.indexOf(id);
      if (idx !== -1) lastClickIndexRef.current = idx;
      return;
    }

    const idx = itemIds.indexOf(id);
    if (idx === -1) return;

    if (e.ctrlKey || e.metaKey) {
      onToggle(id);
      lastClickIndexRef.current = idx;
      return;
    }

    if (e.shiftKey && lastClickIndexRef.current !== null) {
      applyRangeBetween(lastClickIndexRef.current, idx);
      return;
    }

    onDragSelect?.([id]);
    lastClickIndexRef.current = idx;
  };

  const handleContainerClick = (e) => {
    if (didDragRef.current) return;
    if (e.target.closest?.("[data-codec-strip-id]")) return;
    onClearHighlight?.();
    lastClickIndexRef.current = null;
  };

  return (
    <div
      ref={listRef}
      data-codec-list-box
      style={getRecordCodecListBoxStyle(isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={recordCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = getItemId(item);
          const label = getLabel ? getLabel(item) : getItemLabel(item);
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              data-codec-strip-id={id}
              role="option"
              aria-selected={isSelected}
              onClick={(e) => handleClick(id, e)}
              style={recordCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const buildInitialForm = () => {
  const form = apiToForm();
  RECORD_SETTINGS_FORM_FIELDS.forEach((field) => {
    form[field.key] = field.defaultValue;
  });
  return form;
};

const RecordDualList = ({ available, selected, onChange, isCompact }) => {
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const availableList = available.filter(
    (item) => !selected.some((entry) => getItemValue(entry) === getItemValue(item)),
  );

  const toggleAvailableSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAvailable = (ids) => setAvailableSelected(ids);

  const selectChosen = (ids) => setChosenSelected(ids);

  const clearHighlight = () => {
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  useEffect(() => {
    const handleOutsideClear = (e) => {
      if (!availableSelected.length && !chosenSelected.length) return;
      if (e.target.closest("[data-codec-strip-id]")) return;
      if (e.target.closest("[data-codec-action-btn]")) return;
      if (e.target.closest("[data-codec-list-box]")) return;
      clearHighlight();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [availableSelected, chosenSelected]);

  const addSelected = () => {
    if (!availableSelected.length) return;
    onChange([
      ...selected,
      ...availableSelected.filter(
        (id) => !selected.some((entry) => getItemValue(entry) === id),
      ),
    ]);
    setAvailableSelected([]);
  };

  const addAll = () => {
    onChange([
      ...selected,
      ...availableList
        .map(getItemValue)
        .filter(
          (id) =>
            id &&
            !selected.some((entry) => getItemValue(entry) === id),
        ),
    ]);
    setAvailableSelected([]);
  };

  const removeSelected = () => {
    if (!chosenSelected.length) return;
    onChange(
      selected.filter((item) => !chosenSelected.includes(getItemValue(item))),
    );
    setChosenSelected([]);
  };

  const removeAll = () => {
    onChange([]);
    setChosenSelected([]);
  };

  const moveToBottom = () => {
    if (!chosenSelected.length) return;
    onChange([
      ...selected.filter((item) => !chosenSelected.includes(getItemValue(item))),
      ...selected.filter((item) => chosenSelected.includes(getItemValue(item))),
    ]);
  };

  const moveUp = () => {
    if (!chosenSelected.length) return;
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = 1; i < arr.length; i++) {
          const currentId = getItemValue(arr[i]);
          const prevId = getItemValue(arr[i - 1]);
          if (
            chosenSelected.includes(currentId) &&
            !chosenSelected.includes(prevId)
          ) {
            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveDown = () => {
    if (!chosenSelected.length) return;
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = arr.length - 2; i >= 0; i--) {
          const currentId = getItemValue(arr[i]);
          const nextId = getItemValue(arr[i + 1]);
          if (
            chosenSelected.includes(currentId) &&
            !chosenSelected.includes(nextId)
          ) {
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveToTop = () => {
    if (!chosenSelected.length) return;
    onChange([
      ...selected.filter((item) => chosenSelected.includes(getItemValue(item))),
      ...selected.filter((item) => !chosenSelected.includes(getItemValue(item))),
    ]);
  };

  if (isCompact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={recordCodecColumnLabelStyle}>Available</div>
          <RecordCodecListBox
            items={availableList}
            selectedIds={availableSelected}
            onToggle={toggleAvailableSelect}
            onDragSelect={selectAvailable}
            onClearHighlight={clearHighlight}
            emptyText="No available items"
            getLabel={(item) => getItemLabel(item, available)}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <RecordCodecDualListBtn onClick={addSelected} title="Move selected to Selected">
            &gt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn onClick={addAll} title="Move all to Selected">
            &gt;&gt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn
            onClick={removeSelected}
            title="Move selected to Available"
          >
            &lt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn
            onClick={removeAll}
            title="Move all to Available"
          >
            &lt;&lt;
          </RecordCodecDualListBtn>
        </div>
        <div>
          <div style={recordCodecColumnLabelStyle}>Selected</div>
          <RecordCodecListBox
            items={selected}
            selectedIds={chosenSelected}
            onToggle={toggleChosenSelect}
            onDragSelect={selectChosen}
            onClearHighlight={clearHighlight}
            emptyText="No selected items"
            getLabel={(item) => getItemLabel(item, available)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `1fr ${RECORD_CODEC_BTN_COL_WIDTH}px 1fr ${RECORD_CODEC_BTN_COL_WIDTH}px`,
        gap: 10,
        width: "100%",
        alignItems: "start",
      }}
    >
      <div>
        <div style={recordCodecColumnLabelStyle}>Available</div>
        <RecordCodecListBox
          items={availableList}
          selectedIds={availableSelected}
          onToggle={toggleAvailableSelect}
          onDragSelect={selectAvailable}
          onClearHighlight={clearHighlight}
          emptyText="No available items"
          getLabel={(item) => getItemLabel(item, available)}
        />
      </div>
      <div>
        <div
          style={{ height: RECORD_CODEC_LIST_LABEL_OFFSET }}
          aria-hidden="true"
        />
        <div style={recordCodecBtnColumnStyle}>
          <RecordCodecDualListBtn onClick={addSelected} title="Move selected to Selected">
            &gt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn onClick={addAll} title="Move all to Selected">
            &gt;&gt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn
            onClick={removeSelected}
            title="Move selected to Available"
          >
            &lt;
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn
            onClick={removeAll}
            title="Move all to Available"
          >
            &lt;&lt;
          </RecordCodecDualListBtn>
        </div>
      </div>
      <div>
        <div style={recordCodecColumnLabelStyle}>Selected</div>
        <RecordCodecListBox
          items={selected}
          selectedIds={chosenSelected}
          onToggle={toggleChosenSelect}
          onDragSelect={selectChosen}
          onClearHighlight={clearHighlight}
          emptyText="No selected items"
          getLabel={(item) => getItemLabel(item, available)}
        />
      </div>
      <div>
        <div
          style={{ height: RECORD_CODEC_LIST_LABEL_OFFSET }}
          aria-hidden="true"
        />
        <div style={recordCodecBtnColumnStyle}>
          <RecordCodecDualListBtn
            reorder
            down
            title="Move to bottom"
            onClick={moveToBottom}
          >
            vv
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn reorder title="Move up" onClick={moveUp}>
            ^
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn reorder down title="Move down" onClick={moveDown}>
            v
          </RecordCodecDualListBtn>
          <RecordCodecDualListBtn reorder title="Move to top" onClick={moveToTop}>
            ^^
          </RecordCodecDualListBtn>
        </div>
      </div>
    </div>
  );
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
        <RecordDualList
          available={available}
          selected={selected}
          onChange={onChange}
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
