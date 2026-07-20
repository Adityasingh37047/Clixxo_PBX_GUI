import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TH, tdStyle } from "../../../components/common/tableKit";
import { ExtensionBreadcrumb as StorageBreadcrumb } from "../../../components/common";
import { useEffect } from "react";
import { getStorageUsage,
  getStorageSettings,
  updateStorageSettings,
  resetStorageSettings,

 } from "../../../api/apiService";
import {
  TextField,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  STORAGE_PAGE_BREADCRUMB_ROOT,
  STORAGE_PAGE_BREADCRUMB_SECTION,
  STORAGE_PAGE_TITLE,
  STORAGE_TAB_AUTO_CLEANUP_ID,
  STORAGE_TAB_BACKUPS_ID,
  STORAGE_TABS,
  STORAGE_SECTION_RECORD_BACKUP,
  STORAGE_BTN_SAVE,
  STORAGE_BTN_REFRESH,
  STORAGE_BTN_FTP_TEST,
  STORAGE_SECTION_HEADING_LEFT,
  STORAGE_AUTO_CLEANUP_SECTIONS,
  STORAGE_BACKUP_FIELDS,
  STORAGE_LABEL_START_TIME,
  STORAGE_TAB_STATUS_ID,
  STORAGE_SECTION_STATUS,
  STORAGE_SECTION_DEVICES,
  STORAGE_STATUS_COL_COUNT,
  STORAGE_STATUS_COL_SIZE,
  STORAGE_TABLE_COL_STORAGE,
  STORAGE_TABLE_COL_TOTAL_CAPACITY,
  STORAGE_TABLE_COL_USED_SPACE,
  STORAGE_TABLE_COL_AVAILABLE_SPACE,
  STORAGE_TABLE_COL_USAGE,
  STORAGE_DEVICE_LOCAL_DISK,
  STORAGE_BTN_RESET,
} from "../../../constants/StorageConstants";

const STORAGE_COMPACT_MQ = "(max-width: 768px)";
const STORAGE_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
const STORAGE_LABEL_COL_WIDTH = 200;
const STORAGE_CONTROL_COL_WIDTH = 220;
const STORAGE_FIELD_COL_GAP = 8;
const STORAGE_BACKUP_LABEL_COL_WIDTH = 240;
const STORAGE_BACKUP_CONTROL_COL_WIDTH = 320;
const STORAGE_BACKUP_FIELD_COL_GAP = 12;

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
  sectionHeading: "#30415A",
};

const CARD_RADIUS = 4;
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
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    ...storageOutlinedInputRootSx,
    minHeight: 34,
    width: "100%",
    maxWidth: "100%",
  },
};

const STORAGE_STATUS_VALUE_COL_WIDTH = 200;
const STORAGE_STATUS_COL_GAP = 12;

const storageStatusTextFieldSx = {
  ...storageTextFieldSx,
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  "& .MuiOutlinedInput-root": {
    ...storageOutlinedInputRootSx,
    minHeight: 34,
    height: 34,
    width: "100%",
    maxWidth: "100%",
    backgroundColor: C.pageBg,
    "& fieldset": {
      borderColor: C.divider,
    },
    "&:hover fieldset": {
      borderColor: C.divider,
    },
    "&.Mui-focused": {
      boxShadow: "none",
    },
    "&.Mui-focused fieldset": {
      borderColor: C.divider,
      borderWidth: "1px",
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: C.divider,
      borderWidth: "1px",
    },
  },
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: C.divider,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: C.divider,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: C.divider,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: C.pageBg,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.35,
    padding: "8px 12px",
    color: C.valueText,
    cursor: "default",
  },
};

const storageStatusGridStyle = (labelColWidth) => ({
  display: "grid",
  gridTemplateColumns: `${labelColWidth}px ${STORAGE_STATUS_VALUE_COL_WIDTH}px ${STORAGE_STATUS_VALUE_COL_WIDTH}px`,
  columnGap: STORAGE_STATUS_COL_GAP,
  alignItems: "center",
  width: "100%",
  minWidth: 0,
});

const storageStatusLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const storageStatusColHeaderStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.35,
  paddingLeft: 12,
  boxSizing: "border-box",
};

const storageStatusRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: STORAGE_STATUS_COL_GAP,
  width: "100%",
  minWidth: 0,
};

const modalSelectSx = {
  ...storageSelectSx,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

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
    tabActive: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    tabInactive: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
      fontWeight: 600,
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
      tabActive: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      tabInactive: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
      tabActive: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      tabInactive: "#d1d9e6",
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
        borderRadius: 4,
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
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const advancedFormInlineFooterStyle = {
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
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";
const SETTINGS_FIELDS_STACK_GAP = 12;
const SETTINGS_COLUMN_GAP = 12;
const SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";
const STORAGE_FORM_PAD_X = 28;

const SectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(STORAGE_LAPTOP_NARROW_MQ);
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : SETTINGS_SECTION_HEADING_FIRST_MARGIN
        : SETTINGS_SECTION_HEADING_NEXT_MARGIN,
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />

    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : STORAGE_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
  );
};


const storagePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const storagePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
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

const storageHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const storageTabButtonsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

const storageHeaderBtnStyle = {
  height: 30,
  minWidth: 0,
  width: "auto",
  fontSize: 12,
  padding: "0 12px",
  lineHeight: "30px",
  boxSizing: "border-box",
};

const storageHeaderTabBtnStyle = {
  ...storageHeaderBtnStyle,
  width: 110,
  minWidth: 110,
};

const storageBackupActionBtnStyle = {
  ...storageHeaderBtnStyle,
  minWidth: 88,
};

const storageDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  minWidth: 0,
  alignItems: "stretch",
  alignContent: "start",
  minHeight: "100%",
});

const storageDashboardColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_COLUMN_GAP,
  minWidth: 0,
  overflow: "hidden",
  padding: isCompact
    ? `16px ${STORAGE_FORM_PAD_X}px 20px`
    : SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
  boxSizing: "border-box",
});

const storageDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const storageDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const storageDashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  gap: 0,
};

const storageFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_FIELDS_STACK_GAP,
  width: "100%",
  minWidth: 0,
};

const STORAGE_BACKUP_CONTENT_MAX_WIDTH =
  STORAGE_BACKUP_LABEL_COL_WIDTH +
  STORAGE_BACKUP_FIELD_COL_GAP +
  STORAGE_BACKUP_CONTROL_COL_WIDTH;

const storageSingleColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_COLUMN_GAP,
  minWidth: 0,
  overflow: "hidden",
  padding: isCompact
    ? `16px ${STORAGE_FORM_PAD_X}px 20px`
    : SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
  boxSizing: "border-box",
});

const storageBackupContentStyle = {
  width: "100%",
  maxWidth: STORAGE_BACKUP_CONTENT_MAX_WIDTH,
  margin: "0 0 20px 0",
};

const storageDevicesTableShellStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  background: C.cardBg,
};

const getStorageDeviceRowBg = (idx) =>
  idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const StorageTableTD = ({
  children,
  isLastCol = false,
  isLastRow = false,
  rowBg,
}) => (
  <td
    style={{
      ...tdStyle,
      background: rowBg,
      ...(isLastRow ? { borderBottom: "none" } : {}),
      borderRight: isLastCol ? "none" : `1px solid ${C.divider}`,
    }}
  >
    {children}
  </td>
);

