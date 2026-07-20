import React from "react";
import {
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT,
  PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION,
  PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE,
  PCM_CIRCUIT_MAINTENANCE_SECTION_MAINTENANCE,
  PCM_CIRCUIT_MAINTENANCE_SECTION_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_PCM0_TITLE,
  PCM_CIRCUIT_MAINTENANCE_PCM_DEFAULT_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_PCM_STATUS,
  PCM_CIRCUIT_MAINTENANCE_LABEL_LOOPBACK_STATUS,
  PCM_CIRCUIT_MAINTENANCE_LABEL_CHECK,
  PCM_CIRCUIT_MAINTENANCE_LABEL_CHANNEL_NO,
  PCM_CIRCUIT_MAINTENANCE_LABEL_STATUS,
  PCM_CIRCUIT_MAINTENANCE_BTN_CHECK_ALL,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNCHECK_ALL,
  PCM_CIRCUIT_MAINTENANCE_BTN_INVERSE,
  PCM_CIRCUIT_MAINTENANCE_BTN_BLOCK,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNBLOCK,
  PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_CONNECT,
  PCM_CIRCUIT_MAINTENANCE_BTN_PHYSICAL_DISCONNECT,
  PCM_CIRCUIT_MAINTENANCE_BTN_LOCAL_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_BTN_REMOTE_LOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_BTN_UNLOOPBACK,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CHANNEL,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_STATE,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_IN_SERVICE,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLER,
  PCM_CIRCUIT_MAINTENANCE_TOOLTIP_CALLED,
  PCM_CIRCUIT_MAINTENANCE_STATE_UNUSABLE,
  PCM_CIRCUIT_MAINTENANCE_STATE_RESERVED,
  PCM_CIRCUIT_MAINTENANCE_STATE_IDLE,
  PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_YES,
  PCM_CIRCUIT_MAINTENANCE_IN_SERVICE_NO,
} from "../../../constants/PcmCircuitMaintenanceConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import {
  ExtensionBreadcrumb as PcmCircuitMaintenanceBreadcrumb,
  extensionPageWrapStyle as pcmCircuitMaintenancePageWrapStyle,
  extensionPageInnerStyle as pcmCircuitMaintenancePageInnerStyle,
} from "../../../components/common";
import CallEndIcon from "@mui/icons-material/CallEnd";
import RingVolumeIcon from "@mui/icons-material/RingVolume";
import SettingsPhoneIcon from "@mui/icons-material/SettingsPhone";
import PhoneForwardedIcon from "@mui/icons-material/PhoneForwarded";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import PhonePausedIcon from "@mui/icons-material/PhonePaused";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import SystemSecurityUpdateWarningIcon from "@mui/icons-material/SystemSecurityUpdateWarning";
import AppSettingsAltIcon from "@mui/icons-material/AppSettingsAlt";
import PhoneLockedIcon from "@mui/icons-material/PhoneLocked";

import {
  usePcmCircuitMaintenancePage,
  PcmCircuitMaintenanceScrollbarStyles,
  PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS,
} from "./hooks/usePcmCircuitMaintenancePage";
import {
  TH,
  C,
  tdStyle,
  checkboxSx,
  PcmCircuitMaintenanceFieldLabel,
  pcmCircuitMaintenanceDialogConfig,
  pcmCircuitMaintenanceFormPanelStyle,
  pcmCircuitMaintenanceInputStyle,
  pcmCircuitMaintenanceSelectStyle,
  pcmCircuitMaintenanceInputInteraction,
  pcmCircuitMaintenanceAddNewModalFooterStyle,
  pcmCircuitMaintenanceAddNewModalFooterBtnStyle,
  pcmCircuitMaintenanceCardStyle,
  pcmCircuitMaintenanceToolbarStyle,
} from "./components/PcmCircuitMaintenanceFormFields";
import {
  CARD_RADIUS,
  pcmCircuitMaintenanceSelectedBadgeStyle,
  pcmCircuitMaintenanceEditIconStyle,
  handlePcmCircuitMaintenanceEditIconHover,
  getPcmCircuitMaintenanceRowBg,
} from "./components/PcmCircuitMaintenanceTableHelpers";

const PcmCircuitMaintenancePage = () => {
  const vm = usePcmCircuitMaintenancePage();
  const {
    highZoom,
    isCompact,
    contentOverflows,
    contentRef,
    spansData,
    renderPcmMaintenance,
    renderPcmLoopback,
    renderSpanBlock,
    renderPcm0,
  } = vm;

  return (
    <>
      <PcmCircuitMaintenanceScrollbarStyles />
      <div
        className={
          highZoom || isCompact || contentOverflows
            ? PCM_CIRCUIT_MAINTENANCE_SCROLL_CLASS
            : undefined
        }
        style={{
          ...pcmCircuitMaintenancePageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
          ...(highZoom || isCompact || contentOverflows
            ? {
                minHeight: "calc(100vh - 80px)",
                overflowY: "auto",
                overflowX: "visible",
              }
            : {
                height: "calc(100vh - 80px)",
                maxHeight: "calc(100vh - 80px)",
                overflowX: "visible",
                overflowY: "hidden",
              }),
        }}
      >
        <div
          ref={contentRef}
          style={{
            ...pcmCircuitMaintenancePageInnerStyle,
            overflow: "visible",
          }}
        >
          <PcmCircuitMaintenanceBreadcrumb
            root={PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_ROOT}
            section={PCM_CIRCUIT_MAINTENANCE_PAGE_BREADCRUMB_SECTION}
            current={PCM_CIRCUIT_MAINTENANCE_PAGE_TITLE}
          />

          {renderPcmMaintenance()}
          {renderPcmLoopback()}

          {spansData.length > 0 ? spansData.map(renderSpanBlock) : renderPcm0()}
        </div>
      </div>
    </>
  );
};

export default PcmCircuitMaintenancePage;
