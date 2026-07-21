import {
  OPERATIONS_LOG_COLUMNS,
  OPERATIONS_LOG_FILTER_ALL,
} from "../../../../constants/OperationsLogConstants";

const COLUMN_KEYS = OPERATIONS_LOG_COLUMNS.map((col) => col.key);

function isActiveFilter(value) {
  return value && value !== OPERATIONS_LOG_FILTER_ALL;
}

export function mapOperationLogRow(apiRow) {
  return {
    id: apiRow.id,
    createdAt: apiRow.createdAt ?? "",
    username: apiRow.username ?? "",
    ip: apiRow.ip ?? "",
    module: apiRow.module ?? "",
    operation: apiRow.operation ?? "",
    status: apiRow.status ?? "",
    detail: apiRow.detail ?? "",
    userId: apiRow.userId ?? null,
  };
}

export function buildOperationLogRequest(appliedFilters, page, limit) {
  const body = {};
  if (page != null) body.page = page;
  if (limit != null) body.limit = limit;
  if (isActiveFilter(appliedFilters.module)) body.module = appliedFilters.module;
  if (isActiveFilter(appliedFilters.operation)) {
    body.operation = appliedFilters.operation;
  }
  if (isActiveFilter(appliedFilters.username)) {
    body.username = appliedFilters.username;
  }
  if (isActiveFilter(appliedFilters.status)) body.status = appliedFilters.status;
  if (appliedFilters.ip?.trim()) body.ip = appliedFilters.ip.trim();
  if (appliedFilters.startDate) body.startDate = appliedFilters.startDate;
  if (appliedFilters.endDate) body.endDate = appliedFilters.endDate;
  return body;
}

export function buildFilterSelectOptions(items = []) {
  return [
    { value: OPERATIONS_LOG_FILTER_ALL, label: "All" },
    ...items.map((item) => ({ value: item, label: item })),
  ];
}

export function hasOperationsLogActiveFilters(filters) {
  return (
    isActiveFilter(filters.module) ||
    isActiveFilter(filters.operation) ||
    isActiveFilter(filters.username) ||
    isActiveFilter(filters.status) ||
    Boolean(filters.ip?.trim()) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate)
  );
}

export function triggerOperationLogXlsxDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getOperationsLogCellValue(row, key) {
  if (!row || !COLUMN_KEYS.includes(key)) return "";
  if (key === "createdAt") {
    const raw = row.createdAt;
    if (!raw) return "";
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleString();
  }
  return String(row[key] ?? "");
}
