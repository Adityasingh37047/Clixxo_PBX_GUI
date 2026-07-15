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
import {
  INBOUND_ROUTE_DESTINATION_OPTIONS,
  INBOUND_ROUTE_ENABLE_OPTIONS,
  INBOUND_ROUTE_MOBILITY_OPTIONS,
  INBOUND_ROUTE_SEND_RINGTONE_OPTIONS,
  INBOUND_ROUTE_T38_OPTIONS,
  INBOUND_ROUTE_TIME_CONDITION_OPTIONS,
} from "../../../constants/InboundRouteConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as InboundRouteBreadcrumb,
  ExtensionTableListLoading as InboundRouteTableListLoading,
  ExtensionTableListEmptyState as InboundRouteTableListEmptyState,
  ExtensionPagination as InboundRoutePagination,
  extensionTableCheckboxSx as inboundRouteTableCheckboxSx,
  extensionFixedAlertSx as inboundRouteFixedAlertSx,
  extensionPageWrapStyle as inboundRoutePageWrapStyle,
  extensionPageInnerStyle as inboundRoutePageInnerStyle,
  extensionCardStyle as inboundRouteCardStyle,
  extensionToolbarStyle as inboundRouteToolbarStyle,
  extensionSelectedBadgeStyle as inboundRouteSelectedBadgeStyle,
  extensionCancelBtnStyle as inboundRouteCancelBtnStyle,
  extensionPrimaryBtnStyle as inboundRoutePrimaryBtnStyle,
  ExtensionCodecDualList as InboundRouteCodecDualList,
  getExtensionRowBg as getInboundRouteRowBg,
} from "../../../components/common";
import { useInboundRoutesPage } from "./hooks/useInboundRoutesPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  FieldRow,
  InboundLeftField,
  InboundRightRow,
  inboundRightColStyle,
  inboundRouteModalCancelBtnStyle,
  inboundRouteModalDialogContentSx,
  inboundRouteModalFormStyle,
  inboundRouteModalPaperSx,
  inboundRouteModalSelectSx,
  inboundRouteModalTextFieldFullSx,
  inboundRouteModalTitleStyle,
  SectionCard,
} from "./components/InboundRoutesFormFields";
import {
  INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
  formatInboundRouteItemListDisplay,
  handleInboundRouteEditIconHover,
  inboundRouteEditIconStyle,
} from "./components/InboundRoutesTableHelpers";

