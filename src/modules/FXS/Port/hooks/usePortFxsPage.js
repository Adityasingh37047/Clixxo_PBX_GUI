import { useCallback, useEffect, useRef, useState } from "react";
import {
  PORT_FXS_ITEMS_PER_PAGE,
  PORT_FXS_TOTAL_PORTS,
} from "../../../../constants/PortFxsPageConstants";
import { fetchFxsPorts } from "../../../../api/apiService";
import {
  buildBatchInitialPorts,
  normalizeFxsPortsResponse,
} from "../utils/PortFxsTransformers";
import {
  routeTableMinWidthForZoom,
} from "../components/PortFxsTableHelpers";

export function usePortFxsPage() {
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState(null);
  const [batchInitialPorts, setBatchInitialPorts] = useState(null);
  const [maxPorts, setMaxPorts] = useState(PORT_FXS_TOTAL_PORTS);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [showBatchModify, setShowBatchModify] = useState(false);
  const [showSingleModify, setShowSingleModify] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [modifyPortData, setModifyPortData] = useState(null);
  const [modifySaving, setModifySaving] = useState(false);

  const tableScrollRef = useRef(null);
  const modifyFormRef = useRef(null);

  const itemsPerPage = PORT_FXS_ITEMS_PER_PAGE;

  const totalPages = Math.max(1, Math.ceil(ports.length / itemsPerPage));
  const pagedPorts = ports.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const hasData = !error && ports.length > 0;

  const updateHorizontalScroll = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) {
      setHasHorizontalScroll(false);
      return;
    }
    setHasHorizontalScroll(el.scrollWidth > el.clientWidth + 1);
  }, []);

  const loadPorts = async () => {
    setError(null);
    try {
      const res = await fetchFxsPorts();
      const { ports: nextPorts, maxPorts: nextMaxPorts } =
        normalizeFxsPortsResponse(res);
      setMaxPorts(nextMaxPorts);
      setPorts(nextPorts);
      setRefreshKey(Date.now());
    } catch (err) {
      console.error("Error loading FXS ports:", err);
      setError(err.message || "Failed to load ports");
    }
  };

  useEffect(() => {
    loadPorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(1400));
    };
    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);
    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => updateHorizontalScroll());
    const el = tableScrollRef.current;
    if (!el) return () => cancelAnimationFrame(raf);

    const ro = new ResizeObserver(() => {
      updateHorizontalScroll();
    });
    ro.observe(el);

    window.addEventListener("resize", updateHorizontalScroll);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateHorizontalScroll);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", updateHorizontalScroll);
      vv?.removeEventListener("resize", updateHorizontalScroll);
    };
  }, [refreshKey, tableMinWidth, hasData, page, updateHorizontalScroll]);

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const handleBatchModify = () => {
    setBatchInitialPorts(buildBatchInitialPorts(ports, maxPorts));
    setShowBatchModify(true);
  };

  const handleOpenSingleModify = (port) => {
    setModifyPortData(port.raw ?? null);
    setSelectedPort(String(port.port));
    setShowSingleModify(true);
  };

  const handleCloseSingleModify = () => {
    setShowSingleModify(false);
    setSelectedPort(null);
    setModifyPortData(null);
    setModifySaving(false);
  };

  const handleSingleModifySaved = async () => {
    await loadPorts();
    setShowSingleModify(false);
    setSelectedPort(null);
  };

  const handleBatchModifySaved = async () => {
    await loadPorts();
    setShowBatchModify(false);
  };

  return {
    ports,
    error,
    batchInitialPorts,
    maxPorts,
    page,
    refreshKey,
    tableMinWidth,
    hasHorizontalScroll,
    showBatchModify,
    setShowBatchModify,
    showSingleModify,
    selectedPort,
    modifyPortData,
    modifySaving,
    setModifySaving,
    tableScrollRef,
    modifyFormRef,
    itemsPerPage,
    totalPages,
    pagedPorts,
    hasData,
    loadPorts,
    handlePageChange,
    handleBatchModify,
    handleOpenSingleModify,
    handleCloseSingleModify,
    handleSingleModifySaved,
    handleBatchModifySaved,
  };
}
