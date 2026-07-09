import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
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
  MenuItem,
  Select as MuiSelect,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
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
import {
  CONFERENCE_DEFAULT_MAX_MEMBERS,
  CONFERENCE_ENABLE_OPTIONS,
  CONFERENCE_FIELD_TOOLTIPS,
  CONFERENCE_MODAL_TABS,
  CONFERENCE_MODERATOR_NOTE,
  CONFERENCE_YES_NO_OPTIONS,
} from "../../../constants/ConferenceConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as ConferenceBreadcrumb,
  ExtensionTableListLoading as ConferenceTableListLoading,
  ExtensionTableListEmptyState as ConferenceTableListEmptyState,
  ExtensionModalTabs as ConferenceModalTabs,
  extensionTableCheckboxSx as conferenceTableCheckboxSx,
  extensionFixedAlertSx as conferenceFixedAlertSx,
  extensionPageWrapStyle as conferencePageWrapStyle,
  extensionPageInnerStyle as conferencePageInnerStyle,
  extensionCardStyle as conferenceCardStyle,
  extensionToolbarStyle as conferenceToolbarStyle,
  extensionSelectedBadgeStyle as conferenceSelectedBadgeStyle,
  extensionCancelBtnStyle as conferenceCancelBtnStyle,
  extensionPrimaryBtnStyle as conferencePrimaryBtnStyle,
} from "../../../components/common";

const CONFERENCE_COMPACT_MQ = "(max-width: 768px)";

// ── Color Palette ─────────────────────────────────────────────────────────────
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
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
};

// ── Local page UI ──


const CONFERENCE_TABLE_CARD_RADIUS = 10;

const conferencePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CONFERENCE_TABLE_CARD_RADIUS,
  borderBottomRightRadius: CONFERENCE_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const conferencePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const conferenceEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleConferenceEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const conferenceOutlinedInputRootSx = {
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

const conferenceModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...conferenceOutlinedInputRootSx,
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

const conferenceModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...conferenceOutlinedInputRootSx,
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

const conferenceModalPaperSx = {
  width: 880,
  maxWidth: "96vw",
  mx: "auto",
  my: 0,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const conferenceModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const conferenceModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
  marginTop: 24,
};

const conferenceModalDialogContentSx = {
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
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const conferenceModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const CONFERENCE_TOOLTIP_PROPS = {
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

const formatConferenceTooltipTitle = (text) => {
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

const conferenceModalTabBarStyle = {
  
  background: "#ffffff",
};

const conferenceModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};


const CONFERENCE_MODAL_LABEL_WIDTH = 150;

const ConferenceFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = CONFERENCE_FIELD_TOOLTIPS[tooltipKey] || "";
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
      title={formatConferenceTooltipTitle(tooltip)}
      {...CONFERENCE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const ConferenceFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = CONFERENCE_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    <ConferenceFieldLabel
      tooltipKey={tooltipKey}
      style={{
        width: labelWidth,
        flexShrink: 0,
        marginTop: alignTop ? 4 : 0,
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </ConferenceFieldLabel>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const CONFERENCE_MODAL_SECTION_BG = "#f8fafc";

const ConferenceSectionHeading = ({
  title,
  isFirst = false,
  required = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
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
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: CONFERENCE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  </div>
  );
};

const CONFERENCE_MEMBER_LIST_HEIGHT = 188;

const getConferenceMemberListBoxStyle = (isEmpty) => ({
  border: `1px solid ${C.codecBoxBorder}`,
  background: C.codecBoxAvailableBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 10px",
  height: CONFERENCE_MEMBER_LIST_HEIGHT,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 6,
  boxSizing: "border-box",
});

const conferenceMemberListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const conferenceMemberListSubHeadingStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  marginBottom: 8,
  textAlign: "center",
};

const ConferenceMemberListBox = ({ items, emptyText, renderItem }) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getConferenceMemberListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={conferenceMemberListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map(renderItem)
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ConferencePage = () => {
  const isCompact = useMediaQuery(CONFERENCE_COMPACT_MQ);
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
  const modalScrollRef = useRef(null);
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
  const [maxMembers, setMaxMembers] = useState(CONFERENCE_DEFAULT_MAX_MEMBERS);

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

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

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
    setMaxMembers(CONFERENCE_DEFAULT_MAX_MEMBERS);
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
        ...conferencePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={conferencePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={conferenceFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ConferenceBreadcrumb section="Call Features" current="Conference" />

        <div style={conferenceCardStyle}>
          <div
            style={{
              ...conferenceToolbarStyle,
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
                <span style={conferenceSelectedBadgeStyle}>
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
                style={conferenceCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={conferencePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <ConferenceTableListLoading />
            ) : rows.length === 0 ? (
              <ConferenceTableListEmptyState
                message="No conference rooms found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <ConferenceTableListEmptyState
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
                        sx={conferenceTableCheckboxSx}
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
                            sx={conferenceTableCheckboxSx}
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
                            style={conferenceEditIconStyle}
                            onMouseEnter={(e) =>
                              handleConferenceEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleConferenceEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={conferencePaginationStyle}>
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
                <span style={conferencePageBadgeStyle}>
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
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: conferenceModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={conferenceModalTitleStyle}>
          {editId != null ? "Edit Conference" : "Add Conference"}
        </DialogTitle>
        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          sx={{
            ...conferenceModalDialogContentSx,
            padding: "0 24px 20px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              borderBottom: `1px solid ${C.divider}`,
              background: "#ffffff",
              marginLeft: -24,
              marginRight: -24,
            }}
          >
            <ConferenceModalTabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={CONFERENCE_MODAL_TABS}
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
                  <div style={conferenceModalSectionStyle}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
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
                        <ConferenceFieldRow
                          label="Room Name"
                          tooltipKey="room_name"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Conference Number"
                          tooltipKey="conference_number"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={conferenceNumber}
                            onChange={(e) =>
                              setConferenceNumber(e.target.value)
                            }
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Greeting"
                          tooltipKey="greeting"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={greeting}
                            onChange={(e) => setGreeting(e.target.value)}
                            MenuProps={{
                              PaperProps: { sx: { maxHeight: 280 } },
                            }}
                            sx={conferenceModalSelectSx}
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
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Announce"
                          tooltipKey="announce"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={announce}
                            onChange={(e) => setAnnounce(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Record"
                          tooltipKey="record"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={record}
                            onChange={(e) => setRecord(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <ConferenceFieldRow
                          label="Enabled"
                          tooltipKey="enabled"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={enabled}
                            onChange={(e) => setEnabled(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_ENABLE_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Schedule Start"
                          tooltipKey="schedule_start"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            type="datetime-local"
                            value={scheduleStart}
                            onChange={(e) => setScheduleStart(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Schedule End"
                          tooltipKey="schedule_end"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            type="datetime-local"
                            value={scheduleEnd}
                            onChange={(e) => setScheduleEnd(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Pin"
                          tooltipKey="pin"
                          required
                        >
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
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        {pinEnabled === "Yes" && (
                          <>
                            <ConferenceFieldRow label="Moderator Password">
                              <TextField
                                size="small"
                                fullWidth
                                value={moderatorPassword}
                                onChange={(e) =>
                                  setModeratorPassword(e.target.value)
                                }
                                sx={conferenceModalTextFieldFullSx}
                              />
                            </ConferenceFieldRow>
                            <ConferenceFieldRow label="Participant Password">
                              <TextField
                                size="small"
                                fullWidth
                                value={participantPassword}
                                onChange={(e) =>
                                  setParticipantPassword(e.target.value)
                                }
                                sx={conferenceModalTextFieldFullSx}
                              />
                            </ConferenceFieldRow>
                          </>
                        )}
                        <ConferenceFieldRow
                          label="Max Members"
                          tooltipKey="max_members"
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                      </div>
                    </div>

                    <ConferenceSectionHeading title="Moderator Member" required />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                        gap: 24,
                      }}
                    >
                      <div>
                        <div style={conferenceMemberListSubHeadingStyle}>
                          Extensions
                        </div>
                        <ConferenceMemberListBox
                          items={availableExtensions}
                          emptyText="No extension"
                          renderItem={(ext) => (
                            <label
                              key={ext.value}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={moderatorMembers.includes(ext.value)}
                                onChange={() =>
                                  toggleModeratorMember(ext.value)
                                }
                                sx={conferenceTableCheckboxSx}
                              />
                              <span
                                style={{ fontSize: 13, color: C.labelText }}
                              >
                                {ext.label}
                              </span>
                            </label>
                          )}
                        />
                      </div>
                      <div>
                        <div style={conferenceMemberListSubHeadingStyle}>
                          Extension Group
                        </div>
                        <ConferenceMemberListBox
                          items={extensionGroups}
                          emptyText="No extension group"
                          renderItem={(group) => (
                            <label
                              key={group.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={selectedGroupIds.includes(
                                  String(group.id),
                                )}
                                onChange={() => toggleExtensionGroup(group)}
                                sx={conferenceTableCheckboxSx}
                              />
                              <span
                                style={{ fontSize: 13, color: C.labelText }}
                              >
                                {group.name}
                              </span>
                            </label>
                          )}
                        />
                      </div>
                    </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.accent,
                          marginTop: 8,
                          fontWeight: 400,
                          textAlign: "center",
                        }}
                      >
                        {CONFERENCE_MODERATOR_NOTE}
                      </div>
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div style={conferenceModalSectionStyle}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
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
                      <ConferenceFieldRow
                        label="Wait for Moderator"
                        tooltipKey="wait_for_moderator"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={waitForModerator}
                          onChange={(e) => setWaitForModerator(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                      <ConferenceFieldRow
                        label="Say Your Name"
                        tooltipKey="say_your_name"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={sayYourName}
                          onChange={(e) => setSayYourName(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <ConferenceFieldRow
                        label="Mute Participant"
                        tooltipKey="mute_participant"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={muteParticipant}
                          onChange={(e) => setMuteParticipant(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                      <ConferenceFieldRow
                        label="Allow Participant to Invite"
                        tooltipKey="allow_participant_invite"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={allowInvite}
                          onChange={(e) => setAllowInvite(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress
                size={13}
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
            variant="cancel"
            style={conferenceModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConferencePage;
