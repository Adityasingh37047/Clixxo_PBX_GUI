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
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  TIME_CONDITION_TITLE,
  TIME_CONDITION_TYPES,
  TIME_CONDITION_DAYS_OF_WEEK,
  TIME_CONDITION_MONTHS,
  TIME_CONDITION_HOURS,
  TIME_CONDITION_MINUTES,
  TIME_CONDITION_DAYS_OF_MONTH,
  TIME_CONDITION_TABLE_COLUMNS,
} from "../../../constants/TimeConditionConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as TimeConditionBreadcrumb,
  ExtensionTableListLoading as TimeConditionTableListLoading,
  ExtensionTableListEmptyState as TimeConditionTableListEmptyState,
  ExtensionPagination as TimeConditionPagination,
  extensionTableCheckboxSx as timeConditionTableCheckboxSx,
  extensionFixedAlertSx as timeConditionFixedAlertSx,
  extensionPageWrapStyle as timeConditionPageWrapStyle,
  extensionPageInnerStyle as timeConditionPageInnerStyle,
  extensionCardStyle as timeConditionCardStyle,
  extensionToolbarStyle as timeConditionToolbarStyle,
  extensionSelectedBadgeStyle as timeConditionSelectedBadgeStyle,
  extensionCancelBtnStyle as timeConditionCancelBtnStyle,
  extensionPrimaryBtnStyle as timeConditionPrimaryBtnStyle,
  getExtensionRowBg as getTimeConditionRowBg,
} from "../../../components/common";
import { useTimeConditionPage } from "./hooks/useTimeConditionPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  CheckGroup,
  FieldRow,
  TIME_CONDITION_TIME_ROW_LABEL_STYLE,
  timeConditionModalCancelBtnStyle,
  timeConditionModalFormStyle,
  timeConditionModalPaperSx,
  timeConditionModalTextFieldFullSx,
  timeConditionModalTitleStyle,
  TimeGroup,
} from "./components/TimeConditionFormFields";
import {
  handleTimeConditionEditIconHover,
  settingsSummary,
  timeConditionEditIconStyle,
  typeLabel,
} from "./components/TimeConditionTableHelpers";

