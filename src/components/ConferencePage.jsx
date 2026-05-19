import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  Tooltip,
  Alert,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  listConferences,
  getConference,
  createConference,
  updateConference,
  deleteConference,
  listConferenceExtensions,
  listConferenceModeratorMembers,
  listRingBackOptions,
  fetchExtensionGroups,
} from "../api/apiService";

const ENABLE_OPTIONS = ["Yes", "No"];
const YES_NO_OPTIONS = ["Yes", "No"];

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared: Action Button ────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
      color: "#fff",
      border: "1px solid #162233",
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

// ── Shared: Table Header ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, required }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 32 }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 150,
        flexShrink: 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const ConferencePage = () => {
  const normalizeModeratorValue = (value) => String(value ?? "").trim();
  const normalizeExtensionValue = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    return raw.replace(/^extension:/i, "").replace(/^ext:/i, "");
  };

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'advanced'
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    list: false,
    ext: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Basic form state
  const [editId, setEditId] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [conferenceNumber, setConferenceNumber] = useState("");
  const [greeting, setGreeting] = useState("Default");
  const [announce, setAnnounce] = useState("No");
  const [record, setRecord] = useState("No");
  const [moderatorMembers, setModeratorMembers] = useState([]);
  const [enabled, setEnabled] = useState("Yes");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [pinEnabled, setPinEnabled] = useState("No");
  const [moderatorPassword, setModeratorPassword] = useState("");
  const [participantPassword, setParticipantPassword] = useState("");
  const [maxMembers, setMaxMembers] = useState("20");

  // Available extensions for moderator member
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [greetingOptions, setGreetingOptions] = useState([]);

  // Extension groups for quick-select
  const [extensionGroups, setExtensionGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  // Advanced settings
  const [waitForModerator, setWaitForModerator] = useState("Yes");
  const [sayYourName, setSayYourName] = useState("Yes");
  const [muteParticipant, setMuteParticipant] = useState("No");
  const [allowInvite, setAllowInvite] = useState("Yes");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // Initial load
  const loadInitialData = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listConferences();
      const raw = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const mapped = raw.map((item) => ({
        id: item.id,
        roomName: item.name,
        conferenceNumber: String(item.conf_number),
        greeting: item.greeting,
        announce: item.announce ? "Yes" : "No",
        record: item.record ? "Yes" : "No",
        enabled: item.enabled ? "Yes" : "No",
        scheduleStart: toDateTimeLocal(item.schedule_start),
        scheduleEnd: toDateTimeLocal(item.schedule_end),
        pinEnabled: item.pin_enabled ? "Yes" : "No",
        moderatorPassword: item.moderator_pin || "",
        participantPassword: item.participant_pin || "",
        maxMembers: String(item.max_members ?? ""),
        waitForModerator: item.wait_for_moderator ? "Yes" : "No",
        sayYourName: item.say_your_name ? "Yes" : "No",
        muteParticipant: item.mute_participant ? "Yes" : "No",
        allowInvite: item.allow_participant_invite ? "Yes" : "No",
        moderatorMembers: Array.isArray(item.moderators)
          ? item.moderators.map((m) => normalizeModeratorValue(m))
          : [],
      }));
      setRows(mapped);
      setLastUpdated(new Date());

      try {
        setLoading((prev) => ({ ...prev, ext: true }));
        const mmRes = await listConferenceModeratorMembers();
        const mmMessage = mmRes?.message || mmRes?.data || {};
        const extRaw = Array.isArray(mmMessage?.extensions)
          ? mmMessage.extensions
          : [];
        const groupsRaw = Array.isArray(mmMessage?.groups)
          ? mmMessage.groups
          : [];

        const extList = extRaw
          .map((e) => {
            if (!e) return null;
            if (typeof e === "string" || typeof e === "number")
              return { value: String(e), label: String(e) };
            const value = e.extension ?? e.value;
            if (value == null) return null;
            const normalizedExtension = normalizeExtensionValue(value);
            if (!normalizedExtension) return null;
            return {
              value: normalizedExtension,
              label: e.display_name || e.label || normalizedExtension,
            };
          })
          .filter(Boolean);
        setAvailableExtensions(extList);

        const groupList = groupsRaw
          .map((g) => {
            if (!g) return null;
            const id = g.id != null ? String(g.id) : "";
            const value = String(g.value || (id ? `group:${id}` : ""));
            if (!value) return null;
            return {
              id: id || value.replace(/^group:/, ""),
              name: g.name || g.label || value,
              label: g.label || g.name || value,
              value,
            };
          })
          .filter(Boolean);
        setExtensionGroups(groupList);
      } catch (err) {
        try {
          const extRes = await listConferenceExtensions();
          const extRaw = Array.isArray(extRes?.message)
            ? extRes.message
            : Array.isArray(extRes?.data)
              ? extRes.data
              : [];
          const extList = extRaw
            .filter((e) => e && e.extension)
            .map((e) => ({
              value: normalizeExtensionValue(e.extension),
              label: e.display_name || normalizeExtensionValue(e.extension),
            }));
          setAvailableExtensions(extList);
        } catch {
          setAvailableExtensions([]);
        }

        try {
          const grpRes = await fetchExtensionGroups();
          const grpRaw = Array.isArray(grpRes?.message)
            ? grpRes.message
            : Array.isArray(grpRes?.data)
              ? grpRes.data
              : [];
          const groupList = grpRaw
            .map((g) => {
              if (!g) return null;
              const id = g.id != null ? String(g.id) : "";
              const value = id ? `group:${id}` : "";
              if (!value) return null;
              return {
                id,
                name: g.name || value,
                label: g.label || g.name || value,
                value,
              };
            })
            .filter(Boolean);
          setExtensionGroups(groupList);
        } catch {
          setExtensionGroups([]);
        }
      } finally {
        setLoading((prev) => ({ ...prev, ext: false }));
      }

      try {
        const gRes = await listRingBackOptions();
        const customPrompts = Array.isArray(gRes?.message?.custom_prompts)
          ? gRes.message.custom_prompts.map((g) => String(g))
          : [];
        const uniqueCustomPrompts = Array.from(
          new Set(customPrompts.filter(Boolean)),
        );
        setGreetingOptions(["Default", ...uniqueCustomPrompts]);
      } catch (err) {
        setGreetingOptions(["Default"]);
      }
    } catch (err) {
      showMessage("error", err?.message || "Failed to load conference data.");
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadInitialData();
    }
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.roomName, r.conferenceNumber].some((v) =>
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

  // ── Handlers ──
  const resetForm = () => {
    setEditId(null);
    setRoomName("");
    setConferenceNumber("");
    setGreeting("Default");
    setAnnounce("No");
    setRecord("No");
    setModeratorMembers([]);
    setEnabled("Yes");
    setScheduleStart("");
    setScheduleEnd("");
    setPinEnabled("No");
    setModeratorPassword("");
    setParticipantPassword("");
    setMaxMembers("20");
    setWaitForModerator("Yes");
    setSayYourName("Yes");
    setMuteParticipant("No");
    setAllowInvite("Yes");
    setSelectedGroupIds([]);
    setActiveTab("basic");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    let source = row;
    try {
      if (row?.id != null) {
        const detailRes = await getConference(row.id);
        const detail = detailRes?.message || detailRes?.data || {};
        source = {
          ...row,
          roomName: detail?.name ?? row.roomName,
          conferenceNumber:
            detail?.conf_number != null
              ? String(detail.conf_number)
              : row.conferenceNumber,
          greeting: detail?.greeting ?? row.greeting,
          announce:
            typeof detail?.announce === "boolean"
              ? detail.announce
                ? "Yes"
                : "No"
              : row.announce,
          record:
            typeof detail?.record === "boolean"
              ? detail.record
                ? "Yes"
                : "No"
              : row.record,
          moderatorMembers: Array.isArray(detail?.moderators)
            ? detail.moderators.map((m) => normalizeModeratorValue(m))
            : row.moderatorMembers,
          enabled:
            typeof detail?.enabled === "boolean"
              ? detail.enabled
                ? "Yes"
                : "No"
              : row.enabled,
          scheduleStart:
            toDateTimeLocal(detail?.schedule_start) || row.scheduleStart,
          scheduleEnd: toDateTimeLocal(detail?.schedule_end) || row.scheduleEnd,
          pinEnabled:
            typeof detail?.pin_enabled === "boolean"
              ? detail.pin_enabled
                ? "Yes"
                : "No"
              : row.pinEnabled,
          moderatorPassword: detail?.moderator_pin ?? row.moderatorPassword,
          participantPassword:
            detail?.participant_pin ?? row.participantPassword,
          maxMembers:
            detail?.max_members != null
              ? String(detail.max_members)
              : String(row.maxMembers || ""),
          waitForModerator:
            typeof detail?.wait_for_moderator === "boolean"
              ? detail.wait_for_moderator
                ? "Yes"
                : "No"
              : row.waitForModerator,
          sayYourName:
            typeof detail?.say_your_name === "boolean"
              ? detail.say_your_name
                ? "Yes"
                : "No"
              : row.sayYourName,
          muteParticipant:
            typeof detail?.mute_participant === "boolean"
              ? detail.mute_participant
                ? "Yes"
                : "No"
              : row.muteParticipant,
          allowInvite:
            typeof detail?.allow_participant_invite === "boolean"
              ? detail.allow_participant_invite
                ? "Yes"
                : "No"
              : row.allowInvite,
        };
      }
    } catch (err) {
      console.warn(
        "Failed to fetch conference detail for edit, using list row fallback:",
        err,
      );
    }

    setEditId(source.id);
    setRoomName(source.roomName || "");
    setConferenceNumber(source.conferenceNumber || "");
    setGreeting(source.greeting || "Default");
    setAnnounce(source.announce || "No");
    setRecord(source.record || "No");
    setModeratorMembers(
      Array.isArray(source.moderatorMembers) ? source.moderatorMembers : [],
    );
    setEnabled(source.enabled || "Yes");
    setScheduleStart(source.scheduleStart || "");
    setScheduleEnd(source.scheduleEnd || "");
    setPinEnabled(source.pinEnabled || "No");
    setModeratorPassword(source.moderatorPassword || "");
    setParticipantPassword(source.participantPassword || "");
    setMaxMembers(source.maxMembers || "20");
    setWaitForModerator(source.waitForModerator || "Yes");
    setSayYourName(source.sayYourName || "Yes");
    setMuteParticipant(source.muteParticipant || "No");
    setAllowInvite(source.allowInvite || "Yes");
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const toDelete = filteredRows.filter((_, idx) => selected.includes(idx));
      for (const row of toDelete) {
        if (row.id != null) await deleteConference(row.id);
      }
      setSelected([]);
      await loadInitialData();
      showMessage("success", "Conference room(s) deleted successfully.");
    } catch (err) {
      showMessage(
        "error",
        err?.message || "Failed to delete conference room(s).",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedRoomName = roomName.trim();
    if (!trimmedRoomName) return showMessage("error", "Room Name is required.");
    if (!conferenceNumber.trim())
      return showMessage("error", "Conference Center Number is required.");

    const num = parseInt(conferenceNumber.trim(), 10);
    if (Number.isNaN(num) || num < 6400 || num > 6499)
      return showMessage(
        "error",
        "Conference Center Number must be between 6400 and 6499.",
      );

    if (!Array.isArray(moderatorMembers) || moderatorMembers.length === 0)
      return showMessage(
        "error",
        "Please select at least one Moderator Member.",
      );

    const selectedModeratorExtensions = moderatorMembers.filter(
      (member) => !String(member).startsWith("group:"),
    );
    if (selectedModeratorExtensions.length === 0)
      return showMessage(
        "error",
        "Please select at least one Moderator Member extension. Group only selection is not allowed.",
      );

    const maxMembersInt = parseInt(maxMembers, 10);
    if (Number.isNaN(maxMembersInt) || maxMembersInt < 1 || maxMembersInt > 200)
      return showMessage("error", "Max Members must be between 1 and 200.");

    const payloadForApi = {
      name: trimmedRoomName,
      conf_number: num,
      greeting: (greeting || "Default").toLowerCase(),
      announce: announce === "Yes",
      record: record === "Yes",
      enabled: enabled === "Yes",
      schedule_start: scheduleStart || null,
      schedule_end: scheduleEnd || null,
      pin_enabled: pinEnabled === "Yes",
      moderator_pin: pinEnabled === "Yes" ? moderatorPassword || null : null,
      participant_pin:
        pinEnabled === "Yes" ? participantPassword || null : null,
      max_members: maxMembersInt,
      wait_for_moderator: waitForModerator === "Yes",
      say_your_name: sayYourName === "Yes",
      mute_participant: muteParticipant === "Yes",
      allow_participant_invite: allowInvite === "Yes",
      moderators: moderatorMembers.map(String),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateConference(editId, payloadForApi);
      } else {
        await createConference(payloadForApi);
      }
      await loadInitialData();
      setShowModal(false);
      resetForm();
      showMessage("success", "Conference room saved successfully.");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save conference room.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const toggleModeratorMember = (ext) => {
    setModeratorMembers((prev) =>
      prev.includes(ext) ? prev.filter((v) => v !== ext) : [...prev, ext],
    );
  };

  const toggleExtensionGroup = (group) => {
    const groupId = String(group?.id ?? "");
    const groupValue = String(
      group?.value || (groupId ? `group:${groupId}` : ""),
    );
    if (!groupId || !groupValue) return;

    setModeratorMembers((prev) => {
      if (prev.includes(groupValue))
        return prev.filter((v) => v !== groupValue);
      return [...prev, groupValue];
    });
  };

  useEffect(() => {
    const mappedSelected = extensionGroups
      .filter((g) =>
        moderatorMembers.includes(String(g.value || `group:${g.id}`)),
      )
      .map((g) => String(g.id));
    setSelectedGroupIds(mappedSelected);
  }, [moderatorMembers, extensionGroups]);

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
              Conference
            </span>
          </div>
          {/* <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 10, color: C.mutedText }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )} */}
          {/* <span
              style={{
                fontSize: 10,
                color: "#15803d",
                fontWeight: 500,
                background: "#dcfce7",
                padding: "2px 10px",
                borderRadius: 10,
                border: "0.5px solid #bbf7d0",
              }}
            >
              Total Records: {rows.length}
            </span> */}
          {/* </div> */}
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `0.5px solid ${C.cardBorder}`,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
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
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${C.accent}`,
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
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
                  placeholder="Search conferences..."
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
              </div> */}

              {/* <Btn
                onClick={handlePrev}
                disabled={loading.list || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={handleNext}
                disabled={loading.list || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}

              {/* <Btn
                onClick={loadInitialData}
                disabled={loading.list}
                variant="default"
              >
                {loading.list ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : (
                  "Refresh"
                )}
              </Btn> */}
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="accent"
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
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Room Name
                    </TH>
                    <TH>Conference Number</TH>
                    <TH>Enabled</TH>
                    <TH>Max Members</TH>
                    <TH style={{ width: 60 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No conference rooms found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBgColor = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBgColor,
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBgColor;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 0",
                              borderRight: "0.5px solid #edf2f7",
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
                              padding: "7px 4px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "7px 16px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.roomName}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              fontFamily: "monospace",
                              color: C.labelText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.conferenceNumber}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <span
                              style={{
                                background:
                                  row.enabled === "Yes" ? "#dcfce7" : "#fef2f2",
                                color:
                                  row.enabled === "Yes" ? "#15803d" : "#dc2626",
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
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.maxMembers}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" }}
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
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
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
        PaperProps={{ sx: { width: 880, maxWidth: "96vw", borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px 0",
          }}
        >
          {editId != null ? "Edit Conference" : "Add Conference"}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              marginTop: 14,
            }}
          >
            {[
              { id: "basic", label: "BASIC" },
              { id: "advanced", label: "ADVANCED SETTINGS" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? C.pageBg : "transparent",
                  color: activeTab === t.id ? C.accent : "#9ca3af",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: "6px 6px 0 0",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                {/* 2-Column Grid (Top-to-Bottom) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 32px",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Room Name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Conference Number" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={conferenceNumber}
                        onChange={(e) => setConferenceNumber(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Greeting">
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={greeting}
                        onChange={(e) => setGreeting(e.target.value)}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                        sx={{ fontSize: 13 }}
                      >
                        {(greetingOptions.length
                          ? greetingOptions
                          : ["Default"]
                        ).map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FieldRow>
                    <FieldRow label="Announce">
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={announce}
                        onChange={(e) => setAnnounce(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        {YES_NO_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FieldRow>
                    <FieldRow label="Record">
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={record}
                        onChange={(e) => setRecord(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        {YES_NO_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FieldRow>
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Enabled" required>
                      <MuiSelect
                        size="small"
                        fullWidth
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
                    </FieldRow>
                    <FieldRow label="Schedule Start">
                      <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        value={scheduleStart}
                        onChange={(e) => setScheduleStart(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Schedule End">
                      <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        value={scheduleEnd}
                        onChange={(e) => setScheduleEnd(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Pin">
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={pinEnabled}
                        onChange={(e) => {
                          setPinEnabled(e.target.value);
                          if (e.target.value === "No") {
                            setModeratorPassword("");
                            setParticipantPassword("");
                          }
                        }}
                        sx={{ fontSize: 13 }}
                      >
                        {YES_NO_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FieldRow>
                    {pinEnabled === "Yes" && (
                      <>
                        <FieldRow label="Moderator Password">
                          <TextField
                            size="small"
                            fullWidth
                            value={moderatorPassword}
                            onChange={(e) =>
                              setModeratorPassword(e.target.value)
                            }
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
                          />
                        </FieldRow>
                        <FieldRow label="Participant Password">
                          <TextField
                            size="small"
                            fullWidth
                            value={participantPassword}
                            onChange={(e) =>
                              setParticipantPassword(e.target.value)
                            }
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
                          />
                        </FieldRow>
                      </>
                    )}
                    <FieldRow label="Max Members">
                      <TextField
                        size="small"
                        fullWidth
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                  </div>
                </div>

                {/* Moderator Selection Full Width Row */}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: `1px dashed ${C.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 24,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.mutedText,
                          marginBottom: 8,
                        }}
                      >
                        Moderator Member (Extensions)
                      </div>
                      <div
                        style={{
                          border: `1px solid ${C.cardBorder}`,
                          background: "#f8fafc",
                          borderRadius: 4,
                          padding: 8,
                          height: 160,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {availableExtensions.map((ext) => (
                          <label
                            key={ext.value}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={moderatorMembers.includes(ext.value)}
                              onChange={() => toggleModeratorMember(ext.value)}
                              style={{ cursor: "pointer" }}
                            />
                            <span style={{ fontSize: 13, color: C.labelText }}>
                              {ext.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.mutedText,
                          marginBottom: 8,
                        }}
                      >
                        Extension Group
                      </div>
                      <div
                        style={{
                          border: `1px solid ${C.cardBorder}`,
                          background: "#f8fafc",
                          borderRadius: 4,
                          padding: 8,
                          height: 160,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {extensionGroups.map((group) => (
                          <label
                            key={group.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedGroupIds.includes(
                                String(group.id),
                              )}
                              onChange={() => toggleExtensionGroup(group)}
                              style={{ cursor: "pointer" }}
                            />
                            <span style={{ fontSize: 13, color: C.labelText }}>
                              {group.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 11, color: C.errorRed, marginTop: 8 }}
                  >
                    Note: Selecting an extension group will include all members
                    in that group when a moderator dials this conference number.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADVANCED SETTINGS TAB ── */}
          {activeTab === "advanced" && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Wait for Moderator">
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={waitForModerator}
                      onChange={(e) => setWaitForModerator(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FieldRow>
                  <FieldRow label="Say Your Name">
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={sayYourName}
                      onChange={(e) => setSayYourName(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FieldRow>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Mute Participant">
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={muteParticipant}
                      onChange={(e) => setMuteParticipant(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FieldRow>
                  <FieldRow label="Allow Participant to Invite">
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={allowInvite}
                      onChange={(e) => setAllowInvite(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FieldRow>
                </div>
              </div>
            </div>
          )}
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
            onClick={handleSave}
            disabled={loading.save}
            variant="default"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Conference"
                : "Create Conference"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConferencePage;
