import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
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
import { RING_GROUP_ITEMS_PER_PAGE } from "../../../constants/RingGroupConstants";

const ENABLE_OPTIONS = ["Yes", "No"];
const RING_STRATEGY_OPTIONS = ["simultaneous", "sequential", "random"];
const EXTENSION_ANSWER_CONFIRM_OPTIONS = ["Yes", "No"];
const RING_TIMEOUT_OPTIONS = Array.from({ length: 20 }, (_, i) =>
  String((i + 1) * 5),
);
const TIMEOUT_DESTINATION_OPTIONS = [
  { label: "Call Queue", value: "call_queue" },
  { label: "CallBacks", value: "callbacks" },
  { label: "Conference Rooms", value: "conference_rooms" },
  { label: "DISA", value: "disa" },
  { label: "Extensions", value: "extensions" },
  { label: "Fax To Mail", value: "faxtoemail" },
  { label: "IVR Menus", value: "ivr_menus" },
  { label: "Ring Group", value: "ring_groups" },
  { label: "Voicemails", value: "voicemail" },
  { label: "Other", value: "other" },
];

const RING_BACK_MENU_PROPS = {
  PaperProps: { sx: { maxHeight: 360 } },
};

const EMPTY_RING_BACK_OPTIONS = {
  moh_categories: [],
  custom_prompts: [],
  country_tones: [],
};

// ── Color Palette (CDR Style) ─────────────────────────────────────────────────
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

