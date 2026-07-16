import React from "react";
import { Alert, Checkbox, CircularProgress } from "@mui/material";
import {
  VOICEMAIL_BREADCRUMB_SECTION,
  VOICEMAIL_MAX_MESSAGE_TIME_OPTIONS,
  VOICEMAIL_MAX_MESSAGES_OPTIONS,
  VOICEMAIL_MIN_MESSAGE_TIME_OPTIONS,
  VOICEMAIL_PROMPT_OPTIONS,
  VOICEMAIL_SECTIONS,
  VOICEMAIL_TITLE,
} from "../../../constants/VoicemailConstants";
import {
  Btn,
  ExtensionBreadcrumb as VoicemailBreadcrumb,
  ExtensionTableListLoading as VoicemailTableListLoading,
  extensionFixedAlertSx as voicemailFixedAlertSx,
  extensionPageWrapStyle as voicemailPageWrapStyle,
  extensionPageInnerStyle as voicemailPageInnerStyle,
  extensionCardStyle as voicemailCardStyle,
} from "../../../components/common";
import { useVoicemailPage } from "./hooks/useVoicemailPage";
import {
  VoicemailFieldRow,
  VoicemailSectionHeading,
  VoicemailSelectField,
  voicemailCheckboxSx,
} from "./components/VoicemailFormFields";
import {
  voicemailFooterBtnStyle,
  voicemailFooterStyle,
  voicemailFormBodyStyle,
  voicemailHeaderStyle,
} from "./components/VoicemailTableHelpers";

const VoicemailPage = () => {
  const vm = useVoicemailPage();
  const {
    isCompact,
    form,
    message,
    setMessage,
    loading,
    saving,
    set,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...voicemailPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={voicemailPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={voicemailFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <VoicemailBreadcrumb
          section={VOICEMAIL_BREADCRUMB_SECTION}
          current={VOICEMAIL_TITLE}
        />

        <div style={voicemailCardStyle}>
          <div style={voicemailHeaderStyle}>
            <span>{VOICEMAIL_TITLE}</span>
          </div>

          <div style={{ padding: "12px 0 0", boxSizing: "border-box" }}>
            {loading ? (
              <VoicemailTableListLoading />
            ) : (
              <div style={{ ...voicemailFormBodyStyle, paddingBottom: 16 }}>
                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.message_options}
                  isFirst
                  isCompact={isCompact}
                />

                <VoicemailFieldRow
                  label="Max Messages per extension"
                  tooltipKey="max_messages"
                  isCompact={isCompact}
                >
                  <VoicemailSelectField
                    fieldKey="max_messages"
                    value={form.max_messages}
                    onChange={set}
                    options={VOICEMAIL_MAX_MESSAGES_OPTIONS}
                    isCompact={isCompact}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Max Message Time (s)"
                  tooltipKey="max_message_time"
                  isCompact={isCompact}
                >
                  <VoicemailSelectField
                    fieldKey="max_message_time"
                    value={form.max_message_time}
                    onChange={set}
                    options={VOICEMAIL_MAX_MESSAGE_TIME_OPTIONS}
                    isCompact={isCompact}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Min Message Time (s)"
                  tooltipKey="min_message_time"
                  isCompact={isCompact}
                >
                  <VoicemailSelectField
                    fieldKey="min_message_time"
                    value={form.min_message_time}
                    onChange={set}
                    options={VOICEMAIL_MIN_MESSAGE_TIME_OPTIONS}
                    isCompact={isCompact}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Press 5 to leave a message"
                  tooltipKey="press5_enabled"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.press5_enabled}
                    onChange={(e) => set("press5_enabled", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.greeting_options}
                />

                <VoicemailFieldRow
                  label="Busy Prompt"
                  tooltipKey="busy_prompt"
                  isCompact={isCompact}
                >
                  <VoicemailSelectField
                    fieldKey="busy_prompt"
                    value={form.busy_prompt}
                    onChange={set}
                    options={VOICEMAIL_PROMPT_OPTIONS}
                    isCompact={isCompact}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="No answer Prompt"
                  tooltipKey="noanswer_prompt"
                  isCompact={isCompact}
                >
                  <VoicemailSelectField
                    fieldKey="noanswer_prompt"
                    value={form.noanswer_prompt}
                    onChange={set}
                    options={VOICEMAIL_PROMPT_OPTIONS}
                    isCompact={isCompact}
                  />
                </VoicemailFieldRow>

                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.playback_options}
                />

                <VoicemailFieldRow
                  label="Announce Message Caller ID"
                  tooltipKey="announce_callerid"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_callerid}
                    onChange={(e) => set("announce_callerid", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Announce Message Duration"
                  tooltipKey="announce_duration"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_duration}
                    onChange={(e) => set("announce_duration", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Announce Message Arrival Time"
                  tooltipKey="announce_arrival_time"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_arrival_time}
                    onChange={(e) =>
                      set("announce_arrival_time", e.target.checked)
                    }
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>
              </div>
            )}
          </div>

          {!loading && (
            <div style={voicemailFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={voicemailFooterBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "SAVE"
                )}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoicemailPage;
