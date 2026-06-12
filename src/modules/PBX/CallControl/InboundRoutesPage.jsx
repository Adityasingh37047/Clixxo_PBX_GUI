import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  createInboundRoute,
  deleteInboundRoute,
  listInboundRoutes,
  listIvrDestinations,
  listSipRegistrations,
  updateInboundRoute,
} from "../../../api/apiService";
const ENABLE_OPTIONS = ["Yes", "No"];
const T38_OPTIONS = ["Yes", "No"];
const TIME_CONDITION_OPTIONS = ["Yes", "No"];
const MOBILITY_OPTIONS = ["Yes", "No"];
const SEND_RINGTONE_OPTIONS = ["Remote", "Local"];

const DESTINATION_OPTIONS = [
  "Call Queue",
  "CallBacks",
  "Conference Rooms",
  "DISA",
  "Extensions",
  "Fax To Mail",
  "IVR Menus",
  "Ring Groups",
  "Trunks",
  "Outbound",
  "Voicemails",
  "Extension_Range",
  "Other",
];

const DEST_TYPE_TO_UI = {
  extensions: "Extensions",
  voicemail: "Voicemails",
  fax_to_email: "Fax To Mail",
  ring_group: "Ring Groups",
  conference: "Conference Rooms",
  ivr_menu: "IVR Menus",
  extension_range: "Extension_Range",
  other: "Other",
  call_queue: "Call Queue",
  callbacks: "CallBacks",
  disa: "DISA",
  trunk: "Trunks",
  outbound_route: "Outbound",
};

const UI_TO_DEST_TYPE = {
  Extensions: "extensions",
  Voicemails: "voicemail",
  "Fax To Mail": "fax_to_email",
  "Ring Groups": "ring_group",
  "Conference Rooms": "conference",
  "IVR Menus": "ivr_menu",
  Extension_Range: "extension_range",
  Other: "other",
  "Call Queue": "call_queue",
  CallBacks: "callbacks",
  DISA: "disa",
  Trunks: "trunk",
  Outbound: "outbound_route",
};

const OTHER_DESTINATION_OPTIONS = ["Hangup", "Hold Music"];
const DESTINATION_NEEDS_EXTENSION = new Set([
  "Extensions",
  "Fax To Mail",
  "Voicemails",
]);
const DESTINATION_NEEDS_TARGET = new Set([
  "Extensions",
  "Fax To Mail",
  "Voicemails",
  "Conference Rooms",
  "Ring Groups",
  "IVR Menus",
  "Call Queue",
  "CallBacks",
  "DISA",
  "Trunks",
  "Outbound",
  "Other",
]);

/** Dial / route number for a ring group (matches RingGroup.jsx: rg_number). */
const getRingGroupDialNumber = (item) => {
  if (!item || typeof item !== "object") return "";
  const n =
    item.rg_number ??
    item.ring_group_no ??
    item.group_no ??
    item.group ??
    item.page_number;
  if (n !== undefined && n !== null && String(n).trim() !== "")
    return String(n).trim();
  return "";
};

/** If dest_value was saved as DB id, map to rg_number for display and API. */
const resolveRingGroupDestValue = (rawDestValue, ringGroupRows) => {
  if (rawDestValue == null || rawDestValue === "") return "";
  const s = String(rawDestValue).trim();
  if (!Array.isArray(ringGroupRows) || ringGroupRows.length === 0) return s;
  if (ringGroupRows.some((g) => getRingGroupDialNumber(g) === s)) return s;
  const byId = ringGroupRows.find((g) => String(g?.id) === s);
  if (byId) {
    const num = getRingGroupDialNumber(byId);
    return num || s;
  }
  return s;
};

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};
const CARD_RADIUS = 20;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type,
  hoverBehavior = "background",
}) => {
  const variants = {
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
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
  };

  const s = variants[variant] || variants.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
      case "accent":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "cancel":
        return "#b6c2d3";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = extraStyle?.background || s.background;

  return (
    <button
      type={type}
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
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "0.82";
          } else {
            e.currentTarget.style.background = hoverBg;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "1";
          } else {
            e.currentTarget.style.background = baseBg;
          }
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
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};
const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// ── Local page UI (inlined from pbxSharedUi) ──
const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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
      ...style,
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

