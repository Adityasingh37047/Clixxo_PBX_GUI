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
} from "../../../constants/FxsRouteIPtoPstnConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as RouteIpToTelBreadcrumb,
  extensionPageWrapStyle as routeIpToTelPageWrapStyle,
  extensionPageInnerStyle as routeIpToTelPageInnerStyle,
  extensionCardStyle as routeIpToTelCardStyle,
  extensionFixedAlertSx as routeIpToTelFixedAlertSx,
} from "../../../components/common";
import { useRouteIpToTelPage } from "./hooks/useRouteIpToTelPage";
import { formatRouteIpToTelDisplayValue } from "./utils/RouteIpToTelTransformers";
import {
  RouteIpToTelModalForm,
  RouteIpToTelTH,
  fxsRouteIpToTelAddNewDialogPaperSx,
  fxsRouteIpToTelAddNewDialogSx,
  routeIpToTelAddNewModalBackdropSlotProps,
  routeIpToTelAddNewModalDialogContentSx,
  routeIpToTelAddNewModalFooterBtnStyle,
  routeIpToTelAddNewModalFooterCancelBtnStyle,
  routeIpToTelAddNewModalFooterStyle,
  routeIpToTelCheckboxSx,
  routeIpToTelModalTitleStyle,
} from "./components/RouteIpToTelFormFields";
import {
  ROUTE_IP_TO_TEL_PCM_TRUNK_GROUP_TH_GAP,
  getRouteIpToTelRowBg,
  handleRouteIpToTelEditIconHover,
  routeIpToTelEditIconStyle,
  routeIpToTelEmptyStateTitleStyle,
  routeIpToTelEmptyStateWrapStyle,
  routeIpToTelHeaderStyle,
  routeIpToTelPageBadgeStyle,
  routeIpToTelPaginationCountStyle,
  routeIpToTelPaginationStyle,
  routeIpToTelSelectedBadgeStyle,
  routeIpToTelTableBodyStyle,
  routeIpToTelTdStyle,
  routeIpToTelThExtra,
  routeIpToTelToolbarCancelBtnStyle,
  routeIpToTelToolbarPrimaryBtnStyle,
} from "./components/RouteIpToTelTableHelpers";

const RouteIpPstnPage = () => {
  const vm = useRouteIpToTelPage();
  const {
    isModalOpen,
    formData,
    setFormData,
    rules,
    selected,
    page,
    pcmTrunkGroups,
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
    formatRouteIpToTelDisplayValue(key, value, pcmTrunkGroups);

  return (
    <div style={routeIpToTelPageWrapStyle}>
      <div style={routeIpToTelPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={routeIpToTelFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <RouteIpToTelBreadcrumb
          root={ROUTE_IP_PSTN_PAGE_BREADCRUMB_ROOT}
          section={ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION}
          current={ROUTE_IP_PSTN_PAGE_TITLE}
        />

        <div style={routeIpToTelCardStyle}>
          <div style={routeIpToTelHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={routeIpToTelSelectedBadgeStyle(C.accent)}>
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
                style={routeIpToTelToolbarCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={routeIpToTelToolbarCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0}
                style={routeIpToTelToolbarCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={routeIpToTelToolbarPrimaryBtnStyle}
              >
                {ROUTE_IP_PSTN_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          <div style={routeIpToTelTableBodyStyle}>
            {rules.length === 0 ? (
              <div style={routeIpToTelEmptyStateWrapStyle}>
                <div style={routeIpToTelEmptyStateTitleStyle}>
                  {ROUTE_IP_PSTN_EMPTY_MESSAGE}
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={routeIpToTelToolbarCancelBtnStyle}
                >
                  {ROUTE_IP_PSTN_ADD_NEW_EMPTY_LABEL}
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
                    <RouteIpToTelTH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        ...routeIpToTelThExtra,
                        ...ROUTE_IP_TO_TEL_PCM_TRUNK_GROUP_TH_GAP,
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
                        sx={routeIpToTelCheckboxSx}
                      />
                    </RouteIpToTelTH>
                    {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                      <RouteIpToTelTH
                        key={col.key}
                        style={{
                          ...routeIpToTelThExtra,
                          ...ROUTE_IP_TO_TEL_PCM_TRUNK_GROUP_TH_GAP,
                        }}
                      >
                        {col.label}
                      </RouteIpToTelTH>
                    ))}
                    <RouteIpToTelTH
                      style={{
                        width: 70,
                        borderRight: "none",
                        ...routeIpToTelThExtra,
                        ...ROUTE_IP_TO_TEL_PCM_TRUNK_GROUP_TH_GAP,
                      }}
                    >
                      Modify
                    </RouteIpToTelTH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRules.map((item, idx) => {
                    const realIdx = (page - 1) * vm.itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRules.length - 1;
                    const rowBg = getRouteIpToTelRowBg(isSelected, idx);
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
                            ...routeIpToTelTdStyle,
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
                            sx={routeIpToTelCheckboxSx}
                          />
                        </td>
                        {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...routeIpToTelTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {formatDisplayValue(col.key, item[col.key])}
                          </td>
                        ))}
                        <td
                          style={{
                            ...routeIpToTelTdStyle,
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
                              style={routeIpToTelEditIconStyle}
                              onClick={() => handleOpenModal(item, realIdx)}
                              onMouseEnter={(e) =>
                                handleRouteIpToTelEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleRouteIpToTelEditIconHover(e, false)
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
            <div style={routeIpToTelPaginationStyle}>
              <span style={routeIpToTelPaginationCountStyle}>
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
                <span style={routeIpToTelPageBadgeStyle}>
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
          slotProps={routeIpToTelAddNewModalBackdropSlotProps}
          sx={fxsRouteIpToTelAddNewDialogSx}
          PaperProps={{ sx: fxsRouteIpToTelAddNewDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={routeIpToTelModalTitleStyle}>
            {editIndex !== null
              ? ROUTE_IP_PSTN_MODAL_TITLE_EDIT
              : ROUTE_IP_PSTN_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={routeIpToTelAddNewModalDialogContentSx}
          >
            <RouteIpToTelModalForm
              indexSelect={indexSelect}
              editIndex={editIndex}
              formData={formData}
              pcmTrunkGroups={pcmTrunkGroups}
              getAvailableIndices={getAvailableIndices}
              handleIndexSelectChange={handleIndexSelectChange}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={routeIpToTelAddNewModalFooterStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={routeIpToTelAddNewModalFooterBtnStyle}
            >
              {ROUTE_IP_PSTN_SAVE_LABEL}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={routeIpToTelAddNewModalFooterCancelBtnStyle}
            >
              {ROUTE_IP_PSTN_CLOSE_LABEL}
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default RouteIpPstnPage;