const StorageDevicesTable = ({ disk }) => {
  console.log("StorageDevicesTable disk:", disk);

  const rowBg = getStorageDeviceRowBg(0);

  return (
    <div style={storageDevicesTableShellStyle}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "auto",
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            <TH>{STORAGE_TABLE_COL_STORAGE}</TH>
            <TH>{STORAGE_TABLE_COL_TOTAL_CAPACITY}</TH>
            <TH>{STORAGE_TABLE_COL_USED_SPACE}</TH>
            <TH>{STORAGE_TABLE_COL_AVAILABLE_SPACE}</TH>
            <TH style={{ borderRight: "none" }}>
              {STORAGE_TABLE_COL_USAGE}
            </TH>
          </tr>
        </thead>

        <tbody>
          <tr
            style={{
              background: rowBg,
              transition: "background 0.15s ease",
            }}
          >
            <StorageTableTD rowBg={rowBg} isLastRow>
              {STORAGE_DEVICE_LOCAL_DISK}
            </StorageTableTD>

            <StorageTableTD rowBg={rowBg} isLastRow>
              {disk?.total?.human || "-"}
            </StorageTableTD>

            <StorageTableTD rowBg={rowBg} isLastRow>
              {disk?.used?.human || "-"}
            </StorageTableTD>

            <StorageTableTD rowBg={rowBg} isLastRow>
              {disk?.avail?.human || "-"}
            </StorageTableTD>

            <StorageTableTD rowBg={rowBg} isLastCol isLastRow>
              {disk?.used_pct !== undefined ? `${disk.used_pct}%` : "-"}
            </StorageTableTD>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
const StoragePageShell = ({ children }) => (
  <div style={storagePageWrapStyle} data-native-scroll>
    <div style={storagePageInnerStyle}>{children}</div>
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






const StorageFieldRow = ({
  label,
  tooltip,
  required = false,
  labelColWidth = STORAGE_LABEL_COL_WIDTH,
  controlColWidth = STORAGE_CONTROL_COL_WIDTH,
  fieldColGap = STORAGE_FIELD_COL_GAP,
  children,
}) => {
  const labelNode = (
    <label
      style={{
        fontSize: 12,
        color: C.labelText,
        fontWeight: 600,
        width: "100%",
        minWidth: 0,
        lineHeight: 1.35,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
      {required && <span style={{ color: C.errorRed }}> *</span>}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: controlColWidth,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 2,
  };

  const controlSlotStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: controlColWidth,
    minWidth: controlColWidth,
    maxWidth: controlColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: fieldColGap,
      }}
    >
      {label ? (
        <div style={labelWrapStyle}>
          {tooltip ? (
            <Tooltip title={tooltip} {...tooltipProps}>
              {labelNode}
            </Tooltip>
          ) : (
            labelNode
          )}
        </div>
      ) : null}

      <div style={valueColStyle}>
        <div style={controlSlotStyle}>{children}</div>
      </div>
    </div>
  );
};
const buildInitialForm = (sections) => {
  const form = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      form[field.name] = field.defaultValue;
    });
  });
  return form;
};

const allAutoCleanupFields = STORAGE_AUTO_CLEANUP_SECTIONS.flatMap((s) => s.fields);
const autoCleanupInitial = buildInitialForm([{ fields: allAutoCleanupFields }]);
const backupsInitial = buildInitialForm([{ fields: STORAGE_BACKUP_FIELDS }]);

