import React, { useState, useEffect, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Tooltip from "@mui/material/Tooltip";
import {Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  ListSubheader, useMediaQuery } from "@mui/material";
import {
  fetchCallQueues,
  createCallQueue,
  updateCallQueue,
  deleteCallQueue,
  listIvrDestinations,
  listCustomPrompts,
  listRingBackOptions,
} from "../../../api/apiService";
import {
  CALL_QUEUE_INITIAL_FORM,
  RING_STRATEGY_OPTIONS,
  ACTION_OPTIONS,
  ANNOUNCE_FREQ_OPTIONS,
  CALL_QUEUE_TABLE_COLUMNS,
} from "../../../constants/CallQueueConstants";
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Local page UI (pilot: inlined from pbxSharedUi) ──
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
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
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
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
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
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
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

const numManipulateCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const numManipulateToolbarStyle = {
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
        color: PBX_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);
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

const LIST_CARD_RADIUS = 10;
const listCardStyle = {
  ...numManipulateCardStyle,
  borderRadius: LIST_CARD_RADIUS,
};
const listToolbarStyle = {
  ...numManipulateToolbarStyle,
  borderTopLeftRadius: LIST_CARD_RADIUS,
  borderTopRightRadius: LIST_CARD_RADIUS,
};

const codecDualListBtnStyle = {
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

const codecDualListReorderBtnStyle = {
  ...codecDualListBtnStyle,
  fontWeight: 400,
};

const CodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={reorder ? codecDualListReorderBtnStyle : codecDualListBtnStyle}
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

const selectSx = {
  "& .MuiOutlinedInput-input": {
    padding: "4px 6px",
    fontSize: 13,
    background: "#fff",
  },
};
const inputProps = {
  style: { fontSize: 13, padding: "4px 6px", background: "#fff" },
};
const LABEL_W = 175;

const FieldRow = ({ label, children, tooltip }) => (
  <div
    className="flex items-center rounded px-2 py-0.5 gap-2"
    style={{
      minHeight: 30,
    }}
  >
    <Tooltip
      title={tooltip || ""}
      {...tooltipProps}
      disableHoverListener={!tooltip}
    >
      <label
        className="text-[13px] text-gray-700 font-medium whitespace-nowrap text-left"
        style={{
          width: LABEL_W,
          flexShrink: 0,
          position: "relative",
          left: "-8px",
          color: C.accent,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label}
      </label>
    </Tooltip>

    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const CallQueue = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ ...CALL_QUEUE_INITIAL_FORM });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState({});
  const [voicePrompts, setVoicePrompts] = useState([]);
  const [ringBackOptions, setRingBackOptions] = useState({
    moh_categories: [],
    custom_prompts: [],
    country_tones: [],
  });
  const [highlightAvail, setHighlightAvail] = useState([]);
  const [highlightSel, setHighlightSel] = useState([]);
  const hasInitialLoadRef = useRef(false);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(queues.length / itemsPerPage));
  const pagedQueues = queues.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const loadQueues = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallQueues();
      if (res?.response && res?.message) {
        const list = Array.isArray(res.message) ? res.message : [];
        setQueues(list.map((q, i) => ({ ...q, _idx: i + 1 })));
      }
    } catch (e) {
      showMsg("error", e.message || "Failed to load queues");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const ACTION_TO_DEST_KEY = {
    extensions: "Extensions",
    voicemail: "Voicemails",
    ivr_menus: "IVR",
    conference_rooms: "ConferenceRooms",
    ring_groups: "RingGroups",
    disa: "DISA",
    call_queue: "CallQueue",
    callbacks: "Callbacks",
    faxtoemail: "FaxToMail",
    other: "Other",
  };

  const getDestOptions = (action) => {
    if (!action) return [];
    const key = ACTION_TO_DEST_KEY[action];
    return key ? destinations[key] || [] : [];
  };

  const loadDestinations = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message) {
        setDestinations(res.message);
      }
    } catch (_) {}
  };

  const loadVoicePrompts = async () => {
    try {
      const res = await listCustomPrompts();
      if (res?.response) {
        const list = Array.isArray(res.message) ? res.message : [];
        setVoicePrompts(
          list
            .map((it) => ({
              value: String(
                it?.filename ||
                  it?.file_name ||
                  it?.file ||
                  it?.recording_name ||
                  "",
              ).replace(/\.[^/.]+$/, ""),
              label: String(
                it?.recording_name || it?.name || it?.filename || "",
              ).replace(/\.[^/.]+$/, ""),
            }))
            .filter((it) => it.value),
        );
      }
    } catch (_) {}
  };

  const loadRingBackOpts = async () => {
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) return;
      const msg = res?.message;
      const normalized =
        msg && typeof msg === "object" && !Array.isArray(msg) ? msg : {};
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
    } catch (_) {}
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadQueues();
      loadDestinations();
      loadVoicePrompts();
      loadRingBackOpts();
    }
  }, []);

  const apiToForm = (q) => ({
    ...CALL_QUEUE_INITIAL_FORM,
    _id: q.id,
    queue_name: q.name || "",
    queue_number: String(q.queue_number || ""),
    pin: q.pin_required ? "yes" : "no",
    agent_password: q.dynamic_pin || "",
    ring_strategy: q.ring_strategy || "ring_all",
    timeout_action: q.timeout_dest_type || "",
    timeout_action_dest: q.timeout_dest_value || "",
    caller_id_prefix: q.cid_name_prefix || "",
    overflow_action: q.overflow_dest_type || "",
    overflow_action_dest: q.overflow_dest_value || "",
    agents_initial_status: q.agents_initial_status || "logged_in",
    agent_call_timeout: q.agent_timeout ?? 15,
    agent_announcement: q.agent_announcement || "",
    agent_retry_time: q.agent_retry ?? 30,
    wrap_up_time: q.wrapup_time ?? 30,
    max_no_answer: q.max_no_answer ?? 0,
    discard_abandoned_after: q.discard_abandoned_after ?? 0,
    max_wait_time: q.max_wait_time ?? 0,
    max_queue_length: q.max_queue_length ?? 20,
    alert_info: q.alert_info || "",
    music_on_hold:
      q.moh_mode === "default" ? "default" : q.moh_value || "default",
    max_wait_no_agent: q.max_wait_no_agent_sec ?? 90,
    queue_busy_resume: q.queue_busy_resume ? "enable" : "disable",
    transfer_prompt: q.transfer_prompt || "",
    agent_busy_announce: q.agent_busy_announce || "",
    answer_announce: q.answer_announce_caller || "",
    join_when_no_agent: !!q.join_when_no_agent,
    join_announce:
      q.join_announce === "default"
        ? "default"
        : q.join_announce_custom || "default",
    join_announce_playtime: q.join_announce_playtime ?? 0,
    answer_type: q.answer_type || "answer",
    no_agent_announce: q.no_agent_announce || "",
    announce_position: q.announce_position !== false,
    announce_hold_time: q.announce_hold_time !== false,
    call_duration: q.call_duration_est_sec ?? 60,
    announce_frequency: q.announce_position_frequency ?? 30,
    periodic_sound: q.announce_sound || "default",
    periodic_frequency: q.announce_sound_frequency ?? 0,
    busy_callback: q.busy_callback_enabled ? "yes" : "no",
    busy_callback_key: String(q.busy_callback_key ?? "2"),
    busy_callback_announce: q.busy_callback_announce || "default",
    selected_agents: Array.isArray(q.members) ? q.members.map(String) : [],
  });

  const getMohFields = (val) => {
    if (!val || val === "default")
      return { moh_mode: "default", moh_value: null };
    if (ringBackOptions.moh_categories.includes(val))
      return { moh_mode: "moh", moh_value: val };
    if (ringBackOptions.custom_prompts.includes(val))
      return { moh_mode: "custom", moh_value: val };
    if (ringBackOptions.country_tones.includes(val))
      return { moh_mode: "tone", moh_value: val };
    return { moh_mode: "default", moh_value: null };
  };

  const nullIfEmpty = (v) => (v === "" || v == null ? null : v);

  const buildPayload = (f) => ({
    ...(f._id != null ? { id: f._id } : {}),
    name: f.queue_name,
    queue_number: Number(f.queue_number),
    enabled: true,
    pin_required: f.pin === "yes",
    dynamic_pin: f.pin === "yes" ? f.agent_password : null,
    ring_strategy: f.ring_strategy,
    timeout_dest_type: f.timeout_action || null,
    timeout_dest_value: nullIfEmpty(f.timeout_action_dest),
    overflow_dest_type: f.overflow_action || null,
    overflow_dest_value: nullIfEmpty(f.overflow_action_dest),
    cid_name_prefix: nullIfEmpty(f.caller_id_prefix),
    agents_initial_status: f.agents_initial_status,
    agent_timeout: Number(f.agent_call_timeout),
    agent_announcement: nullIfEmpty(f.agent_announcement),
    agent_retry: Number(f.agent_retry_time),
    wrapup_time: Number(f.wrap_up_time),
    max_no_answer: Number(f.max_no_answer),
    discard_abandoned_after: Number(f.discard_abandoned_after) || null,
    max_wait_time: Number(f.max_wait_time),
    max_queue_length: Number(f.max_queue_length),
    alert_info: nullIfEmpty(f.alert_info),
    ...getMohFields(f.music_on_hold),
    max_wait_no_agent_sec: Number(f.max_wait_no_agent),
    queue_busy_resume: f.queue_busy_resume === "enable",
    transfer_prompt: nullIfEmpty(f.transfer_prompt),
    agent_busy_announce: nullIfEmpty(f.agent_busy_announce),
    answer_announce_caller: nullIfEmpty(f.answer_announce),
    join_when_no_agent: !!f.join_when_no_agent,
    join_announce: f.join_announce === "default" ? "default" : "custom",
    join_announce_custom:
      f.join_announce === "default" ? null : f.join_announce,
    join_announce_playtime: Number(f.join_announce_playtime),
    answer_type: f.answer_type,
    no_agent_announce: nullIfEmpty(f.no_agent_announce),
    announce_position: !!f.announce_position,
    announce_hold_time: !!f.announce_hold_time,
    call_duration_est_sec: Number(f.call_duration),
    announce_position_frequency: Number(f.announce_frequency),
    announce_sound: f.periodic_sound || "default",
    announce_sound_frequency: Number(f.periodic_frequency),
    busy_callback_enabled: f.busy_callback === "yes",
    busy_callback_key: String(f.busy_callback_key),
    busy_callback_announce: nullIfEmpty(f.busy_callback_announce),
    members: f.selected_agents,
  });

  const handleOpenModal = (row = null, idx = null) => {
    setForm(row ? apiToForm(row) : { ...CALL_QUEUE_INITIAL_FORM });
    setEditIndex(idx);
    setActiveTab("basic");
    setHighlightAvail([]);
    setHighlightSel([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setActiveTab("basic");
  };

  const handleSave = async () => {
    if (!form.queue_name.trim()) {
      showMsg("error", "Queue Name is required");
      return;
    }
    if (!String(form.queue_number).trim()) {
      showMsg("error", "Queue Number is required");
      return;
    }
    if (form.pin === "yes" && form.agent_password.length < 2) {
      showMsg("error", "Agent Password must be 2 to 4 digits");
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const fn = editIndex !== null ? updateCallQueue : createCallQueue;
      const res = await fn(buildPayload(form));
      if (res?.response) {
        showMsg(
          "success",
          editIndex !== null ? "Queue updated" : "Queue created",
        );
        handleCloseModal();
        await loadQueues();
      } else {
        showMsg("error", res?.message || "Save failed");
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMsg("info", "No queues selected");
      return;
    }
    if (!window.confirm(`Delete ${selected.length} queue(s)?`)) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const q = queues.find((x) => x._idx === idx);
        if (q) await deleteCallQueue(q.id);
      }
      showMsg("success", `${selected.length} queue(s) deleted`);
      setSelected([]);
      await loadQueues();
    } catch (e) {
      showMsg("error", e.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleInverse = () =>
    setSelected(
      pagedQueues.map((q) => q._idx).filter((i) => !selected.includes(i)),
    );
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
    );

  const pageIndices = pagedQueues.map((q) => q._idx);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const extensionsList = Array.isArray(destinations.Extensions)
    ? destinations.Extensions
    : [];
  const computedAvailable = extensionsList.filter(
    (e) => !(form.selected_agents || []).includes(e.value),
  );

  const moveToSelected = (all) => {
    const toMove = all ? computedAvailable.map((e) => e.value) : highlightAvail;
    handleChange("selected_agents", [
      ...(form.selected_agents || []),
      ...toMove.filter((v) => !(form.selected_agents || []).includes(v)),
    ]);
    setHighlightAvail([]);
  };
  const moveToAvailable = (all) => {
    const toRemove = all ? form.selected_agents || [] : highlightSel;
    handleChange(
      "selected_agents",
      (form.selected_agents || []).filter((v) => !toRemove.includes(v)),
    );
    setHighlightSel([]);
  };
  const moveUp = () => {
    if (!highlightSel.length) return;
    const arr = [...(form.selected_agents || [])];
    for (let i = 1; i < arr.length; i++) {
      if (highlightSel.includes(arr[i]) && !highlightSel.includes(arr[i - 1])) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
    }
    handleChange("selected_agents", arr);
  };
  const moveDown = () => {
    if (!highlightSel.length) return;
    const arr = [...(form.selected_agents || [])];
    for (let i = arr.length - 2; i >= 0; i--) {
      if (highlightSel.includes(arr[i]) && !highlightSel.includes(arr[i + 1])) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
    handleChange("selected_agents", arr);
  };
  const moveToTop = () => {
    if (!highlightSel.length) return;
    const arr = form.selected_agents || [];
    const chosen = arr.filter((v) => highlightSel.includes(v));
    const rest = arr.filter((v) => !highlightSel.includes(v));
    handleChange("selected_agents", [...chosen, ...rest]);
  };
  const moveToBottom = () => {
    if (!highlightSel.length) return;
    const arr = form.selected_agents || [];
    const rest = arr.filter((v) => !highlightSel.includes(v));
    const chosen = arr.filter((v) => highlightSel.includes(v));
    handleChange("selected_agents", [...rest, ...chosen]);
  };

  const ringStrategyLabel = (v) =>
    RING_STRATEGY_OPTIONS.find((o) => o.value === v)?.label || v;

  return (
    <div style={{ ...pbxPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
        {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        className="z-50"
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            pt: 5,
          },
        }}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 900,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
          },
        }}
        disableRestoreFocus
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
           
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          {editIndex !== null ? "Edit Call Queue" : "Add Call Queue"}
        </DialogTitle>
        <PbxModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "caller", label: "CALLER EXPERIENCE SETTINGS" },
          ]}
        />
        <DialogContent
          sx={{
            p: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: PBX_MODAL_SECTION_BG,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            {/* ── BASIC TAB ── */}
            {activeTab === "basic" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Queue Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Queue Name *"
                    tooltip="User-defined name of a call queue. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters."
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_name}
                        onChange={(e) =>
                          handleChange("queue_name", e.target.value)
                        }
                        inputProps={inputProps}
                      />
                    </FieldRow>
                    <FieldRow label="Agent Call Timeout (s)"
                    tooltip="The maximum time for each agent to ring. the default value is 15 seconds."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_call_timeout}
                        onChange={(e) =>
                          handleChange("agent_call_timeout", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Queue Number *"
                    tooltip="The number dialed to reach this call queue, with the default value range of 6700~6750 which can be modiied in 'PBX-Preference->Extension Preferences'. It is null by default and must be filled in: otherwise the configuration will fail to be saved."
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.queue_number}
                        onChange={(e) =>
                          handleChange("queue_number", e.target.value)
                        }
                        inputProps={inputProps}
                      />
                    </FieldRow>
                    <FieldRow label="Agent Announcement"
                    tooltip="Announcement played to the Agent prior to bridging in the caller."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_announcement}
                          onChange={(e) =>
                            handleChange("agent_announcement", e.target.value)
                          }
                          sx={selectSx}
                          displayEmpty
                        >
                          <MenuItem value="">Null</MenuItem>
                          <MenuItem value="call_from_queue_number">
                            Call From Queue Number
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem key={vp.value} value={vp.value}>
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Pin *"
                    tooltip="Set whether a password is needed for entering this call queue. The default setting is No."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.pin}
                          onChange={(e) => handleChange("pin", e.target.value)}
                          sx={selectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Agent Retry Time (s)"
                    tooltip="Interval between calling the agent again after the failure of calling the agent. The default value is 30s."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.agent_retry_time}
                        onChange={(e) =>
                          handleChange("agent_retry_time", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    {form.pin === "yes" && (
                      <FieldRow label="Agent Password *"
                      tooltip="Set the password for dynamic agents to enter this call queue. It is null by default and must be filled in: otherwise the configuration will fail to be saved."
                      >
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={form.agent_password}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            handleChange("agent_password", val);
                          }}
                          inputProps={{
                            ...inputProps,
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                            maxLength: 4,
                          }}
                        />
                      </FieldRow>
                    )}
                    <FieldRow label="Wrap Up Time (s)"
                    tooltip="How many seconds after the completion of a call an Agent will have before the queue can ring them with a new call. The default value is 30s."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.wrap_up_time}
                        onChange={(e) =>
                          handleChange("wrap_up_time", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Ring Strategy *"
                    tooltip="Selct the ring strategy for this queue. Ring all: All available agents ring. Longest idle agent(default): The agent keeping idle for the longest time rings first. Round Robin: All available agents ring randomly. Agent with least talk time: The agent whose total call time is shortest rings first. Agent with fewest calls: The agent with the fewest calls rings first. Agent with fewest calls: The agent with the fewest calls rings first. Agent with fewest calls: The agent with the fewest calls rings first. Top Down: The agents ring from top to down in the order already configured."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_strategy}
                          onChange={(e) =>
                            handleChange("ring_strategy", e.target.value)
                          }
                          sx={selectSx}
                        >
                          {RING_STRATEGY_OPTIONS.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Max No Answer " 
                    tooltip="The allowed number of consecutive unanswered calls. 0 means no limit and the default value is 0."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_no_answer}
                        onChange={(e) =>
                          handleChange("max_no_answer", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    {/* Timeout Action + destination */}
                    <div
                      className="flex items-center rounded px-2 py-0.5 gap-2"
                      style={{
                        minHeight: 30,
                      }}
                    >
                      <Tooltip
  title="Select the action to perform when the timeout period is reached without any user input."
  {...tooltipProps}
>
  <label
    className="text-[13px] font-medium whitespace-nowrap text-left"
    style={{
      width: LABEL_W,
      flexShrink: 0,
      color: C.accent,
      position: "relative",
      left: "-8px",
      cursor: "help",
    }}
  >
    Timeout Action
  </label>
</Tooltip>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.timeout_action}
                            onChange={(e) => {
                              handleChange("timeout_action", e.target.value);
                              handleChange("timeout_action_dest", "");
                            }}
                            sx={selectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.timeout_action && (
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.timeout_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "timeout_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={selectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.timeout_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <FieldRow label="Discard Abandoned After(s)"
                    tooltip="Set the discard abandoned after seconds."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.discard_abandoned_after}
                        onChange={(e) =>
                          handleChange(
                            "discard_abandoned_after",
                            e.target.value,
                          )
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Caller ID Name Prefix"
                    tooltip="Theprefix of a caller ID name sent when the queue allocates a call to the agent. By default it is null."
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.caller_id_prefix}
                        onChange={(e) =>
                          handleChange("caller_id_prefix", e.target.value)
                        }
                        inputProps={inputProps}
                      />
                    </FieldRow>
                    <FieldRow label="Max Wait Time (s)"
                    tooltip="The maximum time for a caller to wait in the queue. 0 means no limit and the default value is 0."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_time}
                        onChange={(e) =>
                          handleChange("max_wait_time", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    {/* Overflow Action + destination */}
                    <div
                      className="flex items-center rounded px-2 py-0.5 gap-2"
                      style={{
                        minHeight: 30,
                      }}
                    ><Tooltip
                    title="Transfer to the destination when the number of calling parties in the queue exceeds the upper limit."
                    {...tooltipProps}
                  >
                    <label
                      className="text-[13px] font-medium whitespace-nowrap text-left"
                      style={{
                        width: LABEL_W,
                        flexShrink: 0,
                        color: C.accent,
                        position: "relative",
                        left: "-8px",
                        cursor: "help",
                      }}
                    >
                      Overflow Action
                    </label>
                  </Tooltip>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect
                            value={form.overflow_action}
                            onChange={(e) => {
                              handleChange("overflow_action", e.target.value);
                              handleChange("overflow_action_dest", "");
                            }}
                            sx={selectSx}
                          >
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.overflow_action && (
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect
                              value={form.overflow_action_dest || ""}
                              onChange={(e) =>
                                handleChange(
                                  "overflow_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={selectSx}
                              displayEmpty
                              renderValue={(v) =>
                                v || (
                                  <span style={{ color: "#999", fontSize: 12 }}>
                                    Select...
                                  </span>
                                )
                              }
                            >
                              <MenuItem value="">
                                <em style={{ fontSize: 12 }}>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.overflow_action).map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <FieldRow label="Max Queue Length"
                    tooltip="The maximum number of calls that can be in the queue at the same time. The default value is 20."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_queue_length}
                        onChange={(e) =>
                          handleChange("max_queue_length", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Agents Initial Status"
                    tooltip="Sets the initial status of the static agents."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agents_initial_status}
                          onChange={(e) =>
                            handleChange(
                              "agents_initial_status",
                              e.target.value,
                            )
                          }
                          sx={selectSx}
                        >
                          <MenuItem value="logged_in">Logged In</MenuItem>
                          <MenuItem value="logged_out">Logged Out</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Alert info"
                    tooltip="Set the content of the alert-info field. By default it is null."
                    >
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.alert_info}
                        onChange={(e) =>
                          handleChange("alert_info", e.target.value)
                        }
                        inputProps={inputProps}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Agents">
                  <div className="pt-0 px-0 pb-1">
                    <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                      {/* Available */}
                      <div>
                        <div className="text-[13px] font-semibold text-[#30415A] text-center mb-2">
                          Available
                        </div>
                        <select
                          multiple
                          className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                          value={highlightAvail}
                          onChange={(e) =>
                            setHighlightAvail(
                              Array.from(
                                e.target.selectedOptions,
                                (o) => o.value,
                              ),
                            )
                          }
                        >
                          {computedAvailable.map((e) => (
                            <option key={e.value} value={e.value}>
                              {e.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Move left↔right buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          paddingTop: 28,
                        }}
                      >
                        <CodecDualListBtn onClick={() => moveToSelected(false)}>
                          &gt;
                        </CodecDualListBtn>
                        <CodecDualListBtn onClick={() => moveToSelected(true)}>
                          &gt;&gt;
                        </CodecDualListBtn>
                        <CodecDualListBtn
                          onClick={() => moveToAvailable(false)}
                        >
                          &lt;
                        </CodecDualListBtn>
                        <CodecDualListBtn onClick={() => moveToAvailable(true)}>
                          &lt;&lt;
                        </CodecDualListBtn>
                      </div>

                      {/* Selected */}
                      <div>
                        <div className="text-[13px] font-semibold text-[#30415A] text-center mb-2">
                          Selected
                        </div>
                        <select
                          multiple
                          className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                          value={highlightSel}
                          onChange={(e) =>
                            setHighlightSel(
                              Array.from(
                                e.target.selectedOptions,
                                (o) => o.value,
                              ),
                            )
                          }
                        >
                          {(form.selected_agents || []).map((v) => {
                            const ext = extensionsList.find(
                              (e) => e.value === v,
                            );
                            return (
                              <option key={v} value={v}>
                                {ext?.label || v}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Reorder buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          paddingTop: 28,
                        }}
                      >
                        <CodecDualListBtn
                          reorder
                          title="Move to bottom"
                          onClick={moveToBottom}
                        >
                          vv
                        </CodecDualListBtn>
                        <CodecDualListBtn
                          reorder
                          title="Move up"
                          onClick={moveUp}
                        >
                          ^
                        </CodecDualListBtn>
                        <CodecDualListBtn
                          reorder
                          title="Move down"
                          onClick={moveDown}
                        >
                          v
                        </CodecDualListBtn>
                        <CodecDualListBtn
                          reorder
                          title="Move to top"
                          onClick={moveToTop}
                        >
                          ^^
                        </CodecDualListBtn>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── CALLER EXPERIENCE SETTINGS TAB ── */}
            {activeTab === "caller" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="Caller Settings" isFirst>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Music on Hold *"
                    tooltip="Select the music on hold to play when the caller enters this queue. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.music_on_hold}
                          onChange={(e) =>
                            handleChange("music_on_hold", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {ringBackOptions.moh_categories.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Music on Hold
                            </ListSubheader>
                          )}
                          {ringBackOptions.moh_categories.map((opt) => (
                            <MenuItem
                              key={`moh-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.custom_prompts.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Custom Prompt
                            </ListSubheader>
                          )}
                          {ringBackOptions.custom_prompts.map((opt) => (
                            <MenuItem
                              key={`prompt-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.country_tones.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "36px",
                              }}
                            >
                              Ring Back
                            </ListSubheader>
                          )}
                          {ringBackOptions.country_tones.map((opt) => (
                            <MenuItem
                              key={`tone-${opt}`}
                              value={opt}
                              sx={{ fontSize: 14, pl: 3 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Join When No Agent"
                    tooltip="If enabled, callers can join a queue that has no agents. By default it is unticked."
                    >
                      <Checkbox
                        checked={!!form.join_when_no_agent}
                        onChange={(e) =>
                          handleChange("join_when_no_agent", e.target.checked)
                        }
                        size="small"
                        sx={checkboxSx}
                      />
                    </FieldRow>

                    <FieldRow label="Max Wait Time No Agent (s)"
                    tooltip="The maximum time for a caller to wait in the queue when there are no agents available. The default value is 90s."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.max_wait_no_agent}
                        onChange={(e) =>
                          handleChange("max_wait_no_agent", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>
                    <FieldRow label="Join Announce"
                    tooltip="Select the announcement to play when a caller joins the queue. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.join_announce}
                          onChange={(e) =>
                            handleChange("join_announce", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Queue Busy Resume Offer"
                    tooltip="Set whether to offer the caller to join the queue when the queue is busy. The default setting is Enable."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.queue_busy_resume}
                          onChange={(e) =>
                            handleChange("queue_busy_resume", e.target.value)
                          }
                          sx={selectSx}
                        >
                          <MenuItem value="enable">Enable</MenuItem>
                          <MenuItem value="disable">Disable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Join Announce Playtime"
                    tooltip="Set the playtime of the join announcement. The default value is 0."
                    >
                        <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.join_announce_playtime}
                        onChange={(e) =>
                          handleChange("join_announce_playtime", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Transfer Prompt"
                    tooltip="The caller waiting in the queue will hear a periodic announcement at configured intervals. When an agent answers the call, the transfer prompt tone will be played before connecting the caller. Leave this field empty (NULL) to use the system default behavior."
                    >
                      <FormControl fullWidth size="small">  
                        <MuiSelect
                          value={form.transfer_prompt}
                          onChange={(e) =>
                            handleChange("transfer_prompt", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Answer Type"
                    tooltip="Select the type of answer for the caller. Answer: The caller will hear the answer tone when an agent answers the call. Progress: The caller will hear the progress tone when an agent answers the call."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_type}
                          onChange={(e) =>
                            handleChange("answer_type", e.target.value)
                          }
                          sx={selectSx}
                        >
                          <MenuItem value="answer">Answer</MenuItem>
                          <MenuItem value="progress">Progress</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                      <FieldRow label="Agent Busy Announce"
                      tooltip="Select the announcement to play when the agent is busy. By default it is null."
                      >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_busy_announce}
                          onChange={(e) =>
                            handleChange("agent_busy_announce", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="No Agent Announce"
                    tooltip="Select the announcement to play when there are no agents available. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.no_agent_announce}
                          onChange={(e) =>
                            handleChange("no_agent_announce", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Answer Announce To Caller"
                    tooltip="Select the announcement to play when the agent answers the call. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_announce}
                          onChange={(e) =>
                            handleChange("answer_announce", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => {
                            if (!v) return "";
                            if (v === "agent_id") return "Play AgentID Prompt";
                            const found = voicePrompts.find(
                              (vp) => vp.value === v,
                            );
                            return found ? found.label : v;
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="agent_id" sx={{ fontSize: 14 }}>
                            Play AgentID Prompt
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Caller Position Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Announce Position"
                    tooltip="Set whether to announce the position of the caller in the queue. By default it is unticked."
                    >
                      <Checkbox
                        checked={!!form.announce_position}
                        onChange={(e) =>
                          handleChange("announce_position", e.target.checked)
                        }
                        size="small"
                        sx={checkboxSx}
                      />
                    </FieldRow>
                    <FieldRow label="Call Duration(s)"
                    tooltip="Set the duration of the call. The default value is 60s."
                    >
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={form.call_duration}
                        onChange={(e) =>
                          handleChange("call_duration", e.target.value)
                        }
                        inputProps={{ ...inputProps, min: 0 }}
                      />
                    </FieldRow>

                    <FieldRow label="Announce Hold Time"
                    tooltip="Set whether to announce the hold time of the caller. By default it is unticked."
                    >
                      <Checkbox
                        checked={!!form.announce_hold_time}
                        onChange={(e) =>
                          handleChange("announce_hold_time", e.target.checked)
                        }
                        size="small"
                        sx={checkboxSx}
                      />
                    </FieldRow>
                    <FieldRow label="Announce Frequency(s)"
                    tooltip="Set the frequency of the announcement. The default value is 30s."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.announce_frequency}
                          onChange={(e) =>
                            handleChange("announce_frequency", e.target.value)
                          }
                          sx={selectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Periodic Announcements">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Announce Sound"
                    tooltip="Select the sound to play when the announcement is made. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_sound}
                          onChange={(e) =>
                            handleChange("periodic_sound", e.target.value)
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Announce Frequency(s)"
                    tooltip="Set the frequency of the announcement. The default value is 0."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_frequency}
                          onChange={(e) =>
                            handleChange("periodic_frequency", e.target.value)
                          }
                          sx={selectSx}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="Busy Callback">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Enable Busy Callback"
                    tooltip="Set whether to enable the busy callback. The default setting is No."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback}
                          onChange={(e) =>
                            handleChange("busy_callback", e.target.value)
                          }
                          sx={selectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Busy Callback Announce"
                    tooltip="Select the announcement to play when the agent is busy. By default it is null."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_announce}
                          onChange={(e) =>
                            handleChange(
                              "busy_callback_announce",
                              e.target.value,
                            )
                          }
                          sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={(v) => v || ""}
                        >
                          <MenuItem value="default" sx={{ fontSize: 14 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 14 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                      <FieldRow label="Agent Busy Callback Key"
                    tooltip="Set the key to press to enable the busy callback. The default value is 8."
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_key}
                          onChange={(e) =>
                            handleChange("busy_callback_key", e.target.value)
                          }
                          sx={selectSx}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.cardBorder}`,
            backgroundColor: "#f8fafc",
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
                <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
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
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>

      <div style={pbxPageInnerStyle}>
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

        <PbxBreadcrumb section="Call Features" current="Call Queue" />

        <div style={listCardStyle}>
          <div style={listToolbarStyle}>
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
                variant="cancel"
                onClick={handleInverse}
                disabled={
                  loading.delete || loading.fetch || queues.length === 0
                }
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
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

          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : queues.length === 0 ? (
              <TableListEmptyState
                message="No call queues found."
                onAddNew={() => handleOpenModal()}
              />
            ) : (
             <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",

                  minWidth: 700, ...(isCompact ? { minWidth: 720 } : {}),

                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
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
                    <TH style={{ width: 36 }}>#</TH>
                    <TH>Queue Name</TH>
                    <TH>Queue Number</TH>
                    <TH>Ring Strategy</TH>
                    <TH>Agents</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedQueues.map((q, i) => {
                    const isSelected = selected.includes(q._idx);
                    const isLastRow = i === pagedQueues.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : i % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={q._idx}
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
                            onChange={() => handleSelectRow(q._idx)}
                            disabled={loading.delete}
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
                          {(page - 1) * itemsPerPage + i + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            fontWeight: 600,
                          }}
                        >
                          {q.name || "--"}
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
                          {q.queue_number || "--"}
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
                          {ringStrategyLabel(q.ring_strategy)}
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
                          {Array.isArray(q.members) ? q.members.length : 0}
                        </td>
                        <td

                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                            textAlign: "center",
                            padding: "7px 8px",
                          }}
                        >
                                                    <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => handleOpenModal(q, q._idx)}
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

          {!isInitialLoad && queues.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                borderBottomLeftRadius: LIST_CARD_RADIUS,
                borderBottomRightRadius: LIST_CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedQueues.length} record
                {pagedQueues.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.fetch || page <= 1}
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
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

export default CallQueue;
