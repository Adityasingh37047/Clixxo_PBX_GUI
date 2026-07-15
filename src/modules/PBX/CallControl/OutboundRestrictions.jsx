import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import { OUTBOUND_RESTRICTION_ENABLE_OPTIONS } from "../../../constants/OutboundRestrictionConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as OutboundRestrictionBreadcrumb,
  ExtensionTableListLoading as OutboundRestrictionTableListLoading,
  ExtensionTableListEmptyState as OutboundRestrictionTableListEmptyState,
  ExtensionPagination as OutboundRestrictionPagination,
  extensionTableCheckboxSx as outboundRestrictionTableCheckboxSx,
  extensionFixedAlertSx as outboundRestrictionFixedAlertSx,
  extensionPageWrapStyle as outboundRestrictionPageWrapStyle,
  extensionPageInnerStyle as outboundRestrictionPageInnerStyle,
  extensionCardStyle as outboundRestrictionCardStyle,
  extensionToolbarStyle as outboundRestrictionToolbarStyle,
  extensionSelectedBadgeStyle as outboundRestrictionSelectedBadgeStyle,
  extensionCancelBtnStyle as outboundRestrictionCancelBtnStyle,
  extensionPrimaryBtnStyle as outboundRestrictionPrimaryBtnStyle,
  ExtensionCodecDualList as OutboundRestrictionCodecDualList,
  getExtensionRowBg as getOutboundRestrictionRowBg,
} from "../../../components/common";
import { useOutboundRestrictionsPage } from "./hooks/useOutboundRestrictionsPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  FieldRow,
  OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH,
  OutboundLeftField,
  OutboundRightRow,
  outboundRestrictionModalCancelBtnStyle,
  outboundRestrictionModalFormStyle,
  outboundRestrictionModalPaperSx,
  outboundRestrictionModalSelectSx,
  outboundRestrictionModalTextFieldFullSx,
  outboundRestrictionModalTitleStyle,
  outboundRightColStyle,
  SectionCard,
} from "./components/OutboundRestrictionsFormFields";
import {
  formatOutboundRestrictionItemListDisplay,
  handleOutboundRestrictionEditIconHover,
  outboundRestrictionEditIconStyle,
  OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD,
  yesNoCellStyle,
} from "./components/OutboundRestrictionsTableHelpers";

const OutboundRestrictions = () => {
  const vm = useOutboundRestrictionsPage();
  const {
    isCompact,
    selected,
    showModal,
    loading,
    isInitialLoad,
    editId,
    name,
    setName,
    timeLimit,
    setTimeLimit,
    callsLimit,
    setCallsLimit,
    autoCancelRestriction,
    setAutoCancelRestriction,
    enabled,
    setEnabled,
    memberExtensions,
    setMemberExtensions,
    searchQuery,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
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
    dataEmpty,
    searchEmpty,
  } = vm;

  return (
    <div
      style={{
        ...outboundRestrictionPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={outboundRestrictionPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={outboundRestrictionFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OutboundRestrictionBreadcrumb
          section="Call Control"
          current="Outbound Restrictions"
        />

        <div style={outboundRestrictionCardStyle}>
          <div
            style={{
              ...outboundRestrictionToolbarStyle,
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
                marginLeft: "auto",
                minWidth: 0,
              }}
            >
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search restrictions..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: isCompact ? 120 : 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    style={{
                      fontSize: 11
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}
              {selected.length > 0 && (
                <span style={outboundRestrictionSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={outboundRestrictionCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
                variant="primary"
                style={outboundRestrictionPrimaryBtnStyle}
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
              <OutboundRestrictionTableListLoading />
            ) : dataEmpty ? (
              <OutboundRestrictionTableListEmptyState
                message="No outbound restrictions found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchEmpty ? (
              <OutboundRestrictionTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
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
                        disabled={loading.delete}
                        sx={outboundRestrictionTableCheckboxSx}
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
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Time Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Number of Calls Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Auto Cancel Restriction
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
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
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = getOutboundRestrictionRowBg(isSelected, idx);
                    return (
                      <tr
                        key={row.id ?? realIdx}
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
                            ...tdStyle,
                            background: rowBg,
                            width: 36,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={outboundRestrictionTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.timeLimit || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callsLimit || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={yesNoCellStyle(row.autoCancelRestriction)}
                          >
                            {row.autoCancelRestriction}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                OUTBOUND_RESTRICTION_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRestrictionItemListDisplay(
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
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={yesNoCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
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
                              onClick={() => handleOpenEditModal(row)}
                              style={outboundRestrictionEditIconStyle(
                                loading.delete,
                              )}
                              onMouseEnter={(e) =>
                                handleOutboundRestrictionEditIconHover(
                                  e,
                                  true,
                                  loading.delete,
                                )
                              }
                              onMouseLeave={(e) =>
                                handleOutboundRestrictionEditIconHover(
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
            )}
          </div>

          {!isInitialLoad && filteredRows.length > 0 && (
            <OutboundRestrictionPagination
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
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { ...outboundRestrictionModalPaperSx, borderRadius: editId == null ? "4px" : outboundRestrictionModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={outboundRestrictionModalTitleStyle}>
          {editId != null
            ? "Edit Outbound Restriction"
            : "Add Outbound Restriction"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={outboundRestrictionModalFormStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "8px 28px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <FieldRow
                  label="Name *"
                  tooltipKey="name"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="small"
                      fullWidth
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Time Limit *"
                  tooltipKey="time_limit"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="e.g. 30 min"
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Number of Calls Limit *"
                  tooltipKey="calls_limit"
                  labelWidth={OUTBOUND_RESTRICTION_LEFT_FIELD_LABEL_WIDTH}
                >
                  <OutboundLeftField>
                    <TextField
                      value={callsLimit}
                      onChange={(e) => setCallsLimit(e.target.value)}
                      size="small"
                      fullWidth
                      sx={outboundRestrictionModalTextFieldFullSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
              </div>

              <div style={outboundRightColStyle}>
                <OutboundRightRow
                  label="Auto Cancel Restriction *"
                  tooltipKey="auto_cancel_restriction"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={autoCancelRestriction}
                      onChange={(e) =>
                        setAutoCancelRestriction(e.target.value)
                      }
                      sx={outboundRestrictionModalSelectSx}
                    >
                      {OUTBOUND_RESTRICTION_ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                <OutboundRightRow label="Enabled *" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={outboundRestrictionModalSelectSx}
                    >
                      {OUTBOUND_RESTRICTION_ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
              </div>
            </div>

            <SectionCard
              title="Member Extensions"
              tooltipKey="member_extensions"
            >
              <OutboundRestrictionCodecDualList
                allOptions={allExtensionOptions}
                selected={memberExtensions}
                onChange={setMemberExtensions}
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
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={outboundRestrictionModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRestrictions;
