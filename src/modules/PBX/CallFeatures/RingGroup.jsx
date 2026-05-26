import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
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
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

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
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
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
              <span
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {filteredRows.length} records
              </span>
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
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="accent"
                style={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
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
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH>Name</TH>
                    <TH>Ring Group Number</TH>
                    <TH>Ring Strategy</TH>
                    <TH>Enabled</TH>
                    <TH>Members</TH>
                    <TH style={{ width: 70 }}>Modify</TH>
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
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleToggleRow(realIdx)}
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 6px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              fontFamily: "monospace",
                              color: C.labelText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.ringGroupNumber}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
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
                              textAlign: "center",
                              padding: "10px 14px",
                              borderRight: "1px solid #f1f5f9",
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
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.members.length}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "7px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenEditModal(row)}
                              variant="outline"
                              style={{
                                fontSize: 10,
                                padding: "3px 10px",
                                margin: "0 auto",
                              }}
                            >
                              Edit
                            </Btn>
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
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              <div style={{ marginBottom: 20, position: "relative" }}>
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
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Ring Strategy" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={ringStrategy}
                        onChange={(e) => setRingStrategy(e.target.value)}
                        sx={{ fontSize: 13 }}
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
                        sx={{ fontSize: 13 }}
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
                        style: { fontSize: 13, padding: "6px 8px" },
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
                        sx={{ fontSize: 13 }}
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
                        style: { fontSize: 13, padding: "6px 8px" },
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
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select type</em>
                          </MenuItem>
                          {TIMEOUT_DESTINATION_OPTIONS.map((opt) => (
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
                            sx={{ fontSize: 13 }}
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
                  </FieldRow>

                  <FieldRow label="Enable" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={enabled}
                        onChange={(e) => setEnabled(e.target.value)}
                        sx={{ fontSize: 13 }}
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
                        sx={{ fontSize: 13 }}
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
                        style: { fontSize: 13, padding: "6px 8px" },
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
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.mutedText,
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
                        background: "#f8fafc",
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
                    }}
                  >
                    <Btn
                      onClick={addSelectedMembers}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &gt;
                    </Btn>
                    <Btn
                      onClick={addAllMembers}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &gt;&gt;
                    </Btn>
                    <Btn
                      onClick={removeSelectedMembers}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &lt;
                    </Btn>
                    <Btn
                      onClick={removeAllMembers}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
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
          <Button
            onClick={handleSave}
            disabled={loading.save}
            variant="contained"
            sx={{
              padding: "8px 20px",
              fontSize: 13,
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
              color: "#fff",
              border: "1px solid #5A6F8F",
              boxShadow: "0 2px 8px #3E5475",
              fontWeight: 600,
              textTransform: "none",
              minWidth: "unset",
              width: "auto",
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
              },
              "&:disabled": {
                background: "#94a3b8",
                color: "#e2e8f0",
                border: "1px solid #94a3b8",
              },
            }}
          >
            {loading.save ? (
              <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Group"
                : "Create Group"}
          </Button>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{
              background: "#cbd5e1",
              color: "#374151",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RingGroup;
