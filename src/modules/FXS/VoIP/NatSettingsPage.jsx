import React from "react";
import { Alert } from "@mui/material";
import {
  NAT_SETTINGS_NOTE,
  FXS_NAT_SETTINGS_CARD_TITLE,
  FXS_NAT_SETTINGS_LEFT_SECTION_TITLE,
  FXS_NAT_SETTINGS_RIGHT_SECTION_TITLE,
  FXS_NAT_SETTINGS_SAVE_LABEL,
  FXS_NAT_SETTINGS_RESET_LABEL,
  FXS_NAT_SETTINGS_NOTE_LABEL,
  FXS_NAT_SETTINGS_BREADCRUMB_SECTION,
  FXS_NAT_SETTINGS_PAGE_TITLE,
} from "../../../constants/NatSettingsConstants";
import {
  Btn,
  ExtensionBreadcrumb as NatSettingsBreadcrumb,
  extensionPageWrapStyle as natSettingsPageWrapStyle,
  extensionPageInnerStyle as natSettingsPageInnerStyle,
  extensionCardStyle as natSettingsCardStyle,
  extensionFixedAlertSx as natSettingsFixedAlertSx,
} from "../../../components/common";
import { useNatSettingsPage } from "./hooks/useNatSettingsPage";
import { NatSettingsFormGrid } from "./components/NatSettingsFormFields";
import {
  fxsNatSettingsCardTitleBarStyle,
  fxsNatSettingsFormBtnStyle,
  fxsNatSettingsFormInlineFooterStyle,
  fxsNatSettingsNoteSectionStyle,
  fxsNatSettingsNoteTextStyle,
  fxsNatSettingsNoteTitleStyle,
} from "./components/NatSettingsTableHelpers";

const NatSettingsPage = () => {
  const vm = useNatSettingsPage();
  const {
    form,
    toast,
    setToast,
    leftColumnFields,
    rightColumnFields,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div style={natSettingsPageWrapStyle} data-native-scroll>
      <div style={natSettingsPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={natSettingsFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <NatSettingsBreadcrumb
          root="FXS"
          section={FXS_NAT_SETTINGS_BREADCRUMB_SECTION}
          current={FXS_NAT_SETTINGS_PAGE_TITLE}
          style={{ flexShrink: 0 }}
        />

        <div style={natSettingsCardStyle}>
        <div style={fxsNatSettingsCardTitleBarStyle}>
          <span>{FXS_NAT_SETTINGS_CARD_TITLE}</span>
        </div>
        <NatSettingsFormGrid
          leftSectionTitle={FXS_NAT_SETTINGS_LEFT_SECTION_TITLE}
          rightSectionTitle={FXS_NAT_SETTINGS_RIGHT_SECTION_TITLE}
          leftFields={leftColumnFields}
          rightFields={rightColumnFields}
          form={form}
          onChange={handleChange}
          onCheckbox={handleCheckbox}
        />

        {NAT_SETTINGS_NOTE ? (
          <div style={fxsNatSettingsNoteSectionStyle}>
            <div style={fxsNatSettingsNoteTitleStyle}>{FXS_NAT_SETTINGS_NOTE_LABEL}</div>
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              {NAT_SETTINGS_NOTE.split("\n")
                .filter(Boolean)
                .map((line, index) => (
                  <p
                    key={index}
                    style={{
                      ...fxsNatSettingsNoteTextStyle,
                      margin: index === 0 ? 0 : "8px 0 0",
                    }}
                  >
                    {line}
                  </p>
                ))}
            </div>
          </div>
        ) : null}

        <div style={fxsNatSettingsFormInlineFooterStyle}>
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={fxsNatSettingsFormBtnStyle}
          >
            {FXS_NAT_SETTINGS_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={fxsNatSettingsFormBtnStyle}
          >
            {FXS_NAT_SETTINGS_RESET_LABEL}
          </Btn>
        </div>
        </div>
      </div>
    </div>
  );
};

export default NatSettingsPage;
