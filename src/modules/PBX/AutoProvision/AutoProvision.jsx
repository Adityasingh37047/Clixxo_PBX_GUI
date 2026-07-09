import React, { useState, useEffect, useRef } from "react";
import { listAutoProvision } from "../../../api/apiService";
import {
  Alert,

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
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as AutoProvisionBreadcrumb,
  ExtensionTableListLoading as AutoProvisionTableListLoading,
  ExtensionTableListEmptyState as AutoProvisionTableListEmptyState,
  extensionFixedAlertSx as autoProvisionFixedAlertSx,
  extensionPageWrapStyle as autoProvisionPageWrapStyle,
  extensionPageInnerStyle as autoProvisionPageInnerStyle,
  extensionCardStyle as autoProvisionCardStyle,
  extensionToolbarStyle as autoProvisionToolbarStyle,
  extensionSelectedBadgeStyle as autoProvisionSelectedBadgeStyle,
  extensionCancelBtnStyle as autoProvisionCancelBtnStyle,
} from "../../../components/common";

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





const AUTO_PROVISION_TABLE_CARD_RADIUS = 10;

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

const autoProvisionPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

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
              <AutoProvisionTableListLoading />
            ) : rows.length === 0 ? (
              <AutoProvisionTableListEmptyState message={AUTO_PROVISION_EMPTY_MESSAGE} />
            ) : searchQuery && filteredRows.length === 0 ? (
              <AutoProvisionTableListEmptyState
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
                      ...tdStyle,
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
