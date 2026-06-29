import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(0, 0, 0, 0.15)",
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
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

const storageOutlinedInputRootSx = {
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
    boxShadow: FOCUS_RING_SHADOW(),
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

const storageTextFieldSx = {
  "& .MuiOutlinedInput-root": storageOutlinedInputRootSx,
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const storageSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...storageOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const storageCompactSelectSx = {
  ...storageSelectSx,
  minHeight: 32,
  height: 32,
  "& .MuiSelect-select": {
    ...storageSelectSx["& .MuiSelect-select"],
    padding: "4px 28px 4px 8px !important",
  },
};

const modalTextFieldSx = {
  ...storageTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...storageOutlinedInputRootSx,
    minHeight: 34,
  },
};

const modalSelectSx = storageSelectSx;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
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

  const Component = component || "button";
  return (
    <Component
      type={type || "button"}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
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
      {children}
    </Component>
  );
};

const storageFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />

    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 500,
        color: C.labelText,
        letterSpacing: "0.01em",
      }}
    >
      {title}
    </span>
  </div>
);

const storagePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const storagePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const storageCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
};

const storageTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const storageToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
};

const storageTabBarStyle = {
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const storageTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};

const storageDashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
};

const storageDashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "20px 36px 24px",
  background: C.cardBg,
};

const storageDashboardDividerStyle = {
  background: C.divider,
  width: 1,
  flexShrink: 0,
  marginTop: "-1px", // adjust 10-20px as needed
  marginBottom: "-24px",
};

const storageFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
};

const storageSingleColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 24px",
  background: C.cardBg,
};

const StoragePageShell = ({ children }) => (
  <div style={storagePageWrapStyle} data-native-scroll>
    <div style={storagePageInnerStyle}>{children}</div>
  </div>
);

const StorageBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>System</span>
    <span>&gt;</span>
    <span>System Settings</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>Storage</span>
  </div>
);

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};






const FormFieldRow = ({
  label,
  tooltip,
  required = false,
  labelWidth = 320,
  children,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      width: "100%",
    }}
  >
    <Tooltip
      title={tooltip || ""}
      disableHoverListener={!tooltip}
      {...tooltipProps}
    >
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: labelWidth,
          flexShrink: 0,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label}
        {required && <span style={{ color: C.errorRed }}> *</span>}
      </label>
    </Tooltip>

    <div style={{ width: "min(100%, 320px)", flexShrink: 0 }}>{children}</div>
  </div>
);
const AUTO_CLEANUP_SECTIONS = [
  {
    title: "CDR Auto Cleanup",
    fields: [
      {
        name: "maxCdr",
        label: "Max Number of CDR",
        tooltip: "Set the maximum number of CDR that should be retained. The default is '100000'. The oldest CDR will be deleted when the threshold is reached.",
        type: "text",
        defaultValue: "200000",
      },
      {
        name: "cdrPreservationDuration",
        label: "CDR Preservation Duration",
        tooltip: `Set the maximum numbers of days that CDr should be retained. The default is "0".`,
        type: "text",
        defaultValue: "0",
      },
      {
        name: "maxConferenceSessions",
        label: "Max Number of Conference Sessions",
        tooltip:`Set the maximum number of conference sessions that should be retained. The default is '5000'. The oldest conference session will be deleted when the threshold is reached.`,
        type: "text",
        defaultValue: "5000",
      },
    ],
  },
  {
    title: "VoiceMail and One Touch Recording Auto Cleanup",
    fields: [
      {
        name: "maxVoicemailFiles",
        label: "Max Number of Files",
        tooltip:`Set the maximum number of voice mail files that should be retained. The default is '300'. The oldest voice mail file will be deleted when the threshold is reached.`,
        type: "text",
        defaultValue: "300",
      },
      {
        name: "voicemailPreservationDuration",
        label: "Preservation Duration",
        tooltip: `Set the maximum numbers of days that voice mail files should be retained. "0" for no limitation.`,
        type: "text",
        defaultValue: "0",
      },
      {
        name: "voicemailFilesPreservationDuration",
        label: "Files Preservation Duration",
        tooltip: `Set the maximum numbers of minutes that voicemail and touch recording files should be retained respectively for each extension. "0" for no limitation.`,
        type: "text",
        defaultValue: "0",
      },
    ],
  },
  {
    title: "Recordings Auto Cleanup",
    fields: [
      {
        name: "maxDeviceUsage",
        label: "Max Usage of Device(%)",
        tooltip: `Set the maximum storage percentage the device is allowed to store. The default is "80" (30~90). The oldest recordings will be deleted when the threshold is reached.`,
        type: "text",
        defaultValue: "80",
      },
      {
        name: "recPreservationDuration",
        label: "Rec Preservation Duration",
        tooltip: `Set the maximum numbers of days that recordings should be retained. The default is "0".`,
        type: "text",
        defaultValue: "0",
      },
    ],
  },
  {
    title: "Logs Auto Cleanup",
    fields: [
      {
        name: "maxLogSize",
        label: "Max Size of Total Logs",
        tooltip: `Limit the max size of each log. The default size is 50 MB, 0 for no limitation. The older logs will be deleted when the threshold is reached.`,
        type: "text",
        defaultValue: "50",
      },
      {
        name: "logsPreservationDuration",
        label: "Logs Preservation Duration",
        tooltip: `Set the maximum numbers of days that logs should be retained. The default is "7". "0" for no limitation.`,
        type: "text",
        defaultValue: "7",
      },
      { name: "maxLogs", label: "Max Number of Logs", 
        tooltip: `The maximum number of log files saved per day. The default value is 3 and the minimum value is 1.`,
        type: "text", defaultValue: "3" },
        
    ],
  },
];

