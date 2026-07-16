import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  ACCESS_CONTROL_BTN_INVERSE,
  ACCESS_CONTROL_BTN_DELETE,
  ACCESS_CONTROL_BTN_CLEAR_ALL,
  ACCESS_CONTROL_BTN_ADD_NEW,
  ACCESS_CONTROL_BTN_SAVE,
  ACCESS_CONTROL_BTN_CLOSE,
  ACCESS_CONTROL_BTN_APPLY,
  ACCESS_CONTROL_BTN_CANCEL,
  ACCESS_CONTROL_MODAL_TITLE,
  ACCESS_CONTROL_SELECTED_SUFFIX,
  ACCESS_CONTROL_LOG_TITLE,
  ACCESS_CONTROL_LOG_NOTES,
  ACCESS_CONTROL_INDEX_PLACEHOLDER,
  ACCESS_CONTROL_COMMAND_PLACEHOLDER,
  ACCESS_CONTROL_TABLE_COLUMNS,
  ACCESS_CONTROL_RECORD_LABEL,
  ACCESS_CONTROL_SHOWING_RECORDS,
} from "../../../constants/AccessControlConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useAccessControlPage } from "./hooks/useAccessControlPage";
import {
  TH,
  getAccessControlTdStyle,
  getAccessControlRowBg,
  accessControlCheckboxSx,
} from "./components/AccessControlTableHelpers";
import {
  ACCESS_CONTROL_SCROLL_CLASS,
  AccessControlPageShell,
  AccessControlBreadcrumb,
  AccessControlTableEmptyState,
  AccessControlEditIcon,
  AccessControlFieldLabel,
  accessControlTableContainerStyle,
  accessControlToolbarStyle,
  accessControlFixedAlertSx,
  accessControlCancelBtnStyle,
  accessControlPrimaryBtnStyle,
  accessControlSelectedBadgeStyle,
  accessControlFooterStyle,
  accessControlModalFooterStyle,
  addNewModalFooterBtnStyle,
  accessControlModalCancelBtnStyle,
  accessControlLogSectionStyle,
  accessControlLogTitleStyle,
  accessControlLogBoxStyle,
  accessControlLogPreStyle,
  accessControlLogNotesStyle,
  systemModalFieldInputStyle,
  disabledInputStyle,
  inputInteraction,
} from "./components/AccessControlFormFields";

