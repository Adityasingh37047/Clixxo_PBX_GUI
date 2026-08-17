import React from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  TextField,
  Checkbox,
  Alert,
} from "@mui/material";
import {
  VOICE_PROMPTS_CUSTOM_UPLOAD_NOTE,
  VOICE_PROMPTS_FIELD_TOOLTIPS,
  VOICE_PROMPTS_FORWARDING_HINT,
  VOICE_PROMPTS_MOH_UPLOAD_NOTE,
  VOICE_PROMPTS_RECORD_MODAL_TITLE,
  VOICE_PROMPTS_SECTIONS,
  VOICE_PROMPTS_TABS,
  VOICE_PROMPTS_TITLE,
} from "../../../constants/VoicePromptsConstants";
import {
  Btn,
  TH,
  tdStyle,
  getExtensionRowBg,
  ExtensionBreadcrumb as VoicePromptsBreadcrumb,
  ExtensionTableListLoading as VoicePromptsTableListLoading,
  ExtensionTableListEmptyState as VoicePromptsTableListEmptyState,
  extensionFixedAlertSx as voicePromptsFixedAlertSx,
  extensionPageWrapStyle as voicePromptsPageWrapStyle,
  extensionPageInnerStyle as voicePromptsPageInnerStyle,
  extensionCardStyle as voicePromptsCardStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { useVoicePromptsPage } from "./hooks/useVoicePromptsPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  tooltipProps,
  voicePromptsChooseFileBtnStyle,
  voicePromptsHeaderLeftStyle,
  voicePromptsModalContentStyle,
  voicePromptsModalPaperSx,
  voicePromptsModalSectionStyle,
  voicePromptsModalTitleStyle,
  voicePromptsPanelStyle,
  voicePromptsPrimaryBtnStyle,
  voicePromptsSelectSx,
  voicePromptsTabBtnStyle,
  voicePromptsTabHeaderStyle,
  voicePromptsTableCardStyle,
  voicePromptsTextFieldSx,
  VoicePromptsFieldRow,
  VoicePromptsSectionHeading,
  VoicePromptsTooltipLabel,
  voicePromptsCheckboxSx,
} from "./components/VoicePromptsFormFields";
import {
  formatDateTime,
  formatSize,
  toolIconBtnSx,
} from "./components/VoicePromptsTableHelpers";

