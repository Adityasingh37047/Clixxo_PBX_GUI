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
  ROUTE_IP_IP_TABLE_COLUMNS,
  ROUTE_IP_IP_EMPTY_MESSAGE,
  ROUTE_IP_IP_MODAL_TITLE_ADD,
  ROUTE_IP_IP_MODAL_TITLE_EDIT,
  ROUTE_IP_IP_ADD_NEW_LABEL,
  ROUTE_IP_IP_ADD_NEW_EMPTY_LABEL,
  ROUTE_IP_IP_SAVE_LABEL,
  ROUTE_IP_IP_CLOSE_LABEL,
} from "../../../constants/RouteIPIPConstants";
import { useRouteIPToIPPage } from "./hooks/useRouteIPToIPPage";
import { formatRouteIPToIPDisplayValue } from "./utils/RouteIPToIPTransformers";
import {
  RouteIPToIPBreadcrumb,
  RouteIPToIPBtn,
  RouteIPToIPTH,
  RouteIPToIPModalForm,
  RouteIPToIPTableListLoading,
  RouteIPToIPTableListEmptyState,
  RouteIPToIPPagination,
  routeIPToIPCardStyle,
  routeIPToIPToolbarStyle,
  routeIPToIPPaginationStyle,
  routeIPToIPAddNewModalFooterStyle,
  routeIPToIPAddNewModalFooterBtnStyle,
  routeIPToIPAddNewModalFooterCancelBtnStyle,
  routeIPToIPAddNewModalBackdropSlotProps,
  routeIPToIPAddNewModalDialogContentSx,
  routeIPToIPCheckboxSx,
  routeIPToIPTdStyle,
  routeIPToIPCancelBtnStyle,
  routeIPToIPPrimaryBtnStyle,
  routeIPToIPDialogConfig,
} from "./components/RouteIPToIPFormFields";
import {
  getRouteIPToIPRowBg,
  getRouteIPToIPEditIconStyle,
  handleRouteIPToIPEditIconHover,
  routeIPToIPFixedAlertSx,
  routeIPToIPPageWrapStyle,
  routeIPToIPPageInnerStyle,
  routeIPToIPSelectedBadgeStyle,
  routeIPToIPTableScrollStyle,
} from "./components/RouteIPToIPTableHelpers";

const RouteIPIPPage = () => {
  const vm = useRouteIPToIPPage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    itemsPerPage,
    sipTrunkGroups,
    loading,
    message,
    setMessage,
    validationMessage,
    tableMinWidth,
    totalPages,
    pagedRules,
    handleOpenModal,
    handleCloseModal,
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

  const { dialogSx, paperSx, modalTitleStyle } = routeIPToIPDialogConfig;

  const formatDisplayValue = (key, value, rowIndex = 0) =>
    formatRouteIPToIPDisplayValue(key, value, rowIndex, page, itemsPerPage);

  return (
    <div style={routeIPToIPPageWrapStyle}>
      <div style={routeIPToIPPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={routeIPToIPFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RouteIPToIPBreadcrumb />

        <div style={routeIPToIPCardStyle}>
          <div style={routeIPToIPToolbarStyle}>
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
                <span style={routeIPToIPSelectedBadgeStyle}>
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
              <RouteIPToIPBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={routeIPToIPCancelBtnStyle}
              >
                Inverse
              </RouteIPToIPBtn>
              <RouteIPToIPBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={routeIPToIPCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </RouteIPToIPBtn>
              <RouteIPToIPBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={routeIPToIPCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </RouteIPToIPBtn>
              <RouteIPToIPBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={routeIPToIPPrimaryBtnStyle}
              >
                {ROUTE_IP_IP_ADD_NEW_LABEL}
              </RouteIPToIPBtn>
            </div>
          </div>

          {loading.fetch ? (
            <RouteIPToIPTableListLoading />
          ) : rules.length === 0 ? (
            <RouteIPToIPTableListEmptyState
              message={ROUTE_IP_IP_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={ROUTE_IP_IP_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={routeIPToIPTableScrollStyle}>
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
                      <RouteIPToIPTH
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
                          sx={routeIPToIPCheckboxSx}
                        />
                      </RouteIPToIPTH>
                      {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
                        <RouteIPToIPTH key={col.key}>{col.label}</RouteIPToIPTH>
                      ))}
                      <RouteIPToIPTH style={{ width: 70, borderRight: "none" }}>
                        Modify
                      </RouteIPToIPTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getRouteIPToIPRowBg(isSelected, idx);
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
                              ...routeIPToIPTdStyle,
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
                              sx={routeIPToIPCheckboxSx}
                            />
                          </td>
                          {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...routeIPToIPTdStyle,
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
                              ...routeIPToIPTdStyle,
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
                                style={getRouteIPToIPEditIconStyle(
                                  loading.delete,
                                )}
                                onMouseEnter={(e) =>
                                  handleRouteIPToIPEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleRouteIPToIPEditIconHover(
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

              <RouteIPToIPPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
                style={routeIPToIPPaginationStyle}
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
        slotProps={routeIPToIPAddNewModalBackdropSlotProps}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? ROUTE_IP_IP_MODAL_TITLE_EDIT
            : ROUTE_IP_IP_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={routeIPToIPAddNewModalDialogContentSx}
        >
          <RouteIPToIPModalForm
            formData={formData}
            handleInputChange={handleInputChange}
            sipTrunkGroups={sipTrunkGroups}
            validationMessage={validationMessage}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={routeIPToIPAddNewModalFooterStyle}
        >
          <RouteIPToIPBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={routeIPToIPAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              ROUTE_IP_IP_SAVE_LABEL
            )}
          </RouteIPToIPBtn>
          <RouteIPToIPBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={routeIPToIPAddNewModalFooterCancelBtnStyle}
          >
            {ROUTE_IP_IP_CLOSE_LABEL}
          </RouteIPToIPBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIPIPPage;
