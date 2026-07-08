import {
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import { ExtensionCodecDualList as ExtensionMonitorCodecDualList } from "../../../../components/common";
import { FieldRow } from "./formFields";
import { SectionCard } from "./formFields";
import { ExtensionTooltipLabel } from "./formFields";
import { DestinationAutocomplete } from "./formFields";
import {
  extensionGatedModalFieldSx,
  extensionModalSelectSx,
  extensionModalTextFieldSx,
} from "./formFields";

const EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
];
const EXTENSION_FOLLOW_ME_DESTINATION_TYPES = [
  "Call Queue",
  "CallBacks",
  "Conference Rooms",
  "DISA",
  "Extensions",
  "Fax To Mail",
  "IVR Menus",
  "Ring Groups",
  "Voicemails",
  "Other",
];

function FeaturesTab(props) {
  const {
    form, handleChange, isCompact, extensionOptions, handleAddFollowMeEntry,
    handleFollowMeEntryChange, handleAddDndNumber, handleDndNumberChange,
  } = props;
  return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* Voicemail */}
                <SectionCard title="Voicemail" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Voicemail Enabled:"
                      tooltipKey="voicemail_enabled"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_enabled || "no"}
                          onChange={(e) =>
                            handleChange("voicemail_enabled", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail Keep Local:"
                      tooltipKey="voicemail_keep_local"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_keep_local || "yes"}
                          onChange={(e) =>
                            handleChange("voicemail_keep_local", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail File:"
                      tooltipKey="voicemail_file"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_file || "audio_file_attachment"}
                          onChange={(e) =>
                            handleChange("voicemail_file", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="audio_file_attachment">
                            Audio File Attachment
                          </MenuItem>
                          <MenuItem value="download_link">
                            Download Link
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow
                      label="Voicemail Password:"
                      tooltipKey="voicemail_password"
                    >
                      <TextField
                        type="text"
                        value={form.voicemail_password || ""}
                        onChange={(e) =>
                          handleChange("voicemail_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Select Voice:" tooltipKey="select_voice">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_voice || "system_default"}
                          onChange={(e) =>
                            handleChange("voicemail_voice", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="system_default">
                            System Default
                          </MenuItem>
                          <MenuItem value="blank">Blank</MenuItem>
                          <MenuItem value="busy">Busy</MenuItem>
                          <MenuItem value="welcome">Welcome</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Forwarding */}
                <SectionCard title="Call Forwarding">
                  {(() => {
                    const cfAlwaysEnabled =
                      (form.cf_always_enabled || "disabled") === "enabled";

                    return [
                      { key: "always", label: "Always", tooltipKey: "cf_always" },
                      { key: "busy", label: "On Busy", tooltipKey: "cf_busy" },
                      {
                        key: "no_answer",
                        label: "No Answer",
                        tooltipKey: "cf_no_answer",
                      },
                      {
                        key: "not_registered",
                        label: "Not Registered",
                        tooltipKey: "cf_not_registered",
                      },
                    ].map((rule) => {
                      const cfOtherLocked =
                        cfAlwaysEnabled && rule.key !== "always";
                      const cfRuleEnabled =
                        !cfOtherLocked &&
                        (form[`cf_${rule.key}_enabled`] || "disabled") ===
                          "enabled";
                      const cfFieldSx = extensionGatedModalFieldSx(cfRuleEnabled);

                      return (
                      <div
                        key={rule.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          paddingBottom: 6,
                        }}
                      >
                        <ExtensionTooltipLabel
                          tooltipKey={rule.tooltipKey}
                          style={{ minWidth: 100 }}
                        >
                          {rule.label}
                        </ExtensionTooltipLabel>
                        <RadioGroup
                          row
                          value={
                            cfOtherLocked
                              ? "disabled"
                              : form[`cf_${rule.key}_enabled`] || "disabled"
                          }
                          onChange={(e) =>
                            handleChange(
                              `cf_${rule.key}_enabled`,
                              e.target.value,
                            )
                          }
                          sx={{ flexWrap: "nowrap" }}
                        >
                          <FormControlLabel
                            value="disabled"
                            control={<Radio size="small" />}
                            label="Disabled"
                            disabled={cfOtherLocked}
                            sx={{
                              mr: 1.5,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                          <FormControlLabel
                            value="enabled"
                            control={<Radio size="small" />}
                            label="Enabled"
                            disabled={cfOtherLocked}
                            sx={{
                              mr: 0,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                        </RadioGroup>
                        <DestinationAutocomplete
                          disabled={!cfRuleEnabled}
                          options={extensionOptions}
                          value={form[`cf_${rule.key}_number`] || ""}
                          onCommit={(val) =>
                            handleChange(`cf_${rule.key}_number`, val)
                          }
                          placeholder="Destination Number"
                          sx={{
                            minWidth: 180,
                            width: 150,
                            maxWidth: 150,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          Time Condition
                        </span>
                        <FormControl
                          size="small"
                          disabled={!cfRuleEnabled}
                          sx={{ minWidth: 90 }}
                        >
                          <MuiSelect
                            value={form[`cf_${rule.key}_time`] || "all"}
                            disabled={!cfRuleEnabled}
                            onChange={(e) =>
                              handleChange(
                                `cf_${rule.key}_time`,
                                e.target.value,
                              )
                            }
                            sx={cfFieldSx}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="work_time">Work Time</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                      );
                    });
                  })()}
                </SectionCard>

                {/* Follow Me */}
                <SectionCard title="Follow Me">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="follow_me"
                      style={{ minWidth: 140 }}
                    >
                      Follow Me
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.follow_me_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("follow_me_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.follow_me_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.follow_me_time || "all"}
                        disabled={form.follow_me_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("follow_me_time", e.target.value)
                        }
                        sx={extensionGatedModalFieldSx(
                          form.follow_me_enabled === "enabled",
                        )}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.follow_me_enabled === "enabled" && (
                    <div
                      style={{
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 6,
                        padding: 8,
                        background: "#fafbfc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Destinations
                        </span>
                        <button
                          onClick={handleAddFollowMeEntry}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.follow_me_entries?.length
                        ? form.follow_me_entries
                        : [
                            {
                              destinationType: "",
                              timeout: 30,
                              confirm: "unconfirm",
                            },
                          ]
                      ).map((entry, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <DestinationAutocomplete
                            options={extensionOptions}
                            value={entry?.destinationType || ""}
                            onCommit={(val) =>
                              handleFollowMeEntryChange(
                                idx,
                                "destinationType",
                                val,
                              )
                            }
                            placeholder="Destination Number"
                            sx={{ minWidth: 180 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <MuiSelect
                              value={entry?.timeout ?? 30}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "timeout",
                                  Number(e.target.value),
                                )
                              }
                              sx={extensionModalSelectSx}
                            >
                              {EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <MuiSelect
                              value={entry?.confirm || "unconfirm"}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "confirm",
                                  e.target.value,
                                )
                              }
                              sx={extensionModalSelectSx}
                            >
                              <MenuItem value="confirm">Confirm</MenuItem>
                              <MenuItem value="unconfirm">UnConfirm</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.labelText,
                            minWidth: 140,
                          }}
                        >
                          Timeout Destination
                        </span>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <MuiSelect
                            value={form.follow_me_timeout_destination || ""}
                            displayEmpty
                            onChange={(e) =>
                              handleChange(
                                "follow_me_timeout_destination",
                                e.target.value,
                              )
                            }
                            sx={extensionModalSelectSx}
                          >
                            <MenuItem value="">
                              <em>Select destination</em>
                            </MenuItem>
                            {EXTENSION_FOLLOW_ME_DESTINATION_TYPES.map((l) => (
                              <MenuItem key={l} value={l}>
                                {l}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Do Not Disturb */}
                <SectionCard title="Do Not Disturb">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="dnd"
                      style={{ minWidth: 140 }}
                    >
                      Do Not Disturb
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.dnd_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("dnd_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.dnd_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.dnd_time || "all"}
                        disabled={form.dnd_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("dnd_time", e.target.value)
                        }
                        sx={extensionGatedModalFieldSx(form.dnd_enabled === "enabled")}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.dnd_enabled === "enabled" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Special Numbers
                        </span>
                        <button
                          onClick={handleAddDndNumber}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.dnd_special_numbers?.length
                        ? form.dnd_special_numbers
                        : [""]
                      ).map((val, idx) => (
                        <DestinationAutocomplete
                          key={idx}
                          options={extensionOptions}
                          value={val || ""}
                          onCommit={(v) => handleDndNumberChange(idx, v)}
                          placeholder="Destination Number"
                          sx={{ maxWidth: 180 }}
                        />
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Mobility Extension */}
                <SectionCard title="Mobility Extension">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                      paddingTop: 4,
                    }}
                  >
                    <FieldRow
                      label="Enable Mobility Extension:"
                      labelWidth={200}
                      tooltipKey="enable_mobility_extension"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_mobility_extension || "no"}
                          onChange={(e) =>
                            handleChange(
                              "enable_mobility_extension",
                              e.target.value,
                            )
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Prefix" tooltipKey="prefix">
                      <TextField
                        type="text"
                        value={form.mobility_prefix || ""}
                        disabled={form.enable_mobility_extension !== "yes"}
                        onChange={(e) =>
                          handleChange("mobility_prefix", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionGatedModalFieldSx(
                          form.enable_mobility_extension === "yes",
                          extensionModalTextFieldSx,
                          "text",
                        )}
                      />
                    </FieldRow>
                    <FieldRow
                      label="Ring Simultaneously:"
                      labelWidth={200}
                      tooltipKey="ring_simultaneously"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_simultaneously || "no"}
                          onChange={(e) =>
                            handleChange("ring_simultaneously", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Timeout" tooltipKey="mobility_timeout">
                      <FormControl
                        fullWidth
                        size="small"
                        disabled={form.ring_simultaneously !== "yes"}
                      >
                        <MuiSelect
                          value={Number(form.mobility_timeout || 30)}
                          disabled={form.ring_simultaneously !== "yes"}
                          onChange={(e) =>
                            handleChange(
                              "mobility_timeout",
                              Number(e.target.value),
                            )
                          }
                          sx={extensionGatedModalFieldSx(
                            form.ring_simultaneously === "yes",
                          )}
                        >
                          {EXTENSION_FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Secretary Service */}
                <SectionCard title="Secretary Service">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <ExtensionTooltipLabel
                      tooltipKey="secretary_service"
                      style={{ minWidth: 140 }}
                    >
                      Secretary Service
                    </ExtensionTooltipLabel>
                    <RadioGroup
                      row
                      value={form.secretary_service || "disabled"}
                      onChange={(e) =>
                        handleChange("secretary_service", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                  </div>
                  {form.secretary_service === "enabled" && (
                    <FieldRow label="Secretary Number:">
                      <FormControl sx={{ maxWidth: 260 }} size="small">
                        <MuiSelect
                          value={form.secretary_extension || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("secretary_extension", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="">
                            <em>Select extension</em>
                          </MenuItem>
                          {["ss1", "ss2", ...extensionOptions].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Monitor */}
                <SectionCard title="Monitor">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow
                      label="Allow Being Monitored:"
                      tooltipKey="monitor_allow"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_allow || "disable"}
                          onChange={(e) =>
                            handleChange("monitor_allow", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable_all">Enable All</MenuItem>
                          <MenuItem value="extensions">Extensions</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Monitor Mode:" tooltipKey="monitor_mode">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_mode || "none"}
                          onChange={(e) =>
                            handleChange("monitor_mode", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="listen">Listen</MenuItem>
                          <MenuItem value="whisper">Whisper</MenuItem>
                          <MenuItem value="barge_in">Barge-in</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                  {form.monitor_allow === "extensions" && (
                    <ExtensionMonitorCodecDualList
                      allOptions={extensionOptions.map((ext) => ({
                        value: ext,
                        label: ext,
                      }))}
                      selected={form.monitor_allowed_extensions || []}
                      onChange={(newSelected) =>
                        handleChange("monitor_allowed_extensions", newSelected)
                      }
                      hideReorder
                      isCompact={isCompact}
                      emptyTextAvailable="No extensions available"
                      emptyTextSelected="No selected extensions"
                    />
                  )}
                </SectionCard>
              </div>
  );
}

export default FeaturesTab;
