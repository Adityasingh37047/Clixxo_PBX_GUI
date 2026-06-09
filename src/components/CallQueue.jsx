import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  CircularProgress,
  Checkbox,
  InputAdornment,
  IconButton,
  ListSubheader,
  Alert,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import {
  fetchCallQueues,
  createCallQueue,
  updateCallQueue,
  deleteCallQueue,
  listIvrDestinations,
  listCustomPrompts,
  listRingBackOptions,
} from "../api/apiService";
import {
  CALL_QUEUE_INITIAL_FORM,
  RING_STRATEGY_OPTIONS,
  ACTION_OPTIONS,
  ANNOUNCE_FREQ_OPTIONS,
} from "../constants/CallQueueConstants";

const YES_NO_OPTIONS = ["Yes", "No"];

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
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

// ── Sub-heading with cut line ────────────────────────────────────────────────
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

const CallQueue = () => {
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
  const [lastUpdated, setLastUpdated] = useState(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const itemsPerPage = 20;

  const [destinations, setDestinations] = useState({});
  const [voicePrompts, setVoicePrompts] = useState([]);
  const [ringBackOptions, setRingBackOptions] = useState({
    moh_categories: [],
    custom_prompts: [],
    country_tones: [],
  });

  const [highlightAvail, setHighlightAvail] = useState([]);
  const [highlightSel, setHighlightSel] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const hasInitialLoadRef = useRef(false);

  const showMessage = (type, text) => {
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
        setLastUpdated(new Date());
      }
    } catch (e) {
      showMessage("error", e.message || "Failed to load queues");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
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
      if (res?.response && res?.message) setDestinations(res.message);
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

  const filteredRows = searchQuery.trim()
    ? queues.filter((q) =>
        [q.name, String(q.queue_number)].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : queues;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedQueues = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleCheckAll = () => setSelected(pagedQueues.map((q) => q._idx));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
    );
  const handleInverse = () =>
    setSelected(
      pagedQueues.map((q) => q._idx).filter((i) => !selected.includes(i)),
    );

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
    setShowPassword(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setActiveTab("basic");
  };

  const handleSave = async () => {
    if (!form.queue_name.trim())
      return showMessage("error", "Queue Name is required");
    if (!String(form.queue_number).trim())
      return showMessage("error", "Queue Number is required");
    if (form.pin === "yes" && form.agent_password.length < 2)
      return showMessage("error", "Agent Password must be 2 to 4 digits");

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const fn = editIndex !== null ? updateCallQueue : createCallQueue;
      const res = await fn(buildPayload(form));
      if (res?.response) {
        showMessage(
          "success",
          editIndex !== null
            ? "Queue updated successfully"
            : "Queue created successfully",
        );
        handleCloseModal();
        await loadQueues();
      } else {
        showMessage("error", res?.message || "Save failed");
      }
    } catch (e) {
      showMessage("error", e.message || "Save failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0)
      return showMessage(
        "error",
        "Please select at least one queue to delete.",
      );
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const q = queues.find((x) => x._idx === idx);
        if (q) await deleteCallQueue(q.id);
      }
      showMessage(
        "success",
        `${selected.length} queue(s) deleted successfully`,
      );
      setSelected([]);
      await loadQueues();
    } catch (e) {
      showMessage("error", e.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // ── Dual Listbox Logic ──
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
    if (highlightSel.length !== 1) return;
    const arr = [...(form.selected_agents || [])];
    const i = arr.indexOf(highlightSel[0]);
    if (i > 0) {
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      handleChange("selected_agents", arr);
    }
  };
  const moveDown = () => {
    if (highlightSel.length !== 1) return;
    const arr = [...(form.selected_agents || [])];
    const i = arr.indexOf(highlightSel[0]);
    if (i < arr.length - 1) {
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      handleChange("selected_agents", arr);
    }
  };

  const ringStrategyLabel = (v) =>
    RING_STRATEGY_OPTIONS.find((o) => o.value === v)?.label || v;

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
              Call Queue
            </span>
          </div>
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
              <Btn
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                variant="outline"
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.fetch ? (
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
                        checked={
                          pagedQueues.length > 0 &&
                          selected.length === pagedQueues.length
                        }
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < pagedQueues.length
                        }
                        onChange={
                          selected.length === pagedQueues.length
                            ? handleUncheckAll
                            : handleCheckAll
                        }
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
                      Queue Name
                    </TH>
                    <TH>Queue Number</TH>
                    <TH>Ring Strategy</TH>
                    <TH>Agents</TH>
                    <TH style={{ width: 60 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedQueues.length === 0 ? (
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
                          : "No Call Queues found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedQueues.map((q, idx) => {
                      const isSelected = selected.includes(q._idx);
                      const rowBgColor = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={q._idx}
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
                              onChange={() => handleSelectRow(q._idx)}
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
                            {(page - 1) * itemsPerPage + idx + 1}
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
                            {q.name || "—"}
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
                            {q.queue_number || "—"}
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
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              {ringStrategyLabel(q.ring_strategy)}
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
                            {Array.isArray(q.members) ? q.members.length : 0}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenModal(q, q._idx)}
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
          {!loading.fetch && filteredRows.length > 0 && (
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
                Showing {pagedQueues.length} record
                {pagedQueues.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
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
            padding: "14px 24px 0",
          }}
        >
          {editIndex != null ? "Edit Call Queue" : "Add Call Queue"}

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
              { id: "caller", label: "CALLER EXPERIENCE" },
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
                  padding: "20px 24px 16px",
                }}
              >
                <SectionHeading title="Queue Settings" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
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
                    <FieldRow label="Queue Name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.queue_name}
                        onChange={(e) =>
                          handleChange("queue_name", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Queue Number" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.queue_number}
                        onChange={(e) =>
                          handleChange("queue_number", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Ring Strategy" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.ring_strategy}
                          onChange={(e) =>
                            handleChange("ring_strategy", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          {RING_STRATEGY_OPTIONS.map((o) => (
                            <MenuItem
                              key={o.value}
                              value={o.value}
                              sx={{ fontSize: 13 }}
                            >
                              {o.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Agent Call Timeout (s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.agent_call_timeout}
                        onChange={(e) =>
                          handleChange("agent_call_timeout", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Agent Retry Time (s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.agent_retry_time}
                        onChange={(e) =>
                          handleChange("agent_retry_time", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Wrap Up Time (s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.wrap_up_time}
                        onChange={(e) =>
                          handleChange("wrap_up_time", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Pin" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.pin}
                          onChange={(e) => handleChange("pin", e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="yes" sx={{ fontSize: 13 }}>
                            Yes
                          </MenuItem>
                          <MenuItem value="no" sx={{ fontSize: 13 }}>
                            No
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    {form.pin === "yes" && (
                      <FieldRow label="Agent Password" required>
                        <TextField
                          size="small"
                          fullWidth
                          type={showPassword ? "text" : "password"}
                          value={form.agent_password}
                          onChange={(e) =>
                            handleChange(
                              "agent_password",
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <VisibilityOff sx={{ fontSize: 16 }} />
                                  ) : (
                                    <Visibility sx={{ fontSize: 16 }} />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FieldRow>
                    )}
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Max Wait Time (s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.max_wait_time}
                        onChange={(e) =>
                          handleChange("max_wait_time", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Max No Answer">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.max_no_answer}
                        onChange={(e) =>
                          handleChange("max_no_answer", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Max Queue Length">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.max_queue_length}
                        onChange={(e) =>
                          handleChange("max_queue_length", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Agents Initial Status">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.agents_initial_status}
                          onChange={(e) =>
                            handleChange(
                              "agents_initial_status",
                              e.target.value,
                            )
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="logged_in" sx={{ fontSize: 13 }}>
                            Logged In
                          </MenuItem>
                          <MenuItem value="logged_out" sx={{ fontSize: 13 }}>
                            Logged Out
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Caller ID Name Prefix">
                      <TextField
                        size="small"
                        fullWidth
                        value={form.caller_id_prefix}
                        onChange={(e) =>
                          handleChange("caller_id_prefix", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Discard Abandoned After(s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.discard_abandoned_after}
                        onChange={(e) =>
                          handleChange(
                            "discard_abandoned_after",
                            e.target.value,
                          )
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Alert Info">
                      <TextField
                        size="small"
                        fullWidth
                        value={form.alert_info}
                        onChange={(e) =>
                          handleChange("alert_info", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                  </div>
                </div>

                <SectionHeading title="Routing Settings" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Timeout Action">
                      <div style={{ display: "flex", gap: 8 }}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <MuiSelect
                            value={form.timeout_action}
                            displayEmpty
                            onChange={(e) => {
                              handleChange("timeout_action", e.target.value);
                              handleChange("timeout_action_dest", "");
                            }}
                            sx={{ fontSize: 13 }}
                          >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                              <em>Select...</em>
                            </MenuItem>
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem
                                key={o.value}
                                value={o.value}
                                sx={{ fontSize: 13 }}
                              >
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {form.timeout_action && (
                          <FormControl size="small" sx={{ flex: 1 }}>
                            <MuiSelect
                              value={form.timeout_action_dest || ""}
                              displayEmpty
                              onChange={(e) =>
                                handleChange(
                                  "timeout_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={{ fontSize: 13 }}
                            >
                              <MenuItem value="" sx={{ fontSize: 13 }}>
                                <em>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.timeout_action).map((o) => (
                                <MenuItem
                                  key={o.value}
                                  value={o.value}
                                  sx={{ fontSize: 13 }}
                                >
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        )}
                      </div>
                    </FieldRow>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Overflow Action">
                      <div style={{ display: "flex", gap: 8 }}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <MuiSelect
                            value={form.overflow_action}
                            displayEmpty
                            onChange={(e) => {
                              handleChange("overflow_action", e.target.value);
                              handleChange("overflow_action_dest", "");
                            }}
                            sx={{ fontSize: 13 }}
                          >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                              <em>Select...</em>
                            </MenuItem>
                            {ACTION_OPTIONS.map((o) => (
                              <MenuItem
                                key={o.value}
                                value={o.value}
                                sx={{ fontSize: 13 }}
                              >
                                {o.label}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {form.overflow_action && (
                          <FormControl size="small" sx={{ flex: 1 }}>
                            <MuiSelect
                              value={form.overflow_action_dest || ""}
                              displayEmpty
                              onChange={(e) =>
                                handleChange(
                                  "overflow_action_dest",
                                  e.target.value,
                                )
                              }
                              sx={{ fontSize: 13 }}
                            >
                              <MenuItem value="" sx={{ fontSize: 13 }}>
                                <em>Select...</em>
                              </MenuItem>
                              {getDestOptions(form.overflow_action).map((o) => (
                                <MenuItem
                                  key={o.value}
                                  value={o.value}
                                  sx={{ fontSize: 13 }}
                                >
                                  {o.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        )}
                      </div>
                    </FieldRow>
                  </div>
                </div>

                <SectionHeading title="Agents" />
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
                      value={highlightAvail}
                      onChange={(e) =>
                        setHighlightAvail(
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      style={{
                        width: "100%",
                        height: 160,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 13,
                        outline: "none",
                        background: "#f8fafc",
                      }}
                    >
                      {computedAvailable.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      justifyContent: "center",
                      paddingTop: 24,
                    }}
                  >
                    <Btn
                      onClick={() => moveToSelected(false)}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &gt;
                    </Btn>
                    <Btn
                      onClick={() => moveToSelected(true)}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &gt;&gt;
                    </Btn>
                    <Btn
                      onClick={() => moveToAvailable(false)}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &lt;
                    </Btn>
                    <Btn
                      onClick={() => moveToAvailable(true)}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 12 }}
                    >
                      &lt;&lt;
                    </Btn>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
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
                        value={highlightSel}
                        onChange={(e) =>
                          setHighlightSel(
                            Array.from(
                              e.target.selectedOptions,
                              (o) => o.value,
                            ),
                          )
                        }
                        style={{
                          width: "100%",
                          height: 160,
                          border: `1px solid ${C.cardBorder}`,
                          borderRadius: 4,
                          padding: 8,
                          fontSize: 13,
                          outline: "none",
                          background: "#fff",
                        }}
                      >
                        {(form.selected_agents || []).map((v) => {
                          const ext = extensionsList.find((e) => e.value === v);
                          return (
                            <option key={v} value={v}>
                              {ext?.label || v}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        paddingTop: 24,
                      }}
                    >
                      <Btn
                        onClick={moveUp}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 14 }}
                      >
                        &#8593;
                      </Btn>
                      <Btn
                        onClick={moveDown}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 14 }}
                      >
                        &#8595;
                      </Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CALLER EXPERIENCE TAB ── */}
          {activeTab === "caller" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: "20px 24px 16px",
                }}
              >
                <SectionHeading title="Caller Settings" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Music on Hold">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.music_on_hold}
                          onChange={(e) =>
                            handleChange("music_on_hold", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                        >
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
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
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Join When No Agent">
                      <Checkbox
                        checked={!!form.join_when_no_agent}
                        onChange={(e) =>
                          handleChange("join_when_no_agent", e.target.checked)
                        }
                        size="small"
                        sx={{
                          p: 0,
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Join Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.join_announce}
                          onChange={(e) =>
                            handleChange("join_announce", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Max Wait Time No Agent(s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.max_wait_no_agent}
                        onChange={(e) =>
                          handleChange("max_wait_no_agent", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Answer Type">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.answer_type}
                          onChange={(e) =>
                            handleChange("answer_type", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="answer" sx={{ fontSize: 13 }}>
                            Answer
                          </MenuItem>
                          <MenuItem value="progress" sx={{ fontSize: 13 }}>
                            Progress
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Call Duration(s)">
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.call_duration}
                        onChange={(e) =>
                          handleChange("call_duration", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Announce Position">
                      <Checkbox
                        checked={!!form.announce_position}
                        onChange={(e) =>
                          handleChange("announce_position", e.target.checked)
                        }
                        size="small"
                        sx={{
                          p: 0,
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Announce Hold Time">
                      <Checkbox
                        checked={!!form.announce_hold_time}
                        onChange={(e) =>
                          handleChange("announce_hold_time", e.target.checked)
                        }
                        size="small"
                        sx={{
                          p: 0,
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Announce Frequency(s)">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.announce_frequency}
                          onChange={(e) =>
                            handleChange("announce_frequency", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v} sx={{ fontSize: 13 }}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Transfer Prompt">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.transfer_prompt}
                          onChange={(e) =>
                            handleChange("transfer_prompt", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          displayEmpty
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            null
                          </MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Agent Busy Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.agent_busy_announce}
                          onChange={(e) =>
                            handleChange("agent_busy_announce", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          displayEmpty
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            null
                          </MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="No Agent Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.no_agent_announce}
                          onChange={(e) =>
                            handleChange("no_agent_announce", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          displayEmpty
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            null
                          </MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Queue Busy Resume Offer">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.queue_busy_resume}
                          onChange={(e) =>
                            handleChange("queue_busy_resume", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="enable" sx={{ fontSize: 13 }}>
                            Enable
                          </MenuItem>
                          <MenuItem value="disable" sx={{ fontSize: 13 }}>
                            Disable
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <SectionHeading title="Periodic Announcements" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Announce Sound">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_sound}
                          onChange={(e) =>
                            handleChange("periodic_sound", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Announce Frequency(s)">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.periodic_frequency}
                          onChange={(e) =>
                            handleChange("periodic_frequency", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          {ANNOUNCE_FREQ_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v} sx={{ fontSize: 13 }}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <SectionHeading title="Busy Callback" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Enable Busy Callback">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback}
                          onChange={(e) =>
                            handleChange("busy_callback", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="no" sx={{ fontSize: 13 }}>
                            No
                          </MenuItem>
                          <MenuItem value="yes" sx={{ fontSize: 13 }}>
                            Yes
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Busy Callback Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_announce}
                          onChange={(e) =>
                            handleChange(
                              "busy_callback_announce",
                              e.target.value,
                            )
                          }
                          sx={{ fontSize: 13 }}
                          displayEmpty
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="default" sx={{ fontSize: 13 }}>
                            default
                          </MenuItem>
                          {voicePrompts.map((vp) => (
                            <MenuItem
                              key={vp.value}
                              value={vp.value}
                              sx={{ fontSize: 13 }}
                            >
                              {vp.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Agent Busy Callback Key">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.busy_callback_key}
                          onChange={(e) =>
                            handleChange("busy_callback_key", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                            <MenuItem
                              key={v}
                              value={String(v)}
                              sx={{ fontSize: 13 }}
                            >
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
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
              : editIndex !== null
                ? "Update Queue"
                : "Create Queue"}
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

export default CallQueue;
