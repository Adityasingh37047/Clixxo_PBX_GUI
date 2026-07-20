import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  ROUTE_PSTN_IP_TABLE_COLUMNS,
  ROUTE_PSTN_IP_EMPTY_MESSAGE,
  ROUTE_PSTN_IP_MODAL_TITLE_ADD,
  ROUTE_PSTN_IP_MODAL_TITLE_EDIT,
  ROUTE_PSTN_IP_ADD_NEW_LABEL,
  ROUTE_PSTN_IP_ADD_NEW_EMPTY_LABEL,
  ROUTE_PSTN_IP_SAVE_LABEL,
  ROUTE_PSTN_IP_CLOSE_LABEL,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_ROOT,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_PSTN_IP_PAGE_TITLE,
} from "../../../constants/FxsRoutePstnToIPConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as RouteTelToIpBreadcrumb,
  extensionPageWrapStyle as routeTelToIpPageWrapStyle,
  extensionPageInnerStyle as routeTelToIpPageInnerStyle,
  extensionCardStyle as routeTelToIpCardStyle,
  extensionFixedAlertSx as routeTelToIpFixedAlertSx,
} from "../../../components/common";
import { useRouteTelToIpPage } from "./hooks/useRouteTelToIpPage";
import { formatRouteTelToIpDisplayValue } from "./utils/RouteTelToIpTransformers";
import {
  RouteTelToIpModalForm,
  RouteTelToIpTH,
  fxsRouteTelToIpAddNewDialogPaperSx,
  fxsRouteTelToIpAddNewDialogSx,
  routeTelToIpAddNewModalBackdropSlotProps,
  routeTelToIpAddNewModalDialogContentSx,
  routeTelToIpAddNewModalFooterBtnStyle,
  routeTelToIpAddNewModalFooterCancelBtnStyle,
  routeTelToIpAddNewModalFooterStyle,
  routeTelToIpCheckboxSx,
  routeTelToIpModalTitleStyle,
} from "./components/RouteTelToIpFormFields";
import {
  ROUTE_TEL_TO_IP_PCM_TRUNK_GROUP_TH_GAP,
  getRouteTelToIpRowBg,
  handleRouteTelToIpEditIconHover,
  routeTelToIpEditIconStyle,
  routeTelToIpEmptyStateTitleStyle,
  routeTelToIpEmptyStateWrapStyle,
  routeTelToIpHeaderStyle,
  routeTelToIpPageBadgeStyle,
  routeTelToIpPaginationCountStyle,
  routeTelToIpPaginationStyle,
  routeTelToIpSelectedBadgeStyle,
  routeTelToIpTableBodyStyle,
  routeTelToIpTdStyle,
  routeTelToIpThExtra,
  routeTelToIpToolbarCancelBtnStyle,
  routeTelToIpToolbarPrimaryBtnStyle,
  routeTelToIpToolbarBtnStyle,
} from "./components/RouteTelToIpTableHelpers";

