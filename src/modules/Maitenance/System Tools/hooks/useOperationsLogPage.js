import { useEffect, useMemo, useRef, useState } from "react";
import { postLinuxCmd } from "../../../../api/apiService";
import {
  OPERATIONS_LOG_COMMANDS,
  OPERATIONS_LOG_DOWNLOAD_FILENAME,
  OPERATIONS_LOG_FILE_FALLBACK_PATH,
  OPERATIONS_LOG_FILE_PATH,
  OPERATIONS_LOG_ITEMS_PER_PAGE,
  OPERATIONS_LOG_MAX_RECORDS,
  OPERATIONS_LOG_MESSAGES,
} from "../../../../constants/OperationsLogConstants";
import {
  encodeOperationsLogForShell,
  parseOperationsLogText,
  serializeOperationsLogRows,
  triggerOperationsLogDownload,
} from "../utils/OperationsLogTransformers";
import {
  getOperationsLogFetchErrorMessage,
  isOperationsLogEmpty,
  isOperationsLogUnreadable,
} from "../utils/OperationsLogValidators";

export function useOperationsLogPage() {
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasInitialLoadRef = useRef(false);

  const itemsPerPage = OPERATIONS_LOG_ITEMS_PER_PAGE;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadOperationsLog = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await postLinuxCmd({
        cmd: OPERATIONS_LOG_COMMANDS.FETCH_LATEST(OPERATIONS_LOG_MAX_RECORDS),
      });
      const parsed = parseOperationsLogText(response?.responseData);

      if (isOperationsLogUnreadable(parsed)) {
        setRows([]);
        setSelectedIds([]);
        showMessage("error", OPERATIONS_LOG_MESSAGES.FILE_UNREADABLE);
        return;
      }

      setRows(parsed.rows);
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
      loadOperationsLog();
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));

  const pagedRows = useMemo(
    () => rows.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [rows, page, itemsPerPage],
  );

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), totalPages));
  }, [totalPages]);

  const pageIds = pagedRows.map((row) => row.id);
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
    setPage(nextPage);
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await postLinuxCmd({
        cmd: OPERATIONS_LOG_COMMANDS.FETCH_ALL,
      });
      const parsed = parseOperationsLogText(response?.responseData);
      const content = serializeOperationsLogRows(parsed.rows);

      if (isOperationsLogUnreadable(parsed) || !content.trim()) {
        showMessage("error", OPERATIONS_LOG_MESSAGES.DOWNLOAD_EMPTY);
        return;
      }

      triggerOperationsLogDownload(content, OPERATIONS_LOG_DOWNLOAD_FILENAME);
    } catch (err) {
      console.error("Error downloading operations log:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.DOWNLOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const writeOperationsLogFile = async (content) => {
    const encoded = encodeOperationsLogForShell(content);
    const targetPath = OPERATIONS_LOG_FILE_PATH;
    const fallbackPath = OPERATIONS_LOG_FILE_FALLBACK_PATH;
    const response = await postLinuxCmd({
      cmd: `echo '${encoded}' | base64 -d > '${targetPath}' 2>/dev/null || echo '${encoded}' | base64 -d > '${fallbackPath}' 2>/dev/null || echo "WRITE_ERROR"`,
    });
    return String(response?.responseData ?? "").trim() !== "WRITE_ERROR";
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
      const remaining = rows.filter((row) => !selectedIds.includes(row.id));
      const content = serializeOperationsLogRows(remaining);
      const ok = await writeOperationsLogFile(content);

      if (!ok) {
        showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_FAILED);
        return;
      }

      setRows(remaining);
      setSelectedIds([]);
      setLastUpdated(new Date());
      showMessage("success", "Selected entries deleted.");
    } catch (err) {
      console.error("Error deleting operations log entries:", err);
      showMessage("error", OPERATIONS_LOG_MESSAGES.DELETE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return {
    rows,
    pagedRows,
    loading,
    isInitialLoad,
    message,
    setMessage,
    page,
    totalPages,
    itemsPerPage,
    selectedIds,
    lastUpdated,
    allPageSelected,
    somePageSelected,
    dataEmpty: isOperationsLogEmpty(rows),
    loadOperationsLog,
    handleToggleRow,
    handleToggleAll,
    handlePageChange,
    handleDownload,
    handleDelete,
  };
}
