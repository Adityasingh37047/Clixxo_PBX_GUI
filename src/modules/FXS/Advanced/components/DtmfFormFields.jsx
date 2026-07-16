import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Checkbox, Tooltip } from "@mui/material";
import {
  DTMF_DETECTOR_TAB,
  DTMF_FIELD_TOOLTIPS,
  DTMF_GENERATOR_TAB,
  DTMF_GENERATOR_WARNING,
  DTMF_PAGE_BREADCRUMB_SECTION,
  DTMF_PAGE_TITLE,
  DTMF_TAB_DETECTOR,
  DTMF_TAB_GENERATOR,
} from "../../../../constants/DtmfConstants";
import { Btn } from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  dtmfFieldBg,
  dtmfHeaderLeftStyle,
  dtmfHeaderStyle,
  dtmfNoteStyle,
  dtmfPageInnerStyle,
  dtmfPageWrapStyle,
  dtmfTabBtnStyle,
} from "./DtmfTableHelpers";

export const FIELD_LABEL_COLOR = "#3E5475";

export const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

export const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const FIELD_RADIUS = 8;
const FIELD_CONTROL_WIDTH = 220;
const FIELD_CONTROL_HEIGHT = 36;

export const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

export const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

export const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const nativeFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: FIELD_CONTROL_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: dtmfFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const dtmfCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const DtmfBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={DTMF_PAGE_BREADCRUMB_SECTION}
    current={DTMF_PAGE_TITLE}
  />
);

export const DtmfPageShell = ({ children }) => (
  <div style={dtmfPageWrapStyle} data-native-scroll>
    <div style={dtmfPageInnerStyle}>{children}</div>
  </div>
);

