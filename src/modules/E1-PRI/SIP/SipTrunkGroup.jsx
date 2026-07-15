import React from "react";
import {
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
  SIP_TRUNK_GROUP_FIELD_TOOLTIPS,
  SIP_TRUNK_GROUP_BTN_INVERSE,
  SIP_TRUNK_GROUP_BTN_DELETE,
  SIP_TRUNK_GROUP_BTN_CLEAR_ALL,
  SIP_TRUNK_GROUP_BTN_ADD_NEW,
  SIP_TRUNK_GROUP_BTN_SAVE,
  SIP_TRUNK_GROUP_BTN_SAVING,
  SIP_TRUNK_GROUP_BTN_CLOSE,
  SIP_TRUNK_GROUP_MODAL_ADD_TITLE,
  SIP_TRUNK_GROUP_MODAL_EDIT_TITLE,
  SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID,
  SIP_TRUNK_GROUP_LABEL_GROUP_ID,
  SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK,
  SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS,
  SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID,
  SIP_TRUNK_GROUP_EMPTY_MESSAGE,
  SIP_TRUNK_GROUP_RECORD_LABEL,
  SIP_TRUNK_GROUP_SELECTED_SUFFIX,
  SIP_TRUNK_GROUP_PAGINATION_SHOWING,
  SIP_TRUNK_GROUP_PAGINATION_PAGE_OF,
} from "../../../constants/SipTrunkGroupConstants";
import {
  Checkbox,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useSipTrunkGroupPage } from "./hooks/useSipTrunkGroupPage";
import {
  Btn,
  TH,
  SipTrunkGroupFieldLabel,
  SipTrunkGroupBreadcrumb,
  SipTrunkGroupScrollbarStyles,
  SipTrunkGroupTableListLoading,
  SipTrunkGroupTableListEmptyState,
  SipTrunkGroupPagination,
} from "./components/SipTrunkGroupFormFields";
import {
  C,
  sipTrunkGroupPageWrapStyle,
  sipTrunkGroupPageInnerStyle,
  sipTrunkGroupFixedAlertSx,
  getSipTrunkGroupTdStyle,
  getSipTrunkGroupRowBg,
  sipTrunkGroupCardStyle,
  sipTrunkGroupToolbarStyle,
  sipTrunkGroupPaginationStyle,
  sipTrunkGroupSelectedBadgeStyle,
  sipTrunkGroupCancelBtnStyle,
  sipTrunkGroupPrimaryBtnStyle,
  sipTrunkGroupPageBadgeStyle,
  sipTrunkGroupTableCheckboxSx,
  sipTrunkGroupModalTextFieldSx,
  sipTrunkGroupModalSelectSx,
  SIP_TRUNK_GROUP_SCROLL_CLASS,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX,
  SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
  addNewModalDialogContentSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipTrunkGroupModalCancelBtnStyle,
} from "./components/SipTrunkGroupTableHelpers";

