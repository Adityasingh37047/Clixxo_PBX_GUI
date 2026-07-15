import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { listAutoProvision } from "../../../../api/apiService";
import {
  AUTO_PROVISION_EMPTY_MESSAGE,
  AUTO_PROVISION_ITEMS_PER_PAGE,
} from "../../../../constants/AutoProvisionConstants";
import {
  extractAutoProvisionList,
  filterAutoProvisionRows,
  normalizeAutoProvisionRow,
} from "../utils/AutoProvisionTransformers";
import { getAutoProvisionLoadErrorMessage } from "../utils/AutoProvisionValidators";

const AUTO_PROVISION_COMPACT_MQ = "(max-width: 768px)";
const AUTO_PROVISION_LOAD_ERROR_FALLBACK =
  "Failed to load auto provision devices.";

export function useAutoProvisionPage() {
  const isCompact = useMediaQuery(AUTO_PROVISION_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState({ fetch: false });
  const [error, setError] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const itemsPerPage = AUTO_PROVISION_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await listAutoProvision();
      if (!res?.response) {
        showAlert(
          "error",
          typeof res?.message === "string"
            ? res.message
            : AUTO_PROVISION_LOAD_ERROR_FALLBACK,
        );
        setRows([]);
        setSelected([]);
        return;
      }
      const list = extractAutoProvisionList(res);
      setRows(list.map((item, index) => normalizeAutoProvisionRow(item, index)));
      setSelected([]);
    } catch (err) {
      showAlert(
        "error",
        getAutoProvisionLoadErrorMessage(err, AUTO_PROVISION_LOAD_ERROR_FALLBACK),
      );
      setRows([]);
      setSelected([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
    }
  }, []);

  const filteredRows = filterAutoProvisionRows(rows, searchQuery);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length, itemsPerPage]);

  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return {
    isCompact,
    rows,
    selected,
    loading,
    error,
    setError,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    searchQuery,
    searchFocused,
    setSearchFocused,
    totalPages,
    pagedRows,
    filteredRows,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    loadRows,
    handleSearchChange,
    handleClearSearch,
    emptyMessage: AUTO_PROVISION_EMPTY_MESSAGE,
  };
}
