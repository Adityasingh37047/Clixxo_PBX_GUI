import React from "react";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_EMPTY_MESSAGE,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_ADD,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_DELETE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLEAR_ALL_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_SAVE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLOSE_LABEL,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_NOTE,
} from "../../../constants/E1PriCallerIDReservePoolConstants";
import { useE1PriCallerIDReservePoolPage } from "./hooks/useE1PriCallerIDReservePoolPage";
import {
  E1PriCallerIDReservePoolBreadcrumb,
  E1PriCallerIDReservePoolBtn,
  E1PriCallerIDReservePoolTH,
  E1PriCallerIDReservePoolFieldRow,
  e1PriCallerIDReservePoolInputStyle,
  e1PriCallerIDReservePoolInputInteraction,
  e1PriCallerIDReservePoolFormPanelStyle,
  e1PriCallerIDReservePoolCardStyle,
  e1PriCallerIDReservePoolToolbarStyle,
  e1PriCallerIDReservePoolCancelBtnStyle,
  e1PriCallerIDReservePoolToolbarBtnStyle,
  e1PriCallerIDReservePoolAddNewModalFooterStyle,
  e1PriCallerIDReservePoolAddNewModalFooterBtnStyle,
  e1PriCallerIDReservePoolAddNewModalFooterCancelBtnStyle,
  e1PriCallerIDReservePoolCheckboxSx,
  e1PriCallerIDReservePoolTdStyle,
  e1PriCallerIDReservePoolC as C,
  e1PriCallerIDReservePoolDialogConfig,
} from "./components/E1PriCallerIDReservePoolFormFields";
import {
  getE1PriCallerIDReservePoolRowBg,
  e1PriCallerIDReservePoolEditIconStyle,
  handleE1PriCallerIDReservePoolEditIconHover,
  e1PriCallerIDReservePoolPageWrapStyle,
  e1PriCallerIDReservePoolPageInnerStyle,
  e1PriCallerIDReservePoolSelectedBadgeStyle,
  e1PriCallerIDReservePoolEmptyWrapStyle,
  e1PriCallerIDReservePoolEmptyTitleStyle,
  e1PriCallerIDReservePoolFooterStyle,
  e1PriCallerIDReservePoolNoteStyle,
} from "./components/E1PriCallerIDReservePoolTableHelpers";

