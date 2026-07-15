import React from "react";
import { CircularProgress, Checkbox } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  HOSTS_CARD_TITLE,
  HOSTS_BREADCRUMB,
  HOSTS_BUTTON_LABELS,
  HOSTS_BUTTON_VARIANTS,
  HOSTS_CANCEL_BTN_STYLE,
  HOSTS_PRIMARY_BTN_STYLE,
  HOSTS_MODAL_BTN_STYLE,
  HOSTS_TABLE_HEADERS,
  HOSTS_TABLE_STATUS,
  HOSTS_MODAL_TITLES,
  HOSTS_MODAL_LABELS,
  HOSTS_MODAL_PLACEHOLDERS,
} from "../../../../constants/HostsConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  hostsPageWrapStyle,
  hostsPageInnerStyle,
  hostsTableContainerStyle,
  hostsHeaderStyle,
  hostsHeaderTitleStyle,
  hostsHeaderActionsStyle,
  hostsFooterStyle,
  hostsFixedAlertSx,
  hostsCheckboxSx,
  getHostsRowBg,
  getHostsTdStyle,
  TH,
} from "./HostsTableHelpers";

export { hostsFixedAlertSx };

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const getInputInteraction = (hasError, errorColor = C.errorRed) => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const modalInputStyle = {
  fontSize: 13,
  padding: "0 8px",
  borderRadius: 4,
  border: `1px solid ${OUTLINED_BORDER}`,
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  height: 32,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  background: "#ffffff",
  border: "none",
  borderRadius: 4,
  width: 500,
  maxWidth: "95vw",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
};

const modalHeaderStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  borderBottom: `1px solid ${C.divider}`,
};

const modalBodyStyle = {
  padding: "24px",
  paddingBottom: "16px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  backgroundColor: "#ffffff",
};

const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 0,
};

const modalLabelStyle = {
  width: 170,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "#f8fafc",
};

export const HostsPageShell = ({ children }) => (
  <div style={hostsPageWrapStyle} data-native-scroll>
    <div style={hostsPageInnerStyle}>{children}</div>
  </div>
);

export const HostsBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={HOSTS_BREADCRUMB[0]}
    section={HOSTS_BREADCRUMB[1]}
    current={HOSTS_BREADCRUMB[2]}
  />
);

