import { CircularProgress } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { C } from "../../theme/pbxTokens";
import { Btn } from "./Button";

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

const getExtensionTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getExtensionRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const extensionNoResultsRowStyle = {
  textAlign: "center",
  padding: "36px 0",
  color: C.mutedText,
  fontSize: 13,
};

const ExtensionEditIcon = ({ disabled, onClick }) => (
  <EditDocumentIcon
    titleAccess="Edit"
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);

const ExtensionDeleteIcon = ({ disabled, onClick }) => (
  <DeleteOutlineOutlinedIcon
    titleAccess="Delete"
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#dc2626",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);

const extensionTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ExtensionTableListLoading = () => (
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

const ExtensionTableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
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
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

export {
  TH,
  tdStyle,
  getExtensionTdStyle,
  getExtensionRowBg,
  extensionNoResultsRowStyle,
  ExtensionEditIcon,
  ExtensionDeleteIcon,
  extensionTableCheckboxSx,
  ExtensionTableListLoading,
  ExtensionTableListEmptyState,
};
