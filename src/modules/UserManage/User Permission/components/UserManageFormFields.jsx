import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Checkbox } from "@mui/material";
import {
  PAGE_PERMISSION_GROUPS,
  USER_MANAGE_BREADCRUMB,
  USER_MANAGE_CARD_TITLES,
  USER_MANAGE_LABELS,
  USER_MANAGE_ACCESS_TYPE_OPTIONS,
  USER_MANAGE_ROLE_PERMISSION_OPTIONS,
  USER_MANAGE_BUTTON_LABELS,
  USER_MANAGE_BUTTON_VARIANTS,
  USER_MANAGE_BUTTON_STYLE,
  USER_MANAGE_TOOLTIPS,
  USER_MANAGE_PLACEHOLDERS,
} from "../../../../constants/UserManageConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  CARD_RADIUS,
  userManageBlueBarStyle,
  userManageInputInteraction,
  userManageInputStyle,
  userManageLabelStyle,
  userManagePermissionFooterStyle,
  userManageTableContainerStyle,
  userManageTooltipProps,
  userManageCheckboxSx,
} from "./UserManageTableHelpers";
import {
  allChecked,
  someChecked,
  sectionPages,
} from "../utils/UserManageTransformers";
import { validateResetPassword } from "../utils/UserManageValidators";

export function UserManageBreadcrumb() {
  return (
    <ExtensionBreadcrumb
      root={USER_MANAGE_BREADCRUMB[0]}
      section={USER_MANAGE_BREADCRUMB[1]}
      current={USER_MANAGE_BREADCRUMB[2]}
    />
  );
}

