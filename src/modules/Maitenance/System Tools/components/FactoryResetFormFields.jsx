import React from "react";
import { CircularProgress } from "@mui/material";
import {
  FACTORY_RESET_TITLE,
  FACTORY_RESET_INSTRUCTION,
  FACTORY_RESET_BUTTON_LABELS,
  FACTORY_RESET_BUTTON_VARIANTS,
  FACTORY_RESET_BUTTON_STYLE,
  FACTORY_RESET_BREADCRUMB,
  FACTORY_RESET_STATUS,
} from "../../../../constants/FactoryResetConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  factoryResetPageWrapStyle,
  factoryResetPageInnerStyle,
  factoryResetTableContainerStyle,
  factoryResetHeaderStyle,
  factoryResetFixedAlertSx,
} from "./FactoryResetTableHelpers";

export { factoryResetFixedAlertSx };

export const FactoryResetPageShell = ({ children }) => (
  <div style={factoryResetPageWrapStyle} data-native-scroll>
    <div style={factoryResetPageInnerStyle}>{children}</div>
  </div>
);

export const FactoryResetBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={FACTORY_RESET_BREADCRUMB[0]}
    section={FACTORY_RESET_BREADCRUMB[1]}
    current={FACTORY_RESET_BREADCRUMB[2]}
  />
);

export const FactoryResetCard = ({ loading, onReset }) => (
  <div style={factoryResetTableContainerStyle}>
    <div style={factoryResetHeaderStyle}>
      <span>{FACTORY_RESET_TITLE}</span>
    </div>
    <div
      style={{
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: C.valueText,
          marginBottom: 24,
          fontWeight: 500,
        }}
      >
        {FACTORY_RESET_INSTRUCTION}
      </span>
      <Btn
        variant={FACTORY_RESET_BUTTON_VARIANTS.RESET}
        onClick={onReset}
        disabled={loading}
        style={FACTORY_RESET_BUTTON_STYLE}
      >
        {loading
          ? FACTORY_RESET_STATUS.RESETTING
          : FACTORY_RESET_BUTTON_LABELS.RESET}
      </Btn>
    </div>
  </div>
);

export const FactoryResetLoadingOverlay = ({ loading }) =>
  loading ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
        <CircularProgress />
        <div className="text-gray-700 text-sm whitespace-pre-line font-medium">
          {FACTORY_RESET_STATUS.OVERLAY_MESSAGE}
        </div>
      </div>
    </div>
  ) : null;
