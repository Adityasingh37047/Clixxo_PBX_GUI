import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  ACTION_OPTIONS,
  ANNOUNCE_FREQ_OPTIONS,
  CALL_QUEUE_MODAL_TABS,
  RING_STRATEGY_OPTIONS,
} from "../../../constants/CallQueueConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as CallQueueBreadcrumb,
  ExtensionTableListLoading as CallQueueTableListLoading,
  ExtensionTableListEmptyState as CallQueueTableListEmptyState,
  ExtensionPagination as CallQueuePagination,
  ExtensionModalTabs as CallQueueModalTabs,
  extensionTableCheckboxSx as callQueueTableCheckboxSx,
  extensionFixedAlertSx as callQueueFixedAlertSx,
  extensionPageWrapStyle as callQueuePageWrapStyle,
  extensionPageInnerStyle as callQueuePageInnerStyle,
  extensionCardStyle as callQueueCardStyle,
  extensionToolbarStyle as callQueueToolbarStyle,
  extensionSelectedBadgeStyle as callQueueSelectedBadgeStyle,
  extensionCancelBtnStyle as callQueueCancelBtnStyle,
  extensionPrimaryBtnStyle as callQueuePrimaryBtnStyle,
  ExtensionCodecDualList as CallQueueCodecDualList,
} from "../../../components/common";
import { useCallQueuePage } from "./hooks/useCallQueuePage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  CALL_QUEUE_MODAL_LABEL_WIDTH,
  callQueueModalCancelBtnStyle,
  callQueueModalDialogContentSx,
  callQueueModalFormStyle,
  callQueueModalPaperSx,
  callQueueModalSelectSx,
  callQueueModalTextFieldFullSx,
  callQueueModalTitleStyle,
  CallQueueFieldLabel,
  CallQueueFieldRow,
  SectionCard,
} from "./components/CallQueueFormFields";
import {
  callQueueEditIconStyle,
  handleCallQueueEditIconHover,
} from "./components/CallQueueTableHelpers";

