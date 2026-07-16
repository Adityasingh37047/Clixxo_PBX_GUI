import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  TIME_CONDITION_DAYS_OF_MONTH,
  TIME_CONDITION_DAYS_OF_WEEK,
  TIME_CONDITION_INITIAL_FORM,
  TIME_CONDITION_MONTHS,
} from "../../../../constants/TimeConditionConstants";
import {
  createTimeCondition,
  deleteAllTimeConditions,
  deleteTimeCondition,
  fetchTimeConditions,
  updateTimeCondition,
} from "../../../../api/apiService";
import {
  buildTimeConditionApiPayload,
  formFromRow,
  normalizeFromApi,
  normalizeTimeConditionList,
} from "../utils/TimeConditionTransformers";
import { validateTimeConditionForm } from "../utils/TimeConditionValidators";

const TIME_CONDITION_COMPACT_MQ = "(max-width: 768px)";

export function useTimeConditionPage() {
  const isCompact = useMediaQuery(TIME_CONDITION_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...TIME_CONDITION_INITIAL_FORM });
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

  const loadRows = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await fetchTimeConditions();
      setRows(normalizeTimeConditionList(res).map(normalizeFromApi));
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

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((s) =>
      s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx],
    );

  const allRowsSelected =
    rows.length > 0 && rows.every((_, index) => selected.includes(index));
  const someRowsSelected =
    rows.some((_, index) => selected.includes(index)) && !allRowsSelected;

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

  const openAdd = () => {
    setForm({
      ...TIME_CONDITION_INITIAL_FORM,
      timeRanges: [
        { startHour: "09", startMinute: "00", endHour: "18", endMinute: "00" },
      ],
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setForm(formFromRow(row));
    setEditId(row.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const allDayValues = TIME_CONDITION_DAYS_OF_WEEK.map((d) => d.value);
  const allMonthValues = TIME_CONDITION_MONTHS.map((m) => m.value);
  const allDomValues = TIME_CONDITION_DAYS_OF_MONTH.map(String);

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

  const handleDaysOfMonthToggle = (value) => {
    if (value === "__ALL__") {
      setForm((p) => ({
        ...p,
        daysOfMonth:
          p.daysOfMonth.length === allDomValues.length ? [] : allDomValues,
      }));
    } else {
      setForm((p) => {
        const cur = p.daysOfMonth.map(String);
        return {
          ...p,
          daysOfMonth: cur.includes(value)
            ? cur.filter((d) => d !== value)
            : [...cur, value],
        };
      });
    }
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

  const handleSave = async () => {
    const validationError = validateTimeConditionForm(form);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setLoading((p) => ({ ...p, save: true }));
    try {
      const payload = buildTimeConditionApiPayload({ editId, form });

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

  return {
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
  };
}
