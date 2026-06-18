import React, { useEffect, useState, useRef } from "react";
import {
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
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
} from "../../../api/apiService";

const ENABLE_OPTIONS = ["Yes", "No"];
const YES_NO_OPTIONS = ["Yes", "No"];
const PBX_COMPACT_MQ = "(max-width: 768px)";

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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_OUTLINE,
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

// ── Shared: Table Header ──────────────────────────────────────────────────────
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

const PBX_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pbxModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const PbxModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={PBX_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={pbxModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

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
        color: "#30415A",
      }}
    >
      {title}
    </span>
  </div>
);

const CONFERENCE_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border";
const CONFERENCE_PAGE_INNER = "w-full max-w-full mx-auto";
const CONFERENCE_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const CONFERENCE_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[10px]";
const CONFERENCE_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const CONFERENCE_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const CONFERENCE_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const CONFERENCE_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#e0f2fe] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const CONFERENCE_PAGE_BADGE =
  "rounded-[6px] border-[0.5px] border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const CONFERENCE_PAGINATION =
  "flex items-center justify-between border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[10px]";

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
      className="text-[13px] font-semibold text-[#3E5475]"
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

const ConferencePagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div className={CONFERENCE_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={CONFERENCE_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={disabled || page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
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
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      } catch {
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
      } catch {
        setGreetingOptions(["Default"]);
      }
    } catch (err) {
      showMessage("error", err?.message || "Failed to load conference data.");
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
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
    <div className={`${CONFERENCE_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={CONFERENCE_PAGE_INNER}>
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

        <PbxBreadcrumb section="Call Features" current="Conference" />

        <div className={CONFERENCE_CARD}>
          <div
            className={`${CONFERENCE_TOOLBAR} ${isCompact ? CONFERENCE_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={CONFERENCE_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={CONFERENCE_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={CONFERENCE_TOOLBAR_ACTIONS}>
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
                variant="cancel"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No conference rooms found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
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
                      Room Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Conference Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Max Members
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
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
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
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.roomName}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.conferenceNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
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
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.maxMembers}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                                                    <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: 0.7,
                              transition: "opacity 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.7";
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <ConferencePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPrev={handlePrev}
              onNext={handleNext}
              disabled={loading.list}
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            pt: 6,
          },
        }}
        PaperProps={{
          sx: {
            width: 880,
            maxWidth: "96vw",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            py: 1.5,
          }}
        >
          {editId != null ? "Edit Conference" : "Add Conference"}
        </DialogTitle>
<DialogContent
  style={{
    padding: "0px 24px 20px",
    backgroundColor: "#ffffff",
  }}
>
          <div
            style={{
              borderBottom: "0.5px solid #eef2f7",
              background: "#ffffff",
              marginLeft: "-24px",
              marginRight: "-24px",
            }}
          >
           <PbxModalTabs
  value={activeTab}
  onChange={setActiveTab}
  tabs={[
    { id: "basic", label: "BASIC" },
    { id: "advanced", label: "ADVANCED SETTINGS" },
  ]}
/>
          </div>
          <div style={{ background: "#ffffff" }}>
            <div
              style={{
                padding: 0,
              }}
            >
              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
  style={{
    background: "#f5f7fa",
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 6,
    padding: 16,
    marginTop: 20,
  }}
>
                    {/* 2-Column Grid (Top-to-Bottom) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
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
                              style: {
                                fontSize: 13,
                                padding: "6px 8px",
                                background: "#fff",
                              },
                            }}
                          />
                        </FieldRow>
                        <FieldRow label="Conference Number" required>
                          <TextField
                            size="small"
                            fullWidth
                            value={conferenceNumber}
                            onChange={(e) =>
                              setConferenceNumber(e.target.value)
                            }
                            inputProps={{
                              style: {
                                fontSize: 13,
                                padding: "6px 8px",
                                background: "#fff",
                              },
                            }}
                          />
                        </FieldRow>
                        <FieldRow label="Greeting">
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={greeting}
                            onChange={(e) => setGreeting(e.target.value)}
                            MenuProps={{
                              PaperProps: { sx: { maxHeight: 280 } },
                            }}
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {(greetingOptions.length
                              ? greetingOptions
                              : ["Default"]
                            ).map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
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
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
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
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
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
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {ENABLE_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
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
                              style: {
                                fontSize: 13,
                                padding: "6px 8px",
                                background: "#fff",
                              },
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
                              style: {
                                fontSize: 13,
                                padding: "6px 8px",
                                background: "#fff",
                              },
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
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
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
                                  style: {
                                    fontSize: 13,
                                    padding: "6px 8px",
                                    background: "#fff",
                                  },
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
                                  style: {
                                    fontSize: 13,
                                    padding: "6px 8px",
                                    background: "#fff",
                                  },
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
                              style: {
                                fontSize: 13,
                                padding: "6px 8px",
                                background: "#fff",
                              },
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
                        
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                          gap: 24,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#30415A",
                              marginBottom: 6,
                              textAlign: "center",
                            }}
                          >
                            Moderator Member (Extensions)
                          </div>
                          <div
                            style={{
                              border: `1px solid ${C.cardBorder}`,
                              background: "#fff",
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
                                  onChange={() =>
                                    toggleModeratorMember(ext.value)
                                  }
                                  style={{ cursor: "pointer" }}
                                />
                                <span
                                  style={{ fontSize: 13, color: C.labelText }}
                                >
                                  {ext.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#30415A",
                              marginBottom: 6,
                              textAlign: "center",
                            }}
                          >
                            Extension Group
                          </div>
                          <div
                            style={{
                              border: `1px solid ${C.cardBorder}`,
                              background: "#fff",
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
                                <span
                                  style={{ fontSize: 13, color: C.labelText }}
                                >
                                  {group.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.errorRed,
                          marginTop: 8,
                        }}
                      >
                        Note: Selecting an extension group will include all
                        members in that group when a moderator dials this
                        conference number.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ADVANCED SETTINGS TAB ── */}
              {activeTab === "advanced" && (
                      <div
  style={{
    background: "#f5f7fa",
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 6,
    padding: 16,
    marginTop: 20,
  }}
>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "16px 32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <FieldRow label="Wait for Moderator">
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={waitForModerator}
                          onChange={(e) => setWaitForModerator(e.target.value)}
                          sx={{ fontSize: 13, background: "#fff" }}
                        >
                          {YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
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
                          sx={{ fontSize: 13, background: "#fff" }}
                        >
                          {YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FieldRow>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <FieldRow label="Mute Participant">
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={muteParticipant}
                          onChange={(e) => setMuteParticipant(e.target.value)}
                          sx={{ fontSize: 13, background: "#fff" }}
                        >
                          {YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
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
                          sx={{ fontSize: 13, background: "#fff" }}
                        >
                          {YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FieldRow>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: 2,
            px: 3,
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
          }}
        >
          <Btn
            variant="dialogPrimary"
            onClick={handleSave}
            disabled={loading.save}
          >
            {loading.save ? (
              <CircularProgress
                size={13}
                sx={{ color: "#fff", mr: 1 }}
              />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Conference"
                : "Create Conference"}
          </Btn>
          <Btn
            variant="dialogCancel"
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConferencePage;
