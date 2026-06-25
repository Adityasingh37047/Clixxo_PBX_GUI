import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  cardBorder: "var(--border-strong)",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const SECTION_HEADING_COLOR = "#30415A";

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
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
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

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
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: "16px 0 24px -100px", // sabke liye same
      position: "relative",
      width: "calc(100% + 35px)",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);






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
    }}
  >
  <Tooltip
  title={tooltip || ""}
  arrow
  placement="top"
  disableHoverListener={!tooltip}
  slotProps={{
    tooltip: {
      sx: {
        bgcolor: "#ffffff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        maxWidth: 500,
      },
    },
    arrow: {
      sx: {
        color: "#ffffff",
      },
    },
  }}
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
    {required && <span style={{ color: C.amber }}> *</span>}
  </label>
</Tooltip>

    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
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
          control={<Radio size="small" />}
          label={opt}
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: 14,
              color: "#374151",
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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Storage</span>
        </div>

        <div
          style={{
            background: C.cardBg,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            border: `1.5px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: C.cardBg,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
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
              <Btn variant="cancel" style={{ height: 30, minWidth: 90 }}>
                Refresh
              </Btn>
              <Btn variant="primary" style={{ height: 30, minWidth: 90, fontSize: 12 }}>
                Save
              </Btn>
            </div>
          </div>

          <div
            style={{
              borderBottom: `1px solid ${C.cardBorder}`,
              background: C.cardBg,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              TabIndicatorProps={{ style: { backgroundColor: C.accent, height: 2 } }}
              sx={{
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
              }}
            >
              <Tab label="Auto Cleanup" />
              <Tab label="Backups" />
            </Tabs>
          </div>

          <div style={{ padding: "24px 32px 32px", boxSizing: "border-box" }}>
            {tab === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  maxWidth: 720,
                  margin: "0 auto",
                }}
              >
                {AUTO_CLEANUP_SECTIONS.map((section, idx) => (
                  <div key={section.title}>
                    <SectionHeading title={section.title} isFirst={idx === 0} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {section.fields.map((field) =>
                        renderField(field, autoCleanupForm, handleAutoCleanupChange),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  maxWidth: 720,
                  margin: "0 auto",
                }}
              >
                <SectionHeading title="Record Backup" isFirst />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                sx={{ width: 56 }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <MenuItem
                    key={i}
                    value={String(i).padStart(2, "0")}
                  >
                    {String(i).padStart(2, "0")}
                  </MenuItem>
                ))}
              </Select>

              <span style={{ fontWeight: 600 }}>:</span>

              <Select
                size="small"
                value={backupsForm.startMinute || "00"}
                onChange={(e) =>
                  handleBackupsChange("startMinute", e.target.value)
                }
                sx={{ width: 56 }}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <MenuItem
                    key={i}
                    value={String(i).padStart(2, "0")}
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
                    justifyContent: "center",
                    paddingTop: 8,
                  }}
                >
                  <Btn variant="primary" style={{ minWidth: 110, height: 33, fontSize: 13 }}>
                    FTP Test
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storage;
