import React from "react";
import { CircularProgress } from "@mui/material";
import {
  MODIFICATION_RECORD_CARD_TITLE,
  MODIFICATION_RECORD_BUTTON_LABELS,
  MODIFICATION_RECORD_BUTTON_VARIANTS,
  MODIFICATION_RECORD_BUTTON_STYLE,
  MODIFICATION_RECORD_NOTE,
  MODIFICATION_RECORD_TEXTAREA_PLACEHOLDER,
  MODIFICATION_RECORD_BREADCRUMB,
} from "../../../../constants/ModificationRecordConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  CARD_RADIUS,
  modificationRecordPageWrapStyle,
  modificationRecordPageInnerStyle,
  modificationRecordTableContainerStyle,
  modificationRecordHeaderStyle,
  modificationRecordFixedAlertSx,
} from "./ModificationRecordTableHelpers";

export const MODIFICATION_RECORD_COMPACT_MQ = "(max-width: 768px)";

export { modificationRecordFixedAlertSx };

export const modificationRecordBodyWrapStyle = {
  position: "relative",
  width: "100%",
  background: C.cardBg,
};

export const modificationRecordTextareaBodyStyle = {
  backgroundColor: C.cardBg,
  overflow: "hidden",
};

export const modificationRecordTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 360,
  margin: 0,
  padding: "24px",
  border: "none",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.valueText,
  backgroundColor: C.cardBg,
  whiteSpace: "pre-wrap",
  cursor: "default",
};

export const modificationRecordLoadingOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};

export const modificationRecordLoadingBoxStyle = {
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

export const modificationRecordFooterStyle = {
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

export const modificationRecordNoteStyle = {
  margin: "16px 0 0",
  textAlign: "center",
  fontSize: 12,
  color: C.accent,
  width: "100%",
  lineHeight: 1.5,
};

export const ModificationRecordPageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...modificationRecordPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={modificationRecordPageInnerStyle}>{children}</div>
  </div>
);

export const ModificationRecordBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={MODIFICATION_RECORD_BREADCRUMB[0]}
    section={MODIFICATION_RECORD_BREADCRUMB[1]}
    current={MODIFICATION_RECORD_BREADCRUMB[2]}
  />
);

export const ModificationRecordCard = ({
  outputRef,
  record,
  loading,
  onCheck,
  onDownload,
}) => (
  <div style={modificationRecordTableContainerStyle}>
    <div style={modificationRecordHeaderStyle}>
      <span>{MODIFICATION_RECORD_CARD_TITLE}</span>
    </div>

    <div style={modificationRecordBodyWrapStyle}>
      {loading && (
        <div style={modificationRecordLoadingOverlayStyle}>
          <div style={modificationRecordLoadingBoxStyle}>
            <CircularProgress size={22} sx={{ color: C.accent }} />
            <span>{MODIFICATION_RECORD_BUTTON_LABELS.LOADING}</span>
          </div>
        </div>
      )}
      <div style={modificationRecordTextareaBodyStyle}>
        <textarea
          ref={outputRef}
          value={record}
          readOnly
          spellCheck={false}
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          style={modificationRecordTextareaStyle}
          placeholder={MODIFICATION_RECORD_TEXTAREA_PLACEHOLDER}
        />
      </div>
    </div>

    <div style={modificationRecordFooterStyle}>
      <Btn
        variant={MODIFICATION_RECORD_BUTTON_VARIANTS.CHECK}
        type="button"
        onClick={onCheck}
        disabled={loading}
        style={MODIFICATION_RECORD_BUTTON_STYLE}
      >
        {loading ? (
          <>
            <CircularProgress size={14} color="inherit" />
            {MODIFICATION_RECORD_BUTTON_LABELS.LOADING}
          </>
        ) : (
          MODIFICATION_RECORD_BUTTON_LABELS.CHECK
        )}
      </Btn>
      <Btn
        variant={MODIFICATION_RECORD_BUTTON_VARIANTS.DOWNLOAD}
        type="button"
        onClick={onDownload}
        disabled={loading}
        style={MODIFICATION_RECORD_BUTTON_STYLE}
      >
        {MODIFICATION_RECORD_BUTTON_LABELS.DOWNLOAD}
      </Btn>
    </div>
  </div>
);

export const ModificationRecordNote = () => (
  <p style={modificationRecordNoteStyle}>{MODIFICATION_RECORD_NOTE}</p>
);
