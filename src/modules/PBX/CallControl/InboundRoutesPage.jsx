import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createInboundRoute,
  deleteInboundRoute,
  listInboundRoutes,
  listIvrDestinations,
  listSipRegistrations,
  updateInboundRoute,
} from "../../../api/apiService";
import { INBOUND_ROUTE_FIELD_TOOLTIPS } from "../../../constants/InboundRouteConstants";
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

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[28px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";
const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  accent: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
  danger: `${BTN_BASE} bg-[#dc2626] text-white border-[0.5px] border-[#dc2626] hover:bg-[#b91c1c]`,
  outline: BTN_OUTLINE,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  style,
  type,
  title,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex items-center justify-center p-[48px]">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
    <div
      className="text-[13px] font-semibold text-[var(--text-label)]"
      style={{ marginBottom: showButton && onAddNew ? 16 : 0 }}
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

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

const PBX_MODAL_SECTION_BG = "var(--bg-main)";
const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

const INBOUND_ROUTE_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatInboundTooltipTitle = (text) => {
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

const InboundFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = INBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatInboundTooltipTitle(tooltip)}
      {...INBOUND_ROUTE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const PbxModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const heading = (
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
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey ? INBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      {tooltip ? (
        <Tooltip
          title={formatInboundTooltipTitle(tooltip)}
          {...INBOUND_ROUTE_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const inboundRouteDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-primary)",
  textAlign: "center",
  marginBottom: 8,
};

const inboundRouteDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "var(--bg-main)",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const INBOUND_ROUTE_DUAL_LIST_BTN =
  "box-border m-0 block h-[36px] w-full cursor-pointer border border-[#6b7280] bg-[#d9dde3] p-0 text-center text-[14px] leading-none text-[#111827] hover:bg-[#c5cbd3]";

const InboundRouteDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`${INBOUND_ROUTE_DUAL_LIST_BTN} ${reorder ? "font-normal" : "font-semibold"}`}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
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
    backgroundColor: "var(--bg-surface)",
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
  backgroundColor: "var(--bg-surface)",
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
    backgroundColor: "var(--bg-surface)",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "var(--bg-surface)",
  },
};

const inboundRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const DIALOG_TITLE =
  "!m-0 !box-border !flex-[0_0_auto] bg-[#1e2d42] !text-[#ffffff] ![font-family:Roboto,Helvetica,Arial,sans-serif] ![font-size:16px] ![font-weight:600] ![line-height:1.6] ![letter-spacing:0.0075em] !text-center ![padding:16px_24px] ![border-top-left-radius:8px] ![border-top-right-radius:8px]";

const inboundRouteModalActionsCls =
  "!flex !justify-center !gap-[16px] ![padding:16px_24px] bg-[var(--bg-main)] border-t border-[var(--border-strong)] rounded-b-[8px]";

const INBOUND_ROUTE_MENU_ITEM_SX = { fontSize: 13 };

const INBOUND_ROUTE_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const INBOUND_ROUTE_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const INBOUND_ROUTE_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const INBOUND_ROUTE_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const INBOUND_ROUTE_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const INBOUND_ROUTE_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const INBOUND_ROUTE_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const INBOUND_ROUTE_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const InboundRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  className = "",
}) => (
  <div className={`${INBOUND_ROUTE_PAGINATION} ${className}`.trim()}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span className={INBOUND_ROUTE_PAGE_BADGE}>
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

const FieldRow = ({
  label,
  tooltipKey,
  children,
  wide = false,
  labelWidth = 130,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
    }}
  >
    {tooltipKey ? (
      <InboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          minWidth: labelWidth,
          width: "auto",
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </InboundFieldLabel>
    ) : (
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
    )}
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

/** Left column — same fill-box size as right; label position unchanged */
const InboundLeftField = ({ children }) => (
  <div style={{ width: INBOUND_MODAL_FIELD_WIDTH, maxWidth: "100%" }}>
    {children}
  </div>
);

const InboundRightRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
    }}
  >
    {tooltipKey ? (
      <InboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: INBOUND_MODAL_LABEL_WIDTH,
          minWidth: INBOUND_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: INBOUND_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </InboundFieldLabel>
    ) : (
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
    )}
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

