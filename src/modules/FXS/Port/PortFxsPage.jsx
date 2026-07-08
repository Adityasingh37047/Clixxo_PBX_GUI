import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  PORT_FXS_TABLE_COLUMNS,
  PORT_FXS_ITEMS_PER_PAGE,
  PORT_FXS_TOTAL_PORTS,
  PORT_FXS_BATCH_MODIFY_TITLE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
  PORT_FXS_TABLE_COLUMN_TOOLTIPS,
  PORT_FXS_PAGE_BREADCRUMB_ROOT,
  PORT_FXS_PAGE_BREADCRUMB_SECTION,
  PORT_FXS_PAGE_TITLE,
  PORT_FXS_EMPTY_MESSAGE,
} from "../../../constants/PortFxsPageConstants";
import { fetchFxsPorts } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import PortFxsBatchModifyPage from "./PortFxsBatchModifyPage";
import PortFxsModifyPage from "./PortFxsModifyPage";

// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const tableHeaderLabelStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const renderTableColumnHeader = (col) => {
  if (!PORT_FXS_TABLE_COLUMN_TOOLTIPS[col.key]) return col.label;
  return (
    <FxsFieldLabel
      tooltipKey={col.key}
      tooltips={PORT_FXS_TABLE_COLUMN_TOOLTIPS}
      style={tableHeaderLabelStyle}
    >
      {col.label}
    </FxsFieldLabel>
  );
};

// ── Local page UI (inlined from fxsSharedUi) ──

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};


const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };

const portFxsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  boxSizing: "border-box",
};

const portFxsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const portFxsCardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const portFxsHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
};

const portFxsTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

const portFxsPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 28px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  overflow: "hidden",
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};


const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const addNewModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

const addNewModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const PORT_FXS_DIALOG_MARGIN = 24;
const PORT_FXS_DIALOG_LAYOUT_OFFSET = 80;

const fxsDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PortFxsBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{PORT_FXS_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PORT_FXS_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PORT_FXS_PAGE_TITLE}
    </span>
  </div>
);

const numManipulateCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const numManipulateToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const numManipulatePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};


const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
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

const tableSectionBorder = `1px solid ${C.divider}`;

const fxsDialogPaperSx = {
  margin: PORT_FXS_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PORT_FXS_DIALOG_LAYOUT_OFFSET}px - ${PORT_FXS_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
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
        {PORT_FXS_EMPTY_MESSAGE}
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
    <div style={portFxsCardStyle}>
      <div style={portFxsHeaderStyle}>
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
            style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
          >
            Batch Modify
          </Btn>
        </div>
      </div>

      <div
        ref={tableScrollRef}
        key={refreshKey}
        style={portFxsTableBodyStyle}
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
                            ...PCM_TRUNK_GROUP_TH_GAP,
                          }}
                        >
                          {renderTableColumnHeader(col)}
                        </TH>
                      );
                    }
                    return (
                      <TH key={col.key} style={{ ...routeThExtra, ...PCM_TRUNK_GROUP_TH_GAP }}>
                        {renderTableColumnHeader(col)}
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
        <div style={portFxsPaginationStyle}>
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
    <div style={portFxsPageWrapStyle}>
      <div style={portFxsPageInnerStyle}>
        <PortFxsBreadcrumb />

        {renderListCard()}

        <Dialog
  open={showBatchModify}
  onClose={() => setShowBatchModify(false)}
  maxWidth={false}
  slotProps={addNewModalBackdropSlotProps}
  sx={fxsDialogSx}
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
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
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
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-batch-modify-form"
              style={addNewModalFooterBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => setShowBatchModify(false)}
              style={addNewModalFooterCancelBtnStyle}
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
  slotProps={addNewModalBackdropSlotProps}
  sx={fxsDialogSx}
  PaperProps={{ sx: fxsDialogPaperSx }}
  disableRestoreFocus
  disableEnforceFocus
>
          <DialogTitle style={fxsDialogTitleStyle}>FXS-Modify</DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
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
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-modify-form"
              disabled={modifySaving}
              style={addNewModalFooterBtnStyle}
            >
              {modifySaving ? "Saving..." : "Modify"}
            </Btn>
            <Btn
              variant="cancel"
              type="button"
              onClick={() => modifyFormRef.current?.reset()}
              disabled={modifySaving}
              style={addNewModalFooterCancelBtnStyle}
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
              style={addNewModalFooterCancelBtnStyle}
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
