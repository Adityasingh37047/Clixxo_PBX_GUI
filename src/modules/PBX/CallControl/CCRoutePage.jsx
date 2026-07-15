import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  CC_ROUTE_ENABLE_OPTIONS,
  CC_ROUTE_INTERVAL_OPTIONS,
  CC_ROUTE_RECORD_KEEP_OPTIONS,
  CC_ROUTE_THROUGH_OPTIONS,
} from "../../../constants/CCRouteConstants";
import {
  Btn,
  TH,
  ExtensionBreadcrumb as CcRouteBreadcrumb,
  ExtensionTableListLoading as CcRouteTableListLoading,
  ExtensionTableListEmptyState as CcRouteTableListEmptyState,
  ExtensionPagination as CcRoutePagination,
  extensionTableCheckboxSx as ccRouteTableCheckboxSx,
  extensionFixedAlertSx as ccRouteFixedAlertSx,
  extensionPageWrapStyle as ccRoutePageWrapStyle,
  extensionPageInnerStyle as ccRoutePageInnerStyle,
  extensionCardStyle as ccRouteCardStyle,
  extensionToolbarStyle as ccRouteToolbarStyle,
  extensionSelectedBadgeStyle as ccRouteSelectedBadgeStyle,
  extensionCancelBtnStyle as ccRouteCancelBtnStyle,
  extensionPrimaryBtnStyle as ccRoutePrimaryBtnStyle,
  ExtensionCodecDualList as CcRouteCodecDualList,
  getExtensionTdStyle as getCcRouteTdStyle,
  getExtensionRowBg as getCcRouteRowBg,
} from "../../../components/common";
import { useCCRoutePage } from "./hooks/useCCRoutePage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  ccRouteModalCancelBtnStyle,
  ccRouteModalFormStyle,
  ccRouteModalPaperSx,
  ccRouteModalSelectSx,
  ccRouteModalTitleStyle,
  FieldRow,
  SectionCard,
  ThWithTooltip,
} from "./components/CCRouteFormFields";
import {
  CC_ROUTE_LIST_TRUNCATE_THRESHOLD,
  ccRouteEditIconStyle,
  formatCcRouteItemListDisplay,
  handleCcRouteEditIconHover,
} from "./components/CCRouteTableHelpers";
import { getCcRouteIntervalLabel } from "./utils/CCRouteTransformers";

const CCRoutePage = () => {
  const vm = useCCRoutePage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    isInitialLoad,
    editId,
    ccIntervalTime,
    setCcIntervalTime,
    through,
    setThrough,
    recordKeepTime,
    setRecordKeepTime,
    enabled,
    setEnabled,
    selectedExtensions,
    setSelectedExtensions,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    message,
    setMessage,
    allExtensionOptions,
    allPageSelected,
    somePageSelected,
    getExtensionLabel,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSelectRow,
    handleToggleAll,
    handleDelete,
    handleSave,
  } = vm;

  return (
    <div
      style={{ ...ccRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}
    >
      <div style={ccRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ccRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <CcRouteBreadcrumb section="Call Control" current="CC Route" />

        <div style={ccRouteCardStyle}>
          <div
            style={{
              ...ccRouteToolbarStyle,
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
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={ccRouteSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={ccRouteCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}{" "}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.fetch}
                variant="primary"
                style={ccRoutePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <CcRouteTableListLoading />
            ) : rows.length === 0 ? (
              <CcRouteTableListEmptyState
                message="No CC routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={ccRouteTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <ThWithTooltip
                      tooltipKey="cc_interval_time"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      CC Interval Time
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="through"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Through
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="record_keep_time"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Record Keep Time
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="enable"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Enable
                    </ThWithTooltip>
                    <ThWithTooltip
                      tooltipKey="member_extensions"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Member Extensions
                    </ThWithTooltip>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = getCcRouteRowBg(isSelected, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={row.id}
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
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            sx={ccRouteTableCheckboxSx}
                          />
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {realIdx + 1}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {getCcRouteIntervalLabel(row.ccIntervalTime)}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.through}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.recordKeepTime}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.enabled}
                        </td>
                        <td style={getCcRouteTdStyle(rowBg, lastRowCellStyle)}>
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                CC_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatCcRouteItemListDisplay(
                                row.memberExtensions,
                                {
                                  mapItem: getExtensionLabel,
                                },
                              )}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={getCcRouteTdStyle(rowBg, lastRowCellStyle, {
                            textAlign: "center",
                            padding: "7px 8px",
                            borderRight: "none",
                          })}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={ccRouteEditIconStyle}
                            onMouseEnter={(e) =>
                              handleCcRouteEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleCcRouteEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <CcRoutePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{
          sx: {
            ...ccRouteModalPaperSx,
            borderRadius:
              editId == null ? "4px" : ccRouteModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={ccRouteModalTitleStyle}>
          {editId != null ? "Edit CC Route" : "Add CC Route"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={{ WebkitOverflowScrolling: "touch" }}
        >
          <div style={ccRouteModalFormStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "8px 32px",
              }}
            >
              <FieldRow
                label="CC Interval Time *"
                tooltipKey="cc_interval_time"
              >
                <FormControl size="small" fullWidth>
                  <Select
                    value={ccIntervalTime}
                    onChange={(e) => setCcIntervalTime(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_INTERVAL_OPTIONS.map((o) => (
                      <MenuItem
                        key={o.value}
                        value={o.value}
                        sx={{ fontSize: 13 }}
                      >
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow
                label="Record Keep Time *"
                tooltipKey="record_keep_time"
              >
                <FormControl size="small" fullWidth>
                  <Select
                    value={recordKeepTime}
                    onChange={(e) => setRecordKeepTime(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_RECORD_KEEP_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow label="Through *" tooltipKey="through">
                <FormControl size="small" fullWidth>
                  <Select
                    value={through}
                    onChange={(e) => setThrough(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_THROUGH_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow label="Enable *" tooltipKey="enable">
                <FormControl size="small" fullWidth>
                  <Select
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={ccRouteModalSelectSx}
                  >
                    {CC_ROUTE_ENABLE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
            </div>

            <SectionCard
              title="Member Extensions"
              tooltipKey="member_extensions"
            >
              <CcRouteCodecDualList
                allOptions={allExtensionOptions}
                selected={selectedExtensions}
                onChange={setSelectedExtensions}
                getLabel={getExtensionLabel}
                emptyTextAvailable="No extensions"
                emptyTextSelected="No selected extensions"
              />
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ccRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CCRoutePage;