const SectionCard = ({ title, tooltipKey, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const InboundRoutesPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
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
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    )
      return;
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
    <div
      className={`box-border min-h-[calc(100vh-80px)] bg-[var(--bg-main)] ${isCompact ? "p-[8px]" : "p-[16px]"}`}
    >
      <div className="mx-auto w-full max-w-full">
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

        <div className={INBOUND_ROUTE_CARD}>
          <div
            className={`${INBOUND_ROUTE_TOOLBAR} ${isCompact ? INBOUND_ROUTE_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={INBOUND_ROUTE_TOOLBAR_LEFT}>              {selected.length > 0 && (
                <span className={INBOUND_ROUTE_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={INBOUND_ROUTE_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "var(--text-secondary)" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: "auto",
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
                  ...(isCompact ? { minWidth: 720 } : {}),
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
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
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
                            e.currentTarget.style.background = "var(--row-alt)";
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
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
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
            <InboundRoutePagination
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
        PaperProps={{ sx: inboundRouteModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle className={DIALOG_TITLE}>
          {editId != null ? "Edit Inbound Route" : "Add Inbound Route"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "var(--row-alt)",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
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
                <FieldRow label="Name *" tooltipKey="name">
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
                <FieldRow label="DID Pattern" tooltipKey="did_pattern">
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
                <FieldRow
                  label="Caller ID Pattern"
                  tooltipKey="caller_id_pattern"
                >
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
                <FieldRow
                  label="Distinctive RingTone"
                  tooltipKey="distinctive_ringtone"
                >
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
                <FieldRow label="Enable T.38" tooltipKey="enable_t38">
                  <InboundLeftField>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enableT38}
                        onChange={(e) => setEnableT38(e.target.value)}
                        sx={modalSelectSx}
                      >
                        {T38_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
                <FieldRow label="Destination *" tooltipKey="destination">
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
                          <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InboundLeftField>
                </FieldRow>
              </div>

              <div style={inboundRightColStyle}>
                <InboundRightRow label="Enabled" tooltipKey="enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow label="Priority" tooltipKey="priority">
                  <TextField
                    size="small"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={modalTextFieldFullSx}
                  />
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Mobility Extension"
                  tooltipKey="enable_mobility_extension"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableMobilityExtension}
                      onChange={(e) =>
                        setEnableMobilityExtension(e.target.value)
                      }
                      sx={modalSelectSx}
                    >
                      {MOBILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Send RingTone"
                  tooltipKey="send_ringtone"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={sendRingTone}
                      onChange={(e) => setSendRingTone(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {SEND_RINGTONE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                <InboundRightRow
                  label="Enable Time Condition"
                  tooltipKey="enable_time_condition"
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableTimeCondition}
                      onChange={(e) => setEnableTimeCondition(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {TIME_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </InboundRightRow>

                {destination === "Extension_Range" ? (
                  <InboundRightRow
                    label="Extension Range *"
                    tooltipKey="extension_range"
                  >
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
                  <InboundRightRow
                    label="Destination Value *"
                    tooltipKey="destination_value"
                  >
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
                          <MenuItem value="" disabled sx={INBOUND_ROUTE_MENU_ITEM_SX}>
                            No options available
                          </MenuItem>
                        ) : (
                          destinationChoices.map((opt) => (
                            <MenuItem
                              key={opt.id}
                              value={opt.id}
                              sx={INBOUND_ROUTE_MENU_ITEM_SX}
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

            <SectionCard title="Member Trunks *" tooltipKey="member_trunks">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={inboundRouteDualListLabelStyle}>Available</div>
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
                    style={inboundRouteDualListSelectStyle}
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
                  <InboundRouteDualListBtn onClick={addSelectedTrunks}>
                    &gt;
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn onClick={addAllTrunks}>
                    &gt;&gt;
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn onClick={removeSelectedTrunks}>
                    &lt;
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn onClick={removeAllTrunks}>
                    &lt;&lt;
                  </InboundRouteDualListBtn>
                </div>
                <div>
                  <div style={inboundRouteDualListLabelStyle}>Selected</div>
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
                    style={inboundRouteDualListSelectStyle}
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
                  <InboundRouteDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveTrunkToBottom}
                  >
                    vv
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn reorder title="Move up" onClick={moveTrunkUp}>
                    ^
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveTrunkDown}
                  >
                    v
                  </InboundRouteDualListBtn>
                  <InboundRouteDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveTrunkToTop}
                  >
                    ^^
                  </InboundRouteDualListBtn>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions className={inboundRouteModalActionsCls}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="dialogPrimary"
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="dialogCancel"
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InboundRoutesPage;
