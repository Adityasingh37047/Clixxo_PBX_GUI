import React from "react";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  TextField,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { TH, tdStyle } from "../../../../components/common/tableKit";
import {
  STORAGE_PAGE_BREADCRUMB_ROOT,
  STORAGE_PAGE_BREADCRUMB_SECTION,
  STORAGE_PAGE_TITLE,
  STORAGE_SECTION_RECORD_BACKUP,
  STORAGE_BTN_FTP_TEST,
  STORAGE_SECTION_HEADING_LEFT,
  STORAGE_AUTO_CLEANUP_SECTIONS,
  STORAGE_BACKUP_FIELDS,
  STORAGE_LABEL_START_TIME,
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
} from "../../../../constants/StorageConstants";
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
  getStorageDeviceRowBg,
  storagePageWrapStyle,
  storagePageInnerStyle,
  storageCardStyle,
  storageToolbarStyle,
  storageFormBtnStyle as storageFormBtnStyleFromCommon,
} from "./StorageTableHelpers";

export const storageFormBtnStyle = storageFormBtnStyleFromCommon;

export const STORAGE_COMPACT_MQ = "(max-width: 768px)";
export const STORAGE_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
export const STORAGE_LABEL_COL_WIDTH = 200;
export const STORAGE_CONTROL_COL_WIDTH = 220;
export const STORAGE_FIELD_COL_GAP = 8;
export const STORAGE_BACKUP_LABEL_COL_WIDTH = 240;
export const STORAGE_BACKUP_CONTROL_COL_WIDTH = 320;
export const STORAGE_BACKUP_FIELD_COL_GAP = 12;

const STORAGE_STATUS_VALUE_COL_WIDTH = 200;
const STORAGE_STATUS_COL_GAP = 12;
const SECTION_HEADING_COLOR = "#30415A";

const SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";
const SETTINGS_FIELDS_STACK_GAP = 12;
const SETTINGS_COLUMN_GAP = 12;
const SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";
const STORAGE_FORM_PAD_X = 28;

const STORAGE_BACKUP_CONTENT_MAX_WIDTH =
  STORAGE_BACKUP_LABEL_COL_WIDTH +
  STORAGE_BACKUP_FIELD_COL_GAP +
  STORAGE_BACKUP_CONTROL_COL_WIDTH;

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

export const advancedFormInlineFooterStyle = {
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

export const SectionHeading = ({ title, isFirst = false }) => {
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
          color: SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const storageTableContainerStyle = {
  ...storageCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const storageHeaderStyle = {
  ...storageToolbarStyle,
  width: "100%",
  boxSizing: "border-box",
};

export const storageTabButtonsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

export const storageHeaderBtnStyle = {
  height: 30,
  minWidth: 0,
  width: "auto",
  fontSize: 12,
  padding: "0 12px",
  lineHeight: "30px",
  borderRadius: 4,
  boxSizing: "border-box",
};

export const storageHeaderTabBtnStyle = {
  ...storageHeaderBtnStyle,
  width: 110,
  minWidth: 110,
};

const storageBackupActionBtnStyle = {
  ...storageHeaderBtnStyle,
  minWidth: 88,
};

export const storageDashboardGridStyle = (isCompact) => ({
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

export const storageDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const storageDashboardDividerLineStyle = {
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

export const StorageDevicesTable = ({ disk }) => {
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

export const StoragePageShell = ({ children }) => (
  <div style={storagePageWrapStyle} data-native-scroll>
    <div style={storagePageInnerStyle}>{children}</div>
  </div>
);

export const StorageBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={STORAGE_PAGE_BREADCRUMB_ROOT}
    section={STORAGE_PAGE_BREADCRUMB_SECTION}
    current={STORAGE_PAGE_TITLE}
  />
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

export const StorageFieldRow = ({
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

const renderTextField = (value, onChange, type = "text", max = null) => (
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

export const StorageFormField = ({
  field,
  form,
  onChange,
  errors = {},
  labelColWidth = STORAGE_LABEL_COL_WIDTH,
  controlColWidth = STORAGE_CONTROL_COL_WIDTH,
  fieldColGap = STORAGE_FIELD_COL_GAP,
}) => {
  const value = form[field.name] ?? "";
  const fieldRowProps = {
    labelColWidth,
    controlColWidth,
    fieldColGap,
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
          {renderSelect(value, (v) => onChange(field.name, v), field.options)}
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
                field.max,
              )}
            </div>
          )}
    </StorageFieldRow>
  );
};

export const StorageStatusPanel = ({
  isCompact,
  labelColWidth,
  storageStatus,
}) => (
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
);

export const StorageAutoCleanupPanel = ({
  isCompact,
  labelColWidth,
  autoCleanupForm,
  errors,
  onChange,
}) => (
  <div
    className="settings-dashboard-grid"
    style={storageDashboardGridStyle(isCompact)}
  >
    <div style={storageDashboardColumnStyle(isCompact)}>
      <div style={storageDashboardFieldsStackStyle}>
        {STORAGE_AUTO_CLEANUP_SECTIONS.slice(0, 3).map((section, idx) => (
          <React.Fragment key={section.title}>
            <SectionHeading title={section.title} isFirst={idx === 0} />
            <div style={storageFieldGroupStyle}>
              {section.fields.map((field) => (
                <StorageFormField
                  key={field.name}
                  field={field}
                  form={autoCleanupForm}
                  onChange={onChange}
                  errors={errors}
                  labelColWidth={labelColWidth}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
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
        {STORAGE_AUTO_CLEANUP_SECTIONS.slice(3).map((section, idx) => (
          <React.Fragment key={section.title}>
            <SectionHeading title={section.title} isFirst={idx === 0} />
            <div style={storageFieldGroupStyle}>
              {section.fields.map((field) => (
                <StorageFormField
                  key={field.name}
                  field={field}
                  form={autoCleanupForm}
                  onChange={onChange}
                  errors={errors}
                  labelColWidth={labelColWidth}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export const StorageBackupsPanel = ({
  isCompact,
  backupsForm,
  onChange,
  backupFieldRowOptions,
}) => (
  <div style={storageSingleColumnStyle(isCompact)}>
    <div style={storageBackupContentStyle}>
      <SectionHeading title={STORAGE_SECTION_RECORD_BACKUP} isFirst />
      <div style={storageFieldGroupStyle}>
        {STORAGE_BACKUP_FIELDS.map((field) => (
          <React.Fragment key={field.name}>
            <StorageFormField
              field={field}
              form={backupsForm}
              onChange={onChange}
              {...backupFieldRowOptions}
            />

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
                      onChange={(e) => onChange("startHour", e.target.value)}
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
                        onChange("startMinute", e.target.value)
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
);
