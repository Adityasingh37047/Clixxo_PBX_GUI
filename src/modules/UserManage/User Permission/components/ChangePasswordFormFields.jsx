import React from "react";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  CHANGE_PASSWORD_BREADCRUMB,
  CHANGE_PASSWORD_CARD_TITLE,
  CHANGE_PASSWORD_BUTTON_LABELS,
  CHANGE_PASSWORD_BUTTON_VARIANTS,
  CHANGE_PASSWORD_BUTTON_STYLE,
  CHANGE_PASSWORD_TOOLTIPS,
  CHANGE_PASSWORD_FIELDS,
  CHANGE_PASSWORD_NOTE,
} from "../../../../constants/ChangePasswordConstants";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  changePasswordCardFooterStyle,
  changePasswordCardTitleStyle,
  changePasswordFieldErrorStyle,
  changePasswordFieldGroupStyle,
  changePasswordFieldLabelStyle,
  changePasswordNoteStyle,
  changePasswordTableContainerStyle,
  changePasswordToolbarStyle,
  changePasswordTooltipProps,
  changePasswordVisibilityBtnSx,
  getChangePasswordMuiTextFieldSx,
} from "./ChangePasswordTableHelpers";

export function ChangePasswordBreadcrumb() {
  return (
    <ExtensionBreadcrumb
      root={CHANGE_PASSWORD_BREADCRUMB[0]}
      section={CHANGE_PASSWORD_BREADCRUMB[1]}
      current={CHANGE_PASSWORD_BREADCRUMB[2]}
    />
  );
}

function FieldRow({ name, label, children }) {
  const tooltip = CHANGE_PASSWORD_TOOLTIPS[name];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
      <Tooltip
        title={tooltip || ""}
        disableHoverListener={!tooltip}
        {...changePasswordTooltipProps}
      >
        <label
          style={{
            ...changePasswordFieldLabelStyle,
            cursor: tooltip ? "help" : "default",
          }}
        >
          {label}
        </label>
      </Tooltip>
      <div className="flex-1 w-full max-w-[280px]">{children}</div>
    </div>
  );
}

export function ChangePasswordForm({
  form,
  loading,
  fieldErrors,
  showPasswords,
  onChange,
  onTogglePasswordVisibility,
  onSubmit,
}) {
  return (
    <div>
      <div style={changePasswordTableContainerStyle}>
        <div style={changePasswordToolbarStyle}>
          <span style={changePasswordCardTitleStyle}>
            {CHANGE_PASSWORD_CARD_TITLE}
          </span>
        </div>

        <form id="change-password-form" onSubmit={onSubmit}>
          <div style={{ padding: "24px 36px 32px" }}>
            <div
              className="flex flex-col w-full"
              style={{
                ...changePasswordFieldGroupStyle,
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              {CHANGE_PASSWORD_FIELDS.map((field) => (
                <FieldRow
                  key={field.name}
                  name={field.name}
                  label={`${field.label}:`}
                >
                  <div className="flex flex-col min-w-0 w-full">
                    {field.type === "password" ? (
                      <TextField
                        name={field.name}
                        value={form[field.name]}
                        onChange={onChange}
                        type={showPasswords[field.name] ? "text" : "password"}
                        disabled={loading}
                        autoComplete="off"
                        variant="outlined"
                        size="small"
                        sx={getChangePasswordMuiTextFieldSx({
                          hasError: !!fieldErrors[field.name],
                          disabled: loading,
                        })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() =>
                                  onTogglePasswordVisibility(field.name)
                                }
                                edge="end"
                                size="small"
                                disabled={loading}
                                sx={changePasswordVisibilityBtnSx}
                              >
                                {showPasswords[field.name] ? (
                                  <VisibilityOffIcon fontSize="small" />
                                ) : (
                                  <VisibilityIcon fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    ) : (
                      <TextField
                        name={field.name}
                        value={form[field.name]}
                        onChange={onChange}
                        type="text"
                        disabled={loading || field.name === "username"}
                        autoComplete="off"
                        variant="outlined"
                        size="small"
                        sx={getChangePasswordMuiTextFieldSx({
                          hasError: !!fieldErrors[field.name],
                          disabled: loading || field.name === "username",
                          readOnlyLook: field.name === "username",
                        })}
                      />
                    )}
                    {fieldErrors[field.name] && (
                      <div style={changePasswordFieldErrorStyle}>
                        {fieldErrors[field.name]}
                      </div>
                    )}
                  </div>
                </FieldRow>
              ))}
            </div>
          </div>

          <div style={changePasswordCardFooterStyle}>
            <Btn
              variant={CHANGE_PASSWORD_BUTTON_VARIANTS.PRIMARY}
              disabled={loading}
              type="submit"
              style={CHANGE_PASSWORD_BUTTON_STYLE}
            >
              {loading
                ? CHANGE_PASSWORD_BUTTON_LABELS.SAVING
                : CHANGE_PASSWORD_BUTTON_LABELS.SAVE}
            </Btn>
          </div>
        </form>
      </div>

      <p style={changePasswordNoteStyle}>{CHANGE_PASSWORD_NOTE}</p>
    </div>
  );
}
