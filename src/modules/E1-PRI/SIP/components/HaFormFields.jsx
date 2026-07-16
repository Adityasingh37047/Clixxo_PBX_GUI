import React from "react";
import { Select, MenuItem, FormControl, Tooltip } from "@mui/material";
import {
  HA_PRIMARY_BACKUP_OPTIONS,
  HA_ETH_OPTIONS,
  HA_FIELD_TOOLTIPS,
} from "../../../../constants/HaConstants";
import { haSelectSx } from "./HaTableHelpers";

// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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

const formatFieldTooltipTitle = (text) => {
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

export const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

export const HaFormBody = ({
  enabled,
  setEnabled,
  virtualIp,
  setVirtualIp,
  setIpTouched,
  ipIsValid,
  ipTouched,
  primaryBackup,
  setPrimaryBackup,
  haEth,
  setHaEth,
}) => (
  <div className="space-y-4">
    {/* HA Enable Row */}
    <div className="flex items-center justify-between">
      <E1PriFieldLabel
        tooltipKey="enabled"
        tooltips={HA_FIELD_TOOLTIPS}
        style={{ fontSize: 16, display: "inline-block" }}
      >
        HA
      </E1PriFieldLabel>
      <div className="flex items-center w-60">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled((prev) => !prev)}
          className="w-4 h-4 mr-2 accent-blue-600"
        />
        <span className="text-base text-gray-600">Enable</span>
      </div>
    </div>

    {/* Public Virtual IP Row */}
    <div className="flex items-center justify-between">
      <E1PriFieldLabel
        tooltipKey="virtualIp"
        tooltips={HA_FIELD_TOOLTIPS}
        style={{ fontSize: 16, display: "inline-block" }}
      >
        Public Virtual IP
      </E1PriFieldLabel>
      <div className="flex flex-col items-end">
        <input
          type="text"
          value={virtualIp}
          onChange={(e) => setVirtualIp(e.target.value)}
          onBlur={() => setIpTouched(true)}
          className={`w-60 text-base px-3 py-2 border ${!ipIsValid && ipTouched && enabled ? "border-red-500" : "border-gray-400"} bg-white`}
          style={{ height: "32px" }}
          disabled={!enabled}
          placeholder="e.g. 192.168.1.100"
        />
        {!ipIsValid && ipTouched && enabled && (
          <div className="text-red-500 text-xs mt-1">
            Please enter a valid IPv4 address.
          </div>
        )}
      </div>
    </div>

    {/* Primary/Backup Row */}
    <div className="flex items-center justify-between">
      <E1PriFieldLabel
        tooltipKey="primaryBackup"
        tooltips={HA_FIELD_TOOLTIPS}
        style={{ fontSize: 16, display: "inline-block" }}
      >
        Primary/Backup
      </E1PriFieldLabel>
      <FormControl size="small" className="w-60">
        <Select
          value={primaryBackup}
          onChange={(e) => setPrimaryBackup(e.target.value)}
          variant="outlined"
          disabled={!enabled}
          sx={haSelectSx}
        >
          {HA_PRIMARY_BACKUP_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>

    {/* HA Eth Row */}
    <div className="flex items-center justify-between">
      <E1PriFieldLabel
        tooltipKey="haEth"
        tooltips={HA_FIELD_TOOLTIPS}
        style={{ fontSize: 16, display: "inline-block" }}
      >
        HA Eth
      </E1PriFieldLabel>
      <FormControl size="small" className="w-60">
        <Select
          value={haEth}
          onChange={(e) => setHaEth(e.target.value)}
          variant="outlined"
          disabled={!enabled}
          sx={haSelectSx}
        >
          {HA_ETH_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  </div>
);
