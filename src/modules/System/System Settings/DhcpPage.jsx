import React from "react";
import {
  ExtensionBreadcrumb as DhcpBreadcrumb,
  extensionPageWrapStyle as dhcpPageWrapStyle,
  extensionPageInnerStyle as dhcpPageInnerStyle,
} from "../../../components/common";
import {
  DHCP_SERVER_PAGE_BREADCRUMB_ROOT,
  DHCP_SERVER_PAGE_BREADCRUMB_SECTION,
  DHCP_SERVER_PAGE_TITLE,
} from "../../../constants/DhcpServerSettingsConstants";

const DhcpPage = () => (
  <div style={dhcpPageWrapStyle}>
    <div style={dhcpPageInnerStyle}>
      <DhcpBreadcrumb
        root={DHCP_SERVER_PAGE_BREADCRUMB_ROOT}
        section={DHCP_SERVER_PAGE_BREADCRUMB_SECTION}
        current={DHCP_SERVER_PAGE_TITLE}
      />
    </div>
  </div>
);

export default DhcpPage;