const RoutePstnToIPPage = () => {
  const vm = useRouteTelToIpPage();
  const {
    isModalOpen,
    formData,
    setFormData,
    rules,
    selected,
    page,
    portGroups,
    indexSelect,
    editIndex,
    toast,
    setToast,
    tableMinWidth,
    totalPages,
    pagedRules,
    getAvailableIndices,
    handleOpenModal,
    handleCloseModal,
    handleIndexSelectChange,
    handleSave,
    handleInputChange,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
  } = vm;

  const formatDisplayValue = (key, value) =>
    formatRouteTelToIpDisplayValue(key, value, portGroups);

  return (
    <div style={routeTelToIpPageWrapStyle}>
      <div style={routeTelToIpPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={routeTelToIpFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <RouteTelToIpBreadcrumb
          root={ROUTE_PSTN_IP_PAGE_BREADCRUMB_ROOT}
          section={ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION}
          current={ROUTE_PSTN_IP_PAGE_TITLE}
        />

        <div style={routeTelToIpCardStyle}>
          <div style={routeTelToIpHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={routeTelToIpSelectedBadgeStyle(C.accent)}>
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
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0}
                style={routeTelToIpToolbarCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={routeTelToIpToolbarCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0}
                style={routeTelToIpToolbarCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={routeTelToIpToolbarPrimaryBtnStyle}
              >
                {ROUTE_PSTN_IP_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          <div style={routeTelToIpTableBodyStyle}>
            {rules.length === 0 ? (
              <div style={routeTelToIpEmptyStateWrapStyle}>
                <div style={routeTelToIpEmptyStateTitleStyle}>
                  {ROUTE_PSTN_IP_EMPTY_MESSAGE}
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={routeTelToIpToolbarCancelBtnStyle}
                >
                  {ROUTE_PSTN_IP_ADD_NEW_EMPTY_LABEL}
                </Btn>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: tableMinWidth,
                }}
              >
                <thead>
                  <tr>
                    <RouteTelToIpTH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        ...routeTelToIpThExtra,
                        ...ROUTE_TEL_TO_IP_PCM_TRUNK_GROUP_TH_GAP,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={
                          rules.length > 0 && selected.length === rules.length
                        }
                        indeterminate={
                          selected.length > 0 && selected.length < rules.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) handleCheckAll();
                          else handleUncheckAll();
                        }}
                        sx={routeTelToIpCheckboxSx}
                      />
                    </RouteTelToIpTH>
                    {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                      <RouteTelToIpTH
                        key={col.key}
                        style={{
                          ...routeTelToIpThExtra,
                          ...ROUTE_TEL_TO_IP_PCM_TRUNK_GROUP_TH_GAP,
                        }}
                      >
                        {col.label}
                      </RouteTelToIpTH>
                    ))}
                    <RouteTelToIpTH
                      style={{
                        width: 70,
                        borderRight: "none",
                        ...routeTelToIpThExtra,
                        ...ROUTE_TEL_TO_IP_PCM_TRUNK_GROUP_TH_GAP,
                      }}
                    >
                      Modify
                    </RouteTelToIpTH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRules.map((item, idx) => {
                    const realIdx = (page - 1) * vm.itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRules.length - 1;
                    const rowBg = getRouteTelToIpRowBg(isSelected, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={realIdx}
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
                          style={{
                            ...routeTelToIpTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(idx)}
                            sx={routeTelToIpCheckboxSx}
                          />
                        </td>
                        {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...routeTelToIpTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {formatDisplayValue(col.key, item[col.key])}
                          </td>
                        ))}
                        <td
                          style={{
                            ...routeTelToIpTdStyle,
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
                              style={routeTelToIpEditIconStyle}
                              onClick={() => handleOpenModal(item, realIdx)}
                              onMouseEnter={(e) =>
                                handleRouteTelToIpEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleRouteTelToIpEditIconHover(e, false)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {rules.length > 0 && (
            <div style={routeTelToIpPaginationStyle}>
              <span style={routeTelToIpPaginationCountStyle}>
                Showing {pagedRules.length} record
                {pagedRules.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  ← Prev
                </Btn>
                <span style={routeTelToIpPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={routeTelToIpAddNewModalBackdropSlotProps}
          sx={fxsRouteTelToIpAddNewDialogSx}
          PaperProps={{ sx: fxsRouteTelToIpAddNewDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={routeTelToIpModalTitleStyle}>
            {editIndex !== null
              ? ROUTE_PSTN_IP_MODAL_TITLE_EDIT
              : ROUTE_PSTN_IP_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={routeTelToIpAddNewModalDialogContentSx}
          >
            <RouteTelToIpModalForm
              indexSelect={indexSelect}
              editIndex={editIndex}
              formData={formData}
              portGroups={portGroups}
              getAvailableIndices={getAvailableIndices}
              handleIndexSelectChange={handleIndexSelectChange}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={routeTelToIpAddNewModalFooterStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={routeTelToIpAddNewModalFooterBtnStyle}
            >
              {ROUTE_PSTN_IP_SAVE_LABEL}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={routeTelToIpAddNewModalFooterCancelBtnStyle}
            >
              {ROUTE_PSTN_IP_CLOSE_LABEL}
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default RoutePstnToIPPage;
