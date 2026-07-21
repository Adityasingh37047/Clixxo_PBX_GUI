import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, MenuItem, Select, TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  OUTBOUND_ROUTE_ENABLE_OPTIONS, OUTBOUND_ROUTE_PASSWORD_OPTIONS,
  OUTBOUND_ROUTE_REMEMORY_HUNT_OPTIONS, OUTBOUND_ROUTE_TIME_CONDITION_OPTIONS,
} from "../../../constants/OutboundRouteConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as OutboundRouteBreadcrumb,
  ExtensionTableListLoading as OutboundRouteTableListLoading,
  ExtensionTableListEmptyState as OutboundRouteTableListEmptyState,
  ExtensionPagination as OutboundRoutePagination,
  extensionTableCheckboxSx as outboundRouteTableCheckboxSx,
  extensionFixedAlertSx as outboundRouteFixedAlertSx,
  extensionPageWrapStyle as outboundRoutePageWrapStyle,
  extensionPageInnerStyle as outboundRoutePageInnerStyle,
  extensionCardStyle as outboundRouteCardStyle,
  extensionToolbarStyle as outboundRouteToolbarStyle,
  extensionSelectedBadgeStyle as outboundRouteSelectedBadgeStyle,
  extensionCancelBtnStyle as outboundRouteCancelBtnStyle,
  extensionPrimaryBtnStyle as outboundRoutePrimaryBtnStyle,
  ExtensionCodecDualList as OutboundRouteCodecDualList,
} from "../../../components/common";
import { useOutboundRoutesPage } from "./hooks/useOutboundRoutesPage";
import {
  addNewModalFooterBtnStyle, addNewModalFooterStyle, FieldRow,
  getNativeFieldInteraction, OutboundLeftField, OutboundRightRow,
  OutboundRouteDialPatternActionBtn, OutboundRouteModalSectionHeading,
  outboundCompactInputStyle, outboundRightColStyle,
  outboundRouteDialPatternGridColumns, outboundRouteDialPatternIconSx,
  outboundRouteModalCancelBtnStyle, outboundRouteModalControlSx,
  outboundRouteModalDialogContentSx, outboundRouteModalFormStyle,
  outboundRouteModalPaperSx, outboundRouteModalSelectSx,
  outboundRouteModalTitleStyle, SectionCard,
} from "./components/OutboundRoutesFormFields";
import {
  formatOutboundRouteItemListDisplay,
  OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
  outboundRouteEditIconStyle,
  handleOutboundRouteEditIconHover,
} from "./components/OutboundRoutesTableHelpers";

