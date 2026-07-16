import { useCallback, useEffect, useRef, useState } from "react";
import { monitorBoth } from "../../../../api/apiService";
import {
  PBX_MONITOR_EMPTY_MESSAGES,
  PBX_MONITOR_REFRESH_INTERVAL_MS,
  PBX_MONITOR_SEARCH_PLACEHOLDERS,
  PBX_MONITOR_TAB_VALUES,
} from "../../../../constants/PbxMonitorConstants";
import {
  countRegistered,
  filterExtensions,
  filterTrunks,
  getStatus,
} from "../utils/PbxMonitorTransformers";

export function usePbxMonitorPage() {
  const [activeTab, setActiveTab] = useState(PBX_MONITOR_TAB_VALUES.extension);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [extensionRows, setExtensionRows] = useState([]);
  const [trunkRows, setTrunkRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const silentRefreshRef = useRef(false);

  const loadData = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await monitorBoth();

      const msg = res?.message ?? {};

      setExtensionRows(msg?.extensions ?? []);
      setTrunkRows(msg?.trunks ?? []);

      setLastUpdated(new Date());
      setHasLoaded(true);
    } catch {
      if (!silent) {
        setExtensionRows([]);
        setTrunkRows([]);
      }
    } finally {
      if (silent) {
        silentRefreshRef.current = false;
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData(false);

    const interval = setInterval(
      () => loadData(true),
      PBX_MONITOR_REFRESH_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [loadData]);

  const extRegistered = countRegistered(extensionRows);

  const extUnregistered = extensionRows.length - extRegistered;

  const trkRegistered = countRegistered(trunkRows);

  const filteredExtensions = filterExtensions(extensionRows, searchQuery);

  const filteredTrunks = filterTrunks(trunkRows, searchQuery);

  const tableRows =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? filteredExtensions
      : filteredTrunks;
  const searchPlaceholder =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? PBX_MONITOR_SEARCH_PLACEHOLDERS.extension
      : PBX_MONITOR_SEARCH_PLACEHOLDERS.trunk;
  const emptyMessage =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? PBX_MONITOR_EMPTY_MESSAGES.extension
      : PBX_MONITOR_EMPTY_MESSAGES.trunk;
  const recordLabel =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? `extension${tableRows.length !== 1 ? "s" : ""}`
      : `trunk${tableRows.length !== 1 ? "s" : ""}`;

  return {
    activeTab,
    setActiveTab,
    hasLoaded,
    extensionRows,
    trunkRows,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    loadData,
    extRegistered,
    extUnregistered,
    trkRegistered,
    filteredExtensions,
    filteredTrunks,
    tableRows,
    searchPlaceholder,
    emptyMessage,
    recordLabel,
    getStatus,
  };
}
