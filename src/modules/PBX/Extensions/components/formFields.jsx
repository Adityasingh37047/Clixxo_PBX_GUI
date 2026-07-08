// Extensions form-field kit: tooltip label, FieldRow, SectionCard, field styles,
// and the destination autocomplete. Consumed by the Basic/Features/Advanced tabs.
import React, { useState, useEffect } from "react";
import { Tooltip, TextField } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { EXTENSION_FIELD_TOOLTIPS } from "../../../../constants/ExtensionsConstants";
import {
  ExtensionModalSectionHeading,
  EXTENSION_MODAL_SECTION_BG,
  EXTENSION_MODAL_SECTION_HEADING_COLOR,
} from "../../../../components/common/modalKit";

// ── Field styles ──

const extensionOutlinedInputRootSx = {
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

const extensionModalTextFieldSx = {
  "& .MuiOutlinedInput-root": extensionOutlinedInputRootSx,
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

const extensionModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...extensionOutlinedInputRootSx,
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

const extensionGatedModalFieldSx = (
  enabled,
  baseSx = extensionModalSelectSx,
  enabledCursor = "pointer",
) => {
  const disabledBg = "#f1f5f9";
  const isTextFieldBase = Boolean(baseSx["& .MuiOutlinedInput-root"]);
  const outlinedRootSx = baseSx["& .MuiOutlinedInput-root"] || {};
  const outlinedInputSx = baseSx["& .MuiOutlinedInput-input"] || {};
  const selectSx = baseSx["& .MuiSelect-select"] || {};

  const disabledOutlineSx = !enabled
    ? {
        "&:hover fieldset": { borderColor: OUTLINED_BORDER },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: OUTLINED_BORDER,
        },
        "&.Mui-focused": { boxShadow: "none" },
      }
    : {};

  if (isTextFieldBase) {
    return {
      ...baseSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
      ...(!enabled && {
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: OUTLINED_BORDER,
        },
      }),
      "& .MuiOutlinedInput-root": {
        ...outlinedRootSx,
        backgroundColor: enabled ? "#fff" : disabledBg,
        cursor: enabled ? enabledCursor : "not-allowed",
        ...disabledOutlineSx,
      },
      "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
        ...outlinedInputSx,
        backgroundColor: enabled ? "#fff" : disabledBg,
        cursor: enabled ? enabledCursor : "not-allowed",
      },
      "&.Mui-disabled, & .MuiOutlinedInput-root.Mui-disabled": {
        cursor: "not-allowed",
        backgroundColor: disabledBg,
      },
    };
  }

  return {
    ...baseSx,
    backgroundColor: enabled ? "#fff" : disabledBg,
    cursor: enabled ? enabledCursor : "not-allowed",
    ...disabledOutlineSx,
    "& .MuiSelect-select": {
      ...selectSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
    },
    "&.Mui-disabled": {
      cursor: "not-allowed",
      backgroundColor: disabledBg,
    },
  };
};

// ── Tooltip label ──

const EXTENSION_FIELD_TOOLTIP_PROPS = {
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
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const formatExtensionTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>\s*/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (!normalized.includes("\n")) return normalized;

  const lines = normalized.split("\n");
  return (
    <span style={{ display: "block", lineHeight: 1.45, margin: 0 }}>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </React.Fragment>
      ))}
    </span>
  );
};

const ExtensionTooltipLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? EXTENSION_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );

  if (!tooltip) return labelNode;

  return (
    <Tooltip
      title={formatExtensionTooltipTitle(tooltip)}
      {...EXTENSION_FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

// ── FieldRow / ErrMsg ──

const FieldRow = ({
  label,
  children,
  wide = false,
  labelWidth = 130,
  tooltipKey,
}) => {
  const tooltip = tooltipKey ? EXTENSION_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelStyle = {
    fontSize: 13,
    color: C.labelText,
    fontWeight: 600,
    whiteSpace: "nowrap",
    textAlign: "left",
    width: labelWidth,
    flexShrink: 0,
    paddingTop: wide ? 4 : 0,
    cursor: tooltip ? "help" : undefined,
  };

  const labelNode = <label style={labelStyle}>{label}</label>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: wide ? "flex-start" : "center",
        gap: 12,
        width: "100%",
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatExtensionTooltipTitle(tooltip)}
          {...EXTENSION_FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ErrMsg = ({ children }) => (
  <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{children}</div>
);

// ── SectionCard / AllowCodecsSectionHeading ──

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <ExtensionModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const AllowCodecsSectionHeading = ({ tooltipKey, required = false }) => (
  <ExtensionModalSectionHeading
    margin="24px 0 24px 0"
    titleNode={
      <>
        <ExtensionTooltipLabel
          tooltipKey={tooltipKey}
          style={{ fontSize: 14, color: EXTENSION_MODAL_SECTION_HEADING_COLOR }}
        >
          Allow Codecs
        </ExtensionTooltipLabel>
        {required && <span style={{ color: C.errorRed }}> *</span>}
      </>
    }
  />
);

// ── Destination autocomplete ──

const extensionFilterOptions = createFilterOptions({
  limit: 50,
});

const DestinationAutocomplete = React.memo(function DestinationAutocomplete({
  value,
  onCommit,
  options,
  disabled,
  placeholder,
  sx,
}) {
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      size="small"
      disabled={disabled}
      options={options}
      filterOptions={extensionFilterOptions}
      inputValue={inputValue}
      onInputChange={(e, newValue, reason) => {
        if (reason === "input" || reason === "clear") {
          setInputValue(newValue);
        }
      }}
      onBlur={() => onCommit(inputValue)}
      onChange={(e, newValue) => {
        const v = newValue || "";
        setInputValue(v);
        onCommit(v);
      }}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          sx={{
            ...extensionModalTextFieldSx,
            "& .MuiOutlinedInput-input": {
              ...(extensionModalTextFieldSx["& .MuiOutlinedInput-input"] || {}),
              fontSize: 13,
            },
            "& .MuiInputBase-input::placeholder": {
              fontSize: 13,
              fontWeight: 300,
              opacity: 1,
            },
          }}
        />
      )}
    />
  );
});

export {
  extensionOutlinedInputRootSx,
  extensionModalTextFieldSx,
  extensionModalSelectSx,
  extensionGatedModalFieldSx,
  EXTENSION_FIELD_TOOLTIP_PROPS,
  formatExtensionTooltipTitle,
  ExtensionTooltipLabel,
  FieldRow,
  ErrMsg,
  SectionCard,
  AllowCodecsSectionHeading,
  DestinationAutocomplete,
};

