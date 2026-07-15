import React from "react";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useMediaQuery,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUMBER_FILTER_POOL_COLUMNS,
  NUMBER_FILTER_POOL_GROUPS,
  NUMBER_FILTER_POOL_FIELD_TOOLTIPS,
  NUMBER_FILTER_POOL_EMPTY_MESSAGE,
  NUMBER_FILTER_POOL_MODAL_TITLE_ADD,
  NUMBER_FILTER_POOL_MODAL_TITLE_EDIT,
  NUMBER_FILTER_POOL_ADD_NEW_LABEL,
  NUMBER_FILTER_POOL_ADD_NEW_EMPTY_LABEL,
  NUMBER_FILTER_POOL_DELETE_LABEL,
  NUMBER_FILTER_POOL_CLEAR_ALL_LABEL,
  NUMBER_FILTER_POOL_SAVE_LABEL,
  NUMBER_FILTER_POOL_CLOSE_LABEL,
} from "../../../constants/NumberFilterPoolConstants";
import { useNumberPoolPage } from "./hooks/useNumberPoolPage";
import {
  NumberPoolBreadcrumb,
  NumberPoolBtn,
  NumberPoolTH,
  NumberPoolFieldRow,
  NumberPoolTableListLoading,
  NumberPoolTableListEmptyState,
  numberPoolFormPanelStyle,
  numberPoolInputStyle,
  numberPoolSelectStyle,
  numberPoolInputInteraction,
  numberPoolAddNewModalFooterStyle,
  numberPoolAddNewModalFooterBtnStyle,
  numberPoolAddNewModalFooterCancelBtnStyle,
  numberPoolCheckboxSx,
  numberPoolTdStyle,
  numberPoolC as C,
  numberPoolFixedAlertSx,
  numberPoolCardStyle,
  numberPoolToolbarStyle,
  numberPoolCancelBtnStyle,
  numberPoolToolbarBtnStyle,
  NUMBER_POOL_COMPACT_MQ,
  numberPoolDialogConfig,
} from "./components/NumberPoolFormFields";
import {
  getNumberPoolRowBg,
  getNumberPoolEditIconStyle,
  handleNumberPoolEditIconHover,
  numberPoolPageWrapStyle,
  numberPoolPageInnerStyle,
  numberPoolSelectedBadgeStyle,
  numberPoolTableScrollStyle,
  numberPoolFooterStyle,
} from "./components/NumberPoolTableHelpers";

