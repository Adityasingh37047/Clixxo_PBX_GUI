import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createRingGroup,
  deleteRingGroup,
  fetchSipAccounts,
  listConferences,
  listIvrs,
  listRingBackOptions,
  listRingGroups,
  updateRingGroup,
} from "../../../api/apiService";
import {
  RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  RING_GROUP_ENABLE_OPTIONS,
  RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS,
  RING_GROUP_FIELD_TOOLTIPS,
  RING_GROUP_ITEMS_PER_PAGE,
  RING_GROUP_RING_BACK_MENU_PROPS,
  RING_GROUP_RING_STRATEGY_OPTIONS,
  RING_GROUP_RING_TIMEOUT_OPTIONS,
  RING_GROUP_TIMEOUT_DESTINATION_OPTIONS,
  RING_GROUP_TITLE,
} from "../../../constants/RingGroupConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as RingGroupBreadcrumb,
  ExtensionTableListLoading as RingGroupTableListLoading,
  ExtensionTableListEmptyState as RingGroupTableListEmptyState,
  extensionTableCheckboxSx as ringGroupTableCheckboxSx,
  extensionFixedAlertSx as ringGroupFixedAlertSx,
  extensionPageWrapStyle as ringGroupPageWrapStyle,
  extensionPageInnerStyle as ringGroupPageInnerStyle,
  extensionCardStyle as ringGroupCardStyle,
  extensionToolbarStyle as ringGroupToolbarStyle,
  extensionSelectedBadgeStyle as ringGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as ringGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as ringGroupPrimaryBtnStyle,
  ExtensionCodecDualList as RingGroupCodecDualList,
} from "../../../components/common";

const RING_GROUP_COMPACT_MQ = "(max-width: 768px)";

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
  placeholderText: "#94a3b8",
};

// ── Local page UI ──


const RING_GROUP_TABLE_CARD_RADIUS = 4;

const ringGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: RING_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: RING_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ringGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const ringGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleRingGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const ringGroupOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const ringGroupModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...ringGroupOutlinedInputRootSx,
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

const ringGroupModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...ringGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const ringGroupModalPaperSx = {
  width: 880,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const ringGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const ringGroupModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
  marginTop: 24,
};

const ringGroupModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
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
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ringGroupModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const RING_GROUP_TOOLTIP_PROPS = {
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

const formatRingGroupTooltipTitle = (text) => {
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

const RING_GROUP_MODAL_LABEL_WIDTH = 150;
const RING_GROUP_MODAL_SECTION_BG = "#f8fafc";
const RING_GROUP_MODAL_SECTION_HEADING_COLOR = "#30415A";

const RingGroupFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = RING_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
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
      title={formatRingGroupTooltipTitle(tooltip)}
      {...RING_GROUP_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const RingGroupFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = RING_GROUP_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <RingGroupFieldLabel
        tooltipKey={tooltipKey}
        style={{
          width: labelWidth,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? <span style={{ color: C.errorRed }}> *</span> : null}
      </RingGroupFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: labelWidth,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? <span style={{ color: C.errorRed }}> *</span> : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const RingGroupSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: RING_GROUP_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: RING_GROUP_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? RING_GROUP_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      {tooltip ? (
        <Tooltip
          title={formatRingGroupTooltipTitle(tooltip)}
          {...RING_GROUP_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const RingGroup = () => {
  const isCompact = useMediaQuery(RING_GROUP_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    members: false,
    destinations: false,
    list: false,
    ringBackOptions: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedDataRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = RING_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  // Form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [ringGroupNumber, setRingGroupNumber] = useState("");
  const [ringStrategy, setRingStrategy] = useState("simultaneous");
  const [timeoutDestinationType, setTimeoutDestinationType] = useState("");
  const [timeoutDestinationValue, setTimeoutDestinationValue] = useState("");
  const [ringTimeout, setRingTimeout] = useState("30");
  const [enabled, setEnabled] = useState("Yes");
  const [alertInfo, setAlertInfo] = useState("");
  const [ringBack, setRingBack] = useState("us-ring");
  const [ringBackOptions, setRingBackOptions] = useState(
    RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  );
  const [cidNamePrefix, setCidNamePrefix] = useState("");
  const [extensionAnswerConfirm, setExtensionAnswerConfirm] = useState("No");

  // Member Extensions dual-list
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);

  // Destination value data
  const [destinationData, setDestinationData] = useState({
    extensions: [],
    conferenceRooms: [],
    ivrMenus: [],
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const mapApiToRow = (r) => ({
    id: r.id,
    name: r.name || "",
    ringGroupNumber: String(r.rg_number ?? ""),
    ringStrategy: r.ring_strategy || "simultaneous",
    timeoutDestinationType: r.timeout_dest_type || "",
    timeoutDestinationValue: r.timeout_dest_value || "",
    ringTimeout: String(r.ring_timeout ?? "30"),
    enabled: r.enabled ? "Yes" : "No",
    alertInfo: r.alert_info || "",
    ringBack: r.ring_back || "us-ring",
    cidNamePrefix: r.cid_name_prefix || "",
    extensionAnswerConfirm: r.answer_confirm ? "Yes" : "No",
    members: Array.isArray(r.members) ? r.members.map(String) : [],
  });

  const loadRingBackOptionsAPI = async () => {
    setLoading((prev) => ({ ...prev, ringBackOptions: true }));
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) {
        showMessage(
          "error",
          typeof res?.message === "string"
            ? res.message
            : "Failed to load ring back options.",
        );
        setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
        return;
      }
      const msg = res?.message;
      const normalized =
        msg && typeof msg === "object" && !Array.isArray(msg)
          ? msg
          : RING_GROUP_EMPTY_RING_BACK_OPTIONS;
      setRingBackOptions({
        moh_categories: Array.isArray(normalized.moh_categories)
          ? normalized.moh_categories
          : [],
        custom_prompts: Array.isArray(normalized.custom_prompts)
          ? normalized.custom_prompts
          : [],
        country_tones: Array.isArray(normalized.country_tones)
          ? normalized.country_tones
          : [],
      });
    } catch (err) {
      setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
    } finally {
      setLoading((prev) => ({ ...prev, ringBackOptions: false }));
    }
  };

  const refreshRingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listRingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load ring groups.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(mapApiToRow));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load ring groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshRingGroups();
  }, []);

  const loadFormData = async () => {
    setLoading((prev) => ({ ...prev, members: true, destinations: true }));
    try {
      const [sipRes, confRes, ivrRes] = await Promise.all([
        fetchSipAccounts(),
        listConferences(),
        listIvrs(),
      ]);

      const sipList = Array.isArray(sipRes?.message)
        ? sipRes.message
        : Array.isArray(sipRes?.data)
          ? sipRes.data
          : [];
      const extensions = sipList
        .filter((e) => e && e.extension)
        .map((e) => {
          const ext = String(e.extension);
          const display = (e.display_name || e.name || "").trim();
          return {
            value: ext,
            label: display ? `${ext}-${display}` : ext,
          };
        })
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
            return an - bn;
          return a.label.localeCompare(b.label);
        });
      setAvailableExtensions(extensions);

      const confList = Array.isArray(confRes?.message)
        ? confRes.message
        : Array.isArray(confRes?.data)
          ? confRes.data
          : [];
      const conferenceRooms = confList.map((c) => ({
        value: String(c.conf_number ?? c.id ?? ""),
        label: String(c.conf_number ?? c.id ?? ""),
      }));

      const ivrList = Array.isArray(ivrRes?.message)
        ? ivrRes.message
        : Array.isArray(ivrRes?.data)
          ? ivrRes.data
          : [];
      const ivrMenus = ivrList.map((i) => ({
        value: String(i.ivr_number ?? i.id ?? ""),
        label: String(i.ivr_number ?? i.id ?? ""),
      }));

      setDestinationData({ extensions, conferenceRooms, ivrMenus });
      hasLoadedDataRef.current = true;
    } catch (err) {
      showMessage(
        "error",
        err?.message || "Failed to load ring group form data.",
      );
      setAvailableExtensions([]);
      setDestinationData({ extensions: [], conferenceRooms: [], ivrMenus: [] });
    } finally {
      setLoading((prev) => ({ ...prev, members: false, destinations: false }));
    }
  };

  // ── Search & Pagination Logic ──
  const filteredRows = rows;

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

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setRingGroupNumber("");
    setRingStrategy("simultaneous");
    setTimeoutDestinationType("");
    setTimeoutDestinationValue("");
    setRingTimeout("30");
    setEnabled("Yes");
    setAlertInfo("");
    setRingBack("us-ring");
    setCidNamePrefix("");
    setExtensionAnswerConfirm("No");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setRingGroupNumber(row.ringGroupNumber || "");
    setRingStrategy(row.ringStrategy || "simultaneous");
    setTimeoutDestinationType(row.timeoutDestinationType || "");
    setTimeoutDestinationValue(row.timeoutDestinationValue || "");
    setRingTimeout(row.ringTimeout || "30");
    setEnabled(row.enabled || "Yes");
    setAlertInfo(row.alertInfo || "");
    setRingBack(row.ringBack || "us-ring");
    setCidNamePrefix(row.cidNamePrefix || "");
    setExtensionAnswerConfirm(row.extensionAnswerConfirm || "No");
    setMemberExtensions(Array.isArray(row.members) ? row.members : []);
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selected.length)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = filteredRows.filter((_, idx) =>
          selected.includes(idx),
        );
        let deleteFailed = false;
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deleteRingGroup(row.id);
            if (res?.response === false) {
              deleteFailed = true;
              showMessage(
                "error",
                res?.message || "Failed to delete ring group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshRingGroups();
        if (!deleteFailed) {
          showMessage(
            "success",
            toDelete.length === 1
              ? "Ring group deleted successfully."
              : `${toDelete.length} ring groups deleted successfully.`,
          );
        }
      } catch (err) {
        showMessage("error", err?.message || "Failed to delete ring group(s).");
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return showMessage("error", "Name is required.");
    if (!ringGroupNumber.trim())
      return showMessage("error", "Ring Group Number is required.");

    const rgNumber = parseInt(ringGroupNumber, 10);
    if (Number.isNaN(rgNumber))
      return showMessage("error", "Ring Group Number must be numeric.");

    const ringTimeoutInt = parseInt(ringTimeout, 10);
    if (Number.isNaN(ringTimeoutInt))
      return showMessage("error", "Ring Timeout must be numeric.");

    if (timeoutDestinationType && !timeoutDestinationValue)
      return showMessage("error", "Please select Timeout Destination value.");
    if (!memberExtensions.length)
      return showMessage(
        "error",
        "Please select at least one Member Extension.",
      );

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        const apiPayload = {
          name: trimmed,
          rg_number: rgNumber,
          ring_strategy: ringStrategy,
          ring_timeout: ringTimeoutInt,
          members: memberExtensions.map(String),
          enabled: enabled === "Yes",
          alert_info: alertInfo || "",
          ring_back: ringBack,
          cid_name_prefix: cidNamePrefix || "",
          answer_confirm: extensionAnswerConfirm === "Yes",
          timeout_dest_type: timeoutDestinationType || "",
          timeout_dest_value: timeoutDestinationValue || "",
        };

        let res;
        if (editId != null) {
          res = await updateRingGroup(editId, apiPayload);
        } else {
          res = await createRingGroup(apiPayload);
        }

        if (res?.response === false) {
          showMessage("error", res?.message || "Failed to save ring group.");
          return;
        }
        await refreshRingGroups();
        handleCloseModal();
        showMessage("success", "Ring group saved successfully.");
      } catch (err) {
        showMessage("error", err?.message || "Failed to save ring group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const getExtLabel = (ext) => {
    const found = availableExtensions.find((e) => e.value === ext);
    return found?.label || ext;
  };

  const allExtensionOptions = useMemo(
    () =>
      availableExtensions.map(({ value, label }) => ({ value, label })),
    [availableExtensions],
  );

  // ── Destination Options ──
  const getTimeoutValueOptions = () => {
    switch (timeoutDestinationType) {
      case "extensions":
      case "faxtoemail":
      case "voicemail":
        return destinationData.extensions;
      case "conference_rooms":
        return destinationData.conferenceRooms;
      case "ivr_menus":
        return destinationData.ivrMenus;
      case "ring_groups":
        return rows
          .filter((r) => String(r.id) !== String(editId))
          .map((r) => ({
            value: String(r.ringGroupNumber),
            label: `${r.name}-${r.ringGroupNumber}`,
          }));
      case "other":
        return [
          { value: "Hangup", label: "Hangup" },
          { value: "MusicOnHold", label: "MusicOnHold" },
        ];
      default:
        return [];
    }
  };

  const timeoutValueOptions = getTimeoutValueOptions();
  const shouldShowTimeoutValue = Boolean(timeoutDestinationType);

  const ringBackAllValues = useMemo(
    () => [
      ...ringBackOptions.moh_categories,
      ...ringBackOptions.custom_prompts,
      ...ringBackOptions.country_tones,
    ],
    [ringBackOptions],
  );

  const availableMemberEmptyText = loading.members
    ? "Loading..."
    : "No extension";

  return (
    <div
      style={{
        ...ringGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ringGroupPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ringGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <RingGroupBreadcrumb
          section="Call Features"
          current={RING_GROUP_TITLE}
        />

        <div style={ringGroupCardStyle}>
          <div
            style={{
              ...ringGroupToolbarStyle,
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
                <span style={ringGroupSelectedBadgeStyle}>
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
                style={ringGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={ringGroupPrimaryBtnStyle}
              >
                + Add New
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
              <RingGroupTableListLoading />
            ) : rows.length === 0 ? (
              <RingGroupTableListEmptyState
                message="No ring groups found."
                onAddNew={handleOpenAddModal}
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
                        sx={ringGroupTableCheckboxSx}
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
                      Id
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Group Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Ring Strategy
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Members
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
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : tdStyle.borderBottom,
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
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={ringGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.ringGroupNumber}
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
                              color: "#334155",
                              padding: "4px 11px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.ringStrategy}
                          </span>
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
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.members.length}
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
                              style={ringGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handleRingGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleRingGroupEditIconHover(e, false)
                              }
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={ringGroupPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline" 
                  style={{ borderRadius: 4 }}
                >
                  ← Prev
                </Btn>
                <span style={ringGroupPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { ...ringGroupModalPaperSx, borderRadius: editId == null ? "4px" : ringGroupModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={ringGroupModalTitleStyle}>
          {editId != null
            ? `Edit ${RING_GROUP_TITLE}`
            : `Add ${RING_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...ringGroupModalDialogContentSx,
            padding: "0 24px 20px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ background: "#ffffff" }}>
            <div style={ringGroupModalSectionStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "16px 32px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <RingGroupFieldRow label="Name" tooltipKey="name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Strategy"
                  tooltipKey="ring_strategy"
                  required
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringStrategy}
                      onChange={(e) => setRingStrategy(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_RING_STRATEGY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Timeout (s)"
                  tooltipKey="ring_timeout"
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringTimeout}
                      onChange={(e) => setRingTimeout(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_RING_TIMEOUT_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow label="Alert Info" tooltipKey="alert_info">
                  <TextField
                    size="small"
                    fullWidth
                    value={alertInfo}
                    onChange={(e) => setAlertInfo(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Extension Answer Confirm"
                  tooltipKey="extension_answer_confirm"
                  required
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={extensionAnswerConfirm}
                      onChange={(e) =>
                        setExtensionAnswerConfirm(e.target.value)
                      }
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS.map(
                        (opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ),
                      )}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <RingGroupFieldRow
                  label="Ring Group Number"
                  tooltipKey="ring_group_number"
                  required
                >
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={ringGroupNumber}
                    onChange={(e) => setRingGroupNumber(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Timeout Destination"
                  tooltipKey="timeout_destination"
                  required
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <MuiSelect
                        value={timeoutDestinationType}
                        displayEmpty
                        onChange={(e) => {
                          setTimeoutDestinationType(e.target.value);
                          setTimeoutDestinationValue("");
                        }}
                        sx={ringGroupModalSelectSx}
                      >
                        <MenuItem value="" sx={{ fontSize: 13 }}>
                          <em>Select type</em>
                        </MenuItem>
                        {RING_GROUP_TIMEOUT_DESTINATION_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 13 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>

                    {shouldShowTimeoutValue && (
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <MuiSelect
                          value={timeoutDestinationValue}
                          displayEmpty
                          onChange={(e) =>
                            setTimeoutDestinationValue(e.target.value)
                          }
                          sx={ringGroupModalSelectSx}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select value</em>
                          </MenuItem>
                          {timeoutValueOptions.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    )}
                  </div>
                </RingGroupFieldRow>

                <RingGroupFieldRow label="Enable" tooltipKey="enabled" required>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={ringGroupModalSelectSx}
                    >
                      {RING_GROUP_ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Ring Back"
                  tooltipKey="ring_back"
                  alignTop
                >
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={ringBack}
                      onChange={(e) => setRingBack(e.target.value)}
                      MenuProps={RING_GROUP_RING_BACK_MENU_PROPS}
                      sx={ringGroupModalSelectSx}
                    >
                      {ringBack && !ringBackAllValues.includes(ringBack) && (
                        <MenuItem value={ringBack} sx={{ fontSize: 13 }}>
                          {ringBack}
                        </MenuItem>
                      )}
                      {ringBackOptions.moh_categories.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Music on Hold
                        </ListSubheader>
                      )}
                      {ringBackOptions.moh_categories.map((opt) => (
                        <MenuItem
                          key={`moh-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                      {ringBackOptions.custom_prompts.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Custom Prompt
                        </ListSubheader>
                      )}
                      {ringBackOptions.custom_prompts.map((opt) => (
                        <MenuItem
                          key={`prompt-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                      {ringBackOptions.country_tones.length > 0 && (
                        <ListSubheader
                          disableSticky
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: "24px",
                          }}
                        >
                          Ring Back
                        </ListSubheader>
                      )}
                      {ringBackOptions.country_tones.map((opt) => (
                        <MenuItem
                          key={`tone-${opt}`}
                          value={opt}
                          sx={{ pl: 3, fontSize: 13 }}
                        >
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </RingGroupFieldRow>

                <RingGroupFieldRow
                  label="Caller ID Name Prefix"
                  tooltipKey="caller_id_name_prefix"
                >
                  <TextField
                    size="small"
                    fullWidth
                    value={cidNamePrefix}
                    onChange={(e) => setCidNamePrefix(e.target.value)}
                    sx={ringGroupModalTextFieldFullSx}
                  />
                </RingGroupFieldRow>
              </div>
            </div>

            <RingGroupSectionHeading title="Member Extensions" required />

            <RingGroupCodecDualList
              hideReorder
              allOptions={allExtensionOptions}
              selected={memberExtensions}
              onChange={setMemberExtensions}
              getLabel={getExtLabel}
              emptyTextAvailable={availableMemberEmptyText}
              emptyTextSelected="No selected member"
            />
          </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ringGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RingGroup;
