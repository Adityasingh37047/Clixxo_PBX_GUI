import React from "react";
import {
  ExtensionBreadcrumb as PcmBreadcrumb,
  extensionPageWrapStyle as pcmPageWrapStyle,
  extensionPageInnerStyle as pcmPageInnerStyle,
} from "../../../components/common";

const PcmPage = () => (
  <div style={pcmPageWrapStyle}>
    <div style={pcmPageInnerStyle}>
      <PcmBreadcrumb root="E1-PRI" section="PCM" current="PCM" />
    </div>
  </div>
);

export default PcmPage;
