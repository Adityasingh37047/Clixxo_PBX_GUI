import React from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  ACCOUNT_MANAGE_BREADCRUMB,
  ACCOUNT_MANAGE_MODAL_FIELDS,
  ACCOUNT_MANAGE_MODAL_TITLE,
  ACCOUNT_MANAGE_BUTTON_LABELS,
  ACCOUNT_MANAGE_BUTTON_VARIANTS,
  ACCOUNT_MANAGE_BUTTON_STYLE,
  ACCOUNT_MANAGE_TOOLTIPS,
} from "../../../../constants/AccountManageConstants";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  accountManageDisabledFieldStyle,
  accountManageInputInteraction,
  accountManageModalBodyStyle,
  accountManageModalFooterStyle,
  accountManageModalFormPanelStyle,
  accountManageModalHeaderStyle,
  accountManageModalInputStyle,
  accountManageModalLabelStyle,
  accountManageModalOverlayStyle,
  accountManageModalRowStyle,
  accountManageModalStyle,
  accountManageTooltipProps,
} from "./AccountManageTableHelpers";

export function AccountManageBreadcrumb() {
  return (
    <ExtensionBreadcrumb
      root={ACCOUNT_MANAGE_BREADCRUMB[0]}
      section={ACCOUNT_MANAGE_BREADCRUMB[1]}
      current={ACCOUNT_MANAGE_BREADCRUMB[2]}
    />
  );
}

export function AccountManageModal({
  open,
  loading,
  formData,
  onInputChange,
  onSave,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={accountManageModalOverlayStyle}
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div style={accountManageModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={accountManageModalHeaderStyle}>{ACCOUNT_MANAGE_MODAL_TITLE}</div>
        <div style={accountManageModalBodyStyle}>
          <div style={accountManageModalFormPanelStyle}>
            {ACCOUNT_MANAGE_MODAL_FIELDS.map((field) => (
              <div key={field.name} style={accountManageModalRowStyle}>
                <Tooltip
                  title={ACCOUNT_MANAGE_TOOLTIPS[field.name] || ""}
                  {...accountManageTooltipProps}
                >
                  <label style={accountManageModalLabelStyle}>{field.label}:</label>
                </Tooltip>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={onInputChange}
                    style={{
                      ...accountManageModalInputStyle,
                      ...(field.disabled ? accountManageDisabledFieldStyle : {}),
                    }}
                    disabled={field.disabled}
                    {...(field.disabled ? {} : accountManageInputInteraction)}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={onInputChange}
                    style={{
                      ...accountManageModalInputStyle,
                      ...(field.disabled ? accountManageDisabledFieldStyle : {}),
                    }}
                    disabled={field.disabled}
                    {...(field.disabled ? {} : accountManageInputInteraction)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={accountManageModalFooterStyle}>
          <Btn
            variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.PRIMARY}
            onClick={onSave}
            disabled={loading}
            style={ACCOUNT_MANAGE_BUTTON_STYLE}
          >
            {loading
              ? ACCOUNT_MANAGE_BUTTON_LABELS.SAVING
              : ACCOUNT_MANAGE_BUTTON_LABELS.SAVE}
          </Btn>
          <Btn
            variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
            onClick={onClose}
            disabled={loading}
            style={ACCOUNT_MANAGE_BUTTON_STYLE}
          >
            {ACCOUNT_MANAGE_BUTTON_LABELS.CLOSE}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function AccountManageLoadingBanner({ message }) {
  return (
    <div
      style={{
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "16px",
        marginBottom: "16px",
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
      }}
    >
      <svg
        style={{
          animation: "spin 1s linear infinite",
          width: "20px",
          height: "20px",
          marginRight: "12px",
          color: "#1d4ed8",
        }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          style={{ opacity: "0.25" }}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          style={{ opacity: "0.75" }}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span style={{ fontWeight: "500" }}>{message}</span>
    </div>
  );
}