const TableListEmptyState = ({
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
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PBX_LIST_TRUNCATE_THRESHOLD = 10;
const PBX_LIST_DISPLAY_LIMIT = 6;

const formatPbxItemListDisplay = (
  items,
  {
    threshold = PBX_LIST_TRUNCATE_THRESHOLD,
    limit = PBX_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const PBX_MODAL_SECTION_BG = "#f8fafc";
const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

const PbxModalSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: PBX_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PBX_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const pbxDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pbxDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const PbxDualListBtn = ({ onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={pbxDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldFullSx = {
  ...muiTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const trunkModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const trunkModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const INBOUND_MODAL_LABEL_WIDTH = 185;
const INBOUND_MODAL_FIELD_WIDTH = 210;
const INBOUND_RIGHT_LABEL_PADDING_LEFT = 28;

const FieldRow = ({ label, children, wide = false, labelWidth = 130 }) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        minWidth: labelWidth,
        width: "auto",
        flexShrink: 0,
        paddingTop: wide ? 4 : 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

/** Left column — same fill-box size as right; label position unchanged */
const InboundLeftField = ({ children }) => (
  <div style={{ width: INBOUND_MODAL_FIELD_WIDTH, maxWidth: "100%" }}>
    {children}
  </div>
);

const InboundRightRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        width: INBOUND_MODAL_LABEL_WIDTH,
        minWidth: INBOUND_MODAL_LABEL_WIDTH,
        flexShrink: 0,
        paddingLeft: INBOUND_RIGHT_LABEL_PADDING_LEFT,
        boxSizing: "border-box",
      }}
    >
      {label}
    </label>
    <div style={{ width: INBOUND_MODAL_FIELD_WIDTH, flexShrink: 0 }}>
      {children}
    </div>
  </div>
);

const inboundRightColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const InboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    trunks: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [didPattern, setDidPattern] = useState("");
  const [callerIdPattern, setCallerIdPattern] = useState("");
  const [distinctiveRingTone, setDistinctiveRingTone] = useState("");
  const [enableT38, setEnableT38] = useState("No");
  const [enableTimeCondition, setEnableTimeCondition] = useState("No");
  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState("Yes");
  const [priority, setPriority] = useState("102");
  const [enableMobilityExtension, setEnableMobilityExtension] = useState("No");
  const [sendRingTone, setSendRingTone] = useState("Remote");
  const [destinationTarget, setDestinationTarget] = useState("");
  const [extensionRange, setExtensionRange] = useState("");

  const [destinations, setDestinations] = useState({});
  const hasLoadedDestinationDataRef = useRef(false);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(rows.length / itemsPerPage)),
      ),
    );
  }, [rows]);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const toUiYesNo = (value, defaultValue = "No") => {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "yes") return "Yes";
      if (normalized === "no") return "No";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return defaultValue;
  };

  const toApiYesNo = (value, defaultValue = "no") => {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "yes") return "yes";
    if (normalized === "no") return "no";
    return defaultValue;
  };

  const mapDestTypeToUi = (destType) =>
    DEST_TYPE_TO_UI[String(destType || "").toLowerCase()] || "";
  const mapUiToDestType = (uiDest) => UI_TO_DEST_TYPE[uiDest] || "call_queue";

  /** Ring-group list API uses `rg_number` (same as Ring Group page); do not use DB id as dial target. */
  const getRingGroupDialNumber = (g) => {
    if (!g || typeof g !== "object") return "";
    const n =
      g.rg_number ?? g.ring_group_no ?? g.group_no ?? g.group ?? g.page_number;
    if (n != null && String(n).trim() !== "") return String(n).trim();
    return "";
  };

  /** If dest_value was saved as ring-group row id, map it to the real group number (e.g. 6200). */
  const resolveRingGroupDestValue = (storedValue, ringGroupsList) => {
    if (storedValue == null || storedValue === "") return "";
    const s = String(storedValue).trim();
    if (!Array.isArray(ringGroupsList) || ringGroupsList.length === 0) return s;

    if (ringGroupsList.some((g) => getRingGroupDialNumber(g) === s)) return s;

    const byId = ringGroupsList.find((g) => String(g?.id) === s);
    if (byId) {
      const dial = getRingGroupDialNumber(byId);
      return dial || s;
    }
    return s;
  };

  const mapRouteFromApi = (item, ringGroupsList = []) => {
    const uiDestination = mapDestTypeToUi(item?.dest_type);
    const rawDestValue =
      item?.dest_value != null ? String(item.dest_value) : "";
    const destinationTargetRaw =
      uiDestination === "Extension_Range"
        ? ""
        : uiDestination === "Ring Groups"
          ? resolveRingGroupDestValue(rawDestValue, ringGroupsList)
          : rawDestValue;
    return {
      id: item?.id,
      name: String(item?.name || ""),
      didPattern: String(item?.did_pattern || ""),
      callerIdPattern: String(item?.callerid_pattern || ""),
      distinctiveRingTone: String(item?.distinctive_ringtone || ""),
      enableT38: toUiYesNo(item?.enable_t38, "No"),
      enableTimeCondition: toUiYesNo(item?.enable_time_condition, "No"),
      destination: uiDestination,
      destinationTarget: destinationTargetRaw,
      extensionRange: uiDestination === "Extension_Range" ? rawDestValue : "",
      memberTrunks: Array.isArray(item?.member_trunks)
        ? item.member_trunks.map(String)
        : [],
      enabled: toUiYesNo(item?.enabled, "Yes"),
      priority: String(item?.priority ?? "100"),
      enableMobilityExtension: toUiYesNo(item?.enable_mobility_ext, "No"),
      sendRingTone: String(item?.send_ringtone || "Remote"),
    };
  };

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const fetchInboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listInboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load inbound routes.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : res?.message
          ? [res.message]
          : [];
      setRows(list.map((row) => mapRouteFromApi(row, [])));
    } catch (err) {
      showAlert(err?.message || "Failed to load inbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchInboundRoutes();
  }, []);

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => {
          const id = t?.trunkId || t?.trunk_id || t?.id || t;
          const name = t?.name || t?.trunk_name || "";
          const host = t?.host || t?.sip_server || "";
          let label = "";
          if (name && host) label = `${name}@${host}`;
          else if (name) label = name;
          else if (host) label = host;
          else label = String(id || "");
          return { id: String(id), label: label || String(id || "") };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load trunks.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const loadDestinationData = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message && typeof res.message === "object") {
        setDestinations(res.message);
      }
      hasLoadedDestinationDataRef.current = true;
    } catch {
      setDestinations({});
    }
  };

  const DEST_UI_TO_API_KEY = {
    Extensions: "Extensions",
    Voicemails: "Voicemails",
    "Fax To Mail": "FaxToMail",
    "Ring Groups": "RingGroups",
    "Conference Rooms": "ConferenceRooms",
    "IVR Menus": "IVR",
    "Call Queue": "CallQueue",
    CallBacks: "Callbacks",
    DISA: "DISA",
    Trunks: "Trunks",
    Outbound: "Outbound",
    Other: "Other",
  };

  const getDestinationChoices = () => {
    const apiKey = DEST_UI_TO_API_KEY[destination];
    if (!apiKey) return [];
    const list = Array.isArray(destinations[apiKey])
      ? destinations[apiKey]
      : [];
    return list.map((opt) => ({
      id: String(opt.value),
      label: String(opt.label),
    }));
  };

  const destinationChoices = getDestinationChoices();
  const needsDestinationTarget = DESTINATION_NEEDS_TARGET.has(destination);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDidPattern("");
    setCallerIdPattern("");
    setDistinctiveRingTone("");
    setEnableT38("No");
    setEnableTimeCondition("No");
    setDestination("");
    setEnabled("Yes");
    setPriority("102");
    setEnableMobilityExtension("No");
    setSendRingTone("Remote");
    setDestinationTarget("");
    setExtensionRange("");
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDidPattern(row.didPattern || "");
    setCallerIdPattern(row.callerIdPattern || "");
    setDistinctiveRingTone(row.distinctiveRingTone || "");
    setEnableT38(row.enableT38 || "No");
    setEnableTimeCondition(row.enableTimeCondition || "No");
    setDestination(row.destination || "Call Queue");
    setEnabled(row.enabled || "Yes");
    setPriority(row.priority || "102");
    setEnableMobilityExtension(row.enableMobilityExtension || "No");
    setSendRingTone(row.sendRingTone || "Remote");
    setDestinationTarget(row.destinationTarget || "");
    setExtensionRange(row.extensionRange || "");
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((t) => {
      map.set(t.id, t.label);
    });
    return map;
  }, [availableTrunks]);

  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const availableList = useMemo(
    () => availableTrunks.filter((t) => !selectedTrunks.includes(t.id)),
    [availableTrunks, selectedTrunks],
  );

  const addSelectedTrunks = () => {
    if (availableSelected.length === 0) return;
    setSelectedTrunks((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAllTrunks = () => {
    setSelectedTrunks(availableTrunks.map((t) => t.id));
    setAvailableSelected([]);
  };

  const removeSelectedTrunks = () => {
    if (chosenSelected.length === 0) return;
    setSelectedTrunks((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };

  const removeAllTrunks = () => {
    setSelectedTrunks([]);
    setChosenSelected([]);
  };

  const moveTrunkToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveTrunkUp = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        )
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveTrunkDown = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        )
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveTrunkToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  // Page-level checkbox helpers
  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;
  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteInboundRoute(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more routes.");
      } else {
        showMessage("success", "Inbound route(s) deleted successfully.");
      }
      await fetchInboundRoutes();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete route(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert("Name is required.");
      return;
    }
    if (!destination) {
      showAlert("Destination is required.");
      return;
    }
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 9999
    ) {
      showAlert("Priority must be a number between 1 and 9999.");
      return;
    }
    if (destination === "Extension_Range") {
      if (!extensionRange.trim()) {
        showAlert("Extension range is required (example: 100-136).");
        return;
      }
      const rangePattern = /^\d+\s*-\s*\d+$/;
      if (!rangePattern.test(extensionRange.trim())) {
        showAlert("Invalid extension range format. Use format like 100-136.");
        return;
      }
    } else if (destinationChoices.length > 0 && !destinationTarget) {
      showAlert("Please select a destination target.");
      return;
    }

    const payload = {
      id: editId ?? Date.now(),
      name: trimmedName,
      didPattern,
      callerIdPattern,
      distinctiveRingTone,
      enableT38,
      enableTimeCondition,
      destination,
      destinationTarget:
        destination === "Extension_Range" ? "" : destinationTarget,
      extensionRange:
        destination === "Extension_Range" ? extensionRange.trim() : "",
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    };

    const destType = mapUiToDestType(destination);
    const destValue =
      destination === "Extension_Range"
        ? extensionRange.trim()
        : destinationTarget;

    const apiPayload = {
      name: payload.name,
      did_pattern: payload.didPattern || "",
      callerid_pattern: payload.callerIdPattern || "",
      distinctive_ringtone: payload.distinctiveRingTone || "",
      enable_t38: toApiYesNo(payload.enableT38, "no"),
      enable_time_condition: toApiYesNo(payload.enableTimeCondition, "no"),
      dest_type: destType,
      dest_value: destValue || "",
      member_trunks: Array.isArray(payload.memberTrunks)
        ? payload.memberTrunks
        : [],
      enabled: toApiYesNo(payload.enabled, "yes"),
      priority: parsedPriority,
      enable_mobility_ext: toApiYesNo(payload.enableMobilityExtension, "no"),
      send_ringtone: payload.sendRingTone || "Remote",
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateInboundRoute(editId, apiPayload)
          : await createInboundRoute(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save inbound route.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Inbound route updated successfully."
          : "Inbound route created successfully.",
      );
      await fetchInboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save inbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
        {/* Alert */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <PbxBreadcrumb section="Call Control" current="Inbound Routes" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No inbound routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
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
                        disabled={loading.delete}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      DID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Caller ID Pattern
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH
                      style={{
                        textAlign: "left",
                        paddingLeft: 16,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Member Trunks
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = isSelected
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const destinationStr =
                      row.destination === "Extension_Range"
                        ? `${row.destination}: ${row.extensionRange || ""}`
                        : row.destinationTarget
                          ? `${row.destination}: ${row.destinationTarget}`
                          : row.destination;
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            width: 36,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.didPattern || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callerIdPattern || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {destinationStr || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              background:
                                row.enabled === "Yes" ? "#dcfce7" : "#f1f5f9",
                              color:
                                row.enabled === "Yes" ? "#15803d" : "#475569",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.memberTrunks?.length > 0 ? (
                            <span
                              title={
                                row.memberTrunks.length >
                                PBX_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberTrunks
                                      .map(getTrunkLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatPbxItemListDisplay(row.memberTrunks, {
                                mapItem: getTrunkLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={{
                                cursor: loading.delete
                                  ? "not-allowed"
                                  : "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: loading.delete ? 0.4 : 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!loading.delete)
                                  e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                if (!loading.delete)
                                  e.currentTarget.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: trunkModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={trunkModalTitleStyle}>
          {editId != null ? "Edit Inbound Route" : "Add Inbound Route"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 28px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <FieldRow label="Name *">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={modalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="DID Pattern">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={didPattern}
                      onChange={(e) => setDidPattern(e.target.value)}
                      sx={modalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Caller ID Pattern">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={callerIdPattern}
                      onChange={(e) => setCallerIdPattern(e.target.value)}
                      sx={modalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Distinctive RingTone">
                  <InboundLeftField>
                    <TextField
                      size="small"
                      fullWidth
                      value={distinctiveRingTone}
                      onChange={(e) => setDistinctiveRingTone(e.target.value)}
                      sx={modalTextFieldFullSx}
                    />
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Enable T.38">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enableT38}
                        onChange={(e) => setEnableT38(e.target.value)}
                        sx={modalSelectSx}
                      >
                        {T38_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Destination *">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationTarget("");
                          setExtensionRange("");
                        }}
                        displayEmpty
                        sx={modalSelectSx}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {DESTINATION_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
              </div>

              <div style={inboundRightColStyle}>
                <InboundRightRow label="Enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Priority">
                  <TextField
                    size="small"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={modalTextFieldFullSx}
                  />
                </InboundRightRow>

                <InboundRightRow label="Enable Mobility Extension">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableMobilityExtension}
                      onChange={(e) =>
                        setEnableMobilityExtension(e.target.value)
                      }
                      sx={modalSelectSx}
                    >
                      {MOBILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Send RingTone">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={sendRingTone}
                      onChange={(e) => setSendRingTone(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {SEND_RINGTONE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Enable Time Condition">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableTimeCondition}
                      onChange={(e) => setEnableTimeCondition(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {TIME_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                {destination === "Extension_Range" ? (
                  <InboundRightRow label="Extension Range *">
                    <TextField
                      size="small"
                      fullWidth
                      value={extensionRange}
                      onChange={(e) => setExtensionRange(e.target.value)}
                      placeholder="100-136"
                      sx={modalTextFieldFullSx}
                    />
                  </InboundRightRow>
                ) : needsDestinationTarget ? (
                  <InboundRightRow label="Destination Value *">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destinationTarget}
                        onChange={(e) => setDestinationTarget(e.target.value)}
                        displayEmpty
                        sx={modalSelectSx}
                      >
                        <MenuItem
                          value=""
                          disabled={destinationChoices.length === 0}
                        >
                          <em>Select</em>
                        </MenuItem>
                        {destinationChoices.length === 0 ? (
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            No options available
                          </MenuItem>
                        ) : (
                          destinationChoices.map((opt) => (
                            <MenuItem
                              key={opt.id}
                              value={opt.id}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </InboundRightRow>
                ) : null}
              </div>
            </div>

            <SectionCard title="Member Trunks *">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={pbxDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
                  >
                    {loading.trunks ? (
                      <option>Loading trunks...</option>
                    ) : availableList.length === 0 ? (
                      <option disabled>No trunks</option>
                    ) : (
                      availableList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn onClick={addSelectedTrunks}>
                    &gt;
                  </PbxDualListBtn>
                  <PbxDualListBtn onClick={addAllTrunks}>
                    &gt;&gt;
                  </PbxDualListBtn>
                  <PbxDualListBtn onClick={removeSelectedTrunks}>
                    &lt;
                  </PbxDualListBtn>
                  <PbxDualListBtn onClick={removeAllTrunks}>
                    &lt;&lt;
                  </PbxDualListBtn>
                </div>
                <div>
                  <div style={pbxDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
                  >
                    {selectedTrunks.length === 0 ? (
                      <option disabled>No selected trunks</option>
                    ) : (
                      selectedTrunks.map((id) => (
                        <option key={id} value={id}>
                          {getTrunkLabel(id)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveTrunkToBottom}
                  >
                    vv
                  </PbxDualListBtn>
                  <PbxDualListBtn reorder title="Move up" onClick={moveTrunkUp}>
                    ^
                  </PbxDualListBtn>
                  <PbxDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveTrunkDown}
                  >
                    v
                  </PbxDualListBtn>
                  <PbxDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveTrunkToTop}
                  >
                    ^^
                  </PbxDualListBtn>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InboundRoutesPage;