// ── Shared UI Components ──────────────────────────────────────────────────────
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
        return "#e2e8f0";
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
const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "24px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const RingGroup = () => {
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
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasLoadedDataRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = RING_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
    EMPTY_RING_BACK_OPTIONS,
  );
  const [cidNamePrefix, setCidNamePrefix] = useState("");
  const [extensionAnswerConfirm, setExtensionAnswerConfirm] = useState("No");

  // Member Extensions dual-list
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

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

  const timeoutTypeLabel = (value) =>
    TIMEOUT_DESTINATION_OPTIONS.find((o) => o.value === value)?.label ||
    value ||
    "";

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
        setRingBackOptions(EMPTY_RING_BACK_OPTIONS);
        return;
      }
      const msg = res?.message;
      const normalized =
        msg && typeof msg === "object" && !Array.isArray(msg)
          ? msg
          : EMPTY_RING_BACK_OPTIONS;
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
      setRingBackOptions(EMPTY_RING_BACK_OPTIONS);
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
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to load ring groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
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
        .map((e) => ({
          value: String(e.extension),
          label: `${(e.display_name || e.name || String(e.extension)).trim()}-${String(e.extension)}`,
        }))
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
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.ringGroupNumber].some((v) =>
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
    setAvailableSelected([]);
    setChosenSelected([]);
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
    setAvailableSelected([]);
    setChosenSelected([]);
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
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deleteRingGroup(row.id);
            if (res?.response === false) {
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

  // ── Dual Listbox Logic ──
  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [availableExtensions]);

  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const availableList = useMemo(
    () =>
      availableExtensions.filter((e) => !memberExtensions.includes(e.value)),
    [availableExtensions, memberExtensions],
  );

  const addSelectedMembers = () => {
    if (!availableSelected.length) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };
  const addAllMembers = () => {
    setMemberExtensions(availableExtensions.map((e) => e.value));
    setAvailableSelected([]);
  };
  const removeSelectedMembers = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };
  const removeAllMembers = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

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

  const ringBackMenuCount =
    ringBackOptions.moh_categories.length +
    ringBackOptions.custom_prompts.length +
    ringBackOptions.country_tones.length;

  const ringBackAllValues = useMemo(
    () => [
      ...ringBackOptions.moh_categories,
      ...ringBackOptions.custom_prompts,
      ...ringBackOptions.country_tones,
    ],
    [ringBackOptions],
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
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

        {/* Breadcrumb + Last Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Features &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Ring Group
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            
background: "#ffffff",
borderRadius: 10,
overflow: "hidden",
border: `1.5px solid ${C.cardBorder}`,
boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
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
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
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
                variant="danger"
                style={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}
              > <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                 Delete
              </Btn>
              <Btn
  onClick={handleOpenAddModal}
  disabled={loading.list}
  variant="primary"
   style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
>
  + Add New
</Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto",
overflowY: "auto",
flex: 1,}}>
            {loading.list ? (
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
                    <TH style={{ width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,}}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx} 
                      />
                    </TH>
                    <TH style={{ width: 36, position: "sticky", top: 0, zIndex: 10  }}>Id</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Name</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Ring Group Number</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Ring Strategy</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Enabled</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Members</TH>
                    <TH style={{ width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10, }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No ring groups found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRows.length - 1;
                      const rowBg = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
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
                             ...tdStyle, background: rowBg
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleToggleRow(realIdx)}
                              sx={checkboxSx}
                            />
                          </td>
                          <td
                            style={{
                             ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                          ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                           ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {row.ringGroupNumber}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            <span
                              style={{
                                color: C.valueText,
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
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
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            <span
                              style={{
                                color:
                                  row.enabled === "Yes" ? "#166534" : "#475569",
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 72,
                              }}
                            >
                              {row.enabled}
                            </span>
                          </td>
                          <td
                            style={{
                            ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {row.members.length}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "7px 8px" , ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,}}
                          >
                           <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={() => handleOpenEditModal(row)}
/>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!loading.list && filteredRows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline"
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
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 900, maxWidth: "96vw", borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          {editId != null ? "Edit Ring Group" : "Add Ring Group"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px",backgroundColor:"#ffffff",}}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
               background: "#f5f7fa",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              <div style={{ marginBottom: 20, position: "relative" }}>
                <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
                <span
                   style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.accent,
                        marginBottom: 6,
                        textAlign: "center",
                      }}
                >
                  Ring Group
                </span>
              </div>

              {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                {/* ── LEFT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Name" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" , backgroundColor: "#fff",},
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Ring Strategy" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringStrategy}
                        onChange={(e) => setRingStrategy(e.target.value)}
                        sx={{ fontSize: 13, backgroundColor: "#fff",}}
                      >
                        {RING_STRATEGY_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>

                  <FieldRow label="Ring Timeout (s)">
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringTimeout}
                        onChange={(e) => setRingTimeout(e.target.value)}
                        sx={{ fontSize: 13 , backgroundColor: "#fff",}}
                      >
                        {RING_TIMEOUT_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>

                  <FieldRow label="Alert Info">
                    <TextField
                      size="small"
                      fullWidth
                      value={alertInfo}
                      onChange={(e) => setAlertInfo(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" , backgroundColor: "#fff",},
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Extension Answer Confirm" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={extensionAnswerConfirm}
                        onChange={(e) =>
                          setExtensionAnswerConfirm(e.target.value)
                        }
                        sx={{ fontSize: 13, backgroundColor: "#fff", }}
                      >
                        {EXTENSION_ANSWER_CONFIRM_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Ring Group Number" required>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={ringGroupNumber}
                      onChange={(e) => setRingGroupNumber(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" , backgroundColor: "#fff",},
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Timeout Destination" required>
                    <div style={{ display: "flex", gap: 12 }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <MuiSelect
                          value={timeoutDestinationType}
                          displayEmpty
                          onChange={(e) => {
                            setTimeoutDestinationType(e.target.value);
                            setTimeoutDestinationValue("");
                          }}
                          sx={{ fontSize: 13, backgroundColor: "#fff", }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select type</em>
                          </MenuItem>
                          {TIMEOUT_DESTINATION_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13, backgroundColor: "#fff", }}
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
                            sx={{ fontSize: 13 , backgroundColor: "#fff",}}
                          >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                              <em>Select value</em>
                            </MenuItem>
                            {timeoutValueOptions.map((opt) => (
                              <MenuItem
                                key={opt.value}
                                value={opt.value}
                                sx={{ fontSize: 13, backgroundColor: "#fff", }}
                              >
                                {opt.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      )}
                    </div>
                  </FieldRow>

                  <FieldRow label="Enable" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={enabled}
                        onChange={(e) => setEnabled(e.target.value)}
                        sx={{ fontSize: 13, backgroundColor: "#fff",}}
                      >
                        {ENABLE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>

                  <FieldRow label="Ring Back" align="flex-start">
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringBack}
                        onChange={(e) => setRingBack(e.target.value)}
                        MenuProps={RING_BACK_MENU_PROPS}
                        sx={{ fontSize: 13, backgroundColor: "#fff",}}
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
                  </FieldRow>

                  <FieldRow label="Caller ID Name Prefix">
                    <TextField
                      size="small"
                      fullWidth
                      value={cidNamePrefix}
                      onChange={(e) => setCidNamePrefix(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px",backgroundColor: "#fff", },
                      }}
                    />
                  </FieldRow>
                </div>
              </div>

              {/* Members Dual-Listbox Section */}
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.labelText,
                    marginBottom: 12,
                  }}
                >
                  Member Extensions <span style={{ color: C.errorRed }}>*</span>
                </div>
              <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 40px 1fr",
    gap: 12,
    alignItems: "start",
  }}
