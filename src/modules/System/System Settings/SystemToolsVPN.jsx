import React from "react";
import { Alert, CircularProgress, Chip } from "@mui/material";
import StartIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  SYSTEM_TOOLS_VPN_TYPES, SYSTEM_TOOLS_VPN_SECTION_TITLE, SYSTEM_TOOLS_VPN_TYPE_LABEL,
  SYSTEM_TOOLS_VPN_BTN_SAVE, SYSTEM_TOOLS_VPN_BTN_SAVING, SYSTEM_TOOLS_VPN_BTN_START,
  SYSTEM_TOOLS_VPN_BTN_STARTING, SYSTEM_TOOLS_VPN_BTN_STOP, SYSTEM_TOOLS_VPN_BTN_STOPPING,
  SYSTEM_TOOLS_VPN_BTN_UPLOAD, SYSTEM_TOOLS_VPN_BTN_UPLOADING, SYSTEM_TOOLS_VPN_BTN_REFRESH_LOGS,
  SYSTEM_TOOLS_VPN_BTN_REFRESHING_LOGS, SYSTEM_TOOLS_VPN_BTN_CLEAR_LOGS, SYSTEM_TOOLS_VPN_BTN_CHOOSE_FILE,
} from "../../../constants/SystemToolsVPNConstants";
import { useSystemToolsVPNPage } from "./hooks/useSystemToolsVPNPage";
import { C, CARD_RADIUS, OUTLINED_FOCUS } from "./SystemToolsVPNTableHelpers";
import { Btn, inputInteraction, ROW, selectStyle, SeInput, SYSTEM_TOOLS_VPN_SCROLL_CLASS, VpnBreadcrumb, VpnPageShell, vpnContentStyle, vpnFixedAlertSx, vpnLogTextareaStyle, vpnSaveBtnStyle, vpnTableContainerStyle, vpnToolbarBtnStyle, vpnToolbarStyle, vpnUploadLabelStyle } from "./SystemToolsVPNFormFields";

