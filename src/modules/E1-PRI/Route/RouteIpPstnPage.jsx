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
  ROUTE_IP_PSTN_TABLE_COLUMNS,
  ROUTE_IP_PSTN_EMPTY_MESSAGE,
  ROUTE_IP_PSTN_MODAL_TITLE_ADD,
  ROUTE_IP_PSTN_MODAL_TITLE_EDIT,
  ROUTE_IP_PSTN_ADD_NEW_LABEL,
  ROUTE_IP_PSTN_ADD_NEW_EMPTY_LABEL,
  ROUTE_IP_PSTN_SAVE_LABEL,
  ROUTE_IP_PSTN_CLOSE_LABEL,
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_ROOT,
  ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION,
  ROUTE_IP_PSTN_PAGE_TITLE,
} from "../../../constants/RouteIPtoPstnConstants";
import {
  ExtensionBreadcrumb as RouteIpPstnBreadcrumb,
  extensionPageWrapStyle as routeIpPstnPageWrapStyle,
  extensionPageInnerStyle as routeIpPstnPageInnerStyle,
  extensionFixedAlertSx as routeIpPstnFixedAlertSx,
  extensionSelectedBadgeStyle as routeIpPstnSelectedBadgeStyle,
} from "../../../components/common";
import { useRouteIpPstnPage } from "./hooks/useRouteIpPstnPage";
import { formatRouteIpPstnDisplayValue } from "./utils/RouteIpPstnTransformers";
import {
  RouteIpPstnBtn,
  RouteIpPstnTH,
  RouteIpPstnModalForm,
  RouteIpPstnTableListLoading,
  RouteIpPstnTableListEmptyState,
  RouteIpPstnPagination,
  routeIpPstnCardStyle,
  routeIpPstnToolbarStyle,
  routeIpPstnPaginationStyle,
  routeIpPstnAddNewModalFooterStyle,
  routeIpPstnAddNewModalFooterBtnStyle,
  routeIpPstnAddNewModalFooterCancelBtnStyle,
  routeIpPstnAddNewModalBackdropSlotProps,
  routeIpPstnAddNewModalDialogContentSx,
  routeIpPstnCheckboxSx,
  routeIpPstnTdStyle,
  routeIpPstnCancelBtnStyle,
  routeIpPstnPrimaryBtnStyle,
  routeIpPstnDialogConfig,
} from "./components/RouteIpPstnFormFields";
import {
  getRouteIpPstnRowBg,
  getRouteIpPstnEditIconStyle,
  handleRouteIpPstnEditIconHover,
  routeIpPstnTableScrollStyle,
} from "./components/RouteIpPstnTableHelpers";

const RouteIpPstnPage = () => {
  const vm = useRouteIpPstnPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = routeIpPstnDialogConfig;

  const formatDisplayValue = (key, value, rowIndex = 0) =>
    formatRouteIpPstnDisplayValue(
      key,
      value,
      rowIndex,
      page,
      itemsPerPage,
      pcmTrunkGroups,
    );

  return (
    <div style={routeIpPstnPageWrapStyle}>
      <div style={routeIpPstnPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={routeIpPstnFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RouteIpPstnBreadcrumb
          root={ROUTE_IP_PSTN_PAGE_BREADCRUMB_ROOT}
          section={ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION}
          current={ROUTE_IP_PSTN_PAGE_TITLE}
        />

        <div style={routeIpPstnCardStyle}>
          <div style={routeIpPstnToolbarStyle}>
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
                <span style={routeIpPstnSelectedBadgeStyle}>
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
              <RouteIpPstnBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={routeIpPstnCancelBtnStyle}
              >
                Inverse
              </RouteIpPstnBtn>
              <RouteIpPstnBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={routeIpPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </RouteIpPstnBtn>
              <RouteIpPstnBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={routeIpPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </RouteIpPstnBtn>
              <RouteIpPstnBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={routeIpPstnPrimaryBtnStyle}
              >
                {ROUTE_IP_PSTN_ADD_NEW_LABEL}
              </RouteIpPstnBtn>
            </div>
          </div>

          {loading.fetch ? (
            <RouteIpPstnTableListLoading />
          ) : rules.length === 0 ? (
            <RouteIpPstnTableListEmptyState
              message={ROUTE_IP_PSTN_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={ROUTE_IP_PSTN_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={routeIpPstnTableScrollStyle}>
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
                      <RouteIpPstnTH
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
                          sx={routeIpPstnCheckboxSx}
                        />
                      </RouteIpPstnTH>
                      {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                        <RouteIpPstnTH key={col.key}>{col.label}</RouteIpPstnTH>
                      ))}
                      <RouteIpPstnTH style={{ width: 70, borderRight: "none" }}>
                        Modify
                      </RouteIpPstnTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getRouteIpPstnRowBg(isSelected, idx);
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
                              ...routeIpPstnTdStyle,
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
                              sx={routeIpPstnCheckboxSx}
                            />
                          </td>
                          {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...routeIpPstnTdStyle,
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
                              ...routeIpPstnTdStyle,
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
                                style={getRouteIpPstnEditIconStyle(
                                  loading.delete,
                                )}
                                onMouseEnter={(e) =>
                                  handleRouteIpPstnEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleRouteIpPstnEditIconHover(
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

              <RouteIpPstnPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
                style={routeIpPstnPaginationStyle}
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
        slotProps={routeIpPstnAddNewModalBackdropSlotProps}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? ROUTE_IP_PSTN_MODAL_TITLE_EDIT
            : ROUTE_IP_PSTN_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={routeIpPstnAddNewModalDialogContentSx}
        >
          <RouteIpPstnModalForm
            formData={formData}
            setFormData={setFormData}
            sipTrunkGroups={sipTrunkGroups}
            pcmTrunkGroups={pcmTrunkGroups}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={routeIpPstnAddNewModalFooterStyle}
        >
          <RouteIpPstnBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={routeIpPstnAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              ROUTE_IP_PSTN_SAVE_LABEL
            )}
          </RouteIpPstnBtn>
          <RouteIpPstnBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={routeIpPstnAddNewModalFooterCancelBtnStyle}
          >
            {ROUTE_IP_PSTN_CLOSE_LABEL}
          </RouteIpPstnBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIpPstnPage;