const NumberPool = () => {
  const isCompact = useMediaQuery(NUMBER_POOL_COMPACT_MQ);
  const vm = useNumberPoolPage();
  const {
    rows,
    modalOpen,
    editIndex,
    form,
    loading,
    isInitialLoad,
    isDeleting,
    toast,
    setToast,
    allRowsChecked,
    someRowsChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClearAll,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = numberPoolDialogConfig;

  return (
    <div
      style={{
        ...numberPoolPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={numberPoolPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={numberPoolFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <NumberPoolBreadcrumb />

        <div style={numberPoolCardStyle}>
          <div
            style={{
              ...numberPoolToolbarStyle,
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
              {rows.some((r) => r.checked) && (
                <span style={numberPoolSelectedBadgeStyle}>
                  {rows.filter((r) => r.checked).length} selected
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
              <NumberPoolBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  isInitialLoad || !rows.some((r) => r.checked) || isDeleting
                }
                style={numberPoolCancelBtnStyle}
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUMBER_FILTER_POOL_DELETE_LABEL}
              </NumberPoolBtn>
              <NumberPoolBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isInitialLoad || rows.length === 0 || isDeleting}
                style={numberPoolCancelBtnStyle}
              >
                {NUMBER_FILTER_POOL_CLEAR_ALL_LABEL}
              </NumberPoolBtn>
              <NumberPoolBtn
                variant="primary"
                onClick={() => openModal()}
                disabled={isInitialLoad || isDeleting || loading}
                style={numberPoolToolbarBtnStyle}
              >
                {NUMBER_FILTER_POOL_ADD_NEW_LABEL}
              </NumberPoolBtn>
            </div>
          </div>

          {isInitialLoad ? (
            <NumberPoolTableListLoading />
          ) : rows.length === 0 ? (
            <NumberPoolTableListEmptyState
              message={NUMBER_FILTER_POOL_EMPTY_MESSAGE}
              onAddNew={() => openModal()}
              buttonLabel={NUMBER_FILTER_POOL_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={numberPoolTableScrollStyle}>
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
                      <NumberPoolTH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          checked={allRowsChecked}
                          indeterminate={someRowsChecked}
                          onChange={handleCheckAll}
                          size="small"
                          sx={numberPoolCheckboxSx}
                          disabled={rows.length === 0}
                        />
                      </NumberPoolTH>
                      {NUMBER_FILTER_POOL_COLUMNS.filter(
                        (col) => col.key !== "check" && col.key !== "modify",
                      ).map((col) => (
                        <NumberPoolTH
                          key={col.key}
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          {col.label}
                        </NumberPoolTH>
                      ))}
                      <NumberPoolTH
                        style={{
                          width: 70,
                          borderRight: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        {NUMBER_FILTER_POOL_COLUMNS.find(
                          (col) => col.key === "modify",
                        )?.label || "Modify"}
                      </NumberPoolTH>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const realIdx = idx;
                      const isChecked = row?.checked || false;
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = getNumberPoolRowBg(isChecked, realIdx);
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...numberPoolTdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleCheck(realIdx)}
                              size="small"
                              disabled={isDeleting}
                              sx={numberPoolCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...numberPoolTdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.groupNo}
                          </td>
                          <td
                            style={{
                              ...numberPoolTdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.numberRange}
                          </td>
                          <td
                            style={{
                              ...numberPoolTdStyle,
                              background: rowBg,
                              borderRight: "none",
                              ...lastRowCellStyle,
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
                                onClick={() => {
                                  if (!isDeleting) openModal(realIdx);
                                }}
                                style={getNumberPoolEditIconStyle(isDeleting)}
                                onMouseEnter={(e) =>
                                  handleNumberPoolEditIconHover(
                                    e,
                                    true,
                                    isDeleting,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleNumberPoolEditIconHover(
                                    e,
                                    false,
                                    isDeleting,
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={numberPoolFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (loading) return;
          closeModal();
        }}
        maxWidth={false}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {editIndex !== null
            ? NUMBER_FILTER_POOL_MODAL_TITLE_EDIT
            : NUMBER_FILTER_POOL_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={numberPoolFormPanelStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <NumberPoolFieldRow
                  label="Group No.:"
                  tooltipKey="groupNo"
                  tooltips={NUMBER_FILTER_POOL_FIELD_TOOLTIPS}
                >
                  <select
                    name="groupNo"
                    value={form.groupNo}
                    onChange={handleFormChange}
                    style={numberPoolSelectStyle}
                    {...numberPoolInputInteraction}
                  >
                    {NUMBER_FILTER_POOL_GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </NumberPoolFieldRow>

                <NumberPoolFieldRow
                  label="Range:"
                  tooltipKey="range"
                  tooltips={NUMBER_FILTER_POOL_FIELD_TOOLTIPS}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      name="numberRangeStart"
                      value={form.numberRangeStart}
                      onChange={handleFormChange}
                      placeholder="Start"
                      style={numberPoolInputStyle}
                      {...numberPoolInputInteraction}
                    />
                    <span
                      style={{
                        color: C.mutedText,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      -
                    </span>
                    <input
                      type="text"
                      name="numberRangeEnd"
                      value={form.numberRangeEnd}
                      onChange={handleFormChange}
                      placeholder="End"
                      style={numberPoolInputStyle}
                      {...numberPoolInputInteraction}
                    />
                  </div>
                </NumberPoolFieldRow>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={numberPoolAddNewModalFooterStyle}
        >
          <NumberPoolBtn
            onClick={handleSave}
            variant="primary"
            style={numberPoolAddNewModalFooterBtnStyle}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUMBER_FILTER_POOL_SAVE_LABEL
            )}
          </NumberPoolBtn>
          <NumberPoolBtn
            onClick={closeModal}
            variant="cancel"
            style={numberPoolAddNewModalFooterCancelBtnStyle}
            disabled={loading}
          >
            {NUMBER_FILTER_POOL_CLOSE_LABEL}
          </NumberPoolBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NumberPool;