export const HostsCard = ({
  hosts,
  selected,
  loading,
  allSelected,
  someSelected,
  onInverse,
  onClearAll,
  onDelete,
  onOpenModal,
  onToggleAll,
  onSelectRow,
}) => (
  <div style={hostsTableContainerStyle}>
    <div style={hostsHeaderStyle}>
      <span style={hostsHeaderTitleStyle}>{HOSTS_CARD_TITLE}</span>
      <div style={hostsHeaderActionsStyle}>
        <Btn
          onClick={onInverse}
          disabled={loading.delete || loading.fetch}
          variant={HOSTS_BUTTON_VARIANTS.CANCEL}
          style={HOSTS_CANCEL_BTN_STYLE}
        >
          {HOSTS_BUTTON_LABELS.INVERSE}
        </Btn>
        <Btn
          onClick={onClearAll}
          disabled={loading.delete || loading.fetch || hosts.length === 0}
          variant={HOSTS_BUTTON_VARIANTS.CANCEL}
          style={HOSTS_CANCEL_BTN_STYLE}
        >
          {HOSTS_BUTTON_LABELS.CLEAR_ALL}
        </Btn>
        <Btn
          onClick={onDelete}
          disabled={loading.delete || loading.fetch || selected.length === 0}
          variant={HOSTS_BUTTON_VARIANTS.CANCEL}
          startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
          style={HOSTS_CANCEL_BTN_STYLE}
        >
          {HOSTS_BUTTON_LABELS.DELETE}
        </Btn>
        <Btn
          onClick={() => onOpenModal()}
          disabled={loading.fetch || loading.save}
          variant={HOSTS_BUTTON_VARIANTS.PRIMARY}
          style={HOSTS_PRIMARY_BTN_STYLE}
        >
          {HOSTS_BUTTON_LABELS.ADD_NEW}
        </Btn>
      </div>
    </div>

    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            <TH
              style={{
                width: 40,
                padding: 0,
                borderLeft: "none",
              }}
            >
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleAll}
                disabled={hosts.length === 0}
                sx={hostsCheckboxSx}
              />
            </TH>
            <TH>{HOSTS_TABLE_HEADERS.ID}</TH>
            <TH>{HOSTS_TABLE_HEADERS.PROXY_IP}</TH>
            <TH>{HOSTS_TABLE_HEADERS.DOMAIN}</TH>
            <TH style={{ width: 70, borderRight: "none" }}>
              {HOSTS_TABLE_HEADERS.MODIFY}
            </TH>
          </tr>
        </thead>
        <tbody>
          {loading.fetch ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  ...getHostsTdStyle(C.cardBg, { borderBottom: "none" }),
                  padding: "32px 14px",
                  borderLeft: "none",
                  borderRight: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: C.labelText,
                    fontSize: 13,
                  }}
                >
                  <CircularProgress size={24} />
                  <span>{HOSTS_TABLE_STATUS.LOADING}</span>
                </div>
              </td>
            </tr>
          ) : hosts.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  ...getHostsTdStyle(C.cardBg, { borderBottom: "none" }),
                  padding: "32px 14px",
                  color: C.labelText,
                  fontWeight: 600,
                  borderLeft: "none",
                  borderRight: "none",
                }}
              >
                {HOSTS_TABLE_STATUS.NO_DATA}
              </td>
            </tr>
          ) : (
            hosts.map((item, idx) => {
              const isSelected = selected.includes(idx);
              const isLastRow = idx === hosts.length - 1;
              const rowBg = getHostsRowBg(isSelected, idx);
              const lastRowCellStyle = isLastRow ? { borderBottom: "none" } : {};

              return (
                <tr
                  key={idx}
                  style={{
                    background: rowBg,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = rowBg;
                  }}
                >
                  <td
                    style={getHostsTdStyle(rowBg, lastRowCellStyle, {
                      borderLeft: "none",
                      width: 40,
                    })}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => onSelectRow(idx)}
                      disabled={loading.delete}
                      sx={hostsCheckboxSx}
                    />
                  </td>
                  <td style={getHostsTdStyle(rowBg, lastRowCellStyle)}>
                    {item.index ?? idx + 1}
                  </td>
                  <td style={getHostsTdStyle(rowBg, lastRowCellStyle)}>
                    {item.proxyIp || "--"}
                  </td>
                  <td style={getHostsTdStyle(rowBg, lastRowCellStyle)}>
                    {item.domain || "--"}
                  </td>
                  <td
                    style={getHostsTdStyle(rowBg, lastRowCellStyle, {
                      borderRight: "none",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <EditDocumentIcon
                        titleAccess="Edit"
                        style={{
                          cursor: loading.delete ? "not-allowed" : "pointer",
                          color: "#2563eb",
                          fontSize: 22,
                          opacity: 0.7,
                          transition: "opacity 0.15s ease",
                        }}
                        onClick={() => {
                          if (!loading.delete) onOpenModal(item, idx);
                        }}
                        onMouseEnter={(e) => {
                          if (!loading.delete)
                            e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.7";
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    {hosts.length > 0 && (
      <div style={hostsFooterStyle}>
        <span style={{ fontSize: 11, color: C.mutedText }}>
          {HOSTS_TABLE_STATUS.SHOWING(hosts.length)}
        </span>
      </div>
    )}
  </div>
);

export const HostsModal = ({
  show,
  editIndex,
  form,
  loading,
  validationErrors,
  onChange,
  onSave,
  onClose,
}) =>
  show ? (
    <div
      style={modalOverlayStyle}
      onClick={() => {
        if (!loading.save) onClose();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          {editIndex !== null
            ? HOSTS_MODAL_TITLES.EDIT
            : HOSTS_MODAL_TITLES.ADD}
        </div>
        <div style={modalBodyStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
            }}
          >
            <div style={modalRowStyle}>
              <label style={modalLabelStyle}>{HOSTS_MODAL_LABELS.INDEX}</label>
              <div
                style={{
                  width: "min(100%, 320px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  type="text"
                  value={form.index}
                  style={{
                    ...modalInputStyle,
                    backgroundColor: "#f1f5f9",
                    color: "#94a3b8",
                    cursor: "not-allowed",
                  }}
                  disabled
                />
              </div>
            </div>
            <div style={modalRowStyle}>
              <label style={modalLabelStyle}>
                {HOSTS_MODAL_LABELS.PROXY_IP}
              </label>
              <div
                style={{
                  width: "min(100%, 320px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  type="text"
                  value={form.proxyIp}
                  onChange={(e) => onChange("proxyIp", e.target.value)}
                  style={{
                    ...modalInputStyle,
                    borderColor: validationErrors.proxyIp
                      ? C.errorRed
                      : undefined,
                  }}
                  placeholder={HOSTS_MODAL_PLACEHOLDERS.PROXY_IP}
                  {...getInputInteraction(!!validationErrors.proxyIp, C.errorRed)}
                />
                {validationErrors.proxyIp && (
                  <span
                    style={{
                      color: C.errorRed,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {validationErrors.proxyIp}
                  </span>
                )}
              </div>
            </div>
            <div style={modalRowStyle}>
              <label style={modalLabelStyle}>
                {HOSTS_MODAL_LABELS.DOMAIN}
              </label>
              <div
                style={{
                  width: "min(100%, 320px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) => onChange("domain", e.target.value)}
                  style={{
                    ...modalInputStyle,
                    borderColor: validationErrors.domain
                      ? C.errorRed
                      : undefined,
                  }}
                  placeholder={HOSTS_MODAL_PLACEHOLDERS.DOMAIN}
                  {...getInputInteraction(!!validationErrors.domain, C.errorRed)}
                />
                {validationErrors.domain && (
                  <span
                    style={{
                      color: C.errorRed,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {validationErrors.domain}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={modalFooterStyle}>
          <Btn
            variant={HOSTS_BUTTON_VARIANTS.PRIMARY}
            onClick={onSave}
            disabled={loading.save}
            style={HOSTS_MODAL_BTN_STYLE}
          >
            {loading.save
              ? HOSTS_BUTTON_LABELS.SAVING
              : HOSTS_BUTTON_LABELS.SAVE}
          </Btn>
          <Btn
            variant={HOSTS_BUTTON_VARIANTS.CANCEL}
            onClick={onClose}
            disabled={loading.save}
            style={HOSTS_MODAL_BTN_STYLE}
          >
            {HOSTS_BUTTON_LABELS.CLOSE}
          </Btn>
        </div>
      </div>
    </div>
  ) : null;
