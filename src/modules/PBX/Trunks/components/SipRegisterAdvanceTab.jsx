import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Checkbox,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_DTMF_OPTIONS,
} from "../../../../constants/SipRegisterConstants";
import { extensionTableCheckboxSx as sipRegisterTableCheckboxSx } from "../../../../components/common";
import {
  TrunkFieldLabel,
  SipRegisterFieldLabel,
  TrunkModalSectionHeading,
  trunkFormCheckboxLabelSx,
  sipRegisterModalSelectSx,
  trunkAdaptTextFieldSx,
  trunkAdaptRowActionBtnSx,
  trunkDnisRowGridColumns,
} from "./SipRegisterFormFields";

function SipRegisterAdvanceTab({
  form,
  validationErrors,
  handleChange,
  dnisRows,
  setDnisRows,
  PREFERRED_ASSERTED_IDENTITY_OPTIONS,
  REMOTE_PARTY_ID_OPTIONS,
  CONTACT_MODE_OPTIONS,
}) {
  return (
  <div className="p-3 sm:p-5 space-y-6">
    <div className="hidden">
      <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">
        SIP registration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            SIP Header
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.sip_header || ""}
              onChange={(e) =>
                handleChange("sip_header", e.target.value)
              }
              error={!!validationErrors.sip_header}
              placeholder="+91...@sip.domain"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.sip_header && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.sip_header}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Server Domain
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.server_domain || ""}
              onChange={(e) =>
                handleChange("server_domain", e.target.value)
              }
              error={!!validationErrors.server_domain}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.server_domain && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.server_domain}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Client Domain
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.client_domain || ""}
              onChange={(e) =>
                handleChange("client_domain", e.target.value)
              }
              error={!!validationErrors.client_domain}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.client_domain && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.client_domain}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Outbound Proxy
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form["Outbound Proxy"] || ""}
              onChange={(e) =>
                handleChange("Outbound Proxy", e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Identifier IP
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.identity_ip || ""}
              onChange={(e) =>
                handleChange("identity_ip", e.target.value)
              }
              error={!!validationErrors.identity_ip}
            />
            {validationErrors.identity_ip && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.identity_ip}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="VoIP Settings" isFirst />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        {[
          [
            "Get CalledID Type",
            "ui_get_called_id_type",
            "get_called_id_type",
          ],
          [
            "OPTIONS Interval (s)",
            "ui_options_interval",
            "options_interval",
          ],
          ["TX Volume", "ui_tx_volume", "tx_volume"],
          ["RX Volume", "ui_rx_volume", "rx_volume"],
          ["From User", "from_user", "from_user"],
          ["From Domain", "Domain name", "from_domain"],
        ].map(([lbl, key, tooltipKey]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1"
          >
            <TrunkFieldLabel tooltipKey={tooltipKey}>
              {lbl}
            </TrunkFieldLabel>
            <div className="flex-1 min-w-0">
              <TextField
                size="small"
                fullWidth
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="send_privacy_id">
            Send Privacy ID
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_send_privacy_id}
                onChange={(e) =>
                  handleChange("ui_send_privacy_id", e.target.value)
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
          <TrunkFieldLabel tooltipKey="sip_force_contact">
            Sip Force Contact
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_sip_force_contact || ""}
                displayEmpty
                onChange={(e) =>
                  handleChange(
                    "ui_sip_force_contact",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                <MenuItem value="">
                  <em>—</em>
                </MenuItem>
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="Outbound parameters" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="p_preferred_identity">
            P-Preferred-Identity
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_p_preferred_identity || "None"}
                onChange={(e) =>
                  handleChange(
                    "ui_p_preferred_identity",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="remote_party_id">
            Remote-Party-ID
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_remote_party_id || "None"}
                onChange={(e) =>
                  handleChange("ui_remote_party_id", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {REMOTE_PARTY_ID_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="p_asserted_identity">
            P-Asserted-Identity
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_p_asserted_identity || "None"}
                onChange={(e) =>
                  handleChange(
                    "ui_p_asserted_identity",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="contact">
            Contact
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_contact_mode || "Trunk User Name"}
                onChange={(e) =>
                  handleChange("ui_contact_mode", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {CONTACT_MODE_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="Other Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="limit_max_calls">
            Limit Max Calls
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_limit_max_calls}
              onChange={(e) =>
                handleChange("ui_limit_max_calls", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_early_session">
            Enable Early Session
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enable_early_session}
                onChange={(e) =>
                  handleChange(
                    "ui_enable_early_session",
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
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_early_media">
            Enable Early Media
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enable_early_media}
                onChange={(e) =>
                  handleChange(
                    "ui_enable_early_media",
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
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="user_phone">
            User Phone
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_user_phone}
                  onChange={(e) =>
                    handleChange("ui_user_phone", e.target.checked)
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
          <TrunkFieldLabel tooltipKey="call_timeout">
            Call Timeout(s)
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_call_timeout}
              onChange={(e) =>
                handleChange("ui_call_timeout", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="dtmf_transmit">
            DTMF Transmit Mode
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_dtmf_transmit}
                onChange={(e) =>
                  handleChange("ui_dtmf_transmit", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_DTMF_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="max_call_duration">
            Max Call Duration (s)
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_max_call_duration}
              onChange={(e) =>
                handleChange("ui_max_call_duration", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="dnis">DNIS</TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_dnis}
                  onChange={(e) =>
                    handleChange("ui_dnis", e.target.checked)
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
        {form.ui_dnis && (
          <div className="mt-2 rounded-md border border-gray-200 bg-white p-3 sm:p-5">
            <TrunkModalSectionHeading
              title="DNIS Settings"
              isFirst
              labelBackground="#ffffff"
              titleLeft={0}
            />

            <div
              className="grid gap-2 items-center border-b border-gray-200 pb-2 mb-3"
              style={{
                gridTemplateColumns: trunkDnisRowGridColumns,
              }}
            >
              <SipRegisterFieldLabel tooltipKey="dnis_number">
                DNIS Number
              </SipRegisterFieldLabel>
              <SipRegisterFieldLabel tooltipKey="dnis_name">
                DNIS Name
              </SipRegisterFieldLabel>
              <IconButton
                size="small"
                onClick={() =>
                  setDnisRows((r) => [
                    ...r,
                    { dnisNumber: "", dnisName: "" },
                  ])
                }
                sx={trunkAdaptRowActionBtnSx}
                aria-label="add dnis row"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </div>

            <div className="space-y-2">
              {dnisRows.map((row, i) => (
                <div
                  key={i}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: trunkDnisRowGridColumns,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="DNIS Number"
                    value={row.dnisNumber}
                    onChange={(e) =>
                      setDnisRows((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                dnisNumber: e.target.value,
                              }
                            : x,
                        ),
                      )
                    }
                    sx={trunkAdaptTextFieldSx}
                  />
                  <div className="flex items-center gap-1 min-w-0">
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="DNIS Name"
                      value={row.dnisName}
                      onChange={(e) =>
                        setDnisRows((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  dnisName: e.target.value,
                                }
                              : x,
                          ),
                        )
                      }
                      sx={trunkAdaptTextFieldSx}
                    />
                    {dnisRows.length > 1 ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDnisRows((r) =>
                            r.filter((_, j) => j !== i),
                          )
                        }
                        sx={trunkAdaptRowActionBtnSx}
                        aria-label="remove dnis row"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </div>
                  <span aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <SipRegisterFieldLabel
                tooltipKey="replace_cid"
                style={{ minWidth: "6.5rem", flexShrink: 0 }}
              >
                Replace CID
              </SipRegisterFieldLabel>
              <FormControl size="small" sx={{ width: 160 }}>
                <MuiSelect
                  value={form.ui_replace_cid || "No"}
                  onChange={(e) =>
                    handleChange("ui_replace_cid", e.target.value)
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
        )}
      </div>
    </div>
  </div>

  );
}

export default SipRegisterAdvanceTab;
