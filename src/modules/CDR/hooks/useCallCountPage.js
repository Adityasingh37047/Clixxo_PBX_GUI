import { useEffect, useMemo, useRef, useState } from "react";
import { bulkDeleteCdr, deleteCdrRecording, downloadCdr, fetchCdr, fetchCdrRecording } from "../../../api/apiService";
import { CALL_COUNT_ITEMS_PER_PAGE, CALL_COUNT_MAX_RECORDS } from "../../../constants/CallCountConstants";
import {
  DEFAULT_APPLIED_MODIFY_DRAFT, DEFAULT_FILTERS, matchesCallFrom, matchesCallStatus,
  matchesCallTo, matchesDateRange, matchesDirectionFilter, matchesSearch, matchesTalkDuration, matchesTrunkName,
} from "../utils/CallCountTransformers";

export function useCallCountPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(CALL_COUNT_ITEMS_PER_PAGE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyDraft, setModifyDraft] = useState({
    trunkName: "",
    callFrom: "",
    callTo: "",
    ...DEFAULT_APPLIED_MODIFY_DRAFT,
  });

  const [filterDraft, setFilterDraft] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });
  const [appliedModifyDraft, setAppliedModifyDraft] = useState({
    ...DEFAULT_APPLIED_MODIFY_DRAFT,
  });
  const [recording, setRecording] = useState({
    uniqueid: null,
    url: "",
    loading: false,
  });
  const audioRef = useRef(null);
  const recordingUrlRef = useRef("");

  useEffect(() => {
    recordingUrlRef.current = recording.url;
  }, [recording.url]);

  useEffect(
    () => () => {
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (recording.url && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [recording.url]);

  const stopRecording = () => {
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    setRecording({ uniqueid: null, url: "", loading: false });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handlePlayRecording = async (row) => {
    const uniqueid = row?.uniqueid;
    if (!uniqueid) return;
    if (recording.uniqueid === uniqueid && recording.url) {
      stopRecording();
      return;
    }
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    setError("");
    setRecording({ uniqueid, url: "", loading: true });
    try {
      const blob = await fetchCdrRecording(uniqueid);
      const url = URL.createObjectURL(blob);
      setRecording({ uniqueid, url, loading: false });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 404
          ? "Recording not found for this call."
          : "Failed to load recording. Please try again.",
      );
      setRecording({ uniqueid: null, url: "", loading: false });
    }
  };

  const handleDeleteRecording = async (row) => {
    const uniqueid = row?.uniqueid;
    if (!uniqueid) return;
    if (
      !window.confirm(
        "Delete the recording for this call? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await deleteCdrRecording(uniqueid);
      if (res && res.response === false) {
        setError(res.message || "Failed to delete recording.");
        return;
      }
      if (recording.uniqueid === uniqueid) stopRecording();
      setRows((prev) =>
        prev.map((r) =>
          r.uniqueid === uniqueid ? { ...r, recordingfile: "" } : r,
        ),
      );
    } catch {
      setError("Failed to delete recording. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCdr = async (pageToLoad = page, filters = appliedFilters) => {
    try {
      setLoading(true);
      setError("");
      const requestFilters = {
        startdate: filters.startDate || undefined,
        enddate: filters.endDate || undefined,
        trunk_name: filters.trunkName || undefined,
      };

      let activePage = pageToLoad;
      let data = await fetchCdr(activePage, limit, requestFilters);

      if (
        data?.success &&
        Array.isArray(data.data) &&
        data.data.length === 0 &&
        activePage > 1
      ) {
        const apiTotal = Number(data.total);
        const lastValidPage =
          Number.isFinite(apiTotal) && apiTotal >= 0
            ? Math.max(
                1,
                Math.ceil(Math.min(apiTotal, CALL_COUNT_MAX_RECORDS) / limit),
              )
            : activePage - 1;
        if (lastValidPage < activePage) {
          activePage = lastValidPage;
          data = await fetchCdr(activePage, limit, requestFilters);
        }
      }

      if (data && data.success && Array.isArray(data.data)) {
        const pageRows = data.data;
        setRows(pageRows);
        setLastUpdated(new Date());
        const rowCount = pageRows.length;
        const apiTotal = Number(data.total);
        if (Number.isFinite(apiTotal) && apiTotal >= 0) {
          setTotalRecords(Math.min(apiTotal, CALL_COUNT_MAX_RECORDS));
        } else if (rowCount < limit) {
          setTotalRecords(
            Math.min(
              (activePage - 1) * limit + rowCount,
              CALL_COUNT_MAX_RECORDS,
            ),
          );
        }
        setPage(activePage);
      } else {
        setRows([]);
        setTotalRecords(0);
      }
    } catch {
      setError("Failed to load call records. Please try again.");
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadCdr(1);
    }
  }, []);

  const totalPages = useMemo(() => {
    if (totalRecords > 0) {
      return Math.max(1, Math.ceil(totalRecords / limit));
    }
    const hasNextPage = rows.length >= limit;
    return Math.max(1, page + (hasNextPage ? 1 : 0));
  }, [totalRecords, rows.length, limit, page]);

  const handlePageChange = (nextPage) => {
    const next = Math.min(totalPages, Math.max(1, nextPage));
    if (next === page || loading) return;
    if (next > page && rows.length < limit) return;
    loadCdr(next);
  };

  const handleToggleRow = (uniqueid) => {
    const id = String(uniqueid ?? "");
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesCallStatus(row, appliedFilters.callStatus)) return false;
      if (!matchesDirectionFilter(row, appliedFilters.direction)) return false;
      if (!matchesSearch(row, appliedFilters.search)) return false;
      if (!matchesTrunkName(row, appliedFilters.trunkName)) return false;
      if (!matchesCallFrom(row, appliedFilters.callFrom)) return false;
      if (!matchesCallTo(row, appliedFilters.callTo)) return false;
      if (
        !matchesTalkDuration(
          row,
          appliedModifyDraft.talkDurationOperator,
          appliedModifyDraft.talkDurationSeconds,
        )
      ) {
        return false;
      }
      if (
        !matchesDateRange(row, appliedFilters.startDate, appliedFilters.endDate)
      ) {
        return false;
      }
      return true;
    });
  }, [
    rows,
    appliedFilters,
    appliedModifyDraft.talkDurationOperator,
    appliedModifyDraft.talkDurationSeconds,
  ]);

  const handleToggleAll = () => {
    const pageIds = filteredData
      .map((r) => String(r.uniqueid ?? ""))
      .filter(Boolean);
    if (!pageIds.length) return;
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.callStatus !== "all" ||
      appliedFilters.direction !== "all" ||
      !!appliedFilters.search.trim() ||
      !!appliedFilters.trunkName.trim() ||
      !!appliedFilters.callFrom.trim() ||
      !!appliedFilters.callTo.trim() ||
      !!String(appliedModifyDraft.talkDurationSeconds || "").trim() ||
      !!appliedFilters.startDate ||
      !!appliedFilters.endDate
    );
  }, [appliedFilters, appliedModifyDraft.talkDurationSeconds]);

  const updateFilterDraftDate = (field, value) => {
    const nextStart = field === "startDate" ? value : filterDraft.startDate;
    const nextEnd = field === "endDate" ? value : filterDraft.endDate;
    if (nextStart && nextEnd && nextStart > nextEnd) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    setFilterDraft((f) => ({ ...f, [field]: value }));
  };

  const handleResetFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilterDraft(resetFilters);
    setAppliedFilters(resetFilters);
    setAppliedModifyDraft({ ...DEFAULT_APPLIED_MODIFY_DRAFT });
    setModifyDraft({
      trunkName: "",
      callFrom: "",
      callTo: "",
      ...DEFAULT_APPLIED_MODIFY_DRAFT,
    });
    setSelectedIds([]);
    setPage(1);
    setTotalRecords(0);
    setError("");
    loadCdr(1, resetFilters);
  };

  const handleModifyOpen = () => {
    setFilterDraft({ ...appliedFilters });
    setModifyDraft((m) => ({
      ...m,
      talkDurationOperator: appliedModifyDraft.talkDurationOperator,
      talkDurationSeconds: appliedModifyDraft.talkDurationSeconds,
    }));
    setShowModifyModal(true);
  };

  const handleFilterSearch = () => {
    const { startDate, endDate } = filterDraft;
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    setAppliedFilters({ ...filterDraft });
    setAppliedModifyDraft({
      talkDurationOperator: modifyDraft.talkDurationOperator,
      talkDurationSeconds: modifyDraft.talkDurationSeconds,
    });
    setPage(1);
    setTotalRecords(0);
    loadCdr(1, filterDraft);
    setShowModifyModal(false);
  };

  const handleFilterCancel = () => {
    setFilterDraft({ ...appliedFilters });
    setModifyDraft((m) => ({
      ...m,
      talkDurationOperator: appliedModifyDraft.talkDurationOperator,
      talkDurationSeconds: appliedModifyDraft.talkDurationSeconds,
    }));
    setShowModifyModal(false);
  };

  const handleModifyReset = () => {
    setShowModifyModal(false);
    handleResetFilters();
  };

  const handleDelete = async () => {
    if (!selectedIds.length) {
      window.alert("Please select at least one record to delete.");
      return;
    }
  
    const msg =
      selectedIds.length === 1
        ? "Are you sure you want to delete this record?"
        : `Are you sure you want to delete ${selectedIds.length} records?`;
  
    if (!window.confirm(msg)) return;
  
    const deleteCount = selectedIds.length;
  
    try {
      setLoading(true);
  
      // Bulk delete API call (single request)
      await bulkDeleteCdr(selectedIds);
  
      setSelectedIds([]);
  
      const newTotalRecords = Math.max(0, totalRecords - deleteCount);
  
      const pageToLoad =
        totalRecords > 0
          ? Math.min(
              page,
              Math.max(1, Math.ceil(newTotalRecords / limit))
            )
          : page;
  
      await loadCdr(pageToLoad);
  
      showMessage(
        "success",
        `Deleted ${deleteCount} call count record(s)`
      );
    } catch (error) {
      console.error("Bulk delete failed:", error);
  
      setError(
        "Failed to delete some records. Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await downloadCdr();
      const blob = response.data;
      const cd = response.headers?.["content-disposition"] || "";
      let fileName = "cdr.csv";
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
      if (match)
        fileName = decodeURIComponent(match[1] || match[2] || fileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download CDR file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    rows,
    loading,
    isInitialLoad,
    error,
    setError,
    message,
    setMessage,
    page,
    totalRecords,
    limit,
    selectedIds,
    setSelectedIds,
    lastUpdated,
    showModifyModal,
    setShowModifyModal,
    modifyDraft,
    setModifyDraft,
    filterDraft,
    setFilterDraft,
    appliedFilters,
    appliedModifyDraft,
    recording,
    audioRef,
    filteredData,
    totalPages,
    hasActiveFilters,
    stopRecording,
    loadCdr,
    handlePageChange,
    handleToggleRow,
    handleToggleAll,
    updateFilterDraftDate,
    handleResetFilters,
    handleModifyOpen,
    handleFilterSearch,
    handleFilterCancel,
    handleModifyReset,
    handleDelete,
    handleDownload,
    handlePlayRecording,
    handleDeleteRecording,
  };
}
