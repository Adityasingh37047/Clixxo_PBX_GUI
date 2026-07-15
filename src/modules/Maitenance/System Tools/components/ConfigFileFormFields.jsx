import React from "react";
import { CircularProgress } from "@mui/material";
import {
  CONFIG_FILE_CARD_TITLE,
  CONFIG_FILE_OPTIONS,
  CONFIG_FILE_BUTTON_LABELS,
  CONFIG_FILE_BUTTON_VARIANTS,
  CONFIG_FILE_BUTTON_STYLE,
  CONFIG_FILE_BREADCRUMB,
  CONFIG_FILE_HOSTS_VALUE,
  CONFIG_FILE_TEXTAREA_PLACEHOLDER,
} from "../../../../constants/ConfigFileConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  CARD_RADIUS,
  FIELD_RADIUS,
  configFilePageWrapStyle,
  configFilePageInnerStyle,
  configFileTableContainerStyle,
  configFileHeaderStyle,
  configFileFixedAlertSx,
} from "./ConfigFileTableHelpers";

export const CONFIG_FILE_COMPACT_MQ = "(max-width: 768px)";

export {
  configFileFixedAlertSx,
  configFileTableContainerStyle,
  configFileHeaderStyle,
};

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
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const systemToolsFieldSelectStyle = {
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 13,
  appearance: "auto",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  cursor: "pointer",
};

export const configFileHeaderSelectStyle = {
  ...systemToolsFieldSelectStyle,
  width: "auto",
  minWidth: 180,
  maxWidth: 220,
  height: 30,
  flexShrink: 0,
  marginLeft: "auto",
};

export const configFileHeaderTitleStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  lineHeight: 1.35,
};

export const configFileBodyWrapStyle = {
  position: "relative",
  width: "100%",
  background: C.cardBg,
};

export const configFileTextareaBodyStyle = {
  backgroundColor: C.cardBg,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  overflow: "hidden",
};

export const configFileTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 450,
  margin: 0,
  padding: "24px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.valueText,
  backgroundColor: C.cardBg,
  whiteSpace: "pre-wrap",
  cursor: "text",
};

export const configFileLoadingOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};

export const configFileLoadingBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: C.cardBg,
  padding: "14px 20px",
  borderRadius: 8,
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  fontSize: 13,
  fontWeight: 500,
  color: C.valueText,
};

export const configFileFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  minHeight: 50,
  boxSizing: "border-box",
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

export const ConfigFilePageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...configFilePageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={configFilePageInnerStyle}>{children}</div>
  </div>
);

export const ConfigFileBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={CONFIG_FILE_BREADCRUMB[0]}
    section={CONFIG_FILE_BREADCRUMB[1]}
    current={CONFIG_FILE_BREADCRUMB[2]}
  />
);

export const ConfigFileEditorCard = ({
  selectedFile,
  content,
  loading,
  textareaRef,
  onFileChange,
  onContentChange,
  onTextareaClick,
  onSave,
  onReset,
}) => (
  <div style={configFileTableContainerStyle}>
    <div style={configFileHeaderStyle}>
      <span style={configFileHeaderTitleStyle}>{CONFIG_FILE_CARD_TITLE}</span>
      <select
        value={selectedFile}
        onChange={onFileChange}
        disabled={loading.fetch}
        style={configFileHeaderSelectStyle}
        {...inputInteraction}
      >
        {CONFIG_FILE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    <div style={configFileBodyWrapStyle}>
      {loading.fetch && selectedFile === CONFIG_FILE_HOSTS_VALUE && (
        <div style={configFileLoadingOverlayStyle}>
          <div style={configFileLoadingBoxStyle}>
            <CircularProgress size={22} sx={{ color: C.accent }} />
            <span>{CONFIG_FILE_BUTTON_LABELS.LOADING_FILE}</span>
          </div>
        </div>
      )}
      <div style={configFileTextareaBodyStyle}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={onContentChange}
          onClick={onTextareaClick}
          readOnly={loading.fetch}
          spellCheck={false}
          style={configFileTextareaStyle}
          placeholder={CONFIG_FILE_TEXTAREA_PLACEHOLDER}
        />
      </div>
    </div>

    <div style={configFileFooterStyle}>
      <Btn
        variant={CONFIG_FILE_BUTTON_VARIANTS.SAVE}
        onClick={onSave}
        disabled={loading.fetch || loading.save}
        style={CONFIG_FILE_BUTTON_STYLE}
      >
        {loading.save ? (
          <>
            <CircularProgress size={14} color="inherit" />
            {CONFIG_FILE_BUTTON_LABELS.SAVING}
          </>
        ) : (
          CONFIG_FILE_BUTTON_LABELS.SAVE
        )}
      </Btn>
      <Btn
        variant={CONFIG_FILE_BUTTON_VARIANTS.RESET}
        onClick={onReset}
        disabled={loading.fetch || loading.save}
        style={CONFIG_FILE_BUTTON_STYLE}
      >
        {CONFIG_FILE_BUTTON_LABELS.RESET}
      </Btn>
    </div>
  </div>
);