const SipTrunkGroup = () => {
  const vm = useSipTrunkGroupPage();
  const {
    formData,
    groups,
    trunkIds,
    editIndex,
    editingRecordId,
    selected,
    setSelected,
    page,
    setPage,
    loading,
    showModal,
    setShowModal,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    totalPages,
    pagedGroups,
    allPageSelected,
    somePageSelected,
    handleTogglePageSelection,
    handleInputChange,
    handleSave,
    handleAddNew,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleSingleDelete,
  } = vm;

  return (
    <>
      <SipTrunkGroupScrollbarStyles />
      <div
        className={SIP_TRUNK_GROUP_SCROLL_CLASS}
        style={sipTrunkGroupPageWrapStyle}
        data-native-scroll
      >
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={sipTrunkGroupFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <div style={sipTrunkGroupPageInnerStyle}>
        <SipTrunkGroupBreadcrumb />

        <div style={sipTrunkGroupCardStyle}>
          <div style={sipTrunkGroupToolbarStyle}>
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
                <span style={sipTrunkGroupSelectedBadgeStyle}>
                  {selected.length} {SIP_TRUNK_GROUP_SELECTED_SUFFIX}
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
                onClick={handleInverse}
                disabled={loading.delete || groups.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_INVERSE}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {SIP_TRUNK_GROUP_BTN_DELETE}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || groups.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.fetch}
                variant="primary"
                style={sipTrunkGroupPrimaryBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <SipTrunkGroupTableListLoading />
          ) : groups.length === 0 ? (
            <SipTrunkGroupTableListEmptyState
              message={SIP_TRUNK_GROUP_EMPTY_MESSAGE}
              onAddNew={handleAddNew}
              buttonLabel={SIP_TRUNK_GROUP_BTN_ADD_NEW}
            />
          ) : (
            <>
              <div
                className={SIP_TRUNK_GROUP_SCROLL_CLASS}
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
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleTogglePageSelection}
                          disabled={loading.delete}
                          sx={sipTrunkGroupTableCheckboxSx}
                        />
                      </TH>
                      {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((col, colIdx, cols) => (
                        <TH
                          key={col.key}
                          style={
                            colIdx === cols.length - 1
                              ? { borderRight: "none" }
                              : undefined
                          }
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSel = selected.includes(realIdx);
                      const rowBg = getSipTrunkGroupRowBg(isSel, idx);
                      const isLastRow = idx === pagedGroups.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      const dataCellStyle = { fontWeight: 400 };

                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSel)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={getSipTrunkGroupTdStyle(rowBg, lastRowCellStyle, {
                              width: 40,
                              borderLeft: "none",
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isSel}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={sipTrunkGroupTableCheckboxSx}
                            />
                          </td>
                          {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                            (c) => c.key !== "check",
                          ).map((col, colIdx, cols) => {
                            let value = item[col.key];
                            if (col.key === "index") value = realIdx + 1;
                            const isLastCol = colIdx === cols.length - 1;
                            return (
                              <td
                                key={col.key}
                                style={getSipTrunkGroupTdStyle(
                                  rowBg,
                                  lastRowCellStyle,
                                  {
                                    ...dataCellStyle,
                                    ...(isLastCol
                                      ? { borderRight: "none" }
                                      : {}),
                                  },
                                )}
                              >
                                {value !== undefined &&
                                value !== null &&
                                value !== "" ? (
                                  value
                                ) : (
                                  <span style={{ color: C.mutedText }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <SipTrunkGroupPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedGroups.length}
                recordLabel={SIP_TRUNK_GROUP_RECORD_LABEL}
                onPageChange={(nextPage) =>
                  setPage(Math.min(totalPages, Math.max(1, nextPage)))
                }
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => !loading.save && setShowModal(false)}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
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
            flexShrink: 0,
          }}
        >
          {editingRecordId != null
            ? SIP_TRUNK_GROUP_MODAL_EDIT_TITLE
            : SIP_TRUNK_GROUP_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            flex: "1 1 auto",
          }}
          sx={addNewModalDialogContentSx}
        >
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <SipTrunkGroupFieldLabel
                  tooltipKey="sip_trunk_id"
                  tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    width: 120,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                >
                  {SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID}
                </SipTrunkGroupFieldLabel>

                <div style={{ flex: 1 }}>
                  <Select
                    name="sip_trunk_id"
                    value={formData.sip_trunk_id}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    displayEmpty
                    variant="outlined"
                    sx={sipTrunkGroupModalSelectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                      {SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK}
                    </MenuItem>

                    {trunkIds.length === 0 ? (
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        {SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS}
                      </MenuItem>
                    ) : (
                      trunkIds.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <SipTrunkGroupFieldLabel
                  tooltipKey="group_id"
                  tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    width: 120,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                >
                  {SIP_TRUNK_GROUP_LABEL_GROUP_ID}
                </SipTrunkGroupFieldLabel>

                <div style={{ flex: 1 }}>
                  <TextField
                    type="text"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    placeholder={SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID}
                    sx={sipTrunkGroupModalTextFieldSx}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? SIP_TRUNK_GROUP_BTN_SAVING : SIP_TRUNK_GROUP_BTN_SAVE}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            disabled={loading.save}
            style={sipTrunkGroupModalCancelBtnStyle}
          >
            {SIP_TRUNK_GROUP_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default SipTrunkGroup;