const InboundRoutesPage = () => {
  const vm = useInboundRoutesPage();
  const {
    isCompact, rows, selected, showModal, loading, isInitialLoad, editId,
    name, setName, didPattern, setDidPattern, callerIdPattern, setCallerIdPattern,
    distinctiveRingTone, setDistinctiveRingTone, enableT38, setEnableT38,
    enableTimeCondition, setEnableTimeCondition, destination, setDestination,
    enabled, setEnabled, priority, setPriority, enableMobilityExtension, setEnableMobilityExtension,
    sendRingTone, setSendRingTone, destinationTarget, setDestinationTarget,
    extensionRange, setExtensionRange, selectedTrunks, setSelectedTrunks,
    itemsPerPage, page, setPage, totalPages, pagedRows, message, setMessage,
    destinationChoices, needsDestinationTarget, allTrunkOptions, allPageSelected,
    somePageSelected, getTrunkLabel, handleOpenAddModal, handleOpenEditModal,
    handleCloseModal, handleSelectRow, handleToggleAll, handleDelete, handleSave,
  } = vm;

  return (
    <div style={{ ...inboundRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={inboundRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={inboundRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <InboundRouteBreadcrumb section="Call Control" current="Inbound Routes" />

        <div style={inboundRouteCardStyle}>
          <div
            style={{
              ...inboundRouteToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={inboundRouteSelectedBadgeStyle}>
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
                style={inboundRouteCancelBtnStyle}
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
                style={inboundRoutePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
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
              <InboundRouteTableListLoading />
            ) : rows.length === 0 ? (
              <InboundRouteTableListEmptyState
                message="No inbound routes found."
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
                        disabled={loading.delete}
                        sx={inboundRouteTableCheckboxSx}
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
                      DID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Caller ID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Trunks
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
                    const rowBg = getInboundRouteRowBg(isSelected, idx);
                    const destinationStr =
                      row.destination === "Extension_Range"
                        ? `${row.destination}: ${row.extensionRange || ""}`
                        : row.destinationTarget
                          ? `${row.destination}: ${row.destinationTarget}`
                          : row.destination;
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
                            sx={inboundRouteTableCheckboxSx}
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
                          {row.didPattern || (
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
                          {row.callerIdPattern || (
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
                          {destinationStr || (
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
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
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
                          {row.memberTrunks?.length > 0 ? (
                            <span
                              title={
                                row.memberTrunks.length >
                                INBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberTrunks
                                      .map(getTrunkLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatInboundRouteItemListDisplay(row.memberTrunks, {
                                mapItem: getTrunkLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
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
                              style={inboundRouteEditIconStyle(loading.delete)}
                              onMouseEnter={(e) => handleInboundRouteEditIconHover(e, true, loading.delete)}
                              onMouseLeave={(e) => handleInboundRouteEditIconHover(e, false, loading.delete)}
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

          {!isInitialLoad && rows.length > 0 && (
            <InboundRoutePagination
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
        PaperProps={{ sx: { ...inboundRouteModalPaperSx, borderRadius: editId == null ? "4px" : inboundRouteModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={inboundRouteModalTitleStyle}>
          {editId != null ? "Edit Inbound Route" : "Add Inbound Route"}
        </DialogTitle>
        <DialogContent
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={inboundRouteModalDialogContentSx}
        >
          <div style={inboundRouteModalFormStyle}>
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
                <FieldRow label="Name *" tooltipKey="name">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="DID Pattern" tooltipKey="did_pattern">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={didPattern}
                      onChange={(e) => setDidPattern(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Caller ID Pattern"
                  tooltipKey="caller_id_pattern"
                >
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={callerIdPattern}
                      onChange={(e) => setCallerIdPattern(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow
                  label="Distinctive RingTone"
                  tooltipKey="distinctive_ringtone"
                >
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={distinctiveRingTone}
                      onChange={(e) => setDistinctiveRingTone(e.target.value)}
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Enable T.38" tooltipKey="enable_t38">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enableT38}
                        onChange={(e) => setEnableT38(e.target.value)}
                        sx={inboundRouteModalSelectSx}
                      >
                        {INBOUND_ROUTE_T38_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Destination *" tooltipKey="destination">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationTarget("");
                          setExtensionRange("");
                        }}
                        displayEmpty
                        sx={inboundRouteModalSelectSx}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {INBOUND_ROUTE_DESTINATION_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
              </div>

              <div style={inboundRightColStyle}>
                <InboundRightRow label="Enabled" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Priority" tooltipKey="priority">
                  <TextField
                    size="small"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={inboundRouteModalTextFieldFullSx}
                  />
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Mobility Extension"
                  tooltipKey="enable_mobility_extension"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableMobilityExtension}
                      onChange={(e) =>
                        setEnableMobilityExtension(e.target.value)
                      }
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_MOBILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Send RingTone"
                  tooltipKey="send_ringtone"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={sendRingTone}
                      onChange={(e) => setSendRingTone(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_SEND_RINGTONE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Time Condition"
                  tooltipKey="enable_time_condition"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableTimeCondition}
                      onChange={(e) => setEnableTimeCondition(e.target.value)}
                      sx={inboundRouteModalSelectSx}
                    >
                      {INBOUND_ROUTE_TIME_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                {destination === "Extension_Range" ? (
                  <InboundRightRow
                    label="Extension Range *"
                    tooltipKey="extension_range"
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={extensionRange}
                      onChange={(e) => setExtensionRange(e.target.value)}
                      placeholder="100-136"
                      sx={inboundRouteModalTextFieldFullSx}
                    />
                  </InboundRightRow>
                ) : needsDestinationTarget ? (
                  <InboundRightRow
                    label="Destination Value *"
                    tooltipKey="destination_value"
                  >
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destinationTarget}
                        onChange={(e) => setDestinationTarget(e.target.value)}
                        displayEmpty
                        sx={inboundRouteModalSelectSx}
                      >
                        <MenuItem
                          value=""
                          disabled={destinationChoices.length === 0}
                        >
                          <em>Select</em>
                        </MenuItem>
                        {destinationChoices.length === 0 ? (
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            No options available
                          </MenuItem>
                        ) : (
                          destinationChoices.map((opt) => (
                            <MenuItem
                              key={opt.id}
                              value={opt.id}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </InboundRightRow>
                ) : null}
              </div>
            </div>

            <SectionCard title="Member Trunks *" tooltipKey="member_trunks">
              <InboundRouteCodecDualList
                allOptions={allTrunkOptions}
                selected={selectedTrunks}
                onChange={setSelectedTrunks}
                getLabel={getTrunkLabel}
                emptyTextAvailable="No trunks"
                emptyTextSelected="No selected trunks"
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
            style={inboundRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};


export default InboundRoutesPage;