const CallerIDReservePool = () => {
  const vm = useE1PriCallerIDReservePoolPage();
  const {
    isCompact,
    isModalOpen,
    formData,
    rows,
    selected,
    errors,
    allRowsChecked,
    someRowsChecked,
    isEditMode,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleInputChange,
    handleSelectRow,
    handleCheckAll,
    handleDelete,
    handleClearAll,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } =
    e1PriCallerIDReservePoolDialogConfig;

  return (
    <div
      style={{
        ...e1PriCallerIDReservePoolPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={e1PriCallerIDReservePoolPageInnerStyle}>
        <E1PriCallerIDReservePoolBreadcrumb />

        <div style={e1PriCallerIDReservePoolCardStyle}>
          <div
            style={{
              ...e1PriCallerIDReservePoolToolbarStyle,
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
              {selected.length > 0 && (
                <span style={e1PriCallerIDReservePoolSelectedBadgeStyle}>
                  {selected.length} selected
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
              <E1PriCallerIDReservePoolBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={e1PriCallerIDReservePoolCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_DELETE_LABEL}
              </E1PriCallerIDReservePoolBtn>
              <E1PriCallerIDReservePoolBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0}
                style={e1PriCallerIDReservePoolCancelBtnStyle}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLEAR_ALL_LABEL}
              </E1PriCallerIDReservePoolBtn>
              <E1PriCallerIDReservePoolBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={e1PriCallerIDReservePoolToolbarBtnStyle}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_LABEL}
              </E1PriCallerIDReservePoolBtn>
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={e1PriCallerIDReservePoolEmptyWrapStyle}>
              <div style={e1PriCallerIDReservePoolEmptyTitleStyle}>
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_EMPTY_MESSAGE}
              </div>
              <E1PriCallerIDReservePoolBtn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={e1PriCallerIDReservePoolToolbarBtnStyle}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_ADD_NEW_EMPTY_LABEL}
              </E1PriCallerIDReservePoolBtn>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 480,
                  }}
                >
                  <thead>
                    <tr>
                      <E1PriCallerIDReservePoolTH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                        }}
                      >
                        <Checkbox
                          checked={allRowsChecked}
                          indeterminate={someRowsChecked}
                          onChange={handleCheckAll}
                          size="small"
                          sx={e1PriCallerIDReservePoolCheckboxSx}
                          disabled={rows.length === 0}
                        />
                      </E1PriCallerIDReservePoolTH>
                      {NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS.filter(
                        (col) => col.key !== "check" && col.key !== "modify",
                      ).map((col) => (
                        <E1PriCallerIDReservePoolTH key={col.key}>
                          {col.label}
                        </E1PriCallerIDReservePoolTH>
                      ))}
                      <E1PriCallerIDReservePoolTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        {NUM_MANIPULATE_CALLERID_RESERVE_POOL_TABLE_COLUMNS.find(
                          (col) => col.key === "modify",
                        )?.label || "Modify"}
                      </E1PriCallerIDReservePoolTH>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isChecked = selected.includes(idx);
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = getE1PriCallerIDReservePoolRowBg(
                        isChecked,
                        idx,
                      );
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={idx}
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
                              ...e1PriCallerIDReservePoolTdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleSelectRow(idx)}
                              size="small"
                              sx={e1PriCallerIDReservePoolCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...e1PriCallerIDReservePoolTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.no}
                          </td>
                          <td
                            style={{
                              ...e1PriCallerIDReservePoolTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.callerId}
                          </td>
                          <td
                            style={{
                              ...e1PriCallerIDReservePoolTdStyle,
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
                                onClick={() => handleOpenModal(row, idx)}
                                style={e1PriCallerIDReservePoolEditIconStyle}
                                onMouseEnter={(e) =>
                                  handleE1PriCallerIDReservePoolEditIconHover(
                                    e,
                                    true,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleE1PriCallerIDReservePoolEditIconHover(
                                    e,
                                    false,
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

              <div style={e1PriCallerIDReservePoolFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>

        <p style={e1PriCallerIDReservePoolNoteStyle}>
          {NUM_MANIPULATE_CALLERID_RESERVE_POOL_NOTE}
        </p>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {isEditMode
            ? NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_CALLERID_RESERVE_POOL_MODAL_TITLE_ADD}
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
            <div style={e1PriCallerIDReservePoolFormPanelStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS.map((field) => (
                  <E1PriCallerIDReservePoolFieldRow
                    key={field.name}
                    label={field.label}
                    tooltipKey={field.name}
                    tooltips={NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELD_TOOLTIPS}
                    labelWidth={140}
                  >
                    <div style={{ width: "100%" }}>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] ?? ""}
                        onChange={handleInputChange}
                        min={field.min}
                        style={{
                          ...e1PriCallerIDReservePoolInputStyle,
                          ...(errors[field.name]
                            ? {
                                borderColor: C.amber,
                                boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.12)",
                              }
                            : {}),
                        }}
                        {...e1PriCallerIDReservePoolInputInteraction}
                      />
                      {errors[field.name] && (
                        <div
                          style={{
                            color: C.amber,
                            fontSize: 11,
                            marginTop: 4,
                            textAlign: "left",
                          }}
                        >
                          {errors[field.name]}
                        </div>
                      )}
                    </div>
                  </E1PriCallerIDReservePoolFieldRow>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={e1PriCallerIDReservePoolAddNewModalFooterStyle}
        >
          <E1PriCallerIDReservePoolBtn
            onClick={handleSave}
            variant="primary"
            style={e1PriCallerIDReservePoolAddNewModalFooterBtnStyle}
          >
            {NUM_MANIPULATE_CALLERID_RESERVE_POOL_SAVE_LABEL}
          </E1PriCallerIDReservePoolBtn>
          <E1PriCallerIDReservePoolBtn
            onClick={handleCloseModal}
            variant="cancel"
            style={e1PriCallerIDReservePoolAddNewModalFooterCancelBtnStyle}
          >
            {NUM_MANIPULATE_CALLERID_RESERVE_POOL_CLOSE_LABEL}
          </E1PriCallerIDReservePoolBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallerIDReservePool;
