import React from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Checkbox,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  SIP_REGISTER_COUNTRY_OPTIONS,
  SIP_REGISTER_TRANSPORT_OPTIONS,
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_ETH_PORT_OPTIONS,
  SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS,
} from "../../../../constants/SipRegisterConstants";
import { extensionTableCheckboxSx as sipRegisterTableCheckboxSx } from "../../../../components/common";
import {
  TrunkFieldLabel,
  sipRegisterModalSelectSx,
  trunkFormCheckboxLabelSx,
} from "./SipRegisterFormFields";

function SipRegisterBasicTab({
  form,
  validationErrors,
  handleChange,
  editIndex,
  ethPortOptions,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
  <div className="p-3 sm:p-5">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-0">
      <div className="space-y-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel>Trunk Type</TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <RadioGroup
              row
              value={form.ui_trunk_type}
              onChange={(e) =>
                handleChange("ui_trunk_type", e.target.value)
              }
            >
              <FormControlLabel
                value="sip"
                control={<Radio size="small" />}
                label="SIP"
              />
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="trunk_name" required>
            Trunk Name
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.trunk_id || ""}
              onChange={(e) =>
                handleChange("trunk_id", e.target.value)
              }
              error={!!validationErrors.trunk_id}
              placeholder="Trunk Name"
              disabled={editIndex !== null}
            />
            {validationErrors.trunk_id && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.trunk_id}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="select_country" required>
            Select Country
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl
              fullWidth
              size="small"
              error={!!validationErrors.ui_country}
            >
              <MuiSelect
                value={form.ui_country}
                onChange={(e) =>
                  handleChange("ui_country", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_COUNTRY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
            {validationErrors.ui_country && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.ui_country}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="transport">
            Transport
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_transport}
                onChange={(e) =>
                  handleChange("ui_transport", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_TRANSPORT_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_srtp">
            Enable SRTP
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_enable_srtp}
                  onChange={(e) =>
                    handleChange("ui_enable_srtp", e.target.checked)
                  }
                  size="small"
                  sx={sipRegisterTableCheckboxSx}
                />
              }
              label=""
              sx={trunkFormCheckboxLabelSx}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="register" required>
            Register
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_register}
                onChange={(e) =>
                  handleChange("ui_register", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        {form.ui_register === "Yes" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="username" required>
                Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.username || ""}
                  onChange={(e) =>
                    handleChange("username", e.target.value)
                  }
                  error={!!validationErrors.username}
                  placeholder="Username"
                />
                {validationErrors.username && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.username}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="auth_username">
                Auth Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.auth_username || ""}
                  onChange={(e) =>
                    handleChange("auth_username", e.target.value)
                  }
                  placeholder="Auth Username"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="reg_fail_retry" required>
                RegFail Retry
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.ui_reg_fail_retry || ""}
                  onChange={(e) =>
                    handleChange(
                      "ui_reg_fail_retry",
                      e.target.value,
                    )
                  }
                  error={!!validationErrors.ui_reg_fail_retry}
                  placeholder="30"
                />
                {validationErrors.ui_reg_fail_retry && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.ui_reg_fail_retry}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="outbound_cid_source">
            Outbound CallerId Source
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_outbound_cid_source}
                onChange={(e) =>
                  handleChange(
                    "ui_outbound_cid_source",
                    e.target.value,
                  )
                }
                displayEmpty
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS.map(
                  (c) => (
                    <MenuItem key={c || "_empty"} value={c}>
                      {c || <em>—</em>}
                    </MenuItem>
                  ),
                )}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="record">
            Record
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_record}
                onChange={(e) =>
                  handleChange("ui_record", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enabled" required>
            Enabled
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enabled}
                onChange={(e) =>
                  handleChange("ui_enabled", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="eth_port" required>
            Eth Port
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_eth_port}
                onChange={(e) =>
                  handleChange("ui_eth_port", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {(ethPortOptions.length
                  ? ethPortOptions
                  : SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({
                      value: v,
                      label: v,
                    }))
                ).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="trunk_ip_domain" required>
            Trunk IP/Domain
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.provider || ""}
              onChange={(e) =>
                handleChange("provider", e.target.value)
              }
              error={!!validationErrors.provider}
              placeholder="host:port or domain"
            />
            {validationErrors.provider && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.provider}
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
            <TrunkFieldLabel tooltipKey="show_outbound_cid_name">
              Show Outbound CallerID Name
            </TrunkFieldLabel>
            <div className="flex-1 min-w-0 flex items-center justify-start">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.ui_show_outbound_cid_name}
                    onChange={(e) =>
                      handleChange(
                        "ui_show_outbound_cid_name",
                        e.target.checked,
                      )
                    }
                    size="small"
                    sx={sipRegisterTableCheckboxSx}
                  />
                }
                label=""
                sx={trunkFormCheckboxLabelSx}
              />
            </div>
          </div>
          {form.ui_show_outbound_cid_name && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="outbound_cid_name">
                Outbound CallerId Name
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.ui_outbound_cid_name}
                  onChange={(e) =>
                    handleChange(
                      "ui_outbound_cid_name",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="outbound_cid_number">
            Outbound CallerId Number
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_outbound_cid_number}
              onChange={(e) =>
                handleChange(
                  "ui_outbound_cid_number",
                  e.target.value,
                )
              }
            />
          </div>
        </div>

        {form.ui_register === "Yes" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="password" required>
                Password
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  type={showPassword ? "text" : "password"}
                  size="small"
                  fullWidth
                  value={form.password || ""}
                  onChange={(e) =>
                    handleChange("password", e.target.value)
                  }
                  error={!!validationErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {validationErrors.password && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="expire_in_sec" required>
                Expire Seconds
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.expire_in_sec || ""}
                  onChange={(e) =>
                    handleChange("expire_in_sec", e.target.value)
                  }
                  error={!!validationErrors.expire_in_sec}
                />
                {validationErrors.expire_in_sec && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.expire_in_sec}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="match_username" required>
                Match Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <FormControl
                  fullWidth
                  size="small"
                  error={!!validationErrors.ui_match_username}
                >
                  <MuiSelect
                    value={form.ui_match_username || "Yes"}
                    onChange={(e) =>
                      handleChange(
                        "ui_match_username",
                        e.target.value,
                      )
                    }
                    sx={sipRegisterModalSelectSx}
                  >
                    {SIP_REGISTER_YES_NO.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
                {validationErrors.ui_match_username && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.ui_match_username}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                <TrunkFieldLabel tooltipKey="enable_proxy">
                  Enable Proxy
                </TrunkFieldLabel>
                <div className="flex-1 min-w-0 flex items-center justify-start">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!form.ui_enable_proxy}
                        onChange={(e) =>
                          handleChange(
                            "ui_enable_proxy",
                            e.target.checked,
                          )
                        }
                        size="small"
                        sx={sipRegisterTableCheckboxSx}
                      />
                    }
                    label=""
                    sx={trunkFormCheckboxLabelSx}
                  />
                </div>
              </div>

              {form.ui_enable_proxy && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                  <TrunkFieldLabel tooltipKey="proxy_ip" required>
                    Proxy IP
                  </TrunkFieldLabel>
                  <div className="flex-1 min-w-0">
                    <TextField
                      size="small"
                      fullWidth
                      value={form.ui_proxy_ip || ""}
                      onChange={(e) =>
                        handleChange("ui_proxy_ip", e.target.value)
                      }
                      error={!!validationErrors.ui_proxy_ip}
                    />
                    {validationErrors.ui_proxy_ip && (
                      <div className="text-red-500 text-xs mt-0.5">
                        {validationErrors.ui_proxy_ip}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>

  );
}

export default SipRegisterBasicTab;
