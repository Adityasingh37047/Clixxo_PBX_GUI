import React, { useMemo, useState } from "react";
import { ExtensionBreadcrumb, Btn } from "../../../components/common";
import {
  extensionPageWrapStyle as sipLogPageWrapStyle,
  extensionPageInnerStyle as sipLogPageInnerStyle,
  extensionCardStyle as sipLogCardStyle,
  extensionToolbarStyle as sipLogToolbarStyle,
  extensionCancelBtnStyle as sipLogCancelBtnStyle,
  extensionPrimaryBtnStyle as sipLogPrimaryBtnStyle,
} from "../../../components/common";
import { C, OUTLINED_FOCUS } from "../../../theme/pbxTokens";

const sipLogConsoleStyle = {
  display: "block",
  width: "100%",
  minHeight: 600,
  margin: 0,
  padding: 14,
  border: "none",
  outline: "none",
  resize: "vertical",
  background: "#000000",
  color: "#7CFC00",
  borderRadius: 0,
  fontFamily: "Consolas, Menlo, Monaco, monospace",
  fontSize: 12,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  boxSizing: "border-box",
  cursor: "default",
  overflow: "auto",
};

const SipLogSourceToggle = ({ label, selected, onToggle, disabled }) => {
  const handleToggle = () => {
    if (disabled) return;
    onToggle(!selected);
  };

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: C.labelText }}>
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `2px solid ${OUTLINED_FOCUS}`,
          background: "#ffffff",
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected ? (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: OUTLINED_FOCUS,
              display: "block",
            }}
          />
        ) : null}
      </span>
    </div>
  );
};

const buildIdleConsoleText = () =>
  "SIP Log Viewer\n----------------------------------------\nSelect Asterisk and/or PJSIP, then click Start.";

const buildStartedConsoleText = (runningSources) => {
  const timestamp = new Date().toLocaleTimeString();
  const sections = [];

  if (runningSources.asterisk) {
    sections.push(
      `=== Asterisk SIP Log ===\n[${timestamp}] Log capture started...\n`,
    );
  }

  if (runningSources.pjsip) {
    sections.push(
      `=== PJSIP SIP Log ===\n[${timestamp}] Log capture started...\n`,
    );
  }

  return sections.join("\n");
};

const SipLogViewer = () => {
  const [asteriskSelected, setAsteriskSelected] = useState(false);
  const [pjsipSelected, setPjsipSelected] = useState(false);
  const [runningSources, setRunningSources] = useState({
    asterisk: false,
    pjsip: false,
  });
  const [consoleText, setConsoleText] = useState(buildIdleConsoleText);

  const anySelected = asteriskSelected || pjsipSelected;
  const anyRunning = runningSources.asterisk || runningSources.pjsip;

  const activeLabels = useMemo(() => {
    const labels = [];
    if (runningSources.asterisk) labels.push("Asterisk");
    if (runningSources.pjsip) labels.push("PJSIP");
    return labels;
  }, [runningSources]);

  const handleStart = () => {
    if (!anySelected || anyRunning) return;

    const nextRunning = {
      asterisk: asteriskSelected,
      pjsip: pjsipSelected,
    };

    setRunningSources(nextRunning);
    setConsoleText(buildStartedConsoleText(nextRunning));
  };

  const handleStop = () => {
    if (!anyRunning) return;

    const timestamp = new Date().toLocaleTimeString();
    setConsoleText((prev) => {
      const stops = activeLabels
        .map((label) => `[${timestamp}] ${label} log capture stopped.`)
        .join("\n");
      return `${prev}\n${stops}\n`;
    });
    setRunningSources({ asterisk: false, pjsip: false });
  };

  return (
    <div style={sipLogPageWrapStyle}>
      <div style={sipLogPageInnerStyle}>
        <ExtensionBreadcrumb
          root="Maintenance"
          section="System Tools"
          current="SIP Log Viewer"
        />

        <div style={sipLogCardStyle}>
          <div style={sipLogToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                flexWrap: "wrap",
                flex: 1,
                minWidth: 0,
              }}
            >
              <SipLogSourceToggle
                label="Asterisk"
                selected={asteriskSelected}
                onToggle={setAsteriskSelected}
                disabled={runningSources.asterisk}
              />
              <SipLogSourceToggle
                label="PJSIP"
                selected={pjsipSelected}
                onToggle={setPjsipSelected}
                disabled={runningSources.pjsip}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  type="button"
                  variant="primary"
                  style={sipLogPrimaryBtnStyle}
                  onClick={handleStart}
                  disabled={!anySelected || anyRunning}
                >
                  Start
                </Btn>
                <Btn
                  type="button"
                  variant="cancel"
                  style={sipLogCancelBtnStyle}
                  onClick={handleStop}
                  disabled={!anyRunning}
                >
                  Stop
                </Btn>
              </div>
            </div>

            <Btn type="button" variant="cancel" style={sipLogCancelBtnStyle}>
              ⬇ Download Log
            </Btn>
          </div>

          <div style={{ backgroundColor: "#000000" }}>
            <textarea
              readOnly
              spellCheck={false}
              tabIndex={-1}
              onFocus={(e) => e.target.blur()}
              style={sipLogConsoleStyle}
              value={consoleText}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SipLogViewer;