const AccessControl = () => {
  const vm = useAccessControlPage();
  const {
    commands,
    selected,
    showModal,
    form,
    editIndex,
    loading,
    toast,
    setToast,
    executionLogs,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleApply,
    handleCancelLogs,
  } = vm;

  return (
    <AccessControlPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{ ...accessControlFixedAlertSx, whiteSpace: "pre-line" }}
        >
          {toast.msg}
        </Alert>
      )}

      <AccessControlBreadcrumb />

      <div style={accessControlTableContainerStyle}>
        <div style={accessControlToolbarStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            {selected.length > 0 && (
              <span style={accessControlSelectedBadgeStyle}>
                {selected.length} {ACCESS_CONTROL_SELECTED_SUFFIX}
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
              onClick={handleInverse}
              disabled={loading.delete || commands.length === 0}
              style={accessControlCancelBtnStyle}
            >
              {ACCESS_CONTROL_BTN_INVERSE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selected.length === 0 || loading.delete}
              style={accessControlCancelBtnStyle}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              {loading.delete ? "Deleting..." : ACCESS_CONTROL_BTN_DELETE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={commands.length === 0 || loading.delete}
              style={accessControlCancelBtnStyle}
            >
              {loading.delete ? "Clearing..." : ACCESS_CONTROL_BTN_CLEAR_ALL}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              disabled={loading.save}
              style={accessControlPrimaryBtnStyle}
            >
              {ACCESS_CONTROL_BTN_ADD_NEW}
            </Btn>
          </div>
        </div>

        {commands.length === 0 ? (
          <AccessControlTableEmptyState
            onAddNew={() => handleOpenModal()}
            disabled={loading.save}
          />
        ) : (
          <>
            <div
              className={ACCESS_CONTROL_SCROLL_CLASS}
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
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    {ACCESS_CONTROL_TABLE_COLUMNS.map((col) => {
                      if (col.key === "check") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: col.width,
                              padding: 0,
                              borderLeft: "none",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={
                                commands.length > 0 &&
                                selected.length === commands.length
                              }
                              indeterminate={
                                selected.length > 0 &&
                                selected.length < commands.length
                              }
                              onChange={(e) =>
                                e.target.checked
                                  ? handleCheckAll()
                                  : handleUncheckAll()
                              }
                              sx={accessControlCheckboxSx}
                            />
                          </TH>
                        );
                      }
                      return (
                        <TH
                          key={col.key}
                          style={{
                            ...(col.width ? { width: col.width } : {}),
                            ...(col.key === "modify"
                              ? { borderRight: "none" }
                              : {}),
                          }}
                        >
                          {col.label}
                        </TH>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {commands.map((cmd, rowIdx) => {
                    const isLastRow = rowIdx === commands.length - 1;
                    const isSelected = selected.includes(rowIdx);
                    const rowBg = getAccessControlRowBg(isSelected, rowIdx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={rowIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={getAccessControlTdStyle(
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
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowIdx)}
                            disabled={loading.delete}
                            sx={accessControlCheckboxSx}
                          />
                        </td>
                        <td
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {cmd.index}
                        </td>
                        <td
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {cmd.command}
                        </td>
                        <td
                          style={getAccessControlTdStyle(
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
                            <AccessControlEditIcon
                              disabled={loading.delete}
                              onClick={() => handleOpenModal(cmd, rowIdx)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {commands.length > 0 && (
          <div style={accessControlFooterStyle}>
            <span style={{ fontSize: 11, color: C.mutedText }}>
              {ACCESS_CONTROL_SHOWING_RECORDS(
                commands.length,
                ACCESS_CONTROL_RECORD_LABEL,
              )}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="primary"
                onClick={handleApply}
                disabled={loading.apply}
                style={accessControlPrimaryBtnStyle}
              >
                {loading.apply ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : null}
                {ACCESS_CONTROL_BTN_APPLY}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleCancelLogs}
                disabled={loading.apply}
                style={accessControlCancelBtnStyle}
              >
                {ACCESS_CONTROL_BTN_CANCEL}
              </Btn>
            </div>
          </div>
        )}
      </div>

      <div style={accessControlLogSectionStyle}>
        <div style={accessControlLogTitleStyle}>{ACCESS_CONTROL_LOG_TITLE}</div>
        <div
          className={ACCESS_CONTROL_SCROLL_CLASS}
          style={accessControlLogBoxStyle}
        >
          <pre style={accessControlLogPreStyle}>{executionLogs}</pre>
        </div>
        <div style={accessControlLogNotesStyle}>
          {ACCESS_CONTROL_LOG_NOTES.map((note, idx) => (
            <div key={idx}>{note}</div>
          ))}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          if (!loading.save) handleCloseModal();
        }}
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
        disableRestoreFocus
        disableEnforceFocus
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
          {ACCESS_CONTROL_MODAL_TITLE}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <AccessControlFieldLabel tooltipKey="index">
                Index:
              </AccessControlFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <input
                  type="text"
                  value={form.index || ""}
                  onChange={(e) => handleChange("index", e.target.value)}
                  disabled={editIndex !== null}
                  placeholder={ACCESS_CONTROL_INDEX_PLACEHOLDER}
                  style={
                    editIndex !== null
                      ? { ...disabledInputStyle, width: "100%" }
                      : { ...systemModalFieldInputStyle, width: "100%" }
                  }
                  {...(editIndex === null ? inputInteraction : {})}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <AccessControlFieldLabel tooltipKey="command">
                Command:
              </AccessControlFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <input
                  type="text"
                  value={form.command || ""}
                  onChange={(e) => handleChange("command", e.target.value)}
                  placeholder={ACCESS_CONTROL_COMMAND_PLACEHOLDER}
                  style={{ ...systemModalFieldInputStyle, width: "100%" }}
                  {...inputInteraction}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={accessControlModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            ) : null}
            {loading.save ? "Saving..." : ACCESS_CONTROL_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={accessControlModalCancelBtnStyle}
          >
            {ACCESS_CONTROL_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </AccessControlPageShell>
  );
};

export default AccessControl;