const TimeCondition = () => {
  const vm = useTimeConditionPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    editId,
    form,
    setForm,
    loading,
    isInitialLoad,
    toast,
    setToast,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    allRowsSelected,
    someRowsSelected,
    allDayValues,
    allMonthValues,
    allDomValues,
    handleCheckAll,
    handleUncheckAll,
    handleSelectRow,
    handleDelete,
    openAdd,
    openEdit,
    closeModal,
    toggleCheck,
    handleDaysOfMonthToggle,
    addTimeRange,
    removeTimeRange,
    updateTimeRange,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...timeConditionPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={timeConditionPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type === "error" ? "error" : "success"}
            onClose={() => setToast({ msg: "", type: "" })}
            sx={timeConditionFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <TimeConditionBreadcrumb
          section="Call Control"
          current={TIME_CONDITION_TITLE}
        />

        <div style={timeConditionCardStyle}>
          <div
            style={{
              ...timeConditionToolbarStyle,
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
                <span style={timeConditionSelectedBadgeStyle}>
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
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={timeConditionCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} />
                ) : (
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                Delete
              </Btn>
              <Btn
                onClick={openAdd}
                disabled={loading.save || loading.fetch}
                variant="primary"
                style={timeConditionPrimaryBtnStyle}
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
              <TimeConditionTableListLoading />
            ) : rows.length === 0 ? (
              <TimeConditionTableListEmptyState
                message="No time conditions found."
                onAddNew={openAdd}
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
                        disabled={loading.delete || loading.fetch}
                        sx={timeConditionTableCheckboxSx}
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
                    {TIME_CONDITION_TABLE_COLUMNS.map((c) => (
                      <TH
                        key={c.key}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
                      >
                        {c.label}
                      </TH>
                    ))}
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
                    const rowBg = getTimeConditionRowBg(isSelected, idx);

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
                            sx={timeConditionTableCheckboxSx}
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
                          {typeLabel(row.type)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            maxWidth: 320,
                            whiteSpace: "normal",
                            ...lastRowCellStyle,
                          }}
                        >
                          {settingsSummary(row)}
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
                              onClick={() => openEdit(row)}
                              style={timeConditionEditIconStyle(loading.delete)}
                              onMouseEnter={(e) =>
                                handleTimeConditionEditIconHover(
                                  e,
                                  true,
                                  loading.delete,
                                )
                              }
                              onMouseLeave={(e) =>
                                handleTimeConditionEditIconHover(
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

          {!isInitialLoad && rows.length > 0 && (
            <TimeConditionPagination
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
        onClose={() => {
          if (loading.save) return;
          closeModal();
        }}
        maxWidth={false}
        PaperProps={{
          sx: {
            ...timeConditionModalPaperSx,
            borderRadius:
              editId === null ? "4px" : timeConditionModalPaperSx.borderRadius,
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        disableRestoreFocus
      >
        <DialogTitle style={timeConditionModalTitleStyle}>
          {editId !== null ? "Edit Time Condition" : "Add Time Condition"}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={timeConditionModalFormStyle}>
            <FieldRow label="Name" tooltipKey="name" required>
              <TextField
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Enter name"
                size="small"
                fullWidth
                sx={timeConditionModalTextFieldFullSx}
              />
            </FieldRow>

            <FieldRow label="Type" tooltipKey="type" required>
              <div style={{ display: "flex", gap: 20 }}>
                {TIME_CONDITION_TYPES.map((t) => (
                  <label
                    key={t.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: form.type === t.value ? 600 : 400,
                      color: C.valueText,
                    }}
                  >
                    <input
                      type="radio"
                      name="tc_type"
                      value={t.value}
                      checked={form.type === t.value}
                      onChange={() => setForm((p) => ({ ...p, type: t.value }))}
                      style={{ accentColor: C.accent }}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </FieldRow>

            {form.type === "worktime" && (
              <>
                <FieldRow
                  label="Settings"
                  tooltipKey="settings"
                  required
                  fitContent
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {form.timeRanges.map((tr, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            ...TIME_CONDITION_TIME_ROW_LABEL_STYLE,
                            width: 70,
                          }}
                        >
                          StartTime
                        </span>
                        <TimeGroup
                          showLabel={i === 0}
                          hourValue={tr.startHour}
                          minuteValue={tr.startMinute}
                          onHourChange={(v) =>
                            updateTimeRange(i, "startHour", v)
                          }
                          onMinuteChange={(v) =>
                            updateTimeRange(i, "startMinute", v)
                          }
                          hourOptions={TIME_CONDITION_HOURS}
                          minuteOptions={TIME_CONDITION_MINUTES}
                        />
                        <span
                          style={{
                            ...TIME_CONDITION_TIME_ROW_LABEL_STYLE,
                            marginLeft: 4,
                          }}
                        >
                          EndTime
                        </span>
                        <TimeGroup
                          showLabel={i === 0}
                          hourValue={tr.endHour}
                          minuteValue={tr.endMinute}
                          onHourChange={(v) => updateTimeRange(i, "endHour", v)}
                          onMinuteChange={(v) =>
                            updateTimeRange(i, "endMinute", v)
                          }
                          hourOptions={TIME_CONDITION_HOURS}
                          minuteOptions={TIME_CONDITION_MINUTES}
                        />
                        {i === form.timeRanges.length - 1 ? (
                          <button
                            onClick={addTimeRange}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              background: "#64748b",
                              color: "#fff",
                              border: "none",
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        ) : (
                          <button
                            onClick={() => removeTimeRange(i)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              background: "#e2e8f0",
                              color: "#64748b",
                              border: "none",
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </FieldRow>

                <FieldRow label="Day of Week" tooltipKey="day_of_week" required>
                  <CheckGroup
                    items={TIME_CONDITION_DAYS_OF_WEEK}
                    checked={form.daysOfWeek}
                    onChange={(v) => toggleCheck("daysOfWeek", v, allDayValues)}
                    cols={4}
                  />
                </FieldRow>
              </>
            )}

            {form.type === "holiday" && (
              <>
                <FieldRow label="Month" tooltipKey="month" required>
                  <CheckGroup
                    items={TIME_CONDITION_MONTHS}
                    checked={form.months}
                    onChange={(v) => toggleCheck("months", v, allMonthValues)}
                    cols={6}
                  />
                </FieldRow>

                <FieldRow
                  label="Day of Month"
                  tooltipKey="day_of_month"
                  required
                >
                  <CheckGroup
                    items={TIME_CONDITION_DAYS_OF_MONTH.map(String)}
                    checked={form.daysOfMonth.map(String)}
                    onChange={handleDaysOfMonthToggle}
                    cols={11}
                  />
                </FieldRow>
              </>
            )}
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
                <CircularProgress size={14} style={{ color: "#fff" }} />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            disabled={loading.save}
            style={timeConditionModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimeCondition;