const OutboundRoutesPage = () => {
  const vm = useOutboundRoutesPage();
  const {
    isCompact, rows, selected, showModal, loading, isInitialLoad, editId,
    name, priority, description, nextRoute, enabled, passwordType, singlePin,
    rememoryHunt, timeConditions, dialPatterns, callerConversion,
    memberExtensions, memberTrunks, itemsPerPage, page, totalPages, pagedRows,
    message, allExtensionOptions, allTrunkOptions, allRowsSelected, someRowsSelected,
    setMessage, setName, setPriority, setDescription, setNextRoute, setEnabled,
    setPasswordType, setSinglePin, setRememoryHunt, setMemberExtensions,
    setMemberTrunks, setCallerConversion, setPage, getExtensionLabel,
    getTrunkLabel, handleOpenAddModal, handleOpenEditModal, handleCloseModal,
    handleCheckAll, handleUncheckAll, handleSelectRow, handleDelete, handleSave,
    toggleTimeCondition, updateDialPattern, addDialPattern, removeDialPatternAt,
  } = vm;

  return (
    <div style={{ ...outboundRoutePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={outboundRoutePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={outboundRouteFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OutboundRouteBreadcrumb section="Call Control" current="Outbound Routes" />

        <div style={outboundRouteCardStyle}>
          <div
            style={{
              ...outboundRouteToolbarStyle,
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
              {selected.length > 0 && (
                <span style={outboundRouteSelectedBadgeStyle}>
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
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={outboundRouteCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.list}
                variant="primary"
                style={outboundRoutePrimaryBtnStyle}
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
            }}
          >
            {isInitialLoad ? (
              <OutboundRouteTableListLoading />
            ) : rows.length === 0 ? (
              <OutboundRouteTableListEmptyState
                message="No outbound routes found."
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
                        checked={allRowsSelected}
                        indeterminate={someRowsSelected}
                        onChange={() =>
                          allRowsSelected
                            ? handleUncheckAll()
                            : handleCheckAll()
                        }
                        sx={outboundRouteTableCheckboxSx}
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
                      Priority
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Password
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
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
                    const rowBg = isSelected
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
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
                            sx={outboundRouteTableCheckboxSx}
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
                          {row.priority}
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
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.passwordType === "Single Pin"
                            ? `Single Pin (${row.singlePin || ""})`
                            : row.passwordType}
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
                                OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRouteItemListDisplay(row.memberExtensions, {
                                mapItem: getExtensionLabel,
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
                                OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberTrunks
                                      .map(getTrunkLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatOutboundRouteItemListDisplay(row.memberTrunks, {
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
                              style={outboundRouteEditIconStyle(loading.delete)}
                              onMouseEnter={(event) =>
                                handleOutboundRouteEditIconHover(
                                  event,
                                  true,
                                  loading.delete,
                                )
                              }
                              onMouseLeave={(event) =>
                                handleOutboundRouteEditIconHover(
                                  event,
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

          {!isInitialLoad && rows.length > 0 && (
            <OutboundRoutePagination
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
        PaperProps={{ sx: { ...outboundRouteModalPaperSx, borderRadius: editId == null ? "4px" : outboundRouteModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={outboundRouteModalTitleStyle}>
          {editId != null ? "Edit Outbound Route" : "Add Outbound Route"}
        </DialogTitle>
        <DialogContent
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={outboundRouteModalDialogContentSx}
        >
          <div style={outboundRouteModalFormStyle}>
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
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Priority *" tooltipKey="priority">
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Description" tooltipKey="description">
                  <OutboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundLeftField>
                </FieldRow>
                <FieldRow label="Rmemory Hunt" tooltipKey="rememory_hunt">
                  <OutboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={rememoryHunt}
                        onChange={(e) => setRememoryHunt(e.target.value)}
                        sx={outboundRouteModalSelectSx}
                      >
                        {OUTBOUND_ROUTE_REMEMORY_HUNT_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </OutboundLeftField>
                </FieldRow>
              </div>

              <div style={outboundRightColStyle}>
                <OutboundRightRow label="Next Route" tooltipKey="next_route">
                  <Checkbox
                    checked={nextRoute}
                    onChange={(e) => setNextRoute(e.target.checked)}
                    size="small"
                    sx={outboundRouteTableCheckboxSx}
                  />
                </OutboundRightRow>
                <OutboundRightRow label="Enabled *" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={outboundRouteModalSelectSx}
                    >
                      {OUTBOUND_ROUTE_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                <OutboundRightRow label="Password" tooltipKey="password">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={passwordType}
                      onChange={(e) => {
                        setPasswordType(e.target.value);
                        if (e.target.value !== "Single Pin") setSinglePin("");
                      }}
                      sx={outboundRouteModalSelectSx}
                    >
                      {OUTBOUND_ROUTE_PASSWORD_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </OutboundRightRow>
                {passwordType === "Single Pin" && (
                  <OutboundRightRow
                    label="Enter Password"
                    tooltipKey="enter_password"
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={singlePin}
                      onChange={(e) => setSinglePin(e.target.value)}
                      sx={outboundRouteModalControlSx}
                    />
                  </OutboundRightRow>
                )}
                <OutboundRightRow
                  label="Time Condition"
                  tooltipKey="time_condition"
                  fieldWidth={280}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {OUTBOUND_ROUTE_TIME_CONDITION_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={timeConditions.includes(opt)}
                            onChange={() => toggleTimeCondition(opt)}
                            disabled={
                              opt === "Holiday" &&
                              !timeConditions.includes("All")
                            }
                            size="small"
                            sx={outboundRouteTableCheckboxSx}
                          />
                        }
                        label={opt}
                        sx={{
                          margin: 0,
                          gap: "4px",
                          "& .MuiFormControlLabel-label": {
                            fontSize: 13,
                            color: C.valueText,
                          },
                        }}
                      />
                    ))}
                  </div>
                </OutboundRightRow>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <OutboundRouteModalSectionHeading
                title="Dial Patterns"
                tooltipKey="dial_patterns"
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: outboundRouteDialPatternGridColumns,
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                {["Patterns", "Strip", "Front", "Suffix", "Delay"].map(
                  (heading) => (
                    <div
                      key={heading}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      {heading}
                    </div>
                  ),
                )}
                <OutboundRouteDialPatternActionBtn
                  onClick={addDialPattern}
                  aria-label="add dial pattern row"
                >
                  <AddIcon sx={outboundRouteDialPatternIconSx} />
                </OutboundRouteDialPatternActionBtn>
              </div>
              {dialPatterns.map((item, index) => (
                <div
                  key={`pattern-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: outboundRouteDialPatternGridColumns,
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  {["pattern", "strip", "front", "suffix", "delay"].map(
                    (field) => (
                      <input
                        key={field}
                        style={outboundCompactInputStyle}
                        placeholder={
                          field === "delay" ? "Unit is ms" : undefined
                        }
                        value={item[field]}
                        onChange={(e) =>
                          updateDialPattern(index, field, e.target.value)
                        }
                        {...getNativeFieldInteraction()}
                      />
                    ),
                  )}
                  {dialPatterns.length > 1 ? (
                    <OutboundRouteDialPatternActionBtn
                      onClick={() => removeDialPatternAt(index)}
                      aria-label="remove dial pattern row"
                    >
                      <CloseIcon sx={outboundRouteDialPatternIconSx} />
                    </OutboundRouteDialPatternActionBtn>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <OutboundRouteModalSectionHeading
                title="Caller Number Conversion"
                tooltipKey="caller_number_conversion"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                {["Strip", "Front", "Suffix"].map((heading) => (
                  <div
                    key={heading}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                    }}
                  >
                    {heading}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                {["strip", "front", "suffix"].map((field) => (
                  <input
                    key={field}
                    style={outboundCompactInputStyle}
                    value={callerConversion[field]}
                    onChange={(e) =>
                      setCallerConversion((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    {...getNativeFieldInteraction()}
                  />
                ))}
              </div>
            </div>

            <SectionCard
              title="Member Extensions *"
              tooltipKey="member_extensions"
            >
              <OutboundRouteCodecDualList
                allOptions={loading.members ? [] : allExtensionOptions}
                selected={memberExtensions}
                onChange={setMemberExtensions}
                getLabel={getExtensionLabel}
                emptyTextAvailable={loading.members ? "Loading extensions..." : "No extensions"}
                emptyTextSelected="No selected extensions"
              />
            </SectionCard>

            <SectionCard title="Member Trunks *" tooltipKey="member_trunks">
              <OutboundRouteCodecDualList
                allOptions={loading.trunks ? [] : allTrunkOptions}
                selected={memberTrunks}
                onChange={setMemberTrunks}
                getLabel={getTrunkLabel}
                emptyTextAvailable={loading.trunks ? "Loading trunks..." : "No trunks"}
                emptyTextSelected="No selected trunks"
              />
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={outboundRouteModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRoutesPage;
