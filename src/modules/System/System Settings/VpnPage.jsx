import React from "react";
import {
  ExtensionBreadcrumb as VpnBreadcrumb,
  extensionPageWrapStyle as vpnPageWrapStyle,
  extensionPageInnerStyle as vpnPageInnerStyle,
} from "../../../components/common";
import {
  SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_ROOT,
  SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_SECTION,
  SYSTEM_TOOLS_VPN_PAGE_TITLE,
} from "../../../constants/SystemToolsVPNConstants";

const VpnPage = () => (
  <div style={vpnPageWrapStyle}>
    <div style={vpnPageInnerStyle}>
      <VpnBreadcrumb
        root={SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_ROOT}
        section={SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_SECTION}
        current={SYSTEM_TOOLS_VPN_PAGE_TITLE}
      />
    </div>
  </div>
);

export default VpnPage;
