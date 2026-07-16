import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  SIP_ACCESS_CONTROL_COLUMNS,
  SIP_ACCESS_CONTROL_BTN_INVERSE,
  SIP_ACCESS_CONTROL_BTN_DELETE,
  SIP_ACCESS_CONTROL_BTN_CLEAR_ALL,
  SIP_ACCESS_CONTROL_BTN_ADD_NEW,
  SIP_ACCESS_CONTROL_BTN_SAVE,
  SIP_ACCESS_CONTROL_BTN_CLOSE,
  SIP_ACCESS_CONTROL_MODAL_ADD_TITLE,
  SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE,
  SIP_ACCESS_CONTROL_EMPTY_MESSAGE,
  SIP_ACCESS_CONTROL_RECORD_LABEL,
  SIP_ACCESS_CONTROL_SELECTED_SUFFIX,
  SIP_ACCESS_CONTROL_PAGINATION_SHOWING,
} from "../../../constants/SipAccessControlConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useSipAccessControlPage } from "./hooks/useSipAccessControlPage";
import { getSipAccessControlDefaultLabel } from "./utils/SipAccessControlTransformers";
import {
  TH,
  getSipAccessControlTdStyle,
  getSipAccessControlRowBg,
  sipAccessControlCheckboxSx,
} from "./components/SipAccessControlTableHelpers";
import {
  SIP_ACCESS_CONTROL_SCROLL_CLASS,
  SIP_ACCESS_CONTROL_COMPACT_MQ,
  SipAccessControlPageShell,
  SipAccessControlBreadcrumb,
  SipAccessControlTableEmptyState,
  SipAccessControlEditIcon,
  SipAccessControlFieldLabel,
  sipAccessControlTableContainerStyle,
  sipAccessControlToolbarStyle,
  sipAccessControlFixedAlertSx,
  sipAccessControlCancelBtnStyle,
  sipAccessControlPrimaryBtnStyle,
  sipAccessControlSelectedBadgeStyle,
  sipAccessControlPaginationStyle,
  sipAccessControlModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipAccessControlModalCancelBtnStyle,
  systemModalFieldInputStyle,
  systemModalTextareaStyle,
  systemModalSelectSx,
  inputInteraction,
} from "./components/SipAccessControlFormFields";

const SipAccessControl = () => {
  const isCompact = useMediaQuery(SIP_ACCESS_CONTROL_COMPACT_MQ);
  const vm = useSipAccessControlPage();
  const {
    rows,
    checkedRows,
    modalOpen,
    editingId,
    form,
    toast,
    setToast,
    modalFormFields,
    selectedCount,
    allChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
  } = vm;

  return (
    <SipAccessControlPageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={sipAccessControlFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <SipAccessControlBreadcrumb />

      <div style={sipAccessControlTableContainerStyle}>
        <div
          style={{
            ...sipAccessControlToolbarStyle,
            ...(isCompact
              ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
              : {}),
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
            {selectedCount > 0 && (
              <span style={sipAccessControlSelectedBadgeStyle}>
                {selectedCount} {SIP_ACCESS_CONTROL_SELECTED_SUFFIX}
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Btn
              variant="cancel"
              onClick={handleTableInverse}
              disabled={rows.length === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_INVERSE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selectedCount === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              {SIP_ACCESS_CONTROL_BTN_DELETE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={rows.length === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_CLEAR_ALL}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => openModal(null)}
              style={sipAccessControlPrimaryBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_ADD_NEW}
            </Btn>
          </div>
        </div>

        {rows.length === 0 ? (
          <SipAccessControlTableEmptyState
            message={SIP_ACCESS_CONTROL_EMPTY_MESSAGE}
            onAddNew={() => openModal(null)}
          />
        ) : (
          <>
            <div
              className={SIP_ACCESS_CONTROL_SCROLL_CLASS}
              style={{
                overflowX: "auto",
                overflowY: "auto",
                flex: 1,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 980,
                }}
              >
                <thead>
                  <tr>
                    {SIP_ACCESS_CONTROL_COLUMNS.map((col) => {
                      if (col.key === "check") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 40,
                              padding: 0,
                              borderLeft: "none",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={allChecked}
                              indeterminate={selectedCount > 0 && !allChecked}
                              onChange={(e) => {
                                if (e.target.checked) handleTableCheckAll();
                                else handleTableUncheckAll();
                              }}
                              sx={sipAccessControlCheckboxSx}
                            />
                          </TH>
                        );
                      }
                      if (col.key === "modify") {
                        return (
                          <TH
                            key={col.key}
                            style={{ width: 70, borderRight: "none" }}
                          >
                            {col.label}
                          </TH>
                        );
                      }
                      return <TH key={col.key}>{col.label}</TH>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isLastRow = idx === rows.length - 1;
                    const isRowChecked = !!checkedRows[row.id];
                    const rowBg = getSipAccessControlRowBg(isRowChecked, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              width: 36,
                              borderLeft: "none",
                            },
                          )}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleRowCheck(row.id)}
                            sx={sipAccessControlCheckboxSx}
                          />
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {row.name}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              maxWidth: 180,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            },
                          )}
                        >
                          {row.cidr || "—"}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              maxWidth: 200,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            },
                          )}
                        >
                          {row.domain || "—"}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {getSipAccessControlDefaultLabel(row.default)}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              maxWidth: 280,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            },
                          )}
                        >
                          {row.description || "—"}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              borderRight: "none",
                            },
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <SipAccessControlEditIcon
                              onClick={() => openModal(row)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={sipAccessControlPaginationStyle}>
              <span
                style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}
              >
                {SIP_ACCESS_CONTROL_PAGINATION_SHOWING(
                  rows.length,
                  SIP_ACCESS_CONTROL_RECORD_LABEL,
                )}
              </span>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "4px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          {editingId !== null
            ? SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE
            : SIP_ACCESS_CONTROL_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
            }}
          >
            {modalFormFields.map((field) => (
              <div
                key={field.key}
                style={{
                  display: "flex",
                  alignItems:
                    field.type === "textarea" ? "flex-start" : "center",
                  gap: 12,
                  width: "100%",
                }}
              >
                <SipAccessControlFieldLabel
                  tooltipKey={field.key}
                  style={{
                    paddingTop: field.type === "textarea" ? 8 : 0,
                  }}
                >
                  {field.label}:
                </SipAccessControlFieldLabel>
                <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                  {field.type === "text" ? (
                    <input
                      name={field.key}
                      type="text"
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      placeholder={field.placeholder || ""}
                      style={{ ...systemModalFieldInputStyle, width: "100%" }}
                      {...inputInteraction}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select
                      name={field.key}
                      value={form[field.key] || field.initial}
                      onChange={handleFormChange}
                      fullWidth
                      sx={systemModalSelectSx}
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200, overflow: "auto" },
                        },
                      }}
                    >
                      {(field.options || []).map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : null}
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      rows={4}
                      style={{ ...systemModalTextareaStyle, width: "100%" }}
                      {...inputInteraction}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={sipAccessControlModalFooterStyle}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            style={addNewModalFooterBtnStyle}
          >
            {SIP_ACCESS_CONTROL_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={sipAccessControlModalCancelBtnStyle}
          >
            {SIP_ACCESS_CONTROL_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </SipAccessControlPageShell>
  );
};

export default SipAccessControl;