const VoicePromptsPage = () => {
  const vm = useVoicePromptsPage();
  const {
    isCompact,
    activeTab,
    message,
    setMessage,
    playCallForwardingPrompt,
    setPlayCallForwardingPrompt,
    promptMohCategory,
    setPromptMohCategory,
    mohCategoryName,
    setMohCategoryName,
    mohFile,
    setMohFile,
    mohFiles,
    mohLoading,
    customFile,
    setCustomFile,
    customItems,
    customLoading,
    recordModalOpen,
    setRecordModalOpen,
    recordFileName,
    setRecordFileName,
    recordExtension,
    setRecordExtension,
    extensions,
    mohFileInputRef,
    customFileInputRef,
    mohAudioUrl,
    customAudioUrl,
    mohAudioRef,
    customAudioRef,
    savingPrefs,
    categories,
    handleTabChange,
    handleSavePreferences,
    handleUploadMoh,
    handleUploadCustomPrompt,
    openRecordModal,
    handleSaveRecordedPrompt,
    stopMohPlayer,
    stopCustomPlayer,
    handlePlayMoh,
    handleDownloadMoh,
    handleDeleteMoh,
    handlePlayCustom,
    handleDownloadCustom,
    handleDeleteCustom,
  } = vm;

  return (
    <div
      style={{
        ...voicePromptsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={voicePromptsPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={voicePromptsFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <VoicePromptsBreadcrumb
          section={VOICE_PROMPTS_TITLE}
          current={VOICE_PROMPTS_TITLE}
        />

        <div style={voicePromptsCardStyle}>
          <div
            style={{
              ...voicePromptsTabHeaderStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div
              style={{
                ...voicePromptsHeaderLeftStyle,
                ...(isCompact ? { width: "100%" } : {}),
              }}
            >
              {VOICE_PROMPTS_TABS.map((tab) => (
                <Btn
                  key={tab.id}
                  type="button"
                  variant={activeTab === tab.id ? "tabActive" : "tabInactive"}
                  onClick={() => handleTabChange(tab.id)}
                  style={voicePromptsTabBtnStyle}
                >
                  {tab.label}
                </Btn>
              ))}
            </div>
          </div>

          <div style={{ padding: 16 }}>
            {activeTab === "promptPreference" && (
              <div>
                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.general_preferences}
                  isFirst
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 16,
                    ...voicePromptsPanelStyle,
                  }}
                >
                  <VoicePromptsFieldRow
                    label={
                      <VoicePromptsTooltipLabel tooltipKey="music_on_hold">
                        Music On Hold
                      </VoicePromptsTooltipLabel>
                    }
                  >
                    <FormControl size="small" sx={{ width: 260 }}>
                      <MuiSelect
                        variant="outlined"
                        value={promptMohCategory}
                        onChange={(e) => setPromptMohCategory(e.target.value)}
                        displayEmpty
                        sx={voicePromptsSelectSx}
                      >
                        {categories.length === 0 ? (
                          promptMohCategory ? (
                            <MenuItem
                              value={promptMohCategory}
                              sx={{ fontSize: 13 }}
                            >
                              {promptMohCategory}
                            </MenuItem>
                          ) : (
                            <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                              <em>No uploaded music yet</em>
                            </MenuItem>
                          )
                        ) : (
                          categories.map((category) => (
                            <MenuItem
                              key={category}
                              value={category}
                              sx={{ fontSize: 13 }}
                            >
                              {category}
                            </MenuItem>
                          ))
                        )}
                      </MuiSelect>
                    </FormControl>
                  </VoicePromptsFieldRow>

                  <div>
                    <VoicePromptsFieldRow
                      label={
                        <VoicePromptsTooltipLabel tooltipKey="play_call_forwarding_prompt">
                          Play Call Forwarding Prompt
                        </VoicePromptsTooltipLabel>
                      }
                    >
                      <Checkbox
                        checked={playCallForwardingPrompt}
                        onChange={(e) =>
                          setPlayCallForwardingPrompt(e.target.checked)
                        }
                        size="small"
                        sx={voicePromptsCheckboxSx}
                      />
                    </VoicePromptsFieldRow>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        marginTop: 4,
                      }}
                    >
                      <div style={{ width: 170, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: C.mutedText }}>
                        {VOICE_PROMPTS_FORWARDING_HINT}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex" }}>
                  <Btn
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    variant="primary"
                    style={voicePromptsPrimaryBtnStyle}
                  >
                    {savingPrefs ? "Saving..." : "SAVE"}
                  </Btn>
                </div>
              </div>
            )}

            {activeTab === "musicOnHold" && (
              <div>
                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.upload_moh}
                  isFirst
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    ...voicePromptsPanelStyle,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Tooltip
                      title={VOICE_PROMPTS_FIELD_TOOLTIPS.moh_category}
                      {...tooltipProps}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                        }}
                      >
                        Category
                      </label>
                    </Tooltip>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={mohCategoryName}
                      onChange={(e) => setMohCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      sx={{ ...voicePromptsTextFieldSx, width: 220 }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      File
                    </label>
                    <input
                      ref={mohFileInputRef}
                      type="file"
                      onChange={(e) => setMohFile(e.target.files?.[0] || null)}
                      style={{ display: "none" }}
                    />
                    <Btn
                      onClick={() => mohFileInputRef.current?.click()}
                      variant="cancel"
                      style={voicePromptsChooseFileBtnStyle}
                    >
                      Choose File
                    </Btn>
                    <Btn
                      onClick={handleUploadMoh}
                      variant="primary"
                      style={voicePromptsPrimaryBtnStyle}
                    >
                      UPLOAD
                    </Btn>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.mutedText,
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {mohFile?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  {VOICE_PROMPTS_MOH_UPLOAD_NOTE}
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.all_moh_files}
                />
                <div style={voicePromptsTableCardStyle}>
                  {mohLoading ? (
                    <VoicePromptsTableListLoading />
                  ) : mohFiles.length === 0 ? (
                    <VoicePromptsTableListEmptyState
                      message="No hold music uploaded yet."
                      showButton={false}
                    />
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 600,
                        ...(isCompact ? { minWidth: 720 } : {}),
                      }}
                    >
                      <thead>
                        <tr>
                          <TH>File Name</TH>
                          <TH>Category</TH>
                          <TH>File Size</TH>
                          <TH>Uploaded</TH>
                          <TH style={{ width: 100 }}>Tools</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {mohFiles.map((item, idx) => {
                          const rowBg = getExtensionRowBg(false, idx);
                          const isLastRow = idx === mohFiles.length - 1;
                          const cellStyle = {
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          };
                          const lastCellStyle = {
                            ...cellStyle,
                            borderRight: "none",
                          };
                          return (
                            <tr
                              key={item.id}
                              style={{
                                background: rowBg,
                                transition: "background 0.15s ease",
                              }}
                            >
                              <td
                                style={{
                                  ...cellStyle,
                                  textAlign: "left",
                                  fontWeight: 500,
                                }}
                              >
                                {item.filename}
                              </td>
                              <td style={{ ...cellStyle, textAlign: "left" }}>
                                {item.category || "--"}
                              </td>
                              <td style={{ ...cellStyle, color: C.mutedText }}>
                                {formatSize(item.sizeBytes)}
                              </td>
                              <td style={{ ...cellStyle, color: C.mutedText }}>
                                {formatDateTime(item.uploadedAt)}
                              </td>
                              <td style={lastCellStyle}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Tooltip title="Play">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handlePlayMoh(item)}
                                    >
                                      <PlayArrowRoundedIcon
                                        sx={{ fontSize: 16, color: "#16a34a" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handleDownloadMoh(item)}
                                    >
                                      <DownloadRoundedIcon
                                        sx={{ fontSize: 15, color: "#0284c7" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handleDeleteMoh(item)}
                                    >
                                      <DeleteOutlineRoundedIcon
                                        sx={{ fontSize: 15, color: C.errorRed }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {mohAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      Now Playing:
                    </span>
                    <audio
                      ref={mohAudioRef}
                      controls
                      src={mohAudioUrl}
                      style={{ height: 30, flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={stopMohPlayer}
                      sx={toolIconBtnSx}
                    >
                      <StopRoundedIcon
                        sx={{ fontSize: 16, color: C.errorRed }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
            )}

            {activeTab === "customPrompt" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Btn
                    onClick={openRecordModal}
                    variant="primary"
                    style={voicePromptsPrimaryBtnStyle}
                  >
                    + RECORD NEW
                  </Btn>
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.upload_custom}
                  isFirst
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    ...voicePromptsPanelStyle,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      File Path
                    </label>
                    <input
                      ref={customFileInputRef}
                      type="file"
                      onChange={(e) =>
                        setCustomFile(e.target.files?.[0] || null)
                      }
                      style={{ display: "none" }}
                    />
                    <Btn
                      onClick={() => customFileInputRef.current?.click()}
                      variant="cancel"
                      style={voicePromptsChooseFileBtnStyle}
                    >
                      Choose File
                    </Btn>
                    <Btn
                      onClick={handleUploadCustomPrompt}
                      variant="primary"
                      style={voicePromptsPrimaryBtnStyle}
                    >
                      UPLOAD
                    </Btn>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.mutedText,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {customFile?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  {VOICE_PROMPTS_CUSTOM_UPLOAD_NOTE}
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.recordings}
                />
                <div style={voicePromptsTableCardStyle}>
                  {customLoading ? (
                    <VoicePromptsTableListLoading />
                  ) : customItems.length === 0 ? (
                    <VoicePromptsTableListEmptyState
                      message="No custom prompts uploaded yet."
                      showButton={false}
                    />
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 700,
                        ...(isCompact ? { minWidth: 720 } : {}),
                      }}
                    >
                      <thead>
                        <tr>
                          <TH>Recording Name</TH>
                          <TH>File Name</TH>
                          <TH>File Size</TH>
                          <TH>Uploaded</TH>
                          <TH style={{ width: 120 }}>Tools</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {customItems.map((item, idx) => {
                          const rowBg = getExtensionRowBg(false, idx);
                          const isLastRow = idx === customItems.length - 1;
                          const cellStyle = {
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          };
                          const lastCellStyle = {
                            ...cellStyle,
                            borderRight: "none",
                          };
                          return (
                            <tr
                              key={item.id}
                              style={{
                                background: rowBg,
                                transition: "background 0.15s ease",
                              }}
                            >
                              <td
                                style={{
                                  ...cellStyle,
                                  textAlign: "left",
                                  fontWeight: 600,
                                }}
                              >
                                {item.recordingName}
                              </td>
                              <td
                                style={{
                                  ...cellStyle,
                                  textAlign: "left",
                                  color: C.mutedText,
                                  fontFamily: "monospace",
                                }}
                              >
                                {item.fileName}
                              </td>
                              <td style={{ ...cellStyle, color: C.mutedText }}>
                                {formatSize(item.sizeBytes)}
                              </td>
                              <td style={{ ...cellStyle, color: C.mutedText }}>
                                {formatDateTime(item.uploadedAt)}
                              </td>
                              <td style={lastCellStyle}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Tooltip title="Play">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handlePlayCustom(item)}
                                    >
                                      <PlayArrowRoundedIcon
                                        sx={{ fontSize: 16, color: "#16a34a" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handleDownloadCustom(item)}
                                    >
                                      <DownloadRoundedIcon
                                        sx={{ fontSize: 15, color: "#0284c7" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      sx={toolIconBtnSx}
                                      onClick={() => handleDeleteCustom(item)}
                                    >
                                      <DeleteOutlineRoundedIcon
                                        sx={{ fontSize: 15, color: C.errorRed }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {customAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      Now Playing:
                    </span>
                    <audio
                      ref={customAudioRef}
                      controls
                      src={customAudioUrl}
                      style={{ height: 30, flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={stopCustomPlayer}
                      sx={toolIconBtnSx}
                    >
                      <StopRoundedIcon
                        sx={{ fontSize: 16, color: C.errorRed }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: voicePromptsModalPaperSx }}
      >
        <DialogTitle style={voicePromptsModalTitleStyle}>
          {VOICE_PROMPTS_RECORD_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={voicePromptsModalContentStyle}
          sx={{ "&.MuiDialogContent-root": { paddingTop: "24px" } }}
        >
          <div style={voicePromptsModalSectionStyle}>
            <VoicePromptsFieldRow label="File Name" required>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                value={recordFileName}
                onChange={(e) => setRecordFileName(e.target.value)}
                sx={voicePromptsTextFieldSx}
              />
            </VoicePromptsFieldRow>
            <VoicePromptsFieldRow label="Extension" required>
              <FormControl size="small" fullWidth variant="outlined">
                <MuiSelect
                  variant="outlined"
                  value={recordExtension}
                  onChange={(e) => setRecordExtension(e.target.value)}
                  displayEmpty
                  sx={voicePromptsSelectSx}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                    <em>Select extension</em>
                  </MenuItem>
                  {extensions.map((ext) => (
                    <MenuItem key={ext} value={ext} sx={{ fontSize: 13 }}>
                      {ext}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </VoicePromptsFieldRow>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSaveRecordedPrompt}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            RECORD
          </Btn>
          <Btn
            onClick={() => setRecordModalOpen(false)}
            variant="cancel"
            style={addNewModalFooterCancelBtnStyle}
          >
            CANCEL
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VoicePromptsPage;
