import React from "react";
import {
  PCM_PSTN_TABLE_COLUMNS,
  PCM_PSTN_SPAN_FIELDS,
  PCM_PSTN_CHANNELS_FIELDS,
  PCM_PSTN_VOICE_FIELDS,
  PCM_PSTN_INITIAL_FORM,
  PCM_PSTN_FIELD_TOOLTIPS,
  PCM_PSTN_PAGE_BREADCRUMB_ROOT,
  PCM_PSTN_PAGE_BREADCRUMB_SECTION,
  PCM_PSTN_PAGE_TITLE,
  PCM_PSTN_EMPTY_MESSAGE,
  PCM_PSTN_MODAL_TITLE_ADD,
  PCM_PSTN_MODAL_TITLE_EDIT,
  PCM_PSTN_ADD_NEW_LABEL,
  PCM_PSTN_DELETE_LABEL,
  PCM_PSTN_SAVE_LABEL,
  PCM_PSTN_CLOSE_LABEL,
} from "../../../constants/PcmPstnConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  usePcmPstnPage,
  PCM_PSTN_ADD_NEW_DIALOG_SX,
  PCM_PSTN_ADD_NEW_DIALOG_PAPER_SX,
  PCM_PSTN_MODAL_TAB_BAR_STYLE,
  PCM_PSTN_MODAL_TAB_ACTIVE_COLOR,
  pcmPstnModalTabsSx,
  pcmPstnModalFormPanelStyle,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  pcmPstnModalCancelBtnStyle,
  pcmPstnFooterStyle,
  pcmPstnPrimaryBtnStyle,
  pcmPstnTableCheckboxSx,
} from "./hooks/usePcmPstnPage";
import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  PcmPstnBreadcrumb,
  PcmPstnFieldLabel,
  pcmPstnDialogConfig,
  pcmPstnFormPanelStyle,
  pcmPstnInputStyle,
  pcmPstnSelectStyle,
  pcmPstnInputInteraction,
  pcmPstnAddNewModalFooterStyle,
  pcmPstnAddNewModalFooterBtnStyle,
  pcmPstnCardStyle,
  pcmPstnToolbarStyle,
  PcmPstnTableListLoading as TableListLoading,
  PcmPstnTableListEmptyState as TableListEmptyState,
} from "./components/PcmPstnFormFields";
import {
  CARD_RADIUS,
  pcmPstnPageWrapStyle,
  pcmPstnPageInnerStyle,
  pcmPstnSelectedBadgeStyle,
  pcmPstnFixedAlertSx,
  pcmPstnEditIconStyle,
  handlePcmPstnEditIconHover,
  getPcmPstnRowBg,
  pcmPstnCancelBtnStyle,
} from "./components/PcmPstnTableHelpers";

const PcmPstnPage = () => {
  const vm = usePcmPstnPage();
  const {
    data,
    selectedItems,
    setSelectedItems,
    isModalOpen,
    setIsModalOpen,
    formData,
    editIndex,
    tab,
    setTab,
    loading,
    message,
    setMessage,
    isInitialLoad,
    isCompact,
    handleInputChange,
    handleRefresh,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleAddNew,
    handleEditItem,
    handleSave,
    renderTableRow,
    renderFormField,
  } = vm;

  return (
    <div
      style={{
        ...pcmPstnPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {message.text}
        </Alert>
      )}

      <div style={pcmPstnPageInnerStyle}>
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{PCM_PSTN_PAGE_BREADCRUMB_ROOT}</span>
          <span>&gt;</span>
          <span>{PCM_PSTN_PAGE_BREADCRUMB_SECTION}</span>
          <span>&gt;</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            {PCM_PSTN_PAGE_TITLE}
          </span>
        </div>

        <div style={pcmPstnCardStyle}>
          <div
            style={{
              ...pcmPstnToolbarStyle,
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
              {selectedItems.length > 0 && (
                <span style={pcmPstnSelectedBadgeStyle}>
                  {selectedItems.length} selected
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
                disabled={loading.delete || isInitialLoad || data.length === 0}
                style={pcmPstnCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || isInitialLoad || selectedItems.length === 0
                }
                style={pcmPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {PCM_PSTN_DELETE_LABEL}
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || isInitialLoad || data.length === 0}
                style={pcmPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={handleAddNew}
                disabled={loading.save || isInitialLoad}
                style={pcmPstnPrimaryBtnStyle}
              >
                {PCM_PSTN_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : data.length === 0 ? (
            <TableListEmptyState
              message={PCM_PSTN_EMPTY_MESSAGE}
              onAddNew={handleAddNew}
            />
          ) : (
            <>
              <div
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
                    ...(isCompact ? { minWidth: 720 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH
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
                          size="small"
                          checked={
                            data.length > 0 &&
                            data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            )
                          }
                          indeterminate={
                            data.some((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            ) &&
                            !data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            )
                          }
                          onChange={() => {
                            const allSelected = data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            );
                            if (allSelected) {
                              const rowIds = data.map(
                                (r) => r.span_id || r.span?.id,
                              );
                              setSelectedItems((prev) =>
                                prev.filter((id) => !rowIds.includes(id)),
                              );
                            } else {
                              setSelectedItems((prev) => {
                                const newSelections = [...prev];
                                data.forEach((row) => {
                                  const id = row.span_id || row.span?.id;
                                  if (!newSelections.includes(id)) {
                                    newSelections.push(id);
                                  }
                                });
                                return newSelections;
                              });
                            }
                          }}
                          sx={pcmPstnTableCheckboxSx}
                        />
                      </TH>
                      {PCM_PSTN_TABLE_COLUMNS.map((col) => (
                        <TH
                          key={col.key}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(col.key === "modify"
                              ? { width: 70, borderRight: "none" }
                              : {}),
                          }}
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) =>
                      renderTableRow(row, idx, idx === data.length - 1),
                    )}
                  </tbody>
                </table>
              </div>

              <div style={pcmPstnFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {data.length} record
                  {data.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth={false}
        sx={PCM_PSTN_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_PSTN_ADD_NEW_DIALOG_PAPER_SX,
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
          {editIndex >= 0 ? PCM_PSTN_MODAL_TITLE_EDIT : PCM_PSTN_MODAL_TITLE_ADD}
        </DialogTitle>

        <div style={PCM_PSTN_MODAL_TAB_BAR_STYLE}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: PCM_PSTN_MODAL_TAB_ACTIVE_COLOR,
                height: 2,
              },
            }}
            sx={pcmPstnModalTabsSx}
          >
            <Tab label="Span" />
            <Tab label="Channels" />
            <Tab label="Voice" />
          </Tabs>
        </div>

        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ ...pcmPstnModalFormPanelStyle, width: "100%" }}>
            {(tab === 0
              ? PCM_PSTN_SPAN_FIELDS
              : tab === 1
                ? PCM_PSTN_CHANNELS_FIELDS
                : PCM_PSTN_VOICE_FIELDS
            ).map(renderFormField)}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              PCM_PSTN_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={() => setIsModalOpen(false)}
            disabled={loading.save}
            style={pcmPstnModalCancelBtnStyle}
          >
            {PCM_PSTN_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmPstnPage;