const BACKUP_FIELDS = [
  {
    name: "autoUploadFtp",
    label: "Auto Upload FTP",
    tooltip: `After configuring the FTP server, the recording file will be uploaded automatically. The default value is "No".`,
    type: "select",
    options: ["Yes", "No"],
    defaultValue: "Yes",
  },
  {
    name: "ftpAddress",
    label: "FTP Address",
    tooltip: `FTP server address, format is: (ftp://name:password@IP:port/) of (ftp://IP), if the port number is not filled int, it is the default port 21 and this value must be set, otherwise can not be save.`,
    type: "text",
    defaultValue: "192.168.0.57",
  },
  {
    name: "username",
    label: "Username",
    tooltip: `User name used on the FTP server.`,
    type: "text",
    defaultValue: "ftp-clixxo",
  },
  {
    name: "password",
    label: "Password",
    tooltip: `Password used on the FTP server.`,
    type: "password",
    defaultValue: "password",
  },
  {
    name: "uploadTime",
    label: "Upload Time",
    tooltip: `Real-time: upload at a fixed time point every day. If this value is enabled, you should set startup time. Uplaod the file at 00:00 by default.`,
    type: "radio",
    options: ["Real Time", "Timing"],
    defaultValue: "Real Time",
  },
  
  {
    name: "deleteSourceFile",
    label: "Delete Source File",
    tooltip: `After uploading, the original recording file will be deleted. The default value is "No".`,
    type: "select",
    options: ["Yes", "No"],
    defaultValue: "No",
  },
];

const buildInitialForm = (sections) => {
  const form = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      form[field.name] = field.defaultValue;
    });
  });
  return form;
};

const allAutoCleanupFields = AUTO_CLEANUP_SECTIONS.flatMap((s) => s.fields);
const autoCleanupInitial = buildInitialForm([{ fields: allAutoCleanupFields }]);
const backupsInitial = buildInitialForm([{ fields: BACKUP_FIELDS }]);