export function ResetPasswordDialog({ user, onSave, onCancel, loading }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    const validationError = validateResetPassword(pw);
    if (validationError) {
      setErr(validationError);
      return;
    }
    onSave(pw);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: CARD_RADIUS,
          padding: "24px 28px",
          width: 380,
          maxWidth: "calc(100vw - 32px)",
          border: `1.5px solid ${C.cardBorder}`,
          boxShadow:
            "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
        }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            fontWeight: 700,
            color: C.labelText,
          }}
        >
          {USER_MANAGE_CARD_TITLES.RESET_PASSWORD_PREFIX}
          {user.username}
        </p>
        <input
          style={{ ...userManageInputStyle, marginBottom: 6, height: 36 }}
          type="password"
          placeholder={USER_MANAGE_PLACEHOLDERS.NEW_PASSWORD}
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setErr("");
          }}
          {...userManageInputInteraction}
        />
        {err && (
          <p
            style={{
              color: C.errorRed,
              fontSize: 12,
              margin: "0 0 8px",
              fontWeight: 600,
            }}
          >
            {err}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <Btn
            variant={USER_MANAGE_BUTTON_VARIANTS.PRIMARY}
            onClick={handle}
            disabled={loading}
            style={USER_MANAGE_BUTTON_STYLE}
          >
            {loading
              ? USER_MANAGE_BUTTON_LABELS.SAVING
              : USER_MANAGE_BUTTON_LABELS.SAVE}
          </Btn>
          <Btn
            variant={USER_MANAGE_BUTTON_VARIANTS.CANCEL}
            onClick={onCancel}
            style={USER_MANAGE_BUTTON_STYLE}
          >
            {USER_MANAGE_BUTTON_LABELS.CANCEL}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function PermissionTree({ permissions, setPermissions }) {
  const L1 = 12;
  const L2 = 36;
  const L3 = 60;

  const toggleSection = (section) => {
    const pages = sectionPages(section);
    const next = !allChecked(pages, permissions);
    setPermissions((prev) => {
      const u = { ...prev };
      pages.forEach((p) => {
        u[p.id] = next;
      });
      return u;
    });
  };

  const toggleSub = (sub) => {
    const next = !allChecked(sub.pages, permissions);
    setPermissions((prev) => {
      const u = { ...prev };
      sub.pages.forEach((p) => {
        u[p.id] = next;
      });
      return u;
    });
  };

  const togglePage = (id) =>
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ background: C.cardBg, overflow: "hidden" }}>
      {PAGE_PERMISSION_GROUPS.map((section) => {
        const secPages = sectionPages(section);
        return (
          <div key={section.id}>
            <div
              className="flex items-center py-2 pr-4"
              style={{
                backgroundColor: "#F8FAFC",
                paddingLeft: L1,
                borderTop: `1px solid ${C.divider}`,
                borderBottom: `1px solid ${C.divider}`,
              }}
            >
              <Checkbox
                size="small"
                checked={allChecked(secPages, permissions)}
                indeterminate={someChecked(secPages, permissions)}
                onChange={() => toggleSection(section)}
                sx={userManageCheckboxSx}
              />
              <span
                className="ml-2 text-[13px] font-bold"
                style={{ color: C.labelText, letterSpacing: "0.02em" }}
              >
                {section.label}
              </span>
            </div>
            {section.subGroups.map((sub) => (
              <div key={sub.id}>
                <div
                  className="flex items-center py-1.5 pr-4"
                  style={{ backgroundColor: C.cardBg, paddingLeft: L2 }}
                >
                  <Checkbox
                    size="small"
                    checked={allChecked(sub.pages, permissions)}
                    indeterminate={someChecked(sub.pages, permissions)}
                    onChange={() => toggleSub(sub)}
                    sx={userManageCheckboxSx}
                  />
                  <span
                    className="ml-2 text-[12.5px] font-semibold"
                    style={{ color: C.valueText }}
                  >
                    {sub.label}
                  </span>
                </div>
                <div
                  className="pr-4 py-2"
                  style={{
                    paddingLeft: L3,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "8px 10px",
                  }}
                >
                  {sub.pages.map((page) => (
                    <label
                      key={page.id}
                      className="flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      <Checkbox
                        size="small"
                        checked={!!permissions[page.id]}
                        onChange={() => togglePage(page.id)}
                        sx={userManageCheckboxSx}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: C.labelText, lineHeight: 1.35 }}
                      >
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function UserManageEditForm({
  mode,
  editUser,
  username,
  setUsername,
  password,
  setPassword,
  accessType,
  setAccessType,
  rolePermission,
  setRolePermission,
}) {
  return (
    <div style={{ ...userManageTableContainerStyle, marginTop: 20 }}>
      <div style={{ ...userManageBlueBarStyle, justifyContent: "flex-start" }}>
        <span>
          {mode === "add"
            ? USER_MANAGE_CARD_TITLES.ADD_USER
            : `${USER_MANAGE_CARD_TITLES.EDIT_USER_PREFIX}${editUser?.username}`}
        </span>
      </div>
      <div className="p-6 flex flex-col items-center">
        <div
          style={{ width: "100%", maxWidth: 520 }}
          className="flex flex-col gap-4"
        >
          {mode === "add" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Tooltip title={USER_MANAGE_TOOLTIPS.username} {...userManageTooltipProps}>
                <span className="sm:w-[140px] shrink-0" style={userManageLabelStyle}>
                  {USER_MANAGE_LABELS.USERNAME}
                </span>
              </Tooltip>
              <input
                style={userManageInputStyle}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={USER_MANAGE_PLACEHOLDERS.MIN_5_CHARS}
                {...userManageInputInteraction}
              />
            </div>
          )}
          {mode === "add" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Tooltip title={USER_MANAGE_TOOLTIPS.password} {...userManageTooltipProps}>
                <span className="sm:w-[140px] shrink-0" style={userManageLabelStyle}>
                  {USER_MANAGE_LABELS.PASSWORD}
                </span>
              </Tooltip>
              <input
                style={userManageInputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={USER_MANAGE_PLACEHOLDERS.MIN_5_CHARS}
                {...userManageInputInteraction}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Tooltip title={USER_MANAGE_TOOLTIPS.accessType} {...userManageTooltipProps}>
              <span className="sm:w-[140px] shrink-0" style={userManageLabelStyle}>
                {USER_MANAGE_LABELS.ACCESS_TYPE}
              </span>
            </Tooltip>
            <select
              style={userManageInputStyle}
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              {...userManageInputInteraction}
            >
              {USER_MANAGE_ACCESS_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Tooltip title={USER_MANAGE_TOOLTIPS.rolePermission} {...userManageTooltipProps}>
              <span className="sm:w-[140px] shrink-0" style={userManageLabelStyle}>
                {USER_MANAGE_LABELS.ROLE_PERMISSION}
              </span>
            </Tooltip>
            <select
              style={userManageInputStyle}
              value={rolePermission}
              onChange={(e) => setRolePermission(e.target.value)}
              {...userManageInputInteraction}
            >
              {USER_MANAGE_ROLE_PERMISSION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserManagePermissionCard({
  permissions,
  setPermissions,
  saving,
  canWrite,
  onSave,
  onCancel,
  showReadOnlyToast,
}) {
  return (
    <div style={{ ...userManageTableContainerStyle, marginTop: 20 }}>
      <div
        style={{
          ...userManageBlueBarStyle,
          justifyContent: "flex-start",
          borderBottom: "none",
        }}
      >
        <span>{USER_MANAGE_CARD_TITLES.PAGE_PERMISSIONS}</span>
      </div>
      <PermissionTree permissions={permissions} setPermissions={setPermissions} />
      <div style={userManagePermissionFooterStyle}>
        <Btn
          variant={USER_MANAGE_BUTTON_VARIANTS.PRIMARY}
          onClick={() => {
            if (!canWrite) {
              showReadOnlyToast();
              return;
            }
            onSave();
          }}
          disabled={saving || !canWrite}
          style={USER_MANAGE_BUTTON_STYLE}
        >
          {saving
            ? USER_MANAGE_BUTTON_LABELS.SAVING
            : USER_MANAGE_BUTTON_LABELS.SAVE}
        </Btn>
        <Btn
          variant={USER_MANAGE_BUTTON_VARIANTS.CANCEL}
          onClick={onCancel}
          style={USER_MANAGE_BUTTON_STYLE}
        >
          {USER_MANAGE_BUTTON_LABELS.CANCEL}
        </Btn>
      </div>
    </div>
  );
}