const SystemToolsVPN = () => {
  const vm = useSystemToolsVPNPage();
  const {
    vpnFileInputRef, form, showAdvanced, vpnStatus, vpnLogs, selectedFile, message, setMessage, loading,
    seForm, authMethod, setAuthMethod, seCertFile, seKeyFile, seStatus, seLogs, setSeLogs, isProfileCreated,
    enableChoice, setEnableChoice, enableSeChoice, setEnableSeChoice, showSeAdvanced,
    handleVpnTypeSelect, handleCertChange, handleSeChange, handleSeCert, handleSeKey, areSeFieldsFilled,
    handleSeCreateFlow, handleSeDisconnect, handleSeStatus, handleSeConnect, handleSeDelete, handleSeState,
    handleFileUpload, handleStartVpn, handleStopVpn, handleCheckStatus, handleRefreshLogs, handleSaveEnable, handleSaveSeEnable,
    seFieldPairs, seRowLabelStyle,
  } = vm;
  return (
    <VpnPageShell>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={vpnFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <VpnBreadcrumb />

      <div >
        <div style={vpnTableContainerStyle}>
          <div style={vpnToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              {SYSTEM_TOOLS_VPN_SECTION_TITLE}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ fontSize: 13, fontWeight: 600, color: C.labelText }}
              >
                {SYSTEM_TOOLS_VPN_TYPE_LABEL}
              </span>
              {SYSTEM_TOOLS_VPN_TYPES.map((opt) => (
                <Btn
                  key={opt.value}
                  type="button"
                  variant={
                    form.vpnType === opt.value ? "tabActive" : "tabInactive"
                  }
                  onClick={() => handleVpnTypeSelect(opt.value)}
                  style={{ height: 30 }}
                >
                  {opt.label}
                </Btn>
              ))}
            </div>
          </div>

          <div style={vpnContentStyle}>
            {/* ── OpenVPN ── */}
            {form.vpnType === "openvpn" && (
              <div>
                <div
                  style={{
                    maxWidth: 680,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <ROW label="AutoStart OPENVPN:">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 24,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableOpenVpn"
                            checked={enableChoice === "yes"}
                            onChange={() => setEnableChoice("yes")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            Yes
                          </span>
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableOpenVpn"
                            checked={enableChoice === "no"}
                            onChange={() => setEnableChoice("no")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            No
                          </span>
                        </label>
                      </div>
                      <Btn
                        variant="primary"
                        onClick={handleSaveEnable}
                        disabled={loading.toggle}
                        style={vpnSaveBtnStyle}
                      >
                        {loading.toggle ? SYSTEM_TOOLS_VPN_BTN_SAVING : SYSTEM_TOOLS_VPN_BTN_SAVE}
                      </Btn>
                    </div>
                  </ROW>

                  {showAdvanced && (
                    <>
                      <div style={{ height: 1, background: C.divider }} />

                      <ROW label="Configuration File:">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <input
                              ref={vpnFileInputRef}
                              id="vpn-file-upload"
                              type="file"
                              accept=".ovpn,.conf"
                              onChange={handleCertChange}
                              style={{ display: "none" }}
                            />
                            <Btn
                              type="button"
                              variant="cancel"
                              onClick={() => vpnFileInputRef.current?.click()}
                              style={vpnToolbarBtnStyle}
                            >
                              {SYSTEM_TOOLS_VPN_BTN_CHOOSE_FILE}
                            </Btn>
                            <span
                              style={{
                                fontSize: 11,
                                color: C.mutedText,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                minWidth: 0,
                              }}
                              title={
                                selectedFile
                                  ? selectedFile.name
                                  : "No file chosen"
                              }
                            >
                              {selectedFile
                                ? selectedFile.name
                                : "No file chosen"}
                            </span>
                          </div>
                          <Btn
                            variant="primary"
                            onClick={handleFileUpload}
                            disabled={loading.upload || !selectedFile}
                            startIcon={
                              loading.upload ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : (
                                <UploadIcon sx={{ fontSize: 13 }} />
                              )
                            }
                            style={{ ...vpnToolbarBtnStyle, minWidth: 105, flexShrink: 0 }}
                          >
                            {loading.upload ? SYSTEM_TOOLS_VPN_BTN_UPLOADING : SYSTEM_TOOLS_VPN_BTN_UPLOAD}
                          </Btn>
                        </div>
                      </ROW>

                      <ROW label="Current Status:">
                        <Chip
                          label={vpnStatus}
                          size="small"
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: "6px",
                            color: "#fff",
                            px: 0.5,
                            backgroundColor:
                              vpnStatus === "Running"
                                ? "#16a34a"
                                : vpnStatus === "Stopped"
                                  ? C.errorRed
                                  : "#ea580c",
                          }}
                        />
                      </ROW>

                      <div style={{ height: 1, background: C.divider }} />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 12,
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}
                      >
                        <Btn
                          variant="primary"
                          onClick={handleStartVpn}
                          disabled={loading.start}
                          startIcon={
                            loading.start ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <StartIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={vpnToolbarBtnStyle}
                        >
                          {loading.start ? SYSTEM_TOOLS_VPN_BTN_STARTING : SYSTEM_TOOLS_VPN_BTN_START}
                        </Btn>
                        <Btn
                          variant="primary"
                          onClick={handleStopVpn}
                          disabled={loading.stop}
                          startIcon={
                            loading.stop ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <StopIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={vpnToolbarBtnStyle}
                        >
                          {loading.stop ? SYSTEM_TOOLS_VPN_BTN_STOPPING : SYSTEM_TOOLS_VPN_BTN_STOP}
                        </Btn>
                        <Btn
                          variant="cancel"
                          onClick={handleCheckStatus}
                          disabled={loading.status}
                          startIcon={
                            loading.status ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <CheckCircleIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={{ ...vpnToolbarBtnStyle, minWidth: 130 }}
                        >
                          {loading.status ? "Checking..." : "Check Status"}
                        </Btn>
                      </div>
                    </>
                  )}
                </div>

                {showAdvanced && (
                  <div
                    style={{
                      marginTop: 32,
                      borderTop: `1px solid ${C.divider}`,
                      paddingTop: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.strongText,
                          }}
                        >
                          VPN Logs
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: C.mutedText,
                            marginLeft: 8,
                          }}
                        >
                          Live output from the OpenVPN service
                        </span>
                      </div>
                      <Btn
                        variant="cancel"
                        onClick={handleRefreshLogs}
                        disabled={loading.logs}
                        style={vpnToolbarBtnStyle}
                        startIcon={
                          loading.logs ? (
                            <CircularProgress size={13} color="inherit" />
                          ) : (
                            <RefreshIcon sx={{ fontSize: 13 }} />
                          )
                        }
                      >
                        {loading.logs ? SYSTEM_TOOLS_VPN_BTN_REFRESHING_LOGS : SYSTEM_TOOLS_VPN_BTN_REFRESH_LOGS}
                      </Btn>
                    </div>
                    <textarea
                      value={vpnLogs || "No logs available"}
                      readOnly
                      className={SYSTEM_TOOLS_VPN_SCROLL_CLASS}
                      style={vpnLogTextareaStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── SoftEtherVPN ── */}
            {form.vpnType === "softethervpn" && (
              <div>
                <div
                  style={{
                    maxWidth: 680,
                    margin: "0 auto 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <ROW label="AutoStart SoftEtherVPN:">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 24,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableSeTop"
                            checked={enableSeChoice === "yes"}
                            onChange={() => setEnableSeChoice("yes")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            Yes
                          </span>
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableSeTop"
                            checked={enableSeChoice === "no"}
                            onChange={() => setEnableSeChoice("no")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            No
                          </span>
                        </label>
                      </div>
                      <Btn
                        variant="primary"
                        onClick={handleSaveSeEnable}
                        disabled={loading.toggle}
                        style={vpnSaveBtnStyle}
                      >
                        {loading.toggle ? SYSTEM_TOOLS_VPN_BTN_SAVING : SYSTEM_TOOLS_VPN_BTN_SAVE}
                      </Btn>
                    </div>
                  </ROW>
                </div>

                {showSeAdvanced && (
                  <>
                    {/* Inner config box — no cut lines, clean card */}
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: CARD_RADIUS,
                        border: `1px solid ${C.cardBorder}`,
                        padding: "20px 24px",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.strongText,
                          marginBottom: 18,
                        }}
                      >
                        SoftEtherVPN Configuration
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          marginBottom: 16,
                        }}
                      >
                        {seFieldPairs.map((pair, pairIdx) => (
                          <div
                            key={pairIdx}
                            style={{ display: "flex", gap: 24 }}
                          >
                            {pair.map(({ label, field, type }) => (
                              <div
                                key={field}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <label style={seRowLabelStyle}>{label}</label>
                                <SeInput field={field} type={type} seForm={seForm} handleSeChange={handleSeChange} isProfileCreated={isProfileCreated} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          height: 1,
                          background: C.divider,
                          margin: "4px 0 14px",
                        }}
                      />

                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 12,
                        }}
                      >
                        Authentication
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          maxWidth: 460,
                          marginBottom: authMethod === "certificate" ? 12 : 0,
                        }}
                      >
                        <label style={{ ...seRowLabelStyle, opacity: 1 }}>
                          Auth Method:
                        </label>
                        <select
                          value={authMethod}
                          onChange={(e) => setAuthMethod(e.target.value)}
                          style={{ ...selectStyle, flex: 1 }}
                          onFocus={inputInteraction.onFocus}
                          onBlur={inputInteraction.onBlur}
                          onMouseEnter={inputInteraction.onMouseEnter}
                          onMouseLeave={inputInteraction.onMouseLeave}
                        >
                          <option value="password">Password</option>
                          <option value="certificate">Certificate</option>
                        </select>
                      </div>

                      {authMethod === "certificate" && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 16,
                            paddingLeft: 140,
                            marginTop: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <input
                              id="se-cert"
                              type="file"
                              accept=".cer,.crt"
                              style={{ display: "none" }}
                              onChange={handleSeCert}
                            />
                            <label
                              htmlFor="se-cert"
                              style={vpnUploadLabelStyle}
                            >
                              Upload Cert (.cer)
                            </label>
                            <span style={{ fontSize: 11, color: C.mutedText }}>
                              {seCertFile ? seCertFile.name : "No file"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <input
                              id="se-key"
                              type="file"
                              accept=".key"
                              style={{ display: "none" }}
                              onChange={handleSeKey}
                            />
                            <label
                              htmlFor="se-key"
                              style={vpnUploadLabelStyle}
                            >
                              Upload Key (.key)
                            </label>
                            <span style={{ fontSize: 11, color: C.mutedText }}>
                              {seKeyFile ? seKeyFile.name : "No file"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          height: 1,
                          background: C.divider,
                          margin: "14px 0",
                        }}
                      />

                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 10,
                        }}
                      >
                        Connection Status
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <label style={{ ...seRowLabelStyle, opacity: 1 }}>
                          Current Status:
                        </label>
                        <Chip
                          label={seStatus}
                          size="small"
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: "6px",
                            color: "#fff",
                            px: 0.5,
                            backgroundColor:
                              seStatus === "Running"
                                ? "#16a34a"
                                : seStatus === "Stopped"
                                  ? C.errorRed
                                  : seStatus === "Connecting"
                                    ? "#2563eb"
                                    : "#ea580c",
                          }}
                        />
                      </div>
                    </div>

                    {/* Action buttons — outside the config box */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 28,
                      }}
                    >
                      {!isProfileCreated ? (
                        <Btn
                          variant="primary"
                          onClick={handleSeCreateFlow}
                          disabled={loading.seCreate || !areSeFieldsFilled()}
                          style={{ ...vpnToolbarBtnStyle, minWidth: 130 }}
                        >
                          {loading.seCreate
                            ? "Processing..."
                            : "Create & Connect"}
                        </Btn>
                      ) : (
                        <>
                          {seStatus === "Running" ||
                          seStatus === "Connecting" ? (
                            <Btn
                              variant="error"
                              onClick={handleSeDisconnect}
                              disabled={
                                loading.seDisconnect ||
                                !seForm.connectionName.trim()
                              }
                              style={vpnToolbarBtnStyle}
                            >
                              {loading.seDisconnect
                                ? "Disconnecting..."
                                : "Disconnect"}
                            </Btn>
                          ) : (
                            <Btn
                              variant="primary"
                              onClick={handleSeConnect}
                              disabled={
                                loading.seConnect ||
                                !seForm.connectionName.trim()
                              }
                              style={vpnToolbarBtnStyle}
                            >
                              {loading.seConnect ? "Connecting..." : "Connect"}
                            </Btn>
                          )}
                          <Btn
                            variant="cancel"
                            onClick={() => handleSeStatus(false)}
                            disabled={loading.seStatus}
                            style={vpnToolbarBtnStyle}
                          >
                            {loading.seStatus ? "Checking..." : "Check Status"}
                          </Btn>
                          <Btn
                            variant="default"
                            onClick={handleSeState}
                            disabled={loading.seState}
                            style={{ ...vpnToolbarBtnStyle, minWidth: 100 }}
                          >
                            {loading.seState ? "Checking..." : "VPN State"}
                          </Btn>
                          <Btn
                            variant="error"
                            onClick={() =>
                              handleSeDelete(seForm.connectionName)
                            }
                            disabled={loading.seDelete}
                            style={vpnToolbarBtnStyle}
                          >
                            {loading.seDelete
                              ? "Deleting..."
                              : "Delete Profile"}
                          </Btn>
                        </>
                      )}
                    </div>

                    {/* SoftEther Logs */}
                    <div
                      style={{
                        borderTop: `1px solid ${C.divider}`,
                        paddingTop: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.strongText,
                            }}
                          >
                            SoftEther Logs
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: C.mutedText,
                              marginLeft: 8,
                            }}
                          >
                            Client activity log
                          </span>
                        </div>
                        <Btn
                          variant="cancel"
                          onClick={() => setSeLogs("")}
                          style={vpnToolbarBtnStyle}
                        >
                          {SYSTEM_TOOLS_VPN_BTN_CLEAR_LOGS}
                        </Btn>
                      </div>
                      <textarea
                        value={seLogs || "No logs yet"}
                        readOnly
                        className={SYSTEM_TOOLS_VPN_SCROLL_CLASS}
                        style={vpnLogTextareaStyle}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </VpnPageShell>
  );
};

export default SystemToolsVPN;