const CallQueue = () => {
  const vm = useCallQueuePage();
  const {
    isCompact,
    queues,
    form,
    showModal,
    editIndex,
    activeTab,
    selected,
    message,
    loading,
    isInitialLoad,
    page,
    destinations,
    voicePrompts,
    ringBackOptions,
    modalScrollRef,
    itemsPerPage,
    totalPages,
    pagedQueues,
    allPageSelected,
    somePageSelected,
    allAgentOptions,
    setMessage,
    setActiveTab,
    getDestOptions,
    getAgentLabel,
    ringStrategyLabel,
    handleChange,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    handleInverse,
    handleSelectRow,
    handleToggleAll,
    setPage,
  } = vm;
  return (
    <div
      style={{
        ...callQueuePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        className="z-50"
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            ...callQueueModalPaperSx,
            borderRadius:
              editIndex === null ? "4px" : callQueueModalPaperSx.borderRadius,
          },
        }}
        disableRestoreFocus
      >
        <DialogTitle sx={callQueueModalTitleStyle}>
          {editIndex !== null ? "Edit Call Queue" : "Add Call Queue"}
        </DialogTitle>
        <CallQueueModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={CALL_QUEUE_MODAL_TABS}
        />
        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          sx={{
            p: "24px",
            backgroundColor: "#ffffff",
            ...callQueueModalDialogContentSx,
          }}
        >
          <div style={callQueueModalFormStyle}>
            {/* ── BASIC TAB ── */}
            {activeTab === "basic" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Queue Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow
                      label="Queue Name"
                      tooltipKey="queue_name"
                      required
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_name}
                        onChange={(e) =>
                          handleChange("queue_name", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Agent Call Timeout (s)"
                      tooltipKey="agent_call_timeout"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_call_timeout}
                        onChange={(e) =>
                          handleChange("agent_call_timeout", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Queue Number"
                      tooltipKey="queue_number"
                      required
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_number}
                        onChange={(e) =>
                          handleChange("queue_number", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Agent Announcement"
                      tooltipKey="agent_announcement"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_announcement}
                          onChange={(e) =>
                            handleChange("agent_announcement", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          displayEmpty
                        >
                          <MenuItem value="">Null</MenuItem>
                          <MenuItem value="call_from_queue_number">
                            Call From Queue Number
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem key={vp.value} value={vp.value}>
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow label="Pin" tooltipKey="pin" required>
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.pin}
                          onChange={(e) => handleChange("pin", e.target.value)}
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Agent Retry Time (s)"
                      tooltipKey="agent_retry_time"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_retry_time}
                        onChange={(e) =>
                          handleChange("agent_retry_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {form.pin === "yes" && (
                      <CallQueueFieldRow
                        label="Agent Password"
                        tooltipKey="agent_password"
                        required
                      >
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={form.agent_password}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            handleChange("agent_password", val);
                          }}
                          sx={callQueueModalTextFieldFullSx}
                          inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                            maxLength: 4,
                          }}
                        />
                      </CallQueueFieldRow>
                    )}
                    <CallQueueFieldRow
                      label="Wrap Up Time (s)"
                      tooltipKey="wrap_up_time"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.wrap_up_time}
                        onChange={(e) =>
                          handleChange("wrap_up_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Ring Strategy"
                      tooltipKey="ring_strategy"
                      required
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_strategy}
                          onChange={(e) =>
                            handleChange("ring_strategy", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {RING_STRATEGY_OPTIONS.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Max No Answer"
                      tooltipKey="max_no_answer"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_no_answer}
                        onChange={(e) =>
                          handleChange("max_no_answer", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {/* Timeout Action + destination */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 32,
                      }}
                    >
                      <CallQueueFieldLabel
                        tooltipKey="timeout_action"
                        style={{
                          width: CALL_QUEUE_MODAL_LABEL_WIDTH,
                          flexShrink: 0,
                        }}
                      >
                        Timeout Action
                      </CallQueueFieldLabel>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.timeout_action}
                            onChange={(e) => {
                              handleChange("timeout_action", e.target.value);
                              handleChange("timeout_action_dest", "");
                            }}
                            sx={callQueueModalSelectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.timeout_action && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.timeout_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "timeout_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={callQueueModalSelectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.timeout_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <CallQueueFieldRow
                      label="Discard Abandoned After(s)"
                      tooltipKey="discard_abandoned_after"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.discard_abandoned_after}
                        onChange={(e) =>
                          handleChange(
                            "discard_abandoned_after",
                            e.target.value,
                          )
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Caller ID Name Prefix"
                      tooltipKey="caller_id_prefix"
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.caller_id_prefix}
                        onChange={(e) =>
                          handleChange("caller_id_prefix", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Max Wait Time (s)"
                      tooltipKey="max_wait_time"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_time}
                        onChange={(e) =>
                          handleChange("max_wait_time", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    {/* Overflow Action + destination */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 32,
                      }}
                    >
                      <CallQueueFieldLabel
                        tooltipKey="overflow_action"
                        style={{
                          width: CALL_QUEUE_MODAL_LABEL_WIDTH,
                          flexShrink: 0,
                        }}
                      >
                        Overflow Action
                      </CallQueueFieldLabel>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.overflow_action}
                            onChange={(e) => {
                              handleChange("overflow_action", e.target.value);
                              handleChange("overflow_action_dest", "");
                            }}
                            sx={callQueueModalSelectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.overflow_action && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.overflow_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "overflow_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={callQueueModalSelectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.overflow_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <CallQueueFieldRow
                      label="Max Queue Length"
                      tooltipKey="max_queue_length"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_queue_length}
                        onChange={(e) =>
                          handleChange("max_queue_length", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Agents Initial Status"
                      tooltipKey="agents_initial_status"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agents_initial_status}
                          onChange={(e) =>
                            handleChange(
                              "agents_initial_status",
                              e.target.value,
                            )
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="logged_in">Logged In</MenuItem>
                          <MenuItem value="logged_out">Logged Out</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Alert info"
                      tooltipKey="alert_info"
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.alert_info}
                        onChange={(e) =>
                          handleChange("alert_info", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                      />
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Agents">
                  <CallQueueCodecDualList
                    allOptions={allAgentOptions}
                    selected={form.selected_agents || []}
                    onChange={(agents) =>
                      handleChange("selected_agents", agents)
                    }
                    getLabel={getAgentLabel}
                    emptyTextAvailable="No extension"
                    emptyTextSelected="No agent selected"
                  />
                </SectionCard>
              </div>
            )}

            {/* ── CALLER EXPERIENCE SETTINGS TAB ── */}
            {activeTab === "caller" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Caller Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow
                      label="Music on Hold"
                      tooltipKey="music_on_hold"
                      required
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.music_on_hold}
                          onChange={(e) =>
                            handleChange("music_on_hold", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {ringBackOptions.moh_categories.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Music on Hold
                            </ListSubheader>
                          )}
                          {ringBackOptions.moh_categories.map((opt) => (
                            <MenuItem
                              key={`moh-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.custom_prompts.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Custom Prompt
                            </ListSubheader>
                          )}
                          {ringBackOptions.custom_prompts.map((opt) => (
                            <MenuItem
                              key={`prompt-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.country_tones.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Ring Back
                            </ListSubheader>
                          )}
                          {ringBackOptions.country_tones.map((opt) => (
                            <MenuItem
                              key={`tone-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Join When No Agent"
                      tooltipKey="join_when_no_agent"
                    >
                      <Checkbox
                        checked={!!form.join_when_no_agent}
                        onChange={(e) =>
                          handleChange("join_when_no_agent", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Max Wait Time No Agent (s)"
                      tooltipKey="max_wait_no_agent"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_no_agent}
                        onChange={(e) =>
                          handleChange("max_wait_no_agent", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Join Announce"
                      tooltipKey="join_announce"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.join_announce}
                          onChange={(e) =>
                            handleChange("join_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Queue Busy Resume Offer"
                      tooltipKey="queue_busy_resume"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.queue_busy_resume}
                          onChange={(e) =>
                            handleChange("queue_busy_resume", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="enable">Enable</MenuItem>
                          <MenuItem value="disable">Disable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Join Announce Playtime"
                      tooltipKey="join_announce_playtime"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.join_announce_playtime}
                        onChange={(e) =>
                          handleChange("join_announce_playtime", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Transfer Prompt"
                      tooltipKey="transfer_prompt"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.transfer_prompt}
                          onChange={(e) =>
                            handleChange("transfer_prompt", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Answer Type"
                      tooltipKey="answer_type"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_type}
                          onChange={(e) =>
                            handleChange("answer_type", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="answer">Answer</MenuItem>
                          <MenuItem value="progress">Progress</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Agent Busy Announce"
                      tooltipKey="agent_busy_announce"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_busy_announce}
                          onChange={(e) =>
                            handleChange("agent_busy_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="No Agent Announce"
                      tooltipKey="no_agent_announce"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.no_agent_announce}
                          onChange={(e) =>
                            handleChange("no_agent_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Answer Announce To Caller"
                      tooltipKey="answer_announce"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_announce}
                          onChange={(e) =>
                            handleChange("answer_announce", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => {
                            if (!v) return "";
                            if (v === "agent_id") return "Play AgentID Prompt";
                            const found = voicePrompts.find(
                              (vp) => vp.value === v,
                            );
                            return found ? found.label : v;
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="agent_id" sx={{ fontSize: 14 }}>
                            Play AgentID Prompt
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Caller Position Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow
                      label="Announce Position"
                      tooltipKey="announce_position"
                    >
                      <Checkbox
                        checked={!!form.announce_position}
                        onChange={(e) =>
                          handleChange("announce_position", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Call Duration(s)"
                      tooltipKey="call_duration"
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.call_duration}
                        onChange={(e) =>
                          handleChange("call_duration", e.target.value)
                        }
                        sx={callQueueModalTextFieldFullSx}
                        inputProps={{ min: 0 }}
                      />
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Announce Hold Time"
                      tooltipKey="announce_hold_time"
                    >
                      <Checkbox
                        checked={!!form.announce_hold_time}
                        onChange={(e) =>
                          handleChange("announce_hold_time", e.target.checked)
                        }
                        size="small"
                        sx={callQueueTableCheckboxSx}
                      />
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Announce Frequency(s)"
                      tooltipKey="announce_frequency_caller"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.announce_frequency}
                          onChange={(e) =>
                            handleChange("announce_frequency", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Periodic Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow
                      label="Announce Sound"
                      tooltipKey="periodic_sound"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_sound}
                          onChange={(e) =>
                            handleChange("periodic_sound", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Announce Frequency(s)"
                      tooltipKey="announce_frequency_periodic"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_frequency}
                          onChange={(e) =>
                            handleChange("periodic_frequency", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Busy Callback">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <CallQueueFieldRow
                      label="Enable Busy Callback"
                      tooltipKey="busy_callback"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback}
                          onChange={(e) =>
                            handleChange("busy_callback", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                    <CallQueueFieldRow
                      label="Busy Callback Announce"
                      tooltipKey="busy_callback_announce"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_announce}
                          onChange={(e) =>
                            handleChange(
                              "busy_callback_announce",
                              e.target.value,
                            )
                          }
                          sx={callQueueModalSelectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>

                    <CallQueueFieldRow
                      label="Agent Busy Callback Key"
                      tooltipKey="busy_callback_key"
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_key}
                          onChange={(e) =>
                            handleChange("busy_callback_key", e.target.value)
                          }
                          sx={callQueueModalSelectSx}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </CallQueueFieldRow>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={callQueueModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>

      <div style={callQueuePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={callQueueFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <CallQueueBreadcrumb section="Call Features" current="Call Queue" />

        <div style={callQueueCardStyle}>
          <div style={callQueueToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={callQueueSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={
                  loading.delete || loading.fetch || queues.length === 0
                }
                style={callQueueCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={callQueueCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                style={callQueuePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <CallQueueTableListLoading />
            ) : queues.length === 0 ? (
              <CallQueueTableListEmptyState
                message="No call queues found."
                onAddNew={() => handleOpenModal()}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",

                  minWidth: 700,
                  ...(isCompact ? { minWidth: 720 } : {}),
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        disabled={loading.delete}
                        sx={callQueueTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36 }}>ID</TH>
                    <TH>Queue Name</TH>
                    <TH>Queue Number</TH>
                    <TH>Ring Strategy</TH>
                    <TH>Agents</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedQueues.map((q, i) => {
                    const isSelected = selected.includes(q._idx);
                    const isLastRow = i === pagedQueues.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : i % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={q._idx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(q._idx)}
                            disabled={loading.delete}
                            sx={callQueueTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {(page - 1) * itemsPerPage + i + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            fontWeight: 600,
                          }}
                        >
                          {q.name || "--"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {q.queue_number || "--"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {ringStrategyLabel(q.ring_strategy)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {Array.isArray(q.members) ? q.members.length : 0}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                            textAlign: "center",
                            padding: "7px 8px",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenModal(q, q._idx)}
                            style={callQueueEditIconStyle}
                            onMouseEnter={(e) =>
                              handleCallQueueEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleCallQueueEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && queues.length > 0 && (
            <CallQueuePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedQueues.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CallQueue;