export const DtmfFieldRow = ({ label, tooltipKey, children, isLongLabel = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      width: "100%",
      minHeight: 36,
      alignItems: isLongLabel ? "flex-start" : "center",
      paddingTop: isLongLabel ? 8 : 0,
      paddingBottom: isLongLabel ? 8 : 0,
      marginBottom: 10,
    }}
  >
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 24,
        textAlign: "left",
        lineHeight: 1.45,
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={DTMF_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </div>
    <div
      style={{
        flex: "0 0 auto",
        width: FIELD_CONTROL_WIDTH,
        maxWidth: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </div>
  </div>
);

export const DtmfTabBar = ({ activeTab, onTabChange }) => (
  <div style={dtmfHeaderStyle}>
    <div style={dtmfHeaderLeftStyle}>
      <Btn
        type="button"
        variant={activeTab === DTMF_TAB_DETECTOR ? "tabActive" : "tabInactive"}
        onClick={() => onTabChange(DTMF_TAB_DETECTOR)}
        style={dtmfTabBtnStyle}
      >
        {DTMF_DETECTOR_TAB}
      </Btn>
      <Btn
        type="button"
        variant={activeTab === DTMF_TAB_GENERATOR ? "tabActive" : "tabInactive"}
        onClick={() => onTabChange(DTMF_TAB_GENERATOR)}
        style={dtmfTabBtnStyle}
      >
        {DTMF_GENERATOR_TAB}
      </Btn>
    </div>
  </div>
);

const renderTextField = (
  label,
  fieldName,
  formData,
  handleInputChange,
  handleKeyPress,
  handleKeyPressInteger,
  allowDecimal = false,
) => (
  <DtmfFieldRow
    key={fieldName}
    label={label}
    tooltipKey={fieldName}
    isLongLabel={label.length > 42}
  >
    <input
      id={fieldName}
      type="text"
      value={formData[fieldName]}
      onChange={(e) => handleInputChange(fieldName, e.target.value)}
      onKeyPress={(e) =>
        allowDecimal ? handleKeyPress(e, true) : handleKeyPressInteger(e)
      }
      style={nativeFieldInputStyle}
      maxLength={20}
      {...nativeFieldInteraction}
    />
  </DtmfFieldRow>
);

const renderCheckboxField = (
  label,
  fieldName,
  formData,
  handleCheckboxChange,
) => (
  <DtmfFieldRow key={fieldName} label={label} tooltipKey={fieldName}>
    <Checkbox
      id={fieldName}
      name={fieldName}
      size="small"
      checked={!!formData[fieldName]}
      onChange={() => handleCheckboxChange(fieldName)}
      sx={dtmfCheckboxSx}
    />
  </DtmfFieldRow>
);

const renderAdvancedEnergyField = (
  label,
  lowField,
  highField,
  formData,
  handleInputChange,
  handleKeyPress,
  handleKeyPressInteger,
) => (
  <React.Fragment key={lowField}>
    {renderTextField(
      label,
      lowField,
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
      true,
    )}
    {renderTextField(
      label.replace("Low Hz", "High Hz"),
      highField,
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
      true,
    )}
  </React.Fragment>
);

export const DtmfDetectorSection = ({
  formData,
  handleInputChange,
  handleCheckboxChange,
  handleKeyPress,
  handleKeyPressInteger,
}) => (
  <>
    {renderTextField(
      "Energy Difference of High-freq minus Low-freq (dB)",
      "positiveTwist",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderTextField(
      "Energy Difference of Low-freq minus High-freq (dB)",
      "negativeTwist",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderTextField(
      "Minimum Duration at ON (ms)",
      "minDuration",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderTextField(
      "Minimum Duration at OFF (ms)",
      "minNegativeDuration",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderTextField(
      "Ratio of DT Energy(%)",
      "energyRatio",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
      true,
    )}
    {renderTextField(
      "Lowest Energy Threshold (dB)",
      "levelMinIn",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderCheckboxField(
      "DTMF Display via Channel Status",
      "enableDisplayDtmf",
      formData,
      handleCheckboxChange,
    )}
    {renderCheckboxField(
      "ABCD Detection",
      "enableOmitABCD",
      formData,
      handleCheckboxChange,
    )}
  </>
);

export const DtmfGeneratorSection = ({
  formData,
  handleInputChange,
  handleCheckboxChange,
  handleKeyPress,
  handleKeyPressInteger,
}) => (
  <>
    {renderCheckboxField(
      "DTMF Energy Advance Set",
      "dtmfEnergyAdvance",
      formData,
      handleCheckboxChange,
    )}

    {!formData.dtmfEnergyAdvance &&
      renderTextField(
        "DTMF Energy (dB)",
        "dtmfPlayEnergy",
        formData,
        handleInputChange,
        handleKeyPress,
        handleKeyPressInteger,
      )}

    {formData.dtmfEnergyAdvance && (
      <>
        {renderAdvancedEnergyField(
          "DTMF0 Low Hz Energy (dB)",
          "dtmfPlayEnergy0",
          "dtmfHighPlayEnergy0",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF1 Low Hz Energy (dB)",
          "dtmfPlayEnergy1",
          "dtmfHighPlayEnergy1",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF2 Low Hz Energy (dB)",
          "dtmfPlayEnergy2",
          "dtmfHighPlayEnergy2",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF3 Low Hz Energy (dB)",
          "dtmfPlayEnergy3",
          "dtmfHighPlayEnergy3",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF4 Low Hz Energy (dB)",
          "dtmfPlayEnergy4",
          "dtmfHighPlayEnergy4",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF5 Low Hz Energy (dB)",
          "dtmfPlayEnergy5",
          "dtmfHighPlayEnergy5",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF6 Low Hz Energy (dB)",
          "dtmfPlayEnergy6",
          "dtmfHighPlayEnergy6",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF7 Low Hz Energy (dB)",
          "dtmfPlayEnergy7",
          "dtmfHighPlayEnergy7",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF8 Low Hz Energy (dB)",
          "dtmfPlayEnergy8",
          "dtmfHighPlayEnergy8",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF9 Low Hz Energy (dB)",
          "dtmfPlayEnergy9",
          "dtmfHighPlayEnergy9",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF* Low Hz Energy (dB)",
          "dtmfPlayEnergy10",
          "dtmfHighPlayEnergy10",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
        {renderAdvancedEnergyField(
          "DTMF# Low Hz Energy (dB)",
          "dtmfPlayEnergy11",
          "dtmfHighPlayEnergy11",
          formData,
          handleInputChange,
          handleKeyPress,
          handleKeyPressInteger,
        )}
      </>
    )}

    {renderTextField(
      "Duration at ON (ms)",
      "dtmfTxHighDuration",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}
    {renderTextField(
      "Duration at OFF (ms)",
      "dtmfTxLowDuration",
      formData,
      handleInputChange,
      handleKeyPress,
      handleKeyPressInteger,
    )}

    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: 4,
      }}
    >
      <p style={dtmfNoteStyle}>{DTMF_GENERATOR_WARNING}</p>
    </div>
  </>
);