>
                  <div>
                    <div
                        style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.accent,
                        marginBottom: 6,
                        textAlign: "center",
                      }}
                    >
                      Available
                    </div>
                    <select
                      multiple
                      value={availableSelected}
                      onChange={(e) =>
                        setAvailableSelected(
                          Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          ),
                        )
                      }
                      style={{
                        width: "100%",
                        height: 180,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 13,
                        outline: "none",
                       backgroundColor: "#fff",
                      }}
                    >
                      {loading.members ? (
                        <option disabled>Loading extensions...</option>
                      ) : availableList.length === 0 ? (
                        <option disabled>No extensions available</option>
                      ) : (
                        availableList.map((t) => (
                          <option key={t.value} value={t.value}>
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
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24, // Available/Selected label ki height
    height: 180,   // same as select height
  }}
>
                    <Btn
                      onClick={addSelectedMembers}
                      variant="outline"
                   style={{
      width: 44,
      height: "100%",
      fontSize: 12,
    }}
                    >
                      &gt;
                    </Btn>
                    <Btn
                      onClick={addAllMembers}
                      variant="outline"
                    style={{
      width: 44,
      height: "100%",
      fontSize: 12,
    }}
                    >
                      &gt;&gt;
                    </Btn>
                    <Btn
                      onClick={removeSelectedMembers}
                      variant="outline"
                      style={{
      width: 44,
      height: "100%",
      fontSize: 12,
    }}
                    >
                      &lt;
                    </Btn>
                    <Btn
                      onClick={removeAllMembers}
                      variant="outline"
                   style={{
      width: 44,
      height: "100%",
      fontSize: 12,
    }}
                    >
                      &lt;&lt;
                    </Btn>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.accent,
                        marginBottom: 6,
                        textAlign: "center",
                      }}
                    >
                      Selected
                    </div>
                    <select
                      multiple
                      value={chosenSelected}
                      onChange={(e) =>
                        setChosenSelected(
                          Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          ),
                        )
                      }
                      style={{
                        width: "100%",
                        height: 180,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 13,
                        outline: "none",
                        background: "#fff",
                      }}
                    >
                      {memberExtensions.length === 0 ? (
                        <option disabled>No selected members</option>
                      ) : (
                        memberExtensions.map((id) => (
                          <option key={id} value={id}>
                            {getExtLabel(id)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
       <Btn
  variant="primary"
  onClick={handleSave}
  disabled={loading.save}
 style={{ minWidth: 100, height: 33, fontSize: 13 }}
>
  {loading.save ? (
    <>
      <CircularProgress
        size={14}
        sx={{ color: "#fff", mr: 1 }}
      />
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
   style={{ minWidth: 100, height: 33 }}
>
  Cancel
</Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RingGroup;
