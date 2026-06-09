import React, { useEffect, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Alert, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import {
  TC_TITLE,
  TC_TYPES,
  TC_DAYS_OF_WEEK,
  TC_MONTHS,
  TC_HOURS,
  TC_MINUTES,
  TC_DAYS_OF_MONTH,
  TC_TABLE_COLUMNS,
  TC_INITIAL_FORM,
} from "../../../constants/TimeComditionConstants";
import {
  fetchTimeConditions,
  createTimeCondition,
  updateTimeCondition,
  deleteTimeCondition,
  deleteAllTimeConditions,
} from "../../../api/apiService";
import {
  C,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
} from "../../../sections/numManipulate/numManipulateSharedUi";

const LIST_CARD_RADIUS = 10;
const listCardStyle = {
  ...numManipulateCardStyle,
  borderRadius: LIST_CARD_RADIUS,
};
const listToolbarStyle = {
  ...numManipulateToolbarStyle,
  borderTopLeftRadius: LIST_CARD_RADIUS,
  borderTopRightRadius: LIST_CARD_RADIUS,
};

// ─── helpers ─────────────────────────────────────────────────────────────────
const pad = (n) => String(n ?? 0).padStart(2, "0");
const typeLabel = (v) => TC_TYPES.find((t) => t.value === v)?.label ?? v;

const settingsSummary = (row) => {
  if (row.type === "worktime") {
    const ranges = (row.timeSlots || [])
      .map(
        (r) =>
          `${pad(r.start_hour)}:${pad(r.start_minute)}–${pad(r.end_hour)}:${pad(r.end_minute)}`,
      )
      .join(", ");
    const days =
      (row.daysOfWeek || [])
        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
        .join(", ") || "—";
    return `${ranges || "—"}  |  ${days}`;
  }
  const months =
    (row.months || [])
      .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      .join(", ") || "—";
  const days = (row.daysOfMonth || []).join(", ") || "—";
  return `${months}  |  Day: ${days}`;
};

// API → internal form state
const normalizeFromApi = (item) => ({
  id: item.id,
  name: item.name || "",
  type: item.type === "work_time" ? "worktime" : item.type || "worktime",
  // time_slots from API: [{start_hour, start_minute, end_hour, end_minute}] (numbers)
  timeSlots: Array.isArray(item.time_slots) ? item.time_slots : [],
  daysOfWeek: Array.isArray(item.days_of_week) ? item.days_of_week : [],
  months: Array.isArray(item.months) ? item.months : [],
  daysOfMonth: Array.isArray(item.days_of_month) ? item.days_of_month : [],
});

// Internal form → time_slots for API (strings → numbers)
const formToTimeSlots = (timeRanges) =>
  timeRanges.map((r) => ({
    start_hour: parseInt(r.startHour, 10),
    start_minute: parseInt(r.startMinute, 10),
    end_hour: parseInt(r.endHour, 10),
    end_minute: parseInt(r.endMinute, 10),
  }));

// API time_slots → form timeRanges (numbers → padded strings)
const apiSlotsToFormRanges = (slots) =>
  slots.map((s) => ({
    startHour: pad(s.start_hour),
    startMinute: pad(s.start_minute),
    endHour: pad(s.end_hour),
    endMinute: pad(s.end_minute),
  }));

// ─── sub-components ───────────────────────────────────────────────────────────
const FieldRow = ({ label, required, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
    }}
  >
    <label
      style={{
        width: 120,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        paddingTop: 4,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const CheckGroup = ({ items, checked, onChange, cols = 7 }) => {
  const allValues = items.map((item) =>
    typeof item === "object" ? item.value : item,
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gap: "4px 12px",
        justifyContent: "start",
      }}
    >
      {items.map((item) => {
        const val = typeof item === "object" ? item.value : item;
        const lbl = typeof item === "object" ? item.label : item;
        return (
          <label
            key={val}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={checked.includes(val)}
              onChange={() => onChange(val)}
              style={{ accentColor: "#3b82f6", width: 14, height: 14 }}
            />
            {lbl}
          </label>
        );
      })}
      {/* All checkbox */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          cursor: "pointer",
          userSelect: "none",
          color: "#2563eb",
          fontWeight: 600,
        }}
      >
        <input
          type="checkbox"
          checked={checked.length === allValues.length && allValues.length > 0}
          onChange={() => onChange("__ALL__")}
          style={{ accentColor: "#3b82f6", width: 14, height: 14 }}
        />
        All
      </label>
    </div>
  );
};

const TimeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      border: "1px solid #cbd5e1",
      borderRadius: 4,
      fontSize: 12,
      padding: "2px 4px",
      background: "#fff",
    }}
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

