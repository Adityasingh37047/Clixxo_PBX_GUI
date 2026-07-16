import React from "react";
import {
  RESTART_SECTIONS,
  RESTART_BUTTON_LABELS,
  RESTART_BUTTON_VARIANTS,
  RESTART_BUTTON_STYLE,
  RESTART_BREADCRUMB,
  RESTART_MESSAGES,
} from "../../../../constants/RestartConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  restartPageWrapStyle,
  restartPageInnerStyle,
  restartTableContainerStyle,
  restartHeaderStyle,
  restartFixedAlertSx,
} from "./RestartTableHelpers";

export { restartFixedAlertSx };

export const RestartPageShell = ({ children }) => (
  <div style={restartPageWrapStyle} data-native-scroll>
    <div style={restartPageInnerStyle}>{children}</div>
  </div>
);

export const RestartBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={RESTART_BREADCRUMB[0]}
    section={RESTART_BREADCRUMB[1]}
    current={RESTART_BREADCRUMB[2]}
  />
);

export const RestartSections = ({ loading, loadingType, onRestart }) =>
  RESTART_SECTIONS.map((section, index) => (
    <div
      key={section.key}
      style={{
        ...restartTableContainerStyle,
        ...(index > 0 ? { marginTop: 20 } : {}),
      }}
    >
      <div style={restartHeaderStyle}>{section.title}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 32px",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: C.valueText,
            flex: 1,
            fontWeight: 500,
          }}
        >
          {section.instruction}
        </div>
        <Btn
          variant={RESTART_BUTTON_VARIANTS.RESTART}
          onClick={() => onRestart(section.key)}
          disabled={loading && loadingType === section.key}
          style={RESTART_BUTTON_STYLE}
        >
          {RESTART_BUTTON_LABELS.RESTART}
        </Btn>
      </div>
    </div>
  ));

export const RestartLoadingOverlay = ({
  loading,
  loadingType,
  progressMessage,
}) =>
  loading ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.85)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: C.accent,
          marginBottom: 16,
          textAlign: "center",
          maxWidth: 360,
        }}
      >
        {progressMessage ||
          (loadingType === "system"
            ? RESTART_MESSAGES.systemRestarting
            : RESTART_MESSAGES.serviceRestartingOverlay)}
      </div>
      <div
        className="loader"
        style={{
          width: 48,
          height: 48,
          border: "6px solid #e2e8f0",
          borderTop: `6px solid ${C.accent}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
    </div>
  ) : null;
