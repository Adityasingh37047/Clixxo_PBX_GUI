import {
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import { FieldRow } from "./formFields";
import { SectionCard } from "./formFields";
import {
  extensionModalSelectSx,
  extensionModalTextFieldSx,
} from "./formFields";

function AdvancedTab(props) {
  const { form, handleChange, isCompact } = props;
  return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* RTP Settings */}
                <SectionCard title="RTP Settings" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Enable SRTP:" tooltipKey="enable_srtp">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_srtp || "no"}
                          onChange={(e) =>
                            handleChange("enable_srtp", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="SIP Bypass Media:"
                      tooltipKey="sip_bypass_media"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.sip_bypass_media || "proxy_media"}
                          onChange={(e) =>
                            handleChange("sip_bypass_media", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="proxy_media">Proxy Media</MenuItem>
                          <MenuItem value="bypass_media">Bypass Media</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Settings */}
                <SectionCard title="Call Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Call Timeout (s):"
                      tooltipKey="call_timeout"
                    >
                      <TextField
                        type="number"
                        value={form.call_timeout ?? 30}
                        onChange={(e) =>
                          handleChange("call_timeout", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Max Call Duration (s):"
                      tooltipKey="max_call_duration"
                    >
                      <TextField
                        type="number"
                        value={form.max_call_duration ?? 6000}
                        onChange={(e) =>
                          handleChange("max_call_duration", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Outbound Restriction:"
                      tooltipKey="outbound_restriction"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.outbound_restriction || "disable"}
                          onChange={(e) =>
                            handleChange("outbound_restriction", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Max Call Permission:"
                      tooltipKey="max_call_permission"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={
                            form.admin_call_permission || "international_call"
                          }
                          onChange={(e) =>
                            handleChange(
                              "admin_call_permission",
                              e.target.value,
                            )
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="no_call">No Call</MenuItem>
                          <MenuItem value="internal_call">
                            Internal Call
                          </MenuItem>
                          <MenuItem value="local_call">Local Call</MenuItem>
                          <MenuItem value="long_distance_call">
                            Long-Distance Call
                          </MenuItem>
                          <MenuItem value="international_call">
                            International Call
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Extension Trunk:"
                      tooltipKey="extension_trunk"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.extension_trunk || "disable"}
                          onChange={(e) =>
                            handleChange("extension_trunk", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Used Call Permission:"
                      tooltipKey="used_call_permission"
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          padding: "6px 8px",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          border: `1px solid ${C.cardBorder}`,
                        }}
                      >
                        {{
                          no_call: "No Call",
                          internal_call: "Internal Call",
                          local_call: "Local Call",
                          long_distance_call: "Long-Distance Call",
                        }[form.call_permission] || "International Call"}
                      </div>
                    </FieldRow>
                    <FieldRow
                      label="Dynamic Lock Pin:"
                      tooltipKey="dynamic_lock_pin"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.dynamic_lock_pin || "default"}
                          onChange={(e) =>
                            handleChange("dynamic_lock_pin", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="default">Default</MenuItem>
                          {form.dynamic_lock_pin === "user_password" && (
                            <MenuItem value="user_password">
                              User Password
                            </MenuItem>
                          )}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Diversion:" tooltipKey="diversion">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.diversion || "yes"}
                          onChange={(e) =>
                            handleChange("diversion", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Call Prohibition:"
                      tooltipKey="call_prohibition"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.call_prohibition || "disable"}
                          onChange={(e) =>
                            handleChange("call_prohibition", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Other Settings */}
                <SectionCard title="Other Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="RX Volume:" tooltipKey="rx_volume">
                      <TextField
                        type="number"
                        value={form.rx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("rx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="TX Volume:" tooltipKey="tx_volume">
                      <TextField
                        type="number"
                        value={form.tx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("tx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
  );
}

export default AdvancedTab;
