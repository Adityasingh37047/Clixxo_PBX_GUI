import React, { useState, useEffect, useRef } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select as MuiSelect, MenuItem, FormControl,
  Alert, CircularProgress, Tabs, Tab, Checkbox, ListSubheader,
} from '@mui/material';
import { fetchCallQueues, createCallQueue, updateCallQueue, deleteCallQueue, listIvrDestinations, listCustomPrompts, listRingBackOptions } from '../api/apiService';
import {
  CALL_QUEUE_INITIAL_FORM,
  RING_STRATEGY_OPTIONS,
  ACTION_OPTIONS,
  ANNOUNCE_FREQ_OPTIONS,
  CALL_QUEUE_TABLE_COLUMNS,
} from '../constants/CallQueueConstants';

const selectSx = { '& .MuiOutlinedInput-input': { padding: '4px 6px', fontSize: 13 } };
const inputProps = { style: { fontSize: 13, padding: '4px 6px' } };
const LABEL_W = 175;

const FieldRow = ({ label, children }) => (
  <div className="flex items-center bg-white rounded px-2 py-0.5 gap-2" style={{ minHeight: 30 }}>
    <label className="text-[13px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: LABEL_W, flexShrink: 0 }}>
      {label}
    </label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const CallQueue = () => {
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ ...CALL_QUEUE_INITIAL_FORM });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({ fetch: false, save: false, delete: false });
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState({});
  const [voicePrompts, setVoicePrompts] = useState([]);
  const [ringBackOptions, setRingBackOptions] = useState({ moh_categories: [], custom_prompts: [], country_tones: [] });
  const [highlightAvail, setHighlightAvail] = useState([]);
  const [highlightSel, setHighlightSel] = useState([]);
  const hasInitialLoadRef = useRef(false);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(queues.length / itemsPerPage));
  const pagedQueues = queues.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const loadQueues = async () => {
    if (loading.fetch) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallQueues();
      if (res?.response && res?.message) {
        const list = Array.isArray(res.message) ? res.message : [];
        setQueues(list.map((q, i) => ({ ...q, _idx: i + 1 })));
      }
    } catch (e) {
      showMsg('error', e.message || 'Failed to load queues');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const ACTION_TO_DEST_KEY = {
    extensions: 'Extensions',
    voicemail: 'Voicemails',
    ivr_menus: 'IVR',
    conference_rooms: 'ConferenceRooms',
    ring_groups: 'RingGroups',
    disa: 'DISA',
    call_queue: 'CallQueue',
    callbacks: 'Callbacks',
    faxtoemail: 'FaxToMail',
    other: 'Other',
  };

  const getDestOptions = (action) => {
    if (!action) return [];
    const key = ACTION_TO_DEST_KEY[action];
    return key ? (destinations[key] || []) : [];
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
        setVoicePrompts(list.map(it => ({
          value: String(it?.filename || it?.file_name || it?.file || it?.recording_name || '').replace(/\.[^/.]+$/, ''),
          label: String(it?.recording_name || it?.name || it?.filename || '').replace(/\.[^/.]+$/, ''),
        })).filter(it => it.value));
      }
    } catch (_) {}
  };

  const loadRingBackOpts = async () => {
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) return;
      const msg = res?.message;
      const normalized = msg && typeof msg === 'object' && !Array.isArray(msg) ? msg : {};
      setRingBackOptions({
        moh_categories: Array.isArray(normalized.moh_categories) ? normalized.moh_categories : [],
        custom_prompts: Array.isArray(normalized.custom_prompts) ? normalized.custom_prompts : [],
        country_tones: Array.isArray(normalized.country_tones) ? normalized.country_tones : [],
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
    queue_name: q.name || '',
    queue_number: String(q.queue_number || ''),
    pin: q.pin_required ? 'yes' : 'no',
    agent_password: q.dynamic_pin || '',
    ring_strategy: q.ring_strategy || 'ring_all',
    timeout_action: q.timeout_dest_type || '',
    timeout_action_dest: q.timeout_dest_value || '',
    caller_id_prefix: q.cid_name_prefix || '',
    overflow_action: q.overflow_dest_type || '',
    overflow_action_dest: q.overflow_dest_value || '',
    agents_initial_status: q.agents_initial_status || 'logged_in',
    agent_call_timeout: q.agent_timeout ?? 15,
    agent_announcement: q.agent_announcement || '',
    agent_retry_time: q.agent_retry ?? 30,
    wrap_up_time: q.wrapup_time ?? 30,
    max_no_answer: q.max_no_answer ?? 0,
    discard_abandoned_after: q.discard_abandoned_after ?? 0,
    max_wait_time: q.max_wait_time ?? 0,
    max_queue_length: q.max_queue_length ?? 20,
    alert_info: q.alert_info || '',
    music_on_hold: q.moh_mode === 'default' ? 'default' : (q.moh_value || 'default'),
    max_wait_no_agent: q.max_wait_no_agent_sec ?? 90,
    queue_busy_resume: q.queue_busy_resume ? 'enable' : 'disable',
    transfer_prompt: q.transfer_prompt || '',
    agent_busy_announce: q.agent_busy_announce || '',
    answer_announce: q.answer_announce_caller || '',
    join_when_no_agent: !!q.join_when_no_agent,
    join_announce: q.join_announce === 'default' ? 'default' : (q.join_announce_custom || 'default'),
    join_announce_playtime: q.join_announce_playtime ?? 0,
    answer_type: q.answer_type || 'answer',
    no_agent_announce: q.no_agent_announce || '',
    announce_position: q.announce_position !== false,
    announce_hold_time: q.announce_hold_time !== false,
    call_duration: q.call_duration_est_sec ?? 60,
    announce_frequency: q.announce_position_frequency ?? 30,
    periodic_sound: q.announce_sound || 'default',
    periodic_frequency: q.announce_sound_frequency ?? 0,
    busy_callback: q.busy_callback_enabled ? 'yes' : 'no',
    busy_callback_key: String(q.busy_callback_key ?? '2'),
    busy_callback_announce: q.busy_callback_announce || 'default',
    selected_agents: Array.isArray(q.members) ? q.members.map(String) : [],
  });

  const getMohFields = (val) => {
    if (!val || val === 'default') return { moh_mode: 'default', moh_value: null };
    if (ringBackOptions.moh_categories.includes(val)) return { moh_mode: 'moh', moh_value: val };
    if (ringBackOptions.custom_prompts.includes(val)) return { moh_mode: 'custom', moh_value: val };
    if (ringBackOptions.country_tones.includes(val)) return { moh_mode: 'tone', moh_value: val };
    return { moh_mode: 'default', moh_value: null };
  };

  const nullIfEmpty = (v) => (v === '' || v == null ? null : v);

  const buildPayload = (f) => ({
    ...(f._id != null ? { id: f._id } : {}),
    name: f.queue_name,
    queue_number: Number(f.queue_number),
    enabled: true,
    pin_required: f.pin === 'yes',
    dynamic_pin: f.pin === 'yes' ? f.agent_password : null,
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
    queue_busy_resume: f.queue_busy_resume === 'enable',
    transfer_prompt: nullIfEmpty(f.transfer_prompt),
    agent_busy_announce: nullIfEmpty(f.agent_busy_announce),
    answer_announce_caller: nullIfEmpty(f.answer_announce),
    join_when_no_agent: !!f.join_when_no_agent,
    join_announce: f.join_announce === 'default' ? 'default' : 'custom',
    join_announce_custom: f.join_announce === 'default' ? null : f.join_announce,
    join_announce_playtime: Number(f.join_announce_playtime),
    answer_type: f.answer_type,
    no_agent_announce: nullIfEmpty(f.no_agent_announce),
    announce_position: !!f.announce_position,
    announce_hold_time: !!f.announce_hold_time,
    call_duration_est_sec: Number(f.call_duration),
    announce_position_frequency: Number(f.announce_frequency),
    announce_sound: f.periodic_sound || 'default',
    announce_sound_frequency: Number(f.periodic_frequency),
    busy_callback_enabled: f.busy_callback === 'yes',
    busy_callback_key: String(f.busy_callback_key),
    busy_callback_announce: nullIfEmpty(f.busy_callback_announce),
    members: f.selected_agents,
  });

  const handleOpenModal = (row = null, idx = null) => {
    setForm(row ? apiToForm(row) : { ...CALL_QUEUE_INITIAL_FORM });
    setEditIndex(idx);
    setActiveTab('basic');
    setHighlightAvail([]);
    setHighlightSel([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setActiveTab('basic');
  };

  const handleSave = async () => {
    if (!form.queue_name.trim()) { showMsg('error', 'Queue Name is required'); return; }
    if (!String(form.queue_number).trim()) { showMsg('error', 'Queue Number is required'); return; }
    if (form.pin === 'yes' && form.agent_password.length < 2) { showMsg('error', 'Agent Password must be 2 to 4 digits'); return; }
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const fn = editIndex !== null ? updateCallQueue : createCallQueue;
      const res = await fn(buildPayload(form));
      if (res?.response) {
        showMsg('success', editIndex !== null ? 'Queue updated' : 'Queue created');
        handleCloseModal();
        await loadQueues();
      } else {
        showMsg('error', res?.message || 'Save failed');
      }
    } catch (e) {
      showMsg('error', e.message || 'Save failed');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) { showMsg('info', 'No queues selected'); return; }
    if (!window.confirm(`Delete ${selected.length} queue(s)?`)) return;
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const q = queues.find(x => x._idx === idx);
        if (q) await deleteCallQueue(q.id);
      }
      showMsg('success', `${selected.length} queue(s) deleted`);
      setSelected([]);
      await loadQueues();
    } catch (e) {
      showMsg('error', e.message || 'Delete failed');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleCheckAll = () => setSelected(pagedQueues.map(q => q._idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () => setSelected(pagedQueues.map(q => q._idx).filter(i => !selected.includes(i)));
  const handleSelectRow = (idx) => setSelected(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]);

  const extensionsList = Array.isArray(destinations.Extensions) ? destinations.Extensions : [];
  const computedAvailable = extensionsList.filter(e => !(form.selected_agents || []).includes(e.value));

  const moveToSelected = (all) => {
    const toMove = all ? computedAvailable.map(e => e.value) : highlightAvail;
    handleChange('selected_agents', [...(form.selected_agents || []), ...toMove.filter(v => !(form.selected_agents || []).includes(v))]);
    setHighlightAvail([]);
  };
  const moveToAvailable = (all) => {
    const toRemove = all ? (form.selected_agents || []) : highlightSel;
    handleChange('selected_agents', (form.selected_agents || []).filter(v => !toRemove.includes(v)));
    setHighlightSel([]);
  };
  const moveUp = () => {
    if (highlightSel.length !== 1) return;
    const arr = [...(form.selected_agents || [])];
    const i = arr.indexOf(highlightSel[0]);
    if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; handleChange('selected_agents', arr); }
  };
  const moveDown = () => {
    if (highlightSel.length !== 1) return;
    const arr = [...(form.selected_agents || [])];
    const i = arr.indexOf(highlightSel[0]);
    if (i < arr.length - 1) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; handleChange('selected_agents', arr); }
  };

  const ringStrategyLabel = (v) => RING_STRATEGY_OPTIONS.find(o => o.value === v)?.label || v;

  const SectionHeader = ({ title }) => (
    <div className="px-3 py-1 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">{title}</div>
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4' }}>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 1020, maxWidth: '98vw', mx: 'auto', p: 0 } }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444' }}
        >
          {editIndex !== null ? 'Edit Call Queue' : 'Add Call Queue'}
        </DialogTitle>
        <DialogContent style={{ padding: '10px 8px 0 8px', backgroundColor: '#dde0e4', border: '1px solid #444', borderTop: 'none' }}>
          <div className="flex flex-col w-full">
            <div className="border-b border-gray-400 mb-2 bg-[#f1f3f6] rounded-t-md">
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" textColor="inherit"
                TabIndicatorProps={{ style: { backgroundColor: '#0e8fd6', height: 3 } }}>
                <Tab label="BASIC" value="basic" sx={{ fontSize: 12, fontWeight: 600, minHeight: 34 }} />
                <Tab label="CALLER EXPERIENCE SETTINGS" value="caller" sx={{ fontSize: 12, fontWeight: 600, minHeight: 34 }} />
              </Tabs>
            </div>

            {/* ── BASIC TAB ── */}
            {activeTab === 'basic' && (
              <div className="flex flex-col gap-2 w-full pb-2">
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Queue Settings" />
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">

                    <FieldRow label="Queue Name *">
                      <TextField size="small" fullWidth variant="outlined" value={form.queue_name}
                        onChange={e => handleChange('queue_name', e.target.value)} inputProps={inputProps} />
                    </FieldRow>
                    <FieldRow label="Agent Call Timeout (s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.agent_call_timeout}
                        onChange={e => handleChange('agent_call_timeout', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Queue Number *">
                      <TextField size="small" fullWidth variant="outlined" value={form.queue_number}
                        onChange={e => handleChange('queue_number', e.target.value)} inputProps={inputProps} />
                    </FieldRow>
                    <FieldRow label="Agent Announcement">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.agent_announcement} onChange={e => handleChange('agent_announcement', e.target.value)} sx={selectSx} displayEmpty>
                          <MenuItem value="">Null</MenuItem>
                          <MenuItem value="call_from_queue_number">Call From Queue Number</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Pin *">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.pin} onChange={e => handleChange('pin', e.target.value)} sx={selectSx}>
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Agent Retry Time (s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.agent_retry_time}
                        onChange={e => handleChange('agent_retry_time', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    {form.pin === 'yes' && (
                      <FieldRow label="Agent Password *">
                        <TextField size="small" fullWidth variant="outlined" value={form.agent_password}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            handleChange('agent_password', val);
                          }}
                          inputProps={{ ...inputProps, inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }} />
                      </FieldRow>
                    )}
                    <FieldRow label="Wrap Up Time (s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.wrap_up_time}
                        onChange={e => handleChange('wrap_up_time', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Ring Strategy *">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.ring_strategy} onChange={e => handleChange('ring_strategy', e.target.value)} sx={selectSx}>
                          {RING_STRATEGY_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Max No Answer">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.max_no_answer}
                        onChange={e => handleChange('max_no_answer', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    {/* Timeout Action + destination */}
                    <div className="flex items-center bg-white rounded px-2 py-0.5 gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[13px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: LABEL_W, flexShrink: 0 }}>
                        Timeout Action
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect value={form.timeout_action}
                            onChange={e => { handleChange('timeout_action', e.target.value); handleChange('timeout_action_dest', ''); }} sx={selectSx}>
                            {ACTION_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.timeout_action && (
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.timeout_action_dest || ''}
                              onChange={e => handleChange('timeout_action_dest', e.target.value)} sx={selectSx}
                              displayEmpty renderValue={v => v || <span style={{ color: '#999', fontSize: 12 }}>Select...</span>}>
                              <MenuItem value=""><em style={{ fontSize: 12 }}>Select...</em></MenuItem>
                              {getDestOptions(form.timeout_action).map(o => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <FieldRow label="Discard Abandoned After(s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.discard_abandoned_after}
                        onChange={e => handleChange('discard_abandoned_after', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Caller ID Name Prefix">
                      <TextField size="small" fullWidth variant="outlined" value={form.caller_id_prefix}
                        onChange={e => handleChange('caller_id_prefix', e.target.value)} inputProps={inputProps} />
                    </FieldRow>
                    <FieldRow label="Max Wait Time (s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.max_wait_time}
                        onChange={e => handleChange('max_wait_time', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    {/* Overflow Action + destination */}
                    <div className="flex items-center bg-white rounded px-2 py-0.5 gap-2" style={{ minHeight: 30 }}>
                      <label className="text-[13px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: LABEL_W, flexShrink: 0 }}>
                        Overflow Action
                      </label>
                      <div className="flex-1 min-w-0">
                        <FormControl fullWidth size="small">
                          <MuiSelect value={form.overflow_action}
                            onChange={e => { handleChange('overflow_action', e.target.value); handleChange('overflow_action_dest', ''); }} sx={selectSx}>
                            {ACTION_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      {form.overflow_action && (
                        <div className="flex-1 min-w-0">
                          <FormControl fullWidth size="small">
                            <MuiSelect value={form.overflow_action_dest || ''}
                              onChange={e => handleChange('overflow_action_dest', e.target.value)} sx={selectSx}
                              displayEmpty renderValue={v => v || <span style={{ color: '#999', fontSize: 12 }}>Select...</span>}>
                              <MenuItem value=""><em style={{ fontSize: 12 }}>Select...</em></MenuItem>
                              {getDestOptions(form.overflow_action).map(o => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                    </div>
                    <FieldRow label="Max Queue Length">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.max_queue_length}
                        onChange={e => handleChange('max_queue_length', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Agents Initial Status">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.agents_initial_status} onChange={e => handleChange('agents_initial_status', e.target.value)} sx={selectSx}>
                          <MenuItem value="logged_in">Logged In</MenuItem>
                          <MenuItem value="logged_out">Logged Out</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Alert info">
                      <TextField size="small" fullWidth variant="outlined" value={form.alert_info}
                        onChange={e => handleChange('alert_info', e.target.value)} inputProps={inputProps} />
                    </FieldRow>

                  </div>
                </div>

                {/* Agents dual listbox */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Agents" />
                  <div className="p-3">
                    <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                      {/* Available */}
                      <div>
                        <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                        <select multiple
                          className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                          value={highlightAvail}
                          onChange={e => setHighlightAvail(Array.from(e.target.selectedOptions, o => o.value))}>
                          {computedAvailable.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Move left↔right buttons */}
                      <div className="flex flex-col gap-1 justify-center mt-7">
                        {[
                          { lbl: '>', fn: () => moveToSelected(false) },
                          { lbl: '>>', fn: () => moveToSelected(true) },
                          { lbl: '<', fn: () => moveToAvailable(false) },
                          { lbl: '<<', fn: () => moveToAvailable(true) },
                        ].map(b => (
                          <button key={b.lbl} onClick={b.fn}
                            className="w-full h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold rounded hover:bg-gray-300">
                            {b.lbl}
                          </button>
                        ))}
                      </div>

                      {/* Selected */}
                      <div>
                        <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                        <select multiple
                          className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                          value={highlightSel}
                          onChange={e => setHighlightSel(Array.from(e.target.selectedOptions, o => o.value))}>
                          {(form.selected_agents || []).map(v => {
                            const ext = extensionsList.find(e => e.value === v);
                            return <option key={v} value={v}>{ext?.label || v}</option>;
                          })}
                        </select>
                      </div>

                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1 justify-center mt-7">
                        {[
                          { lbl: '^', fn: moveUp },
                          { lbl: 'v', fn: moveDown },
                        ].map(b => (
                          <button key={b.lbl} onClick={b.fn}
                            className="w-full h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold rounded hover:bg-gray-300">
                            {b.lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CALLER EXPERIENCE SETTINGS TAB ── */}
            {activeTab === 'caller' && (
              <div className="flex flex-col gap-2 w-full pb-2">

                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Caller Settings" />
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Music on Hold *">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.music_on_hold} onChange={e => handleChange('music_on_hold', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }} renderValue={v => v || ''}>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {ringBackOptions.moh_categories.length > 0 && (
                            <ListSubheader disableSticky sx={{ fontWeight: 700, fontSize: 14, lineHeight: '36px' }}>Music on Hold</ListSubheader>
                          )}
                          {ringBackOptions.moh_categories.map(opt => (
                            <MenuItem key={`moh-${opt}`} value={opt} sx={{ fontSize: 14, pl: 3 }}>{opt}</MenuItem>
                          ))}
                          {ringBackOptions.custom_prompts.length > 0 && (
                            <ListSubheader disableSticky sx={{ fontWeight: 700, fontSize: 14, lineHeight: '36px' }}>Custom Prompt</ListSubheader>
                          )}
                          {ringBackOptions.custom_prompts.map(opt => (
                            <MenuItem key={`prompt-${opt}`} value={opt} sx={{ fontSize: 14, pl: 3 }}>{opt}</MenuItem>
                          ))}
                          {ringBackOptions.country_tones.length > 0 && (
                            <ListSubheader disableSticky sx={{ fontWeight: 700, fontSize: 14, lineHeight: '36px' }}>Ring Back</ListSubheader>
                          )}
                          {ringBackOptions.country_tones.map(opt => (
                            <MenuItem key={`tone-${opt}`} value={opt} sx={{ fontSize: 14, pl: 3 }}>{opt}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Join When No Agent">
                      <Checkbox checked={!!form.join_when_no_agent}
                        onChange={e => handleChange('join_when_no_agent', e.target.checked)}
                        size="small" sx={{ p: 0 }} />
                    </FieldRow>

                    <FieldRow label="Max Wait Time No Agent (s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.max_wait_no_agent}
                        onChange={e => handleChange('max_wait_no_agent', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>
                    <FieldRow label="Join Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.join_announce} onChange={e => handleChange('join_announce', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Queue Busy Resume Offer">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.queue_busy_resume} onChange={e => handleChange('queue_busy_resume', e.target.value)} sx={selectSx}>
                          <MenuItem value="enable">Enable</MenuItem>
                          <MenuItem value="disable">Disable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Join Announce Playtime">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.join_announce_playtime}
                        onChange={e => handleChange('join_announce_playtime', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Transfer Prompt">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.transfer_prompt} onChange={e => handleChange('transfer_prompt', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Answer Type">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.answer_type} onChange={e => handleChange('answer_type', e.target.value)} sx={selectSx}>
                          <MenuItem value="answer">Answer</MenuItem>
                          <MenuItem value="progress">Progress</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Agent Busy Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.agent_busy_announce} onChange={e => handleChange('agent_busy_announce', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="No Agent Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.no_agent_announce} onChange={e => handleChange('no_agent_announce', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="">null</MenuItem>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Answer Announce To Caller">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.answer_announce} onChange={e => handleChange('answer_announce', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                          renderValue={v => {
                            if (!v) return '';
                            if (v === 'agent_id') return 'Play AgentID Prompt';
                            const found = voicePrompts.find(vp => vp.value === v);
                            return found ? found.label : v;
                          }}>
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="agent_id" sx={{ fontSize: 14 }}>Play AgentID Prompt</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Caller Position Announcements" />
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Announce Position">
                      <Checkbox checked={!!form.announce_position}
                        onChange={e => handleChange('announce_position', e.target.checked)}
                        size="small" sx={{ p: 0 }} />
                    </FieldRow>
                    <FieldRow label="Call Duration(s)">
                      <TextField type="number" size="small" fullWidth variant="outlined" value={form.call_duration}
                        onChange={e => handleChange('call_duration', e.target.value)} inputProps={{ ...inputProps, min: 0 }} />
                    </FieldRow>

                    <FieldRow label="Announce Hold Time">
                      <Checkbox checked={!!form.announce_hold_time}
                        onChange={e => handleChange('announce_hold_time', e.target.checked)}
                        size="small" sx={{ p: 0 }} />
                    </FieldRow>
                    <FieldRow label="Announce Frequency(s)">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.announce_frequency} onChange={e => handleChange('announce_frequency', e.target.value)} sx={selectSx}>
                          {ANNOUNCE_FREQ_OPTIONS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Periodic Announcements" />
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Announce Sound">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.periodic_sound} onChange={e => handleChange('periodic_sound', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Announce Frequency(s)">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.periodic_frequency} onChange={e => handleChange('periodic_frequency', e.target.value)} sx={selectSx}>
                          {ANNOUNCE_FREQ_OPTIONS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                  <SectionHeader title="Busy Callback" />
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <FieldRow label="Enable Busy Callback">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.busy_callback} onChange={e => handleChange('busy_callback', e.target.value)} sx={selectSx}>
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Busy Callback Announce">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.busy_callback_announce} onChange={e => handleChange('busy_callback_announce', e.target.value)} sx={selectSx}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} renderValue={v => v || ''}>
                          <MenuItem value="default" sx={{ fontSize: 14 }}>default</MenuItem>
                          {voicePrompts.map(vp => (
                            <MenuItem key={vp.value} value={vp.value} sx={{ fontSize: 14 }}>{vp.label}</MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Agent Busy Callback Key">
                      <FormControl fullWidth size="small">
                        <MuiSelect value={form.busy_callback_key} onChange={e => handleChange('busy_callback_key', e.target.value)} sx={selectSx}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="p-3 justify-center gap-6">
          <Button variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff', fontWeight: 600, fontSize: '15px', borderRadius: 2,
              minWidth: 110, minHeight: 38, textTransform: 'none',
              boxShadow: '0 2px 8px #b3e0ff',
              '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)' },
              '&:disabled': { background: '#ccc', color: '#666' },
            }}
            onClick={handleSave} disabled={loading.save}
            startIcon={loading.save && <CircularProgress size={18} color="inherit" />}>
            {loading.save ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151', fontWeight: 600, fontSize: '15px', borderRadius: 2,
              minWidth: 110, minHeight: 38, textTransform: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)' },
            }}
            onClick={handleCloseModal} disabled={loading.save}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300, boxShadow: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Main content */}
      <div className="w-full max-w-full mx-auto p-2">
        <div className="w-full max-w-full mx-auto">
          <div
            className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
            style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
          >
            Call Queue
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
              <thead>
                <tr>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Queue Name</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Queue Number</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Ring Strategy</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Agents</th>
                  <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading.fetch ? (
                  <tr><td colSpan={7} className="border border-gray-300 px-2 py-8 text-center"><CircularProgress size={26} /></td></tr>
                ) : queues.length === 0 ? (
                  <tr><td colSpan={7} className="border border-gray-300 px-2 py-4 text-center text-gray-500">No queues yet. Click "Add New" to create one.</td></tr>
                ) : (
                  pagedQueues.map((q, i) => (
                    <tr key={q._idx}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={selected.includes(q._idx)} onChange={() => handleSelectRow(q._idx)} disabled={loading.delete} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{(page - 1) * itemsPerPage + i + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{q.name || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{q.queue_number || '--'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{ringStrategyLabel(q.ring_strategy)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{Array.isArray(q.members) ? q.members.length : 0}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100"
                          titleAccess="Edit"
                          onClick={() => handleOpenModal(q, q._idx)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={handleCheckAll} disabled={loading.delete || loading.fetch}
                className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Check All
              </button>
              <button onClick={handleUncheckAll} disabled={loading.delete || loading.fetch}
                className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Uncheck All
              </button>
              <button onClick={handleInverse} disabled={loading.delete || loading.fetch}
                className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Inverse
              </button>
              <button onClick={handleDelete} disabled={loading.delete || loading.fetch}
                className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${(loading.delete || loading.fetch) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading.delete && <CircularProgress size={11} />}Delete
              </button>
            </div>
            <button onClick={() => handleOpenModal()} disabled={loading.fetch || loading.save}
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${(loading.fetch || loading.save) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Add New
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{queues.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <span>Go to Page</span>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={e => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallQueue;
