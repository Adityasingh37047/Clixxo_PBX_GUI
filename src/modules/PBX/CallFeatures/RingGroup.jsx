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
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import {
  RING_GROUP_ENABLE_OPTIONS,
  RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS,
  RING_GROUP_RING_BACK_MENU_PROPS,
  RING_GROUP_RING_STRATEGY_OPTIONS,
  RING_GROUP_RING_TIMEOUT_OPTIONS,
  RING_GROUP_TIMEOUT_DESTINATION_OPTIONS,
  RING_GROUP_TITLE,
} from "../../../constants/RingGroupConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as RingGroupBreadcrumb,
  ExtensionTableListLoading as RingGroupTableListLoading,
  ExtensionTableListEmptyState as RingGroupTableListEmptyState,
  ExtensionPagination as RingGroupPagination,
  extensionTableCheckboxSx as ringGroupTableCheckboxSx,
  extensionFixedAlertSx as ringGroupFixedAlertSx,
  extensionPageWrapStyle as ringGroupPageWrapStyle,
  extensionPageInnerStyle as ringGroupPageInnerStyle,
  extensionCardStyle as ringGroupCardStyle,
  extensionToolbarStyle as ringGroupToolbarStyle,
  extensionSelectedBadgeStyle as ringGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as ringGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as ringGroupPrimaryBtnStyle,
  ExtensionCodecDualList as RingGroupCodecDualList,
} from "../../../components/common";
import { useRingGroupPage } from "./hooks/useRingGroupPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  RingGroupFieldRow,
  RingGroupSectionHeading,
  ringGroupModalCancelBtnStyle,
  ringGroupModalDialogContentSx,
  ringGroupModalPaperSx,
  ringGroupModalSectionStyle,
  ringGroupModalSelectSx,
  ringGroupModalTextFieldFullSx,
  ringGroupModalTitleStyle,
} from "./components/RingGroupFormFields";
import {
  getRingGroupRowBg,
  handleRingGroupEditIconHover,
  ringGroupEditIconStyle,
  ringGroupEnabledCellStyle,
  ringGroupStrategyCellStyle,
} from "./components/RingGroupTableHelpers";

