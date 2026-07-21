import React from "react";
import {
  ExtensionBreadcrumb as PcmStatusBreadcrumb,
  extensionPageWrapStyle as pcmStatusPageWrapStyle,
  extensionPageInnerStyle as pcmStatusPageInnerStyle,
} from "../../../components/common";

const PcmStatusPage = () => (
  <div style={pcmStatusPageWrapStyle}>
    <div style={pcmStatusPageInnerStyle}>
      <PcmStatusBreadcrumb root="E1-PRI" section="PCM" current="Status" />
    </div>
  </div>
);

export default PcmStatusPage;
