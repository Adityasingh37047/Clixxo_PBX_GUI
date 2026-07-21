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
  CircularProgress,
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
} from "../../../constants/RoutePstnToIPConstants";
import {
  ExtensionBreadcrumb as RoutePstnToIpBreadcrumb,
  extensionPageWrapStyle as routePstnToIpPageWrapStyle,
  extensionPageInnerStyle as routePstnToIpPageInnerStyle,
  extensionFixedAlertSx as routePstnToIpFixedAlertSx,
  extensionSelectedBadgeStyle as routePstnToIpSelectedBadgeStyle,
} from "../../../components/common";
import { useRoutePstnToIpPage } from "./hooks/useRoutePstnToIpPage";
import { formatRoutePstnToIpDisplayValue } from "./utils/RoutePstnToIpTransformers";
import {
  RoutePstnToIpBtn,
  RoutePstnToIpTH,
  RoutePstnToIpModalForm,
  RoutePstnToIpTableListLoading,
  RoutePstnToIpTableListEmptyState,
  RoutePstnToIpPagination,
  routePstnToIpCardStyle,
  routePstnToIpToolbarStyle,
  routePstnToIpPaginationStyle,
  routePstnToIpAddNewModalFooterStyle,
  routePstnToIpAddNewModalFooterBtnStyle,
  routePstnToIpAddNewModalFooterCancelBtnStyle,
  routePstnToIpAddNewModalBackdropSlotProps,
  routePstnToIpAddNewModalDialogContentSx,
  routePstnToIpCheckboxSx,
  routePstnToIpTdStyle,
  routePstnToIpCancelBtnStyle,
  routePstnToIpPrimaryBtnStyle,
  routePstnToIpDialogConfig,
} from "./components/RoutePstnToIpFormFields";
import {
  getRoutePstnToIpRowBg,
  getRoutePstnToIpEditIconStyle,
  handleRoutePstnToIpEditIconHover,
  routePstnToIpTableScrollStyle,
} from "./components/RoutePstnToIpTableHelpers";

const RoutePstnToIPPage = () => {
  const vm = useRoutePstnToIpPage();
  const {
    isModalOpen,
    formData,
    setFormData,
    rules,
    selected,
    page,
    itemsPerPage,
    sipTrunkGroups,
    pcmTrunkGroups,
    loading,
    message,
    setMessage,
    tableMinWidth,
    totalPages,
    pagedRules,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = routePstnToIpDialogConfig;

  const formatDisplayValue = (key, value, rowIndex = 0) =>
    formatRoutePstnToIpDisplayValue(key, value, rowIndex, page, itemsPerPage);

  return (
    <div style={routePstnToIpPageWrapStyle}>
      <div style={routePstnToIpPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={routePstnToIpFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RoutePstnToIpBreadcrumb
          root={ROUTE_PSTN_IP_PAGE_BREADCRUMB_ROOT}
          section={ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION}
          current={ROUTE_PSTN_IP_PAGE_TITLE}
        />

        <div style={routePstnToIpCardStyle}>
          <div style={routePstnToIpToolbarStyle}>
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
                <span style={routePstnToIpSelectedBadgeStyle}>
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
              <RoutePstnToIpBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={routePstnToIpCancelBtnStyle}
              >
                Inverse
              </RoutePstnToIpBtn>
              <RoutePstnToIpBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={routePstnToIpCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </RoutePstnToIpBtn>
              <RoutePstnToIpBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={routePstnToIpCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </RoutePstnToIpBtn>
              <RoutePstnToIpBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={routePstnToIpPrimaryBtnStyle}
              >
                {ROUTE_PSTN_IP_ADD_NEW_LABEL}
              </RoutePstnToIpBtn>
            </div>
          </div>

          {loading.fetch ? (
            <RoutePstnToIpTableListLoading />
          ) : rules.length === 0 ? (
            <RoutePstnToIpTableListEmptyState
              message={ROUTE_PSTN_IP_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={ROUTE_PSTN_IP_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={routePstnToIpTableScrollStyle}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      <RoutePstnToIpTH
                        style={{ width: 40, padding: 0, borderLeft: "none" }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            rules.length > 0 && selected.length === rules.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < rules.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={routePstnToIpCheckboxSx}
                        />
                      </RoutePstnToIpTH>
                      {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                        <RoutePstnToIpTH key={col.key}>
                          {col.label}
                        </RoutePstnToIpTH>
                      ))}
                      <RoutePstnToIpTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </RoutePstnToIpTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getRoutePstnToIpRowBg(isSelected, idx);
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
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...routePstnToIpTdStyle,
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
                              disabled={loading.delete}
                              sx={routePstnToIpCheckboxSx}
                            />
                          </td>
                          {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...routePstnToIpTdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key], idx)}
                            </td>
                          ))}
                          <td
                            style={{
                              ...routePstnToIpTdStyle,
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
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                style={getRoutePstnToIpEditIconStyle(
                                  loading.delete,
                                )}
                                onMouseEnter={(e) =>
                                  handleRoutePstnToIpEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleRoutePstnToIpEditIconHover(
                                    e,
                                    false,
                                    loading.delete,
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

              <RoutePstnToIpPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
                style={routePstnToIpPaginationStyle}
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        slotProps={routePstnToIpAddNewModalBackdropSlotProps}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? ROUTE_PSTN_IP_MODAL_TITLE_EDIT
            : ROUTE_PSTN_IP_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={routePstnToIpAddNewModalDialogContentSx}
        >
          <RoutePstnToIpModalForm
            formData={formData}
            setFormData={setFormData}
            sipTrunkGroups={sipTrunkGroups}
            pcmTrunkGroups={pcmTrunkGroups}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={routePstnToIpAddNewModalFooterStyle}
        >
          <RoutePstnToIpBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={routePstnToIpAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              ROUTE_PSTN_IP_SAVE_LABEL
            )}
          </RoutePstnToIpBtn>
          <RoutePstnToIpBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={routePstnToIpAddNewModalFooterCancelBtnStyle}
          >
            {ROUTE_PSTN_IP_CLOSE_LABEL}
          </RoutePstnToIpBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoutePstnToIPPage;