const Storage = () => {
  const [tab, setTab] = useState(0);
  const [autoCleanupForm, setAutoCleanupForm] = useState(autoCleanupInitial);
  const [backupsForm, setBackupsForm] = useState(backupsInitial);

  const handleAutoCleanupChange = (name, value) =>
    setAutoCleanupForm((prev) => ({ ...prev, [name]: value }));

  const handleBackupsChange = (name, value) =>
    setBackupsForm((prev) => ({ ...prev, [name]: value }));

  const renderTextField = (value, onChange, type = "text") => (
    <TextField
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      variant="outlined"
      inputProps={{
        style: {
          fontSize: 13,
          height: 32,
          padding: "0 8px",
          boxSizing: "border-box",
        },
      }}
      sx={modalTextFieldSx}
    />
  );

  const renderSelect = (value, onChange, options) => (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      variant="outlined"
      sx={modalSelectSx}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  );

  const renderRadio = (value, onChange, options) => (
    <RadioGroup row value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <FormControlLabel
          key={opt}
          value={opt}
          control={
            <Radio
              size="small"
              sx={{
                color: OUTLINED_BORDER,
                "&.Mui-checked": { color: OUTLINED_FOCUS },
              }}
            />
          }
          label={opt}
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: 13,
              color: C.labelText,
            },
          }}
        />
      ))}
    </RadioGroup>
  );

  const renderField = (field, form, onChange) => {
    const value = form[field.name] ?? "";
  
    if (field.name === "startHour" || field.name === "startMinute") {
      return (
        <FormFieldRow
          key={field.name}
          label={field.name === "startMinute" ? "" : field.label}
          required
          labelWidth={field.name === "startMinute" ? 0 : 320}
        >
          <div style={{ width: 60 }}>
            {renderSelect(
              value,
              (v) => onChange(field.name, v),
              field.options
            )}
          </div>
        </FormFieldRow>
      );
    }
  
    return (
      <FormFieldRow
        key={field.name}
        label={field.label}
        tooltip={field.tooltip}
        required
      >
        {field.type === "select"
          ? renderSelect(value, (v) => onChange(field.name, v), field.options)
          : field.type === "radio"
            ? renderRadio(value, (v) => onChange(field.name, v), field.options)
            : renderTextField(value, (v) => onChange(field.name, v), field.type)}
      </FormFieldRow>
    );
  };

  return (
    <StoragePageShell>
      <StorageBreadcrumb />

      <div style={storageCardShellStyle}>
        <div style={storageTableContainerStyle}>
          <div style={storageToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
            Storage

            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn variant="cancel" style={storageFormBtnStyle}>
                Refresh
              </Btn>
              <Btn variant="primary" style={storageFormBtnStyle}>
                Save
              </Btn>
            </div>
          </div>

          <div style={storageTabBarStyle}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              TabIndicatorProps={{
                style: { backgroundColor: C.accent, height: 2 },
              }}
              sx={storageTabsSx}
            >
              <Tab label="Auto Cleanup" />
              <Tab label="Backups" />
            </Tabs>
          </div>

          {tab === 0 && (
            <div style={storageDashboardGridStyle}>
              <div style={storageDashboardColumnStyle}>
                {AUTO_CLEANUP_SECTIONS.slice(0, 2).map((section, idx) => (
                  <div key={section.title}>
                    <SectionHeading title={section.title} isFirst={idx === 0} />
                    <div style={storageFieldGroupStyle}>
                      {section.fields.map((field) =>
                        renderField(
                          field,
                          autoCleanupForm,
                          handleAutoCleanupChange,
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={storageDashboardDividerStyle} aria-hidden="true" />

              <div style={storageDashboardColumnStyle}>
                {AUTO_CLEANUP_SECTIONS.slice(2).map((section, idx) => (
                  <div key={section.title}>
                    <SectionHeading title={section.title} isFirst={idx === 0} />
                    <div style={storageFieldGroupStyle}>
                      {section.fields.map((field) =>
                        renderField(
                          field,
                          autoCleanupForm,
                          handleAutoCleanupChange,
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 1 && (
            <div style={storageSingleColumnStyle}>
              <SectionHeading title="Record Backup" isFirst />
              <div style={storageFieldGroupStyle}>
                {BACKUP_FIELDS.map((field) => (
                  <React.Fragment key={field.name}>
                    {renderField(field, backupsForm, handleBackupsChange)}

                    {field.name === "uploadTime" &&
                      backupsForm.uploadTime === "Timing" && (
                        <FormFieldRow label="Start Time" required>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Select
                              size="small"
                              value={backupsForm.startHour || "00"}
                              onChange={(e) =>
                                handleBackupsChange("startHour", e.target.value)
                              }
                              sx={{ ...storageCompactSelectSx, width: 56 }}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <MenuItem
                                  key={i}
                                  value={String(i).padStart(2, "0")}
                                  sx={{ fontSize: 13 }}
                                >
                                  {String(i).padStart(2, "0")}
                                </MenuItem>
                              ))}
                            </Select>

                            <span
                              style={{
                                fontWeight: 600,
                                color: C.labelText,
                              }}
                            >
                              :
                            </span>

                            <Select
                              size="small"
                              value={backupsForm.startMinute || "00"}
                              onChange={(e) =>
                                handleBackupsChange(
                                  "startMinute",
                                  e.target.value,
                                )
                              }
                              sx={{ ...storageCompactSelectSx, width: 56 }}
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <MenuItem
                                  key={i}
                                  value={String(i).padStart(2, "0")}
                                  sx={{ fontSize: 13 }}
                                >
                                  {String(i).padStart(2, "0")}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                        </FormFieldRow>
                      )}
                  </React.Fragment>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: 4,
                }}
              >
                <Btn variant="primary" style={storageFormBtnStyle}>
                  FTP Test
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </StoragePageShell>
  );
};

export default Storage;
