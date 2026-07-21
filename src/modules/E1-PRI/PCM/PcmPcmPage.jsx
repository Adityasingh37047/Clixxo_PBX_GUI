import React from "react";
import { createPortal } from "react-dom";
import {
  PCM_PCM_TABLE_HEADERS,
  PCM_PCM_SIGNALING_PROTOCOL_OPTIONS,
  PCM_PCM_CLOCK_OPTIONS,
  PCM_PCM_CONNECTION_LINE_OPTIONS,
  PCM_PCM_PAGE_TITLE,
  PCM_PCM_MODAL_TITLE_EDIT,
  PCM_PCM_SAVE_LABEL,
  PCM_PCM_CLOSE_LABEL,
  PCM_PCM_PAGE_BREADCRUMB_ROOT,
  PCM_PCM_PAGE_BREADCRUMB_SECTION,
} from "../../../constants/PcmPcmConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Checkbox, useMediaQuery } from "@mui/material";
import {
  ExtensionBreadcrumb as PcmPcmBreadcrumb,
  extensionPageWrapStyle as pcmPcmPageWrapStyle,
  extensionPageInnerStyle as pcmPcmPageInnerStyle,
  extensionCardStyle as pcmPcmCardStyle,
  extensionToolbarStyle as pcmPcmToolbarStyle,
  Btn as PcmPcmBtn,
  TH as PcmPcmTH,
  tdStyle as pcmPcmTdStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { usePcmPcmPage } from "./hooks/usePcmPcmPage";
import { renderPcmPcmCell } from "./utils/PcmPcmTransformers";
import {
  PcmPcmLabeledRow,
  pcmPcmFormPanelStyle,
  pcmPcmInputStyle,
  pcmPcmSelectStyle,
  pcmPcmInputInteraction,
  pcmPcmAddNewModalFooterStyle,
  pcmPcmAddNewModalFooterBtnStyle,
  pcmPcmCheckboxSx,
  PCM_PCM_COMPACT_MQ,
} from "./components/PcmPcmFormFields";
import {
  getPcmPcmRowBg,
  pcmPcmEditIconStyle,
  handlePcmPcmEditIconHover,
  pcmPcmModalCancelBtnStyle,
  pcmPcmTableScrollStyle,
} from "./components/PcmPcmTableHelpers";

const PcmPcmPage = () => {
  const isCompact = useMediaQuery(PCM_PCM_COMPACT_MQ);
  const {
    pcmData,
    modalOpen,
    modalForm,
    openModal,
    closeModal,
    handleModalChange,
    handleModalCheckbox,
    handleSave,
  } = usePcmPcmPage();

  return (
    <div
      style={{
        ...pcmPcmPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pcmPcmPageInnerStyle}>
        <PcmPcmBreadcrumb
          root={PCM_PCM_PAGE_BREADCRUMB_ROOT}
          section={PCM_PCM_PAGE_BREADCRUMB_SECTION}
          current={PCM_PCM_PAGE_TITLE}
        />

        <div style={pcmPcmCardStyle}>
          <div style={pcmPcmToolbarStyle}>
            <span>{PCM_PCM_PAGE_TITLE}</span>
          </div>

          <div style={{ ...pcmPcmTableScrollStyle, width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
                minWidth: 900,
                ...(isCompact ? { minWidth: 720 } : {}),
              }}
            >
              <thead>
                <tr>
                  {PCM_PCM_TABLE_HEADERS.map((h, i) => (
                    <PcmPcmTH
                      key={h}
                      style={{
                        borderLeft: i === 0 ? "none" : undefined,
                        borderRight:
                          i === PCM_PCM_TABLE_HEADERS.length - 1
                            ? "none"
                            : undefined,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {h}
                    </PcmPcmTH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pcmData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: getPcmPcmRowBg(false, idx),
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = getPcmPcmRowBg(
                        false,
                        idx,
                      );
                    }}
                  >
                    {PCM_PCM_TABLE_HEADERS.slice(0, -1).map((h, colIndex) => (
                      <td
                        key={`${idx}-${h}`}
                        style={{
                          ...pcmPcmTdStyle,
                          borderLeft: colIndex === 0 ? "none" : undefined,
                          fontWeight: 400,
                        }}
                      >
                        {renderPcmPcmCell(row, colIndex)}
                      </td>
                    ))}
                    <td
                      style={{
                        ...pcmPcmTdStyle,
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <EditDocumentIcon
                          titleAccess="Edit"
                          style={pcmPcmEditIconStyle}
                          onClick={() => openModal(idx)}
                          onMouseEnter={(e) =>
                            handlePcmPcmEditIconHover(e, true)
                          }
                          onMouseLeave={(e) =>
                            handlePcmPcmEditIconHover(e, false)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div
            role="presentation"
            onClick={closeModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1400,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pcm-pcm-dialog-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 560,
                maxWidth: "95vw",
                maxHeight: "calc(100vh - 128px)",
                background: C.cardBg,
                borderRadius: 4,
                overflow: "hidden",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                id="pcm-pcm-dialog-title"
                style={{
                  background: "#1e2d42",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {PCM_PCM_MODAL_TITLE_EDIT}
              </div>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#ffffff",
                  overflowY: "auto",
                  flex: "1 1 auto",
                }}
              >
                <div style={pcmPcmFormPanelStyle}>
                  <PcmPcmLabeledRow label="PCM No.:" tooltipKey="pcmNo">
                    <input
                      type="text"
                      value={modalForm.pcmNo ?? ""}
                      onChange={(e) =>
                        handleModalChange("pcmNo", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow
                    label="Signaling Protocol:"
                    tooltipKey="signalingProtocol"
                  >
                    <select
                      value={modalForm.signalingProtocol ?? ""}
                      onChange={(e) =>
                        handleModalChange("signalingProtocol", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_SIGNALING_PROTOCOL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow
                    label="Signaling Time Slot:"
                    tooltipKey="signalingTimeSlot"
                  >
                    <input
                      type="text"
                      value={modalForm.signalingTimeSlot ?? ""}
                      onChange={(e) =>
                        handleModalChange("signalingTimeSlot", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow label="Clock:" tooltipKey="clock">
                    <select
                      value={modalForm.clock ?? ""}
                      onChange={(e) =>
                        handleModalChange("clock", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_CLOCK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow
                    label="Connection Line:"
                    tooltipKey="connectionLine"
                  >
                    <select
                      value={modalForm.connectionLine ?? ""}
                      onChange={(e) =>
                        handleModalChange("connectionLine", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_CONNECTION_LINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow
                    label="Option Sip Trunk ID:"
                    tooltipKey="sipTrunkNo"
                  >
                    <input
                      type="text"
                      value={modalForm.sipTrunkNo ?? ""}
                      onChange={(e) =>
                        handleModalChange("sipTrunkNo", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow label="Enable CRC-4" tooltipKey="crc4">
                    <Checkbox
                      checked={!!modalForm.crc4}
                      onChange={() => handleModalCheckbox("crc4")}
                      sx={pcmPcmCheckboxSx}
                    />
                  </PcmPcmLabeledRow>
                  <PcmPcmLabeledRow
                    label="Apply to All PCMs"
                    tooltipKey="applyToAllPcMs"
                  >
                    <Checkbox
                      checked={!!modalForm.applyToAllPcMs}
                      onChange={() => handleModalCheckbox("applyToAllPcMs")}
                      sx={pcmPcmCheckboxSx}
                    />
                  </PcmPcmLabeledRow>
                </div>
              </div>
              <div style={pcmPcmAddNewModalFooterStyle}>
                <PcmPcmBtn
                  variant="primary"
                  onClick={handleSave}
                  style={pcmPcmAddNewModalFooterBtnStyle}
                >
                  {PCM_PCM_SAVE_LABEL}
                </PcmPcmBtn>
                <PcmPcmBtn
                  variant="cancel"
                  onClick={closeModal}
                  style={{
                    ...pcmPcmAddNewModalFooterBtnStyle,
                    ...pcmPcmModalCancelBtnStyle,
                  }}
                >
                  {PCM_PCM_CLOSE_LABEL}
                </PcmPcmBtn>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PcmPcmPage;
