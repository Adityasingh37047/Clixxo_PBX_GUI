import React from "react";
import {
  ExtensionBreadcrumb as PcmSettingsBreadcrumb,
  extensionPageWrapStyle as pcmSettingsPageWrapStyle,
  extensionPageInnerStyle as pcmSettingsPageInnerStyle,
} from "../../../components/common";

const PcmSettingsPage = () => (
  <div style={pcmSettingsPageWrapStyle}>
    <div style={pcmSettingsPageInnerStyle}>
      <PcmSettingsBreadcrumb root="E1-PRI" section="PCM" current="Settings" />
    </div>
  </div>
);

export default PcmSettingsPage;
