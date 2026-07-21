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
  PORT_GROUP_TABLE_COLUMNS,
  PORT_GROUP_EMPTY_MESSAGE,
  PORT_GROUP_MODAL_TITLE_ADD,
  PORT_GROUP_MODAL_TITLE_EDIT,
  PORT_GROUP_SAVE_LABEL,
  PORT_GROUP_CLOSE_LABEL,
  PORT_GROUP_PAGE_BREADCRUMB_SECTION,
  PORT_GROUP_PAGE_BREADCRUMB_TITLE,
} from "../../../constants/PortGroupPageConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PortGroupBreadcrumb,
  ExtensionPagination as PortGroupPagination,
  extensionPageWrapStyle as portGroupPageWrapStyle,
  extensionPageInnerStyle as portGroupPageInnerStyle,
  extensionCardStyle as portGroupCardStyle,
  extensionFixedAlertSx as portGroupFixedAlertSx,
  extensionSelectedBadgeStyle as portGroupSelectedBadgeStyle,
} from "../../../components/common";
import { usePortGroupPage } from "./hooks/usePortGroupPage";
import {
  PortGroupFormFields,
  PortGroupPortsSection,
  PORT_GROUP_ADD_NEW_DIALOG_PAPER_SX,
  PORT_GROUP_ADD_NEW_DIALOG_SX,
  addNewModalBackdropSlotProps,
  addNewModalDialogContentSx,
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  fxsToolbarCancelBtnStyle,
  fxsToolbarPrimaryBtnStyle,
  portGroupCheckboxSx,
  portGroupHeaderStyle,
  portGroupPaginationStyle,
  portGroupTableBodyStyle,
} from "./components/PortGroupFormFields";
import {
  PCM_TRUNK_GROUP_TH_GAP,
  getPortGroupRowBg,
  handlePortGroupEditIconHover,
  portGroupEditIconStyle,
  routeTdStyle,
  routeThExtra,
} from "./components/PortGroupTableHelpers";

const PortGroupPage = () => {
  const vm = usePortGroupPage();
  const {
    groups,
    isModalOpen,
    editingGroupId,
    form,
    tableMinWidth,
    toast,
    setToast,
    selectedCount,
    allChecked,
    handleOpenModal,
    handleCloseModal,
    handleAddNewClick,
    handleFormChange,
    handlePortToggle,
    handleCheckAllPorts,
    handleInversePorts,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
    checkedRows,
  } = vm;

  const renderEmptyState = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#3E5475",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {PORT_GROUP_EMPTY_MESSAGE}
      </div>
      <Btn
        variant="cancel"
        onClick={handleAddNewClick}
        style={fxsToolbarCancelBtnStyle}
      >
        + Add New
      </Btn>
    </div>
  );

  const renderTableCell = (col, group, isSelected, rowBg, cellExtra = {}) => {
    if (col.key === "modify") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            borderRight: "none",
            ...cellExtra,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EditDocumentIcon
              titleAccess="Edit"
              style={portGroupEditIconStyle}
              onClick={() => handleOpenModal(group)}
              onMouseEnter={(e) => handlePortGroupEditIconHover(e, true)}
              onMouseLeave={(e) => handlePortGroupEditIconHover(e, false)}
            />
          </div>
        </td>
      );
    }
    if (col.key === "check") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            width: 36,
            ...cellExtra,
          }}
        >
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={() => handleRowCheck(group.id)}
            sx={portGroupCheckboxSx}
          />
        </td>
      );
    }
    return (
      <td
        key={col.key}
        style={{
          ...routeTdStyle,
          background: rowBg,
          wordBreak: col.key === "ports" ? "break-all" : undefined,
          ...cellExtra,
        }}
      >
        {group[col.key]}
      </td>
    );
  };

  return (
    <div style={portGroupPageWrapStyle}>
      <div style={portGroupPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={portGroupFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <PortGroupBreadcrumb
          section={PORT_GROUP_PAGE_BREADCRUMB_SECTION}
          current={PORT_GROUP_PAGE_BREADCRUMB_TITLE}
        />

        <div style={portGroupCardStyle}>
          <div style={portGroupHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {selectedCount > 0 && (
                <span style={portGroupSelectedBadgeStyle}>
                  {selectedCount} selected
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
                disabled={groups.length === 0}
                style={fxsToolbarCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selectedCount === 0}
                style={fxsToolbarCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={groups.length === 0}
                style={fxsToolbarCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={handleAddNewClick}
                style={fxsToolbarPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={portGroupTableBodyStyle}>
            {groups.length === 0 ? (
              renderEmptyState()
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
                    {PORT_GROUP_TABLE_COLUMNS.map((col) => {
                      if (col.key === "check") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 40,
                              padding: 0,
                              borderLeft: "none",
                              ...routeThExtra,
                              ...PCM_TRUNK_GROUP_TH_GAP,
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
                              sx={portGroupCheckboxSx}
                            />
                          </TH>
                        );
                      }
                      if (col.key === "modify") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 70,
                              borderRight: "none",
                              ...routeThExtra,
                              ...PCM_TRUNK_GROUP_TH_GAP,
                            }}
                          >
                            {col.label}
                          </TH>
                        );
                      }
                      return (
                        <TH
                          key={col.key}
                          style={{ ...routeThExtra, ...PCM_TRUNK_GROUP_TH_GAP }}
                        >
                          {col.label}
                        </TH>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, idx) => {
                    const isSelected = !!checkedRows[group.id];
                    const rowBg = getPortGroupRowBg(isSelected, idx);
                    return (
                      <tr
                        key={group.id}
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
                        {PORT_GROUP_TABLE_COLUMNS.map((col) =>
                          renderTableCell(col, group, isSelected, rowBg, {}),
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {groups.length > 0 && (
            <PortGroupPagination
              page={1}
              totalPages={1}
              recordCount={groups.length}
              onPageChange={() => {}}
              style={portGroupPaginationStyle}
            />
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={addNewModalBackdropSlotProps}
          sx={PORT_GROUP_ADD_NEW_DIALOG_SX}
          PaperProps={{
            sx: PORT_GROUP_ADD_NEW_DIALOG_PAPER_SX,
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
            {editingGroupId !== null
              ? PORT_GROUP_MODAL_TITLE_EDIT
              : PORT_GROUP_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 4,
                  padding: 20,
                }}
              >
                <PortGroupFormFields form={form} handleFormChange={handleFormChange} />
              </div>
              <PortGroupPortsSection
                form={form}
                handlePortToggle={handlePortToggle}
                handleCheckAllPorts={handleCheckAllPorts}
                handleInversePorts={handleInversePorts}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={addNewModalFooterBtnStyle}
            >
              {PORT_GROUP_SAVE_LABEL}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={addNewModalFooterCancelBtnStyle}
            >
              {PORT_GROUP_CLOSE_LABEL}
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortGroupPage;