const RingGroup = () => {
  const vm = useRingGroupPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    ringGroupNumber,
    setRingGroupNumber,
    ringStrategy,
    setRingStrategy,
    timeoutDestinationType,
    setTimeoutDestinationType,
    timeoutDestinationValue,
    setTimeoutDestinationValue,
    ringTimeout,
    setRingTimeout,
    enabled,
    setEnabled,
    alertInfo,
    setAlertInfo,
    ringBack,
    setRingBack,
    ringBackOptions,
    cidNamePrefix,
    setCidNamePrefix,
    extensionAnswerConfirm,
    setExtensionAnswerConfirm,
    memberExtensions,
    setMemberExtensions,
    allPageSelected,
    somePageSelected,
    allExtensionOptions,
    timeoutValueOptions,
    shouldShowTimeoutValue,
    ringBackAllValues,
    availableMemberEmptyText,
    getExtLabel,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...ringGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ringGroupPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ringGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RingGroupBreadcrumb
          section="Call Features"
          current={RING_GROUP_TITLE}
        />

        <div style={ringGroupCardStyle}>
          <div
            style={{
              ...ringGroupToolbarStyle,
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
                <span style={ringGroupSelectedBadgeStyle}>
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
                style={ringGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={ringGroupPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <RingGroupTableListLoading />
            ) : rows.length === 0 ? (
              <RingGroupTableListEmptyState
                message="No ring groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        sx={ringGroupTableCheckboxSx}
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
                      Id
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Group Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Strategy
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Members
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
                    const rowBg = getRingGroupRowBg(isSelected, idx);
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : tdStyle.borderBottom,
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
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
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={ringGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.ringGroupNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={ringGroupStrategyCellStyle}>
                            {row.ringStrategy}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={ringGroupEnabledCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.members.length}
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
                              style={ringGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handleRingGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleRingGroupEditIconHover(e, false)
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <RingGroupPagination
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
        PaperProps={{
          sx: {
            ...ringGroupModalPaperSx,
            borderRadius:
              editId == null ? "4px" : ringGroupModalPaperSx.borderRadius,
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={ringGroupModalTitleStyle}>
          {editId != null
            ? `Edit ${RING_GROUP_TITLE}`
            : `Add ${RING_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...ringGroupModalDialogContentSx,
            padding: "0 24px 20px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ background: "#ffffff" }}>
            <div style={ringGroupModalSectionStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                  gap: "16px 32px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <RingGroupFieldRow label="Name" tooltipKey="name" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={ringGroupModalTextFieldFullSx}
                    />
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Ring Strategy"
                    tooltipKey="ring_strategy"
                    required
                  >
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringStrategy}
                        onChange={(e) => setRingStrategy(e.target.value)}
                        sx={ringGroupModalSelectSx}
                      >
                        {RING_GROUP_RING_STRATEGY_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Ring Timeout (s)"
                    tooltipKey="ring_timeout"
                  >
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringTimeout}
                        onChange={(e) => setRingTimeout(e.target.value)}
                        sx={ringGroupModalSelectSx}
                      >
                        {RING_GROUP_RING_TIMEOUT_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </RingGroupFieldRow>

                  <RingGroupFieldRow label="Alert Info" tooltipKey="alert_info">
                    <TextField
                      size="small"
                      fullWidth
                      value={alertInfo}
                      onChange={(e) => setAlertInfo(e.target.value)}
                      sx={ringGroupModalTextFieldFullSx}
                    />
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Extension Answer Confirm"
                    tooltipKey="extension_answer_confirm"
                    required
                  >
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={extensionAnswerConfirm}
                        onChange={(e) =>
                          setExtensionAnswerConfirm(e.target.value)
                        }
                        sx={ringGroupModalSelectSx}
                      >
                        {RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS.map(
                          (opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ),
                        )}
                      </MuiSelect>
                    </FormControl>
                  </RingGroupFieldRow>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <RingGroupFieldRow
                    label="Ring Group Number"
                    tooltipKey="ring_group_number"
                    required
                  >
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={ringGroupNumber}
                      onChange={(e) => setRingGroupNumber(e.target.value)}
                      sx={ringGroupModalTextFieldFullSx}
                    />
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Timeout Destination"
                    tooltipKey="timeout_destination"
                    required
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <MuiSelect
                          value={timeoutDestinationType}
                          displayEmpty
                          onChange={(e) => {
                            setTimeoutDestinationType(e.target.value);
                            setTimeoutDestinationValue("");
                          }}
                          sx={ringGroupModalSelectSx}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select type</em>
                          </MenuItem>
                          {RING_GROUP_TIMEOUT_DESTINATION_OPTIONS.map(
                            (opt) => (
                              <MenuItem
                                key={opt.value}
                                value={opt.value}
                                sx={{ fontSize: 13 }}
                              >
                                {opt.label}
                              </MenuItem>
                            ),
                          )}
                        </MuiSelect>
                      </FormControl>

                      {shouldShowTimeoutValue && (
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <MuiSelect
                            value={timeoutDestinationValue}
                            displayEmpty
                            onChange={(e) =>
                              setTimeoutDestinationValue(e.target.value)
                            }
                            sx={ringGroupModalSelectSx}
                          >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                              <em>Select value</em>
                            </MenuItem>
                            {timeoutValueOptions.map((opt) => (
                              <MenuItem
                                key={opt.value}
                                value={opt.value}
                                sx={{ fontSize: 13 }}
                              >
                                {opt.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      )}
                    </div>
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Enable"
                    tooltipKey="enabled"
                    required
                  >
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={enabled}
                        onChange={(e) => setEnabled(e.target.value)}
                        sx={ringGroupModalSelectSx}
                      >
                        {RING_GROUP_ENABLE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Ring Back"
                    tooltipKey="ring_back"
                    alignTop
                  >
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringBack}
                        onChange={(e) => setRingBack(e.target.value)}
                        MenuProps={RING_GROUP_RING_BACK_MENU_PROPS}
                        sx={ringGroupModalSelectSx}
                      >
                        {ringBack && !ringBackAllValues.includes(ringBack) && (
                          <MenuItem value={ringBack} sx={{ fontSize: 13 }}>
                            {ringBack}
                          </MenuItem>
                        )}
                        {ringBackOptions.moh_categories.length > 0 && (
                          <ListSubheader
                            disableSticky
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              lineHeight: "24px",
                            }}
                          >
                            Music on Hold
                          </ListSubheader>
                        )}
                        {ringBackOptions.moh_categories.map((opt) => (
                          <MenuItem
                            key={`moh-${opt}`}
                            value={opt}
                            sx={{ pl: 3, fontSize: 13 }}
                          >
                            {opt}
                          </MenuItem>
                        ))}
                        {ringBackOptions.custom_prompts.length > 0 && (
                          <ListSubheader
                            disableSticky
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              lineHeight: "24px",
                            }}
                          >
                            Custom Prompt
                          </ListSubheader>
                        )}
                        {ringBackOptions.custom_prompts.map((opt) => (
                          <MenuItem
                            key={`prompt-${opt}`}
                            value={opt}
                            sx={{ pl: 3, fontSize: 13 }}
                          >
                            {opt}
                          </MenuItem>
                        ))}
                        {ringBackOptions.country_tones.length > 0 && (
                          <ListSubheader
                            disableSticky
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              lineHeight: "24px",
                            }}
                          >
                            Ring Back
                          </ListSubheader>
                        )}
                        {ringBackOptions.country_tones.map((opt) => (
                          <MenuItem
                            key={`tone-${opt}`}
                            value={opt}
                            sx={{ pl: 3, fontSize: 13 }}
                          >
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </RingGroupFieldRow>

                  <RingGroupFieldRow
                    label="Caller ID Name Prefix"
                    tooltipKey="caller_id_name_prefix"
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={cidNamePrefix}
                      onChange={(e) => setCidNamePrefix(e.target.value)}
                      sx={ringGroupModalTextFieldFullSx}
                    />
                  </RingGroupFieldRow>
                </div>
              </div>

              <RingGroupSectionHeading title="Member Extensions" required />

              <RingGroupCodecDualList
                hideReorder
                allOptions={allExtensionOptions}
                selected={memberExtensions}
                onChange={setMemberExtensions}
                getLabel={getExtLabel}
                emptyTextAvailable={availableMemberEmptyText}
                emptyTextSelected="No selected member"
              />
            </div>
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
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ringGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RingGroup;
