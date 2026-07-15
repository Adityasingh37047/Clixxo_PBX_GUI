import React from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  SIP_ACCOUNT_FORM_FIELDS,
  SIP_ACCOUNT_NOTE,
  SIP_ACCOUNT_UPLOAD,
  SIP_ACCOUNT_DOWNLOAD,
  SIP_ACCOUNT_BUTTON_LABELS,
  SIP_ACCOUNT_BUTTON_VARIANTS,
  SIP_ACCOUNT_BUTTON_STYLE,
  SIP_ACCOUNT_BREADCRUMB,
} from "../../../../constants/SIPAccountGeneratorConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  sipGenPageWrapStyle,
  sipGenPageInnerStyle,
  sipGenTableContainerStyle,
  sipGenHeaderStyle,
  sipGenFixedAlertSx,
  FIELD_RADIUS,
} from "./SIPAccountGeneratorTableHelpers";

export { sipGenFixedAlertSx, sipGenTableContainerStyle, sipGenHeaderStyle };

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";

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

export const sipGenFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  outline: "none",
  color: C.labelText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

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

export const sipGenNoteStyle = {
  margin: "16px 0 0",
  textAlign: "center",
  fontSize: 12,
  color: C.accent,
  width: "100%",
  whiteSpace: "nowrap",
  overflowX: "auto",
  lineHeight: 1.45,
};

export const sipGenFileNameStyle = {
  color: C.labelText,
  fontSize: 13,
  maxWidth: 150,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const sipGenSectionCardStyle = {
  ...sipGenTableContainerStyle,
  marginTop: 20,
};

export const SIPAccountGeneratorPageShell = ({ children }) => (
  <div style={sipGenPageWrapStyle} data-native-scroll>
    <div style={sipGenPageInnerStyle}>{children}</div>
  </div>
);

export const SIPAccountGeneratorBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIP_ACCOUNT_BREADCRUMB[0]}
    section={SIP_ACCOUNT_BREADCRUMB[1]}
    current={SIP_ACCOUNT_BREADCRUMB[2]}
  />
);

export const SIPAccountGeneratorFormPanel = ({ form, onChange }) => (
  <div className="p-6">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="flex flex-col md:flex-row flex-wrap gap-6 flex-1">
        {SIP_ACCOUNT_FORM_FIELDS.map((field) => (
          <div
            key={field.name}
            className={`flex flex-col gap-1 ${
              field.flex ? "flex-1 min-w-[200px]" : ""
            }`}
          >
            <label
              htmlFor={field.name}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.labelText,
              }}
            >
              <Tooltip title={field.tooltip} {...tooltipProps}>
                <span style={{ color: C.labelText }}>{field.label}</span>
              </Tooltip>
            </label>

            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
              style={{
                ...sipGenFieldInputStyle,
                ...(field.minWidth && {
                  minWidth: field.minWidth,
                }),
              }}
              {...inputInteraction}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 lg:mt-5">
        <Btn
          type="submit"
          variant={SIP_ACCOUNT_BUTTON_VARIANTS.SAVE}
          style={SIP_ACCOUNT_BUTTON_STYLE}
        >
          {SIP_ACCOUNT_BUTTON_LABELS.SAVE}
        </Btn>
      </div>
    </div>

    <p style={sipGenNoteStyle}>{SIP_ACCOUNT_NOTE}</p>
  </div>
);

export const SIPAccountUploadPanel = ({
  fileName,
  fileInputRef,
  onFileChange,
  onChooseFile,
  onUpload,
}) => (
  <div style={sipGenSectionCardStyle}>
    <div style={sipGenHeaderStyle}>
      <span>{SIP_ACCOUNT_UPLOAD.title}</span>
    </div>
    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div style={{ flex: 1, color: C.valueText, fontSize: 13 }}>
        <div style={{ fontWeight: 500 }}>{SIP_ACCOUNT_UPLOAD.instruction}</div>
        <div style={{ color: C.mutedText, marginTop: 4 }}>
          {SIP_ACCOUNT_UPLOAD.prompt}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileChange}
        />
        <Btn
          variant={SIP_ACCOUNT_BUTTON_VARIANTS.CHOOSE_FILE}
          onClick={onChooseFile}
          style={SIP_ACCOUNT_BUTTON_STYLE}
        >
          {SIP_ACCOUNT_BUTTON_LABELS.CHOOSE_FILE}
        </Btn>
        <span style={sipGenFileNameStyle}>{fileName}</span>
      </div>

      <div className="flex md:justify-end flex-1">
        <Btn
          variant={SIP_ACCOUNT_BUTTON_VARIANTS.UPLOAD}
          onClick={onUpload}
          style={SIP_ACCOUNT_BUTTON_STYLE}
        >
          {SIP_ACCOUNT_BUTTON_LABELS.UPLOAD}
        </Btn>
      </div>
    </div>
  </div>
);

export const SIPAccountDownloadPanel = ({ onDownload }) => (
  <div style={sipGenSectionCardStyle}>
    <div style={sipGenHeaderStyle}>
      <span>{SIP_ACCOUNT_DOWNLOAD.title}</span>
    </div>
    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 flex flex-col gap-1">
        <span style={{ color: C.labelText, fontSize: 13, fontWeight: 600 }}>
          {SIP_ACCOUNT_DOWNLOAD.fileLabel}
        </span>
        <span style={{ color: C.errorRed, fontSize: 13, fontWeight: 500 }}>
          {SIP_ACCOUNT_DOWNLOAD.fileName}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          color: C.valueText,
          fontSize: 13,
          textAlign: "center",
        }}
      >
        {SIP_ACCOUNT_DOWNLOAD.instruction}
      </div>

      <div className="flex md:justify-end flex-1">
        <Btn
          variant={SIP_ACCOUNT_BUTTON_VARIANTS.DOWNLOAD}
          onClick={onDownload}
          style={SIP_ACCOUNT_BUTTON_STYLE}
        >
          {SIP_ACCOUNT_BUTTON_LABELS.DOWNLOAD}
        </Btn>
      </div>
    </div>
  </div>
);
