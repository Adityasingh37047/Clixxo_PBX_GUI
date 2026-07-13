import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { createCallQueue, deleteCallQueue, fetchCallQueues, listCustomPrompts, listIvrDestinations, listRingBackOptions, updateCallQueue } from "../../../../api/apiService";
import { CALL_QUEUE_INITIAL_FORM } from "../../../../constants/CallQueueConstants";
import { buildCallQueuePayload, formatRingStrategyLabel, getDestOptions, mapCallQueueApiToForm, mapCustomPrompts, normalizeRingBackOptions } from "../utils/CallQueueTransformers";
import { validateCallQueueForm } from "../utils/CallQueueValidators";

const CALL_QUEUE_COMPACT_MQ = "(max-width: 768px)";
const EMPTY_RING_BACK_OPTIONS = { moh_categories: [], custom_prompts: [], country_tones: [] };

export function useCallQueuePage() {
  const isCompact = useMediaQuery(CALL_QUEUE_COMPACT_MQ);
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ ...CALL_QUEUE_INITIAL_FORM });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({ fetch: false, save: false, delete: false });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState({});
  const [voicePrompts, setVoicePrompts] = useState([]);
  const [ringBackOptions, setRingBackOptions] = useState(EMPTY_RING_BACK_OPTIONS);
  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(queues.length / itemsPerPage));
  const pagedQueues = queues.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: "", text: "" }), 5000); };
  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const loadQueues = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try { const res = await fetchCallQueues(); if (res?.response && res?.message) { const list = Array.isArray(res.message) ? res.message : []; setQueues(list.map((q, i) => ({ ...q, _idx: i + 1 }))); } }
    catch (e) { showMsg("error", e.message || "Failed to load queues"); }
    finally { setLoading((prev) => ({ ...prev, fetch: false })); setIsInitialLoad(false); }
  };
  const loadDestinations = async () => { try { const res = await listIvrDestinations(); if (res?.response && res?.message) setDestinations(res.message); } catch (_) {} };
  const loadVoicePrompts = async () => { try { const res = await listCustomPrompts(); if (res?.response) setVoicePrompts(mapCustomPrompts(Array.isArray(res.message) ? res.message : [])); } catch (_) {} };
  const loadRingBackOpts = async () => { try { const res = await listRingBackOptions(); if (res?.response !== false) setRingBackOptions(normalizeRingBackOptions(res?.message)); } catch (_) {} };
  useEffect(() => { if (!hasInitialLoadRef.current) { hasInitialLoadRef.current = true; loadQueues(); loadDestinations(); loadVoicePrompts(); loadRingBackOpts(); } }, []);
  useLayoutEffect(() => { if (showModal && modalScrollRef.current) modalScrollRef.current.scrollTop = 0; }, [showModal, activeTab]);
  const handleOpenModal = (row = null, idx = null) => { setForm(row ? mapCallQueueApiToForm(row) : { ...CALL_QUEUE_INITIAL_FORM }); setEditIndex(idx); setActiveTab("basic"); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditIndex(null); setActiveTab("basic"); };
  const handleSave = async () => {
    const error = validateCallQueueForm(form); if (error) return showMsg("error", error);
    setLoading((prev) => ({ ...prev, save: true }));
    try { const fn = editIndex !== null ? updateCallQueue : createCallQueue; const res = await fn(buildCallQueuePayload(form, ringBackOptions)); if (res?.response) { showMsg("success", editIndex !== null ? "Queue updated" : "Queue created"); handleCloseModal(); await loadQueues(); } else showMsg("error", res?.message || "Save failed"); }
    catch (e) { showMsg("error", e.message || "Save failed"); }
    finally { setLoading((prev) => ({ ...prev, save: false })); }
  };
  const handleDelete = async () => {
    if (selected.length === 0) return showMsg("info", "No queues selected");
    if (!window.confirm(`Delete ${selected.length} queue(s)?`)) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try { for (const idx of selected) { const q = queues.find((x) => x._idx === idx); if (q) await deleteCallQueue(q.id); } showMsg("success", `${selected.length} queue(s) deleted`); setSelected([]); await loadQueues(); }
    catch (e) { showMsg("error", e.message || "Delete failed"); }
    finally { setLoading((prev) => ({ ...prev, delete: false })); }
  };
  const handleInverse = () => setSelected(pagedQueues.map((q) => q._idx).filter((i) => !selected.includes(i)));
  const handleSelectRow = (idx) => setSelected((prev) => prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]);
  const pageIndices = pagedQueues.map((q) => q._idx);
  const allPageSelected = pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected = pageIndices.some((i) => selected.includes(i)) && !allPageSelected;
  const handleToggleAll = () => { if (!pageIndices.length) return; setSelected((prev) => allPageSelected ? prev.filter((i) => !pageIndices.includes(i)) : Array.from(new Set([...prev, ...pageIndices]))); };
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const extensionsList = Array.isArray(destinations.Extensions) ? destinations.Extensions : [];
  const allAgentOptions = useMemo(() => extensionsList.map((e) => ({ value: String(e.value ?? e.extension ?? e.id ?? ""), label: e.label || String(e.value ?? e.extension ?? e.id ?? "") })).filter((e) => e.value), [extensionsList]);
  const agentLabelMap = useMemo(() => { const map = new Map(); allAgentOptions.forEach((e) => map.set(e.value, e.label)); return map; }, [allAgentOptions]);
  const getAgentLabel = (id) => agentLabelMap.get(id) || id;
  return {
    isCompact, queues, form, showModal, editIndex, activeTab, selected, message, loading, isInitialLoad, page, destinations, voicePrompts, ringBackOptions, modalScrollRef, itemsPerPage, totalPages, pagedQueues, allPageSelected, somePageSelected, allAgentOptions,
    setQueues, setForm, setShowModal, setEditIndex, setActiveTab, setSelected, setMessage, setLoading, setIsInitialLoad, setPage, setDestinations, setVoicePrompts, setRingBackOptions,
    getDestOptions: (action) => getDestOptions(destinations, action), getAgentLabel, ringStrategyLabel: formatRingStrategyLabel, handleChange, handleOpenModal, handleCloseModal, handleSave, handleDelete, handleInverse, handleSelectRow, handleToggleAll, handlePrev, handleNext,
  };
}
