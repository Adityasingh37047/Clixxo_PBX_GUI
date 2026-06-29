import React, { useState, useEffect, useRef } from "react";
import { listAutoProvision } from "../../../api/apiService";
import {
  Alert,
  Checkbox,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  AUTO_PROVISION_BREADCRUMB_SECTION,
  AUTO_PROVISION_COLUMNS,
  AUTO_PROVISION_EMPTY_MESSAGE,
  AUTO_PROVISION_ITEMS_PER_PAGE,
  AUTO_PROVISION_SEARCH_PLACEHOLDER,
  AUTO_PROVISION_TITLE,
} from "../../../constants/AutoProvisionConstants";

const AUTO_PROVISION_COMPACT_MQ = "(max-width: 768px)";

const PROVISION_LIST_KEYS = [
  "devices",
  "rows",
  "items",
  "list",
  "records",
  "data",
  "auto_provision",
  "auto_provisions",
  "autoProvision",
  "provision_list",
  "provisions",
  "results",
  "content",
];

const looksLikeProvisionRow = (item) =>
  item &&
  typeof item === "object" &&
  (item.mac_address != null ||
    item.macAddress != null ||
    item.mac != null ||
    item.MAC != null ||
    item.extension != null ||
    item.Extension != null ||
    item.ip != null ||
    item.ip_address != null);

const extractAutoProvisionList = (res) => {
  const sources = [res?.message, res?.data, res?.result, res];

  for (const source of sources) {
    if (Array.isArray(source)) return source;
  }

  for (const source of sources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    for (const key of PROVISION_LIST_KEYS) {
      if (Array.isArray(source[key])) return source[key];
    }
    const matched = Object.values(source).find(
      (value) =>
        Array.isArray(value) &&
        value.length > 0 &&
        looksLikeProvisionRow(value[0]),
    );
    if (matched) return matched;
  }

  for (const source of sources) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    for (const key of PROVISION_LIST_KEYS) {
      if (Array.isArray(source[key])) return source[key];
    }
  }

  return [];
};

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  placeholderText: "#94a3b8",
  accent: "#3E5475",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
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
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

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

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </button>
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
      ...extra,
    }}
  >
    {children}
  </th>
);

const autoProvisionTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const autoProvisionTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const AUTO_PROVISION_TABLE_CARD_RADIUS = 10;

const autoProvisionPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const autoProvisionPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const autoProvisionCardStyle = {
  background: "#ffffff",
  borderRadius: AUTO_PROVISION_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const autoProvisionToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: AUTO_PROVISION_TABLE_CARD_RADIUS,
  borderTopRightRadius: AUTO_PROVISION_TABLE_CARD_RADIUS,
};

const autoProvisionPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: AUTO_PROVISION_TABLE_CARD_RADIUS,
  borderBottomRightRadius: AUTO_PROVISION_TABLE_CARD_RADIUS,
  flexWrap: "wrap",
  gap: 8,
};

const autoProvisionSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const autoProvisionCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const autoProvisionPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const autoProvisionFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const AutoProvisionBreadcrumb = ({ section, current }) => (
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
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({ message }) => (
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
      }}
    >
      {message}
    </div>
  </div>
);

const getAutoProvisionRowBg = (idx, isSelected) => {
  if (isSelected) return "#e0f2fe";
  return idx % 2 === 1 ? "#f8fafc" : "#ffffff";
};

const normalizeRow = (item, index) => {
  const manufacturer =
    item.manufacturer || item.Manufacturer || item.vendor || item.Vendor || "";
  const model = item.model || item.Model || "";
  const manufacturerModel =
    item.manufacturer_model ||
    item.manufacturerModel ||
    item["Manufacturer / Model"] ||
    [manufacturer, model].filter(Boolean).join(" / ") ||
    "";

  return {
    id:
      item.id ??
      item.mac_address ??
      item.macAddress ??
      item.mac ??
      item.MAC ??
      index,
    macAddress:
      item.mac_address ||
      item.macAddress ||
      item.mac ||
      item.MAC ||
      item["MAC Address"] ||
      "",
    extension:
      item.extension != null
        ? String(item.extension)
        : item.Extension != null
          ? String(item.Extension)
          : item.ext != null
            ? String(item.ext)
            : "",
    manufacturerModel,
    ip:
      item.ip ||
      item.IP ||
      item.ip_address ||
      item.ipAddress ||
      item["IP"] ||
      "",
  };
};

const AutoProvision = () => {
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
            : "Failed to load auto provision devices.",
        );
        setRows([]);
        setSelected([]);
        return;
      }
      const list = extractAutoProvisionList(res);
      setRows(list.map((item, index) => normalizeRow(item, index)));
      setSelected([]);
    } catch (err) {
      showAlert(
        "error",
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load auto provision devices.",
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

  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.macAddress, r.extension, r.manufacturerModel, r.ip].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : rows;

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
  }, [filteredRows.length]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

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

  return (
    <div
      style={{
        ...autoProvisionPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={autoProvisionPageInnerStyle}>
        {error.text && (
          <Alert
            severity={
              error.type === "error"
                ? "error"
                : error.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setError({ type: "", text: "" })}
            sx={autoProvisionFixedAlertSx}
          >
            {error.text}
          </Alert>
        )}

        <AutoProvisionBreadcrumb
          section={AUTO_PROVISION_BREADCRUMB_SECTION}
          current={AUTO_PROVISION_TITLE}
        />

        <div style={autoProvisionCardStyle}>
          <div
            style={{
              ...autoProvisionToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={autoProvisionSelectedBadgeStyle}>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f8fafc",
                  border: `1px solid ${searchFocused ? "#3E5475" : "#d1d5db"}`,
                  borderRadius: 10,
                  padding: "5px 10px",
                  boxShadow: searchFocused
                    ? "0 0 0 2px rgba(62, 84, 117, 0.15)"
                    : "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? "#3E5475" : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={AUTO_PROVISION_SEARCH_PLACEHOLDER}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11,
                      color: C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>

              <Btn
                onClick={loadRows}
                disabled={loading.fetch}
                variant="cancel"
                style={autoProvisionCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState message={AUTO_PROVISION_EMPTY_MESSAGE} />
            ) : searchQuery && filteredRows.length === 0 ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={autoProvisionTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.macAddress}
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.extension}
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.manufacturerModel}
                    </TH>
                    <TH
                      style={{
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {AUTO_PROVISION_COLUMNS.ip}
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = getAutoProvisionRowBg(idx, isSelected);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const cellStyle = {
                      ...autoProvisionTdStyle,
                      background: rowBg,
                      ...lastRowCellStyle,
                    };
                    const lastCellStyle = {
                      ...cellStyle,
                      borderRight: "none",
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...cellStyle,
                            borderLeft: "none",
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={autoProvisionTableCheckboxSx}
                          />
                        </td>
                        <td style={cellStyle}>{row.macAddress || "—"}</td>
                        <td style={cellStyle}>{row.extension || "—"}</td>
                        <td style={cellStyle}>
                          {row.manufacturerModel || "—"}
                        </td>
                        <td style={lastCellStyle}>{row.ip || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={autoProvisionPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.fetch || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span style={autoProvisionPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoProvision;