// ─── main component ──────────────────────────────────────────────────────────
const TimeCondition = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...TC_INITIAL_FORM });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const hasLoaded = useRef(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  // ── load ──────────────────────────────────────────────────────────────────
  const loadRows = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await fetchTimeConditions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(normalizeFromApi));
    } catch (e) {
      showToast(e?.message || "Failed to load time conditions", "error");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadRows();
    }
  }, []);

  // ── select helpers ────────────────────────────────────────────────────────
  const handleSelectRow = (idx) =>
    setSelected((s) =>
      s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx],
    );

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} item(s)?`)) return;
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const ids = selected.map((idx) => rows[idx].id);
      if (ids.length === 1) {
        await deleteTimeCondition(ids[0]);
      } else {
        await deleteAllTimeConditions(ids);
      }
      setSelected([]);
      await loadRows();
      showToast("Deleted successfully");
    } catch (e) {
      showToast(e?.message || "Delete failed", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── modal ─────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({
      ...TC_INITIAL_FORM,
      timeRanges: [
        { startHour: "09", startMinute: "00", endHour: "18", endMinute: "00" },
      ],
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setForm({
      name: row.name,
      type: row.type,
      timeRanges: row.timeSlots.length
        ? apiSlotsToFormRanges(row.timeSlots)
        : [
            {
              startHour: "09",
              startMinute: "00",
              endHour: "18",
              endMinute: "00",
            },
          ],
      daysOfWeek: row.daysOfWeek,
      months: row.months,
      daysOfMonth: row.daysOfMonth,
    });
    setEditId(row.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  // ── form helpers ──────────────────────────────────────────────────────────
  const allDayValues = TC_DAYS_OF_WEEK.map((d) => d.value);
  const allMonthValues = TC_MONTHS.map((m) => m.value);
  const allDomValues = TC_DAYS_OF_MONTH.map(String);

  const toggleCheck = (key, value, allValues) => {
    setForm((prev) => {
      const list = prev[key];
      if (value === "__ALL__") {
        return {
          ...prev,
          [key]: list.length === allValues.length ? [] : [...allValues],
        };
      }
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const addTimeRange = () =>
    setForm((p) => ({
      ...p,
      timeRanges: [
        ...p.timeRanges,
        { startHour: "00", startMinute: "00", endHour: "00", endMinute: "00" },
      ],
    }));

  const removeTimeRange = (idx) =>
    setForm((p) => ({
      ...p,
      timeRanges: p.timeRanges.filter((_, i) => i !== idx),
    }));

  const updateTimeRange = (idx, field, val) =>
    setForm((p) => {
      const tr = [...p.timeRanges];
      tr[idx] = { ...tr[idx], [field]: val };
      return { ...p, timeRanges: tr };
    });

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (form.type === "worktime" && !form.daysOfWeek.length) {
      showToast("Select at least one Day of Week", "error");
      return;
    }
    if (form.type === "worktime" && !form.timeRanges.length) {
      showToast("Add at least one time range", "error");
      return;
    }
    if (form.type === "holiday" && !form.months.length) {
      showToast("Select at least one Month", "error");
      return;
    }
    if (form.type === "holiday" && !form.daysOfMonth.length) {
      showToast("Select at least one Day of Month", "error");
      return;
    }

    setLoading((p) => ({ ...p, save: true }));
    try {
      const common = {
        name: form.name.trim(),
        condition_type: form.type,
      };

      const typeFields =
        form.type === "worktime"
          ? {
              time_slots: formToTimeSlots(form.timeRanges),
              days_of_week: form.daysOfWeek,
            }
          : {
              months: form.months,
              days_of_month: form.daysOfMonth.map(Number),
            };

      const payload =
        editId !== null
          ? { id: editId, ...common, ...typeFields }
          : { ...common, ...typeFields };

      const res =
        editId !== null
          ? await updateTimeCondition(payload)
          : await createTimeCondition(payload);

      if (res?.response === false) {
        showToast(res.message || "Save failed", "error");
        return;
      }
      showToast(
        editId !== null ? "Updated successfully" : "Created successfully",
      );
      closeModal();
      await loadRows();
    } catch (e) {
      showToast(e?.message || "Save failed", "error");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type === "error" ? "error" : "success"}
            onClose={() => setToast({ msg: "", type: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <PbxBreadcrumb section="Call Control" current={TC_TITLE} />

        <div style={listCardStyle}>
          <div style={listToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
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
                variant="danger"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
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
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
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
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 40, padding: 0, borderLeft: "none" }} />
                    <TH style={{ width: 36 }}>#</TH>
                    {TC_TABLE_COLUMNS.map((c) => (
                      <TH key={c.key}>{c.label}</TH>
                    ))}
                    <TH style={{ width: 70, borderRight: "none" }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          borderBottom: "1px solid #f1f5f9",
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
                        <td style={{ ...tdStyle, background: rowBg }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {typeLabel(row.type)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            maxWidth: 320,
                            whiteSpace: "normal",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {settingsSummary(row)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            textAlign: "center",
                            padding: "7px 8px",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => openEdit(row)}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
                borderBottomLeftRadius: LIST_CARD_RADIUS,
                borderBottomRightRadius: LIST_CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record{rows.length !== 1 ? "s" : ""} on
                page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
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
        className="z-50"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 680,
            maxWidth: "96vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
          },
        }}
        disableRestoreFocus
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.cardBorder}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          {editId !== null ? "Edit Time Condition" : "Add Time Condition"}
        </DialogTitle>

        <DialogContent sx={{ p: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              marginTop: 22,
            }}
          >
              {/* Name */}
              <FieldRow label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Enter name"
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </FieldRow>

              {/* Type */}
              <FieldRow label="Type" required>
                <div style={{ display: "flex", gap: 20 }}>
                  {TC_TYPES.map((t) => (
                    <label
                      key={t.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: form.type === t.value ? 600 : 400,
                      }}
                    >
                      <input
                        type="radio"
                        name="tc_type"
                        value={t.value}
                        checked={form.type === t.value}
                        onChange={() =>
                          setForm((p) => ({ ...p, type: t.value }))
                        }
                        style={{ accentColor: "#3b82f6" }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </FieldRow>

              {/* ── WorkTime fields ── */}
              {form.type === "worktime" && (
                <>
                  <FieldRow label="Settings" required>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 11,
                          color: "#64748b",
                          fontWeight: 600,
                          paddingLeft: 70,
                        }}
                      >
                        <span style={{ width: 80, textAlign: "center" }}>
                          Hour
                        </span>
                        <span style={{ width: 60, textAlign: "center" }}>
                          Minute
                        </span>
                        <span style={{ width: 16 }} />
                        <span style={{ width: 80, textAlign: "center" }}>
                          Hour
                        </span>
                        <span style={{ width: 60, textAlign: "center" }}>
                          Minute
                        </span>
                      </div>
                      {form.timeRanges.map((tr, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "#374151",
                              width: 70,
                              flexShrink: 0,
                            }}
                          >
                            StartTime
                          </span>
                          <TimeSelect
                            value={tr.startHour}
                            onChange={(v) => updateTimeRange(i, "startHour", v)}
                            options={TC_HOURS}
                          />
                          <span style={{ fontSize: 12 }}>:</span>
                          <TimeSelect
                            value={tr.startMinute}
                            onChange={(v) =>
                              updateTimeRange(i, "startMinute", v)
                            }
                            options={TC_MINUTES}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "#374151",
                              marginLeft: 4,
                            }}
                          >
                            EndTime
                          </span>
                          <TimeSelect
                            value={tr.endHour}
                            onChange={(v) => updateTimeRange(i, "endHour", v)}
                            options={TC_HOURS}
                          />
                          <span style={{ fontSize: 12 }}>:</span>
                          <TimeSelect
                            value={tr.endMinute}
                            onChange={(v) => updateTimeRange(i, "endMinute", v)}
                            options={TC_MINUTES}
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

                  <FieldRow label="Day of Week" required>
                    <CheckGroup
                      items={TC_DAYS_OF_WEEK}
                      checked={form.daysOfWeek}
                      onChange={(v) =>
                        toggleCheck("daysOfWeek", v, allDayValues)
                      }
                      cols={4}
                    />
                  </FieldRow>
                </>
              )}

              {/* ── Holiday fields ── */}
              {form.type === "holiday" && (
                <>
                  <FieldRow label="Month" required>
                    <CheckGroup
                      items={TC_MONTHS}
                      checked={form.months}
                      onChange={(v) => toggleCheck("months", v, allMonthValues)}
                      cols={6}
                    />
                  </FieldRow>

                  <FieldRow label="Day of Month" required>
                    <CheckGroup
                      items={TC_DAYS_OF_MONTH.map(String)}
                      checked={form.daysOfMonth.map(String)}
                      onChange={(v) => {
                        if (v === "__ALL__") {
                          setForm((p) => ({
                            ...p,
                            daysOfMonth:
                              p.daysOfMonth.length === allDomValues.length
                                ? []
                                : allDomValues,
                          }));
                        } else {
                          setForm((p) => {
                            const cur = p.daysOfMonth.map(String);
                            return {
                              ...p,
                              daysOfMonth: cur.includes(v)
                                ? cur.filter((d) => d !== v)
                                : [...cur, v],
                            };
                          });
                        }
                      }}
                      cols={7}
                    />
                  </FieldRow>
                </>
              )}
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.cardBorder}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff" }} />
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
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimeCondition;