const Storage = () => {
  const isCompact = useMediaQuery(STORAGE_COMPACT_MQ);

  const labelColWidth = isCompact ? 160 : STORAGE_LABEL_COL_WIDTH;

  const backupLabelColWidth = isCompact
    ? 180
    : STORAGE_BACKUP_LABEL_COL_WIDTH;

  const backupControlColWidth = isCompact
    ? 240
    : STORAGE_BACKUP_CONTROL_COL_WIDTH;

  const backupFieldRowOptions = {
    labelColWidth: backupLabelColWidth,
    controlColWidth: backupControlColWidth,
    fieldColGap: STORAGE_BACKUP_FIELD_COL_GAP,
  };
  const [storageStatus, setStorageStatus] = useState({
    cdr: {
      count: "",
      size: "",
    },
  
    voicemail: {
      count: "",
      size: "",
    },
  
    recordings: {
      count: "",
      size: "",
    },
  
    disk: {
      total: {
        human: "",
      },
      used: {
        human: "",
      },
      avail: {
        human: "",
      },
      used_pct: "",
    },
  });
  const [activeTab, setActiveTab] = useState(STORAGE_TAB_STATUS_ID);
  const [autoCleanupForm, setAutoCleanupForm] = useState(autoCleanupInitial);
  const [backupsForm, setBackupsForm] = useState(backupsInitial);
  const [errors, setErrors] = useState({}); 

  const loadStorageUsage = async () => {
    try {
      const res = await getStorageUsage();
  
      console.log("FULL RESPONSE:", res);
  
      const data = res.message;
  
      setStorageStatus({
        cdr: {
          count: data.cdr.count,
          size: data.cdr.size.human,
        },
  
        voicemail: {
          count: data.voicemail.files,
          size: data.voicemail.size.human,
        },
  
        recordings: {
          count: data.recordings.count,
          size: data.recordings.size.human,
        },
  
        disk: data.disk,
      });
    } catch (err) {
      console.error("Storage Usage Error:", err);
    }
  };

// AUTO CLEANUP FUNCTIONS
const loadStorageSettings = async () => {
  try {
    const res = await getStorageSettings();

    console.log("Storage Settings:", res);

    const data = res.message;

    setAutoCleanupForm({
      maxCdr: data.cdr_max_count,
      cdrPreservationDuration: data.cdr_max_days,

      maxVoicemailFiles: data.vm_max_files,
      voicemailPreservationDuration: data.vm_max_days,

      maxDeviceUsage: data.rec_max_usage_pct,
      recPreservationDuration: data.rec_max_days,

      maxLogSize: data.log_max_size_mb,
      logsPreservationDuration: data.log_max_days,

      maxLogs: data.log_max_per_day,
    });
    
    setErrors({});
  } catch (err) {
    console.error(err);
  }
};



const handleRefresh = async () => {
  if (activeTab === STORAGE_TAB_STATUS_ID) {
    await loadStorageUsage();
  } else if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
    await loadStorageSettings();
  }
};
  useEffect(() => {
    if (activeTab === STORAGE_TAB_STATUS_ID) {
      loadStorageUsage();
    }

  if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
    loadStorageSettings();
  }
  }, [activeTab]);

  const handleSaveStorageSettings = async () => {
    const newErrors = {};
    if (
      Number(autoCleanupForm.maxDeviceUsage) < 30 ||
      Number(autoCleanupForm.maxDeviceUsage) > 90
    ) {
      newErrors.maxDeviceUsage =
        "Value must be between 30 and 90.";
    }
  
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    
    
    try {
      const payload = {
        cdr_max_count: autoCleanupForm.maxCdr,
        cdr_max_days: autoCleanupForm.cdrPreservationDuration,
  
        vm_max_files: autoCleanupForm.maxVoicemailFiles,
        vm_max_days: autoCleanupForm.voicemailPreservationDuration,
  
        rec_max_usage_pct: autoCleanupForm.maxDeviceUsage,
        rec_max_days: autoCleanupForm.recPreservationDuration,
  
        log_max_size_mb: autoCleanupForm.maxLogSize,
        log_max_days: autoCleanupForm.logsPreservationDuration,
  
        log_max_per_day: autoCleanupForm.maxLogs,
      };
  
      console.log("Save Payload:", payload);
  
      const res = await updateStorageSettings(payload);

      console.log("Save Response:", res);
      
      setErrors({}); 
      
      loadStorageSettings();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };
  const handleResetStorageSettings = async () => {
    try {
      const res = await resetStorageSettings();
  
      console.log("Reset Response:", res);
  
      await loadStorageSettings();
    } catch (err) {
      console.error("Reset Error:", err);
    }
  };

  const handleAutoCleanupChange = (name, value) =>
    setAutoCleanupForm((prev) => ({ ...prev, [name]: value }));

  const handleBackupsChange = (name, value) =>
    setBackupsForm((prev) => ({ ...prev, [name]: value }));

  const renderTextField = (
    value,
    onChange,
    type = "text",
    max = null
  ) => (
    <TextField
      type={type}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
  
        if (max === null || val === "" || Number(val) <= max) {
          onChange(val);
        }
      }}
      size="small"
      fullWidth
      variant="outlined"
      inputProps={{
        min: 0,
        max,
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

  const renderField = (field, form, onChange, rowOptions = {}) => {
    const value = form[field.name] ?? "";
    const fieldRowProps = {
      labelColWidth: rowOptions.labelColWidth ?? labelColWidth,
      controlColWidth: rowOptions.controlColWidth ?? STORAGE_CONTROL_COL_WIDTH,
      fieldColGap: rowOptions.fieldColGap ?? STORAGE_FIELD_COL_GAP,
    };

    if (field.name === "startHour" || field.name === "startMinute") {
      return (
        <StorageFieldRow
          key={field.name}
          label={field.name === "startMinute" ? "" : field.label}
          required
          {...fieldRowProps}
        >
          <div style={{ width: "100%" }}>
            {renderSelect(
              value,
              (v) => onChange(field.name, v),
              field.options,
            )}
          </div>
        </StorageFieldRow>
      );
    }

    return (
      <StorageFieldRow
        key={field.name}
        label={field.label}
        tooltip={field.tooltip}
        required
        {...fieldRowProps}
      >
        {field.type === "select"
          ? renderSelect(value, (v) => onChange(field.name, v), field.options)
          : field.type === "radio"
            ? renderRadio(value, (v) => onChange(field.name, v), field.options)
            : (
              <div style={{ position: "relative", width: "100%" }}>
              {errors[field.name] && (
                <div
                  style={{
                    position: "absolute",
                    top: -18,
                    left: 0,
                    color: C.errorRed,
                    fontSize: 11,
                  }}
                >
                  {errors[field.name]}
                </div>
              )}
            
            
                {renderTextField(
                  value,
                  (v) => onChange(field.name, v),
                  field.type,
                  field.max
                )}
              </div>
            )}
      </StorageFieldRow>
    );
  };

  return (
    <StoragePageShell>
      <StorageBreadcrumb
        root={STORAGE_PAGE_BREADCRUMB_ROOT}
        section={STORAGE_PAGE_BREADCRUMB_SECTION}
        current={STORAGE_PAGE_TITLE}
      />

      <div style={storageTableContainerStyle}>
          <div style={storageHeaderStyle}>
            <div style={storageTabButtonsStyle}>
              {STORAGE_TABS.map((tabItem) => (
                <Btn
                  key={tabItem.id}
                  type="button"
                  variant={
                    activeTab === tabItem.id ? "tabActive" : "tabInactive"
                  }
                  onClick={() => setActiveTab(tabItem.id)}
                  style={storageHeaderTabBtnStyle}
                >
                  {tabItem.label}
                </Btn>
              ))}
            </div>
            <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  }}
>
  {/* Status Tab */}
  {activeTab === STORAGE_TAB_STATUS_ID && (
    <Btn
      variant="cancel"
      type="button"
      style={storageHeaderBtnStyle}
      onClick={handleRefresh}
    >
      {STORAGE_BTN_REFRESH}
    </Btn>
  )}

  {/* Auto Cleanup Tab */}
  {activeTab === STORAGE_TAB_AUTO_CLEANUP_ID && (
    <>
      <Btn
        variant="cancel"
        type="button"
        style={storageHeaderBtnStyle}
        onClick={handleRefresh}
      >
        {STORAGE_BTN_REFRESH}
      </Btn>

      <Btn
        variant="cancel"
        type="button"
        style={storageHeaderBtnStyle}
        onClick={handleResetStorageSettings}
      >
        {STORAGE_BTN_RESET}
      </Btn>
    </>
  )}
</div>
          </div>

          <div style={{ padding: 0, boxSizing: "border-box" }}>
          <form
            id="storage-settings-form"
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col"
            style={{ width: "100%" }}
          >
            {activeTab === STORAGE_TAB_STATUS_ID && (
              <div style={storageSingleColumnStyle(isCompact)}>
                <div style={storageBackupContentStyle}>
                  <SectionHeading title={STORAGE_SECTION_STATUS} isFirst />

                  <div style={storageStatusRowsStyle}>
                    <div style={storageStatusGridStyle(labelColWidth)}>
                      <div />
                      <div style={storageStatusColHeaderStyle}>
                        {STORAGE_STATUS_COL_COUNT}
                      </div>
                      <div style={storageStatusColHeaderStyle}>
                        {STORAGE_STATUS_COL_SIZE}
                      </div>
                    </div>

                    <div style={storageStatusGridStyle(labelColWidth)}>
                      <div style={storageStatusLabelStyle}>CDR</div>
                      <TextField
                        size="small"
                        value={storageStatus.cdr.count}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                      <TextField
                        size="small"
                        value={storageStatus.cdr.size}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                    </div>

                    <div style={storageStatusGridStyle(labelColWidth)}>
                      <div style={storageStatusLabelStyle}>Voicemail</div>
                      <TextField
                        size="small"
                        value={storageStatus.voicemail.count}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                      <TextField
                        size="small"
                        value={storageStatus.voicemail.size}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                    </div>

                    <div style={storageStatusGridStyle(labelColWidth)}>
                      <div style={storageStatusLabelStyle}>Recordings</div>
                      <TextField
                        size="small"
                        value={storageStatus.recordings.count}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                      <TextField
                        size="small"
                        value={storageStatus.recordings.size}
                        InputProps={{ readOnly: true }}
                        sx={storageStatusTextFieldSx}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-0" style={{ width: "100%" }}>
                  <SectionHeading title={STORAGE_SECTION_DEVICES} />
                  <div style={{ overflowX: "auto" }}>
                    <StorageDevicesTable disk={storageStatus.disk} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === STORAGE_TAB_AUTO_CLEANUP_ID && (
              <div
                className="settings-dashboard-grid"
                style={storageDashboardGridStyle(isCompact)}
              >
                <div style={storageDashboardColumnStyle(isCompact)}>
                  <div style={storageDashboardFieldsStackStyle}>
                    {STORAGE_AUTO_CLEANUP_SECTIONS.slice(0, 3).map(
                      (section, idx) => (
                        <React.Fragment key={section.title}>
                          <SectionHeading
                            title={section.title}
                            isFirst={idx === 0}
                          />
                          <div style={storageFieldGroupStyle}>
                            {section.fields.map((field) =>
                              renderField(
                                field,
                                autoCleanupForm,
                                handleAutoCleanupChange,
                              ),
                            )}
                          </div>
                        </React.Fragment>
                      ),
                    )}
                  </div>
                </div>

                {!isCompact && (
                  <div
                    className="settings-dashboard-divider"
                    style={storageDashboardDividerCellStyle}
                    aria-hidden="true"
                  >
                    <div style={storageDashboardDividerLineStyle} />
                  </div>
                )}

                <div style={storageDashboardColumnStyle(isCompact)}>
                  <div style={storageDashboardFieldsStackStyle}>
                    {STORAGE_AUTO_CLEANUP_SECTIONS.slice(3).map(
                      (section, idx) => (
                        <React.Fragment key={section.title}>
                          <SectionHeading
                            title={section.title}
                            isFirst={idx === 0}
                          />
                          <div style={storageFieldGroupStyle}>
                            {section.fields.map((field) =>
                              renderField(
                                field,
                                autoCleanupForm,
                                handleAutoCleanupChange,
                              ),
                            )}
                          </div>
                        </React.Fragment>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === STORAGE_TAB_BACKUPS_ID && (
              <div style={storageSingleColumnStyle(isCompact)}>
                <div style={storageBackupContentStyle}>
                  <SectionHeading
                    title={STORAGE_SECTION_RECORD_BACKUP}
                    isFirst
                  />
                  <div style={storageFieldGroupStyle}>
                    {STORAGE_BACKUP_FIELDS.map((field) => (
                      <React.Fragment key={field.name}>
                        {renderField(
                          field,
                          backupsForm,
                          handleBackupsChange,
                          backupFieldRowOptions,
                        )}

                        {field.name === "uploadTime" &&
                          backupsForm.uploadTime === "Timing" && (
                            <StorageFieldRow
                              label={STORAGE_LABEL_START_TIME}
                              required
                              {...backupFieldRowOptions}
                            >
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
                                    handleBackupsChange(
                                      "startHour",
                                      e.target.value,
                                    )
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
                            </StorageFieldRow>
                          )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 14,
                    }}
                  >
                    <Btn variant="primary" style={storageBackupActionBtnStyle}>
                      {STORAGE_BTN_FTP_TEST}
                    </Btn>
                  </div>
                </div>
              </div>
            )}
          </form>
          </div>

          {activeTab !== STORAGE_TAB_STATUS_ID && (
  <div style={advancedFormInlineFooterStyle}>
    <Btn
      variant="primary"
      type="submit"
      form="storage-settings-form"
      onClick={handleSaveStorageSettings}
      style={storageFormBtnStyle}
    >
      {STORAGE_BTN_SAVE}
    </Btn>
  </div>
)}
        </div>
    </StoragePageShell>
  );
};

export default Storage;
