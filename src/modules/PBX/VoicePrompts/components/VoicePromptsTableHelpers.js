export const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatDateTime = (value) => {
  if (!value) return "--";
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return "--";
  return dt.toLocaleString();
};

export const toolIconBtnSx = {
  width: 24,
  height: 24,
  border: "1px solid #c2c8d0",
  borderRadius: 4,
  backgroundColor: "#f5f7fa",
  p: 0,
  "&:hover": { backgroundColor: "#e8edf3" },
};
