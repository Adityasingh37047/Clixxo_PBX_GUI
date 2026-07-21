import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteAllOperationLogs,
  deleteOperationLogRows,
  exportOperationLogXlsx,
  fetchOperationLogFilters,
  fetchOperationLogList,
} from "../../../../api/apiService";
import {
  DEFAULT_OPERATIONS_LOG_FILTERS,
  OPERATIONS_LOG_DOWNLOAD_FILENAME,
  OPERATIONS_LOG_ITEMS_PER_PAGE,
  OPERATIONS_LOG_MESSAGES,
} from "../../../../constants/OperationsLogConstants";
import {
  buildOperationLogRequest,
  hasOperationsLogActiveFilters,
  mapOperationLogRow,
  triggerOperationLogXlsxDownload,
} from "../utils/OperationsLogTransformers";
import {
  getOperationsLogFetchErrorMessage,
  isOperationsLogEmpty,
} from "../utils/OperationsLogValidators";

export function useOperationsLogPage() {
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDraft, setFilterDraft] = useState({
    ...DEFAULT_OPERATIONS_LOG_FILTERS,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    ...DEFAULT_OPERATIONS_LOG_FILTERS,
  });
  const [filterOptions, setFilterOptions] = useState({
    usernames: [],
    modules: [],
    operations: [],
    statuses: [],
  });
  const hasInitialLoadRef = useRef(false);

  const itemsPerPage = OPERATIONS_LOG_ITEMS_PER_PAGE;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadFilters = async () => {
    try {
      const response = await fetchOperationLogFilters();
      if (response?.response && response?.data) {
        setFilterOptions({
          usernames: response.data.usernames ?? [],
          modules: response.data.modules ?? [],
          operations: response.data.operations ?? [],
          statuses: response.data.statuses ?? [],
        });
      }
    } catch (err) {
      console.error("Error fetching operation log filters:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.FILTERS_FAILED);
    }
  };

  const loadOperationsLog = async (
    pageToLoad = page,
    filters = appliedFilters,
  ) => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const payload = buildOperationLogRequest(
        filters,
        pageToLoad,
        itemsPerPage,
      );
      const response = await fetchOperationLogList(payload);

      if (!response?.response) {
        throw new Error("Operation log list failed");
      }

      const mappedRows = (response.data ?? []).map(mapOperationLogRow);
      setRows(mappedRows);
      setPage(response.page ?? pageToLoad);
      setTotalRecords(response.total ?? mappedRows.length);
      setTotalPages(Math.max(1, response.total_pages ?? 1));
      setSelectedIds([]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching operations log:", err);
      setRows([]);
      setSelectedIds([]);
      showMessage("error", getOperationsLogFetchErrorMessage(err));
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadFilters();
      loadOperationsLog(1, DEFAULT_OPERATIONS_LOG_FILTERS);
    }
  }, []);

  const hasActiveFilters = useMemo(
    () => hasOperationsLogActiveFilters(appliedFilters),
    [appliedFilters],
  );

  const pageIds = rows.map((row) => row.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  const handlePageChange = (nextPage) => {
    loadOperationsLog(nextPage, appliedFilters);
  };

  const handleFilterOpen = () => {
    setFilterDraft({ ...appliedFilters });
    setShowFilterModal(true);
  };

  const handleFilterCancel = () => {
    setFilterDraft({ ...appliedFilters });
    setShowFilterModal(false);
  };

  const handleFilterReset = () => {
    setFilterDraft({ ...DEFAULT_OPERATIONS_LOG_FILTERS });
    setAppliedFilters({ ...DEFAULT_OPERATIONS_LOG_FILTERS });
    setShowFilterModal(false);
    loadOperationsLog(1, DEFAULT_OPERATIONS_LOG_FILTERS);
  };

  const handleFilterSearch = () => {
    const { startDate, endDate } = filterDraft;
    if (startDate && endDate && startDate > endDate) {
      showMessage("error", OPERATIONS_LOG_MESSAGES.INVALID_DATE_RANGE);
      return;
    }

    const nextFilters = { ...filterDraft };
    setAppliedFilters(nextFilters);
    setShowFilterModal(false);
    loadOperationsLog(1, nextFilters);
  };

  const updateFilterDraftDate = (field, value) => {
    setFilterDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const payload = buildOperationLogRequest(appliedFilters);
      const response = await exportOperationLogXlsx(payload);
      const blob = response.data;

      if (!blob || blob.size === 0) {
        showMessage("error", OPERATIONS_LOG_MESSAGES.DOWNLOAD_EMPTY);
        return;
      }

      triggerOperationLogXlsxDownload(blob, OPERATIONS_LOG_DOWNLOAD_FILENAME);
    } catch (err) {
      console.error("Error downloading operations log:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.DOWNLOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_NONE);
      return;
    }

    if (!window.confirm(OPERATIONS_LOG_MESSAGES.DELETE_CONFIRM)) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await deleteOperationLogRows(selectedIds);

      if (!response?.response) {
        showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_FAILED);
        return;
      }

      showMessage(
        "success",
        `Deleted ${response.deleted ?? selectedIds.length} entries.`,
      );
      await loadOperationsLog(page, appliedFilters);
    } catch (err) {
      console.error("Error deleting operations log entries:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (totalRecords === 0 && rows.length === 0) {
      showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_ALL_NONE);
      return;
    }

    if (!window.confirm(OPERATIONS_LOG_MESSAGES.DELETE_ALL_CONFIRM)) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await deleteAllOperationLogs();

      if (!response?.response) {
        showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_ALL_FAILED);
        return;
      }

      setFilterDraft({ ...DEFAULT_OPERATIONS_LOG_FILTERS });
      setAppliedFilters({ ...DEFAULT_OPERATIONS_LOG_FILTERS });
      setShowFilterModal(false);
      showMessage("success", OPERATIONS_LOG_MESSAGES.DELETE_ALL_SUCCESS);
      await loadOperationsLog(1, DEFAULT_OPERATIONS_LOG_FILTERS);
    } catch (err) {
      console.error("Error clearing operation log:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_ALL_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return {
    rows,
    loading,
    isInitialLoad,
    message,
    setMessage,
    page,
    totalPages,
    totalRecords,
    itemsPerPage,
    selectedIds,
    lastUpdated,
    allPageSelected,
    somePageSelected,
    dataEmpty: isOperationsLogEmpty(rows),
    hasActiveFilters,
    showFilterModal,
    setShowFilterModal,
    filterDraft,
    setFilterDraft,
    appliedFilters,
    filterOptions,
    loadOperationsLog,
    handleToggleRow,
    handleToggleAll,
    handlePageChange,
    handleDownload,
    handleDelete,
    handleDeleteAll,
    handleFilterOpen,
    handleFilterCancel,
    handleFilterReset,
    handleFilterSearch,
    updateFilterDraftDate,
  };
}
