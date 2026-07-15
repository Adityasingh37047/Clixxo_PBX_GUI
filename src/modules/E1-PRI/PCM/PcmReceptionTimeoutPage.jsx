import React from "react";
import { createPortal } from "react-dom";
import {
  PCM_RECEPTION_TIMEOUT_FIELDS,
  PCM_RECEPTION_TIMEOUT_FIELD_TOOLTIPS,
  PCM_RECEPTION_TIMEOUT_PAGE_TITLE,
  PCM_RECEPTION_TIMEOUT_MODAL_TITLE_EDIT,
} from "../../../constants/PcmReceptionTimeoutConstants";
import { Alert, useMediaQuery } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { usePcmReceptionTimeoutPage } from "./hooks/usePcmReceptionTimeoutPage";
import { formatPcmReceptionTimeoutCell } from "./utils/PcmReceptionTimeoutTransformers";
import { Btn } from "../../../components/common";
import {
  PcmReceptionTimeoutBreadcrumb,
  PcmReceptionTimeoutTH,
  PcmReceptionTimeoutFieldLabel,
  pcmReceptionTimeoutFormPanelStyle,
  pcmReceptionTimeoutInputStyle,
  pcmReceptionTimeoutInputInteraction,
  pcmReceptionTimeoutAddNewModalFooterStyle,
  pcmReceptionTimeoutAddNewModalFooterBtnStyle,
  pcmReceptionTimeoutTdStyle,
  pcmReceptionTimeoutC as C,
  pcmReceptionTimeoutCardStyle,
  pcmReceptionTimeoutToolbarStyle,
  PCM_RECEPTION_TIMEOUT_COMPACT_MQ,
} from "./components/PcmReceptionTimeoutFormFields";
import {
  pcmReceptionTimeoutEditIconStyle,
  handlePcmReceptionTimeoutEditIconHover,
  pcmReceptionTimeoutFixedAlertSx,
  pcmReceptionTimeoutPageWrapStyle,
  pcmReceptionTimeoutPageInnerStyle,
  pcmReceptionTimeoutModalCancelBtnStyle,
  pcmReceptionTimeoutTableScrollStyle,
} from "./components/PcmReceptionTimeoutTableHelpers";

const PcmReceptionTimeoutPage = () => {
  const isCompact = useMediaQuery(PCM_RECEPTION_TIMEOUT_COMPACT_MQ);
  const vm = usePcmReceptionTimeoutPage();
  const {
    isModalOpen,
    formData,
    timeoutData,
    toast,
    setToast,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...pcmReceptionTimeoutPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            ...pcmReceptionTimeoutFixedAlertSx,
            top: 20,
            right: 20,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <div style={pcmReceptionTimeoutPageInnerStyle}>
        <PcmReceptionTimeoutBreadcrumb />

        <div style={pcmReceptionTimeoutCardStyle}>
          <div style={pcmReceptionTimeoutToolbarStyle}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: C.labelText,
              }}
            >
              {PCM_RECEPTION_TIMEOUT_PAGE_TITLE}
            </span>
          </div>

          <div style={{ ...pcmReceptionTimeoutTableScrollStyle, width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
                minWidth: 600,
                ...(isCompact ? { minWidth: 480 } : {}),
              }}
            >
              <thead>
                <tr>
                  <PcmReceptionTimeoutTH
                    style={{
                      borderLeft: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Inter Digit Timeout (s)
                  </PcmReceptionTimeoutTH>
                  <PcmReceptionTimeoutTH
                    style={{ position: "sticky", top: 0, zIndex: 10 }}
                  >
                    Description
                  </PcmReceptionTimeoutTH>
                  <PcmReceptionTimeoutTH
                    style={{
                      width: 70,
                      borderRight: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Modify
                  </PcmReceptionTimeoutTH>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    background: "#ffffff",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <td
                    style={{
                      ...pcmReceptionTimeoutTdStyle,
                      borderLeft: "none",
                      borderBottom: "none",
                      fontWeight: 400,
                    }}
                  >
                    {formatPcmReceptionTimeoutCell(
                      timeoutData.interDigitTimeout,
                    )}
                  </td>
                  <td
                    style={{
                      ...pcmReceptionTimeoutTdStyle,
                      borderBottom: "none",
                      fontWeight: 400,
                    }}
                  >
                    {formatPcmReceptionTimeoutCell(timeoutData.description)}
                  </td>
                  <td
                    style={{
                      ...pcmReceptionTimeoutTdStyle,
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
                        style={pcmReceptionTimeoutEditIconStyle}
                        onClick={handleOpenModal}
                        onMouseEnter={(e) =>
                          handlePcmReceptionTimeoutEditIconHover(e, true)
                        }
                        onMouseLeave={(e) =>
                          handlePcmReceptionTimeoutEditIconHover(e, false)
                        }
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div
            role="presentation"
            onClick={handleCloseModal}
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
              aria-labelledby="pcm-reception-timeout-dialog-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 500,
                maxWidth: "95vw",
                background: C.cardBg,
                borderRadius: 4,
                overflow: "hidden",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                id="pcm-reception-timeout-dialog-title"
                style={{
                  background: "#1e2d42",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                }}
              >
                {PCM_RECEPTION_TIMEOUT_MODAL_TITLE_EDIT}
              </div>
              <div style={{ padding: "24px", backgroundColor: "#ffffff" }}>
                <div style={pcmReceptionTimeoutFormPanelStyle}>
                  {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
                    <div
                      key={field.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <PcmReceptionTimeoutFieldLabel
                        tooltipKey={field.name}
                        tooltips={PCM_RECEPTION_TIMEOUT_FIELD_TOOLTIPS}
                        style={{
                          width: 170,
                          flexShrink: 0,
                          fontSize: 13,
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {field.label}:
                      </PcmReceptionTimeoutFieldLabel>
                      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] ?? ""}
                          onChange={handleInputChange}
                          placeholder={field.placeholder || ""}
                          style={pcmReceptionTimeoutInputStyle}
                          {...pcmReceptionTimeoutInputInteraction}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={pcmReceptionTimeoutAddNewModalFooterStyle}>
                <Btn
                  variant="primary"
                  onClick={handleSave}
                  style={pcmReceptionTimeoutAddNewModalFooterBtnStyle}
                >
                  Save
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleCloseModal}
                  style={pcmReceptionTimeoutModalCancelBtnStyle}
                >
                  Cancel
                </Btn>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PcmReceptionTimeoutPage;
