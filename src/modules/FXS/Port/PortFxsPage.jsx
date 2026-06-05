import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PORT_FXS_TABLE_COLUMNS,
  PORT_FXS_ITEMS_PER_PAGE,
  PORT_FXS_TOTAL_PORTS,
  PORT_FXS_BATCH_MODIFY_TITLE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
} from "../../../sections/port/constants/PortFxsPageConstants";
import { fetchFxsPorts } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import PortFxsBatchModifyPage from "./PortFxsBatchModifyPage";
import PortFxsModifyPage from "./PortFxsModifyPage";
import {
  C,
  Btn,
  TH,
  tdStyle,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  routeTableMinWidthForZoom,
} from "../../../sections/fxs/fxsSharedUi";

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

const FWD_TYPE_TO_UI = {
  no_reply: "No Reply",
  unconditional: "Unconditional",
  busy: "Busy",
};

const tableSectionBorder = `1px solid ${C.cardBorder}`;

const fxsDialogPaperSx = {
  width: PORT_FXS_MODIFY_DIALOG_WIDTH,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const fxsDialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const fxsDialogActionsStyle = {
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  justifyContent: "center",
  gap: 12,
};

const PortFxsPage = () => {
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState(null);
  const [batchInitialPorts, setBatchInitialPorts] = useState(null);
  const [maxPorts, setMaxPorts] = useState(PORT_FXS_TOTAL_PORTS);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const tableScrollRef = useRef(null);

  const updateHorizontalScroll = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) {
      setHasHorizontalScroll(false);
      return;
    }
    setHasHorizontalScroll(el.scrollWidth > el.clientWidth + 1);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(ports.length / PORT_FXS_ITEMS_PER_PAGE),
  );
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ITEMS_PER_PAGE,
    page * PORT_FXS_ITEMS_PER_PAGE,
  );

  const mapApiPortToRow = (item) => ({
    port: item.port ?? item.id,
    type: "FXS",
    sipAccount: item.sipAccount || "---",
    displayName: item.displayName || "---",
    autoDialNum: item.autoDialNumber || "---",
    dnd: item.dnd ? "Enable" : "Disable",
    forward: item.callForwardEnabled ? "Enable" : "Disable",
    fwdType: FWD_TYPE_TO_UI[item.forwardType] || item.forwardType || "---",
    fwdNumber: item.forwardNumber || "---",
    cid: item.cidEnabled ? "Enable" : "Disable",
    callWaiting: item.callWaiting ? "Enable" : "Disable",
    regStatus: item.enabled ? "Registered" : "Unregistered",
    echoCanceller: item.echoCanceller ? "Enable" : "Disable",
    colorRing: "---",
    colorRingIndex: "---",
    inputGain: item.inputGain ?? 0,
    outputGain: item.outputGain ?? 0,
    raw: item,
  });

  const loadPorts = async () => {
    setError(null);
    try {
      const res = await fetchFxsPorts();
      const data = Array.isArray(res?.data) ? res.data : [];
      const apiMaxPorts = res?.maxPorts || data.length || PORT_FXS_TOTAL_PORTS;
      setMaxPorts(apiMaxPorts);
      setPorts(data.map(mapApiPortToRow));
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

  const hasData = !error && ports.length > 0;

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

  const [showBatchModify, setShowBatchModify] = useState(false);
  const [showSingleModify, setShowSingleModify] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [modifyPortData, setModifyPortData] = useState(null);
  const [modifySaving, setModifySaving] = useState(false);
  const modifyFormRef = useRef(null);

  const handleBatchModify = () => {
    if (ports && ports.length > 0) {
      setBatchInitialPorts({
        startingPort: String(ports[0].port),
        endingPort: String(ports[ports.length - 1].port),
      });
    } else {
      setBatchInitialPorts({
        startingPort: "1",
        endingPort: String(PORT_FXS_TOTAL_PORTS),
      });
    }
    setShowBatchModify(true);
  };

  const renderEmptyState = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#3E5475",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        No available FXS settings!
      </div>
      <Btn
        variant="cancel"
        onClick={handleBatchModify}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        Batch Modify
      </Btn>
    </div>
  );

  const renderTableCell = (col, port, rowBg, isLastRow) => {
    const cellStyle = {
      ...routeTdStyle,
      background: rowBg,
      borderBottom: isLastRow ? "none" : routeTdStyle.borderBottom,
      ...(col.key === "modify" ? { borderRight: "none" } : {}),
    };

    if (col.key === "modify") {
      return (
        <td key={col.key} style={cellStyle}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EditDocumentIcon
              titleAccess="Modify"
              style={{
                cursor: "pointer",
                color: "#2563eb",
                fontSize: 22,
                opacity: 0.7,
                transition: "opacity 0.15s ease",
              }}
              onClick={() => {
                setModifyPortData(port.raw ?? null);
                setSelectedPort(String(port.port));
                setShowSingleModify(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            />
          </div>
        </td>
      );
    }

    const value =
      col.key === "regStatus"
        ? renderRegStatusBadge(port.regStatus)
        : port[col.key];

    return (
      <td key={col.key} style={cellStyle}>
        {value}
      </td>
    );
  };

  const renderRegStatusBadge = (regStatus) => {
    const s = String(regStatus || "").toLowerCase();
    const registered = s === "registered";
    return (
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
          ...(registered
            ? { color: "#16a34a", background: "none", border: "none" }
            : {
                padding: "2px 10px",
                borderRadius: 999,
                background: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #d1d5db",
              }),
        }}
      >
        {regStatus || "—"}
      </span>
    );
  };

  const renderListCard = () => (
    <div
      style={{
        ...numManipulateCardStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={numManipulateToolbarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleBatchModify}
            style={{
              height: 30,
              padding: "6px 14px",
              fontSize: 12,
              borderRadius: 10,
            }}
          >
            Batch Modify
          </Btn>
        </div>
      </div>

      <div
        ref={tableScrollRef}
        key={refreshKey}
        style={{
          overflowX: "auto",
          overflowY: "auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {error ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              padding: 24,
              fontSize: 13,
              color: C.amber,
              textAlign: "center",
            }}
          >
            Error: {error}
          </div>
        ) : !hasData ? (
          renderEmptyState()
        ) : (
          <div
            style={{
              minWidth: tableMinWidth,
              width: tableMinWidth === "100%" ? "100%" : "max-content",
              borderBottom: hasHorizontalScroll
                ? tableSectionBorder
                : undefined,
              boxSizing: "border-box",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: tableMinWidth,
              }}
            >
              <thead>
                <tr>
                  {PORT_FXS_TABLE_COLUMNS.map((col) => {
                    if (col.key === "modify") {
                      return (
                        <TH
                          key={col.key}
                          style={{
                            width: 70,
                            borderRight: "none",
                            ...routeThExtra,
                          }}
                        >
                          {col.label}
                        </TH>
                      );
                    }
                    return (
                      <TH key={col.key} style={routeThExtra}>
                        {col.label}
                      </TH>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pagedPorts.map((port, idx) => {
                  const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                  const isLastRow = idx === pagedPorts.length - 1;
                  return (
                    <tr
                      key={port.port}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                      }}
                    >
                      {PORT_FXS_TABLE_COLUMNS.map((col) =>
                        renderTableCell(col, port, rowBg, isLastRow),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasData && (
        <div
          style={{
            ...numManipulatePaginationStyle,
            borderTop: tableSectionBorder,
          }}
        >
          <span style={{ fontSize: 11, color: C.mutedText }}>
            Showing {pagedPorts.length} record
            {pagedPorts.length !== 1 ? "s" : ""} on page {page}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              variant="outline"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
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
                border: `1px solid ${C.cardBorder}`,
              }}
            >
              Page {page} of {totalPages}
            </span>
            <Btn
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next →
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>FXS</span>
          <span>&gt;</span>
          <span>Port</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            FXS Settings
          </span>
        </div>

        {renderListCard()}

        <Dialog
          open={showBatchModify}
          onClose={() => setShowBatchModify(false)}
          maxWidth={false}
          PaperProps={{ sx: fxsDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={fxsDialogTitleStyle}>
            {PORT_FXS_BATCH_MODIFY_TITLE}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <PortFxsBatchModifyPage
              key={`batch-${batchInitialPorts?.startingPort ?? "0"}-${batchInitialPorts?.endingPort ?? "0"}`}
              inDialog
              formId="fxs-batch-modify-form"
              initialPorts={batchInitialPorts}
              maxPorts={maxPorts}
              onSaved={async () => {
                await loadPorts();
                setShowBatchModify(false);
              }}
              onClose={() => setShowBatchModify(false)}
            />
          </DialogContent>
          <DialogActions style={fxsDialogActionsStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-batch-modify-form"
              style={{ minWidth: 100, height: 33, fontSize: 13 }}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => setShowBatchModify(false)}
              style={{ minWidth: 100, height: 33 }}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showSingleModify && !!selectedPort}
          onClose={() => {
            setShowSingleModify(false);
            setSelectedPort(null);
            setModifyPortData(null);
            setModifySaving(false);
          }}
          maxWidth={false}
          PaperProps={{ sx: fxsDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={fxsDialogTitleStyle}>FXS-Modify</DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            {selectedPort && (
              <PortFxsModifyPage
                ref={modifyFormRef}
                key={`modify-${selectedPort}`}
                inDialog
                formId="fxs-modify-form"
                port={selectedPort}
                maxPorts={maxPorts}
                onSavingChange={setModifySaving}
                onSaved={async () => {
                  await loadPorts();
                  setShowSingleModify(false);
                  setSelectedPort(null);
                }}
                onClose={() => {
                  setShowSingleModify(false);
                  setSelectedPort(null);
                }}
              />
            )}
          </DialogContent>
          <DialogActions style={fxsDialogActionsStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-modify-form"
              disabled={modifySaving}
              style={{ minWidth: 100, height: 33, fontSize: 13 }}
            >
              {modifySaving ? "Saving..." : "Modify"}
            </Btn>
            <Btn
              variant="cancel"
              type="button"
              onClick={() => modifyFormRef.current?.reset()}
              disabled={modifySaving}
              style={{ minWidth: 100, height: 33 }}
            >
              Reset
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => {
                setShowSingleModify(false);
                setSelectedPort(null);
                setModifyPortData(null);
                setModifySaving(false);
              }}
              style={{ minWidth: 100, height: 33 }}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortFxsPage;
