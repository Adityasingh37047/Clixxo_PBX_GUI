import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Tooltip,
  TextField,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import {
  deleteCustomPrompt,
  deleteMohFile,
  getVoicePromptPreferences,
  listCustomPrompts,
  listMohClasses,
  listMohFiles,
  listVoicePromptExtensions,
  playCustomPrompt,
  playMohFile,
  recordNewCustomPrompt,
  uploadCustomPrompt,
  updateVoicePromptPreferences,
  uploadMohFile,
} from '../api/apiService';

const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDateTime = (value) => {
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return '--';
  return dt.toLocaleString();
};

const safeFilename = (v) => String(v || '').trim();
const normalizeMohClassList = (res) => {
  const msg = res?.message ?? res?.data ?? {};
  const raw =
    Array.isArray(msg?.moh_classes) ? msg.moh_classes :
    Array.isArray(msg?.classes) ? msg.classes :
    Array.isArray(msg?.categories) ? msg.categories :
    Array.isArray(msg) ? msg :
    Array.isArray(res?.data) ? res.data : [];
  return raw
    .map((x) => (typeof x === 'string' ? x : x?.name || x?.category || x?.class || ''))
    .map((x) => String(x).trim())
    .filter(Boolean);
};

const triggerBrowserDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toMessageText = (msg, fallback) => {
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (msg && typeof msg === 'object') {
    if (typeof msg.message === 'string' && msg.message.trim()) return msg.message;
    if (typeof msg.error === 'string' && msg.error.trim()) return msg.error;
    if (typeof msg.details === 'string' && msg.details.trim()) return msg.details;
  }
  return fallback;
};

const VoicePromptsPage = () => {
  const [activeTab, setActiveTab] = useState('promptPreference');

  const [playCallForwardingPrompt, setPlayCallForwardingPrompt] = useState(false);
  const [promptMohCategory, setPromptMohCategory] = useState('default');

  const [mohCategoryName, setMohCategoryName] = useState('');
  const [mohFile, setMohFile] = useState(null);
  const [mohClasses, setMohClasses] = useState([]);
  const [mohFiles, setMohFiles] = useState([]);
  const [mohLoading, setMohLoading] = useState(false);

  const [customFile, setCustomFile] = useState(null);
  const [customItems, setCustomItems] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordFileName, setRecordFileName] = useState('');
  const [recordExtension, setRecordExtension] = useState('');
  const [extensions, setExtensions] = useState([]);
  const mohFileInputRef = useRef(null);
  const customFileInputRef = useRef(null);
  const [mohAudioUrl, setMohAudioUrl] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const mohAudioRef = useRef(null);
  const customAudioRef = useRef(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const categories = useMemo(() => {
    const listCats = mohFiles.map((f) => String(f?.category || '').trim()).filter(Boolean);
    return Array.from(new Set(listCats));
  }, [mohFiles]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const prefRes = await getVoicePromptPreferences();
        if (prefRes?.response) {
          const msg = prefRes?.message ?? prefRes?.data ?? {};
          setPromptMohCategory(String(msg?.music_on_hold || 'default'));
          setPlayCallForwardingPrompt(!!msg?.play_call_forwarding_prompt);
          const prefClasses = Array.isArray(msg?.moh_classes) ? msg.moh_classes : [];
          if (prefClasses.length > 0) {
            setMohClasses(prefClasses.map((x) => String(x).trim()).filter(Boolean));
          }
        }
      } catch {}

      try {
        const clsRes = await listMohClasses();
        if (clsRes?.response) {
          setMohClasses(normalizeMohClassList(clsRes));
        } else {
          setMohClasses([]);
        }
      } catch {
        setMohClasses([]);
      }
      await loadMohFiles();

      try {
        const extRes = await listVoicePromptExtensions();
        if (extRes?.response) {
          const list = normalizeList(extRes);
          const extList = list.map((x) => String(x?.extension ?? x?.ext ?? x).trim()).filter(Boolean);
          setExtensions(Array.from(new Set(extList)));
        } else {
          setExtensions([]);
        }
      } catch {
        setExtensions([]);
      }

      try {
        setCustomLoading(true);
        const res = await listCustomPrompts();
        if (res?.response) {
          const list = normalizeList(res);
          setCustomItems(
            list.map((it, idx) => ({
              id: it?.id ?? `${idx}`,
              recordingName: String(it?.recording_name || it?.name || it?.filename || '').replace(/\.[^/.]+$/, ''),
              fileName: safeFilename(it?.filename || it?.file_name || it?.file || ''),
              extension: String(it?.extension || it?.ext || '--'),
              sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
              uploadedAt: it?.uploaded_at || it?.uploaded || it?.date || '',
            }))
          );
        } else {
          setCustomItems([]);
        }
      } catch {
        setCustomItems([]);
      } finally {
        setCustomLoading(false);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(promptMohCategory)) {
      setPromptMohCategory(categories[0]);
      return;
    }
    if (categories.length === 0 && !mohLoading) {
      setPromptMohCategory('');
    }
  }, [categories, promptMohCategory, mohLoading]);

  const loadMohFiles = async () => {
    setMohLoading(true);
    try {
      const res = await listMohFiles();
      if (!res?.response) {
        setMohFiles([]);
        return;
      }
      const msg = res?.message ?? res?.data ?? {};
      const list = Array.isArray(msg)
        ? msg
        : Array.isArray(msg?.files)
        ? msg.files
        : Array.isArray(msg)
        ? msg
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setMohFiles(
        list.map((it, idx) => ({
          id: it?.id ?? `${idx}`,
          category: String(it?.category || ''),
          filename: safeFilename(it?.filename || it?.file_name || it?.name || it),
          sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
          uploadedAt: it?.uploaded_at || it?.created_at || it?.uploaded || it?.date || '',
        }))
      );
    } catch {
      setMohFiles([]);
    } finally {
      setMohLoading(false);
    }
  };

  const refreshMohClasses = async () => {
    try {
      const clsRes = await listMohClasses();
      if (!clsRes?.response) {
        setMohClasses([]);
        return [];
      }
      const classes = normalizeMohClassList(clsRes);
      setMohClasses(classes);
      return classes;
    } catch {
      setMohClasses([]);
      return [];
    }
  };

  useEffect(() => {
    if (activeTab === 'musicOnHold') {
      loadMohFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await updateVoicePromptPreferences({
        music_on_hold: promptMohCategory,
        play_call_forwarding_prompt: playCallForwardingPrompt,
      });
      if (!res?.response) {
        window.alert(res?.message || 'Failed to update preferences.');
        return;
      }
      window.alert('Preferences updated successfully.');
    } catch (e) {
      window.alert(e?.message || 'Failed to update preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUploadMoh = async () => {
    const trimmedCategory = mohCategoryName.trim();
    if (!trimmedCategory) {
      window.alert('Category is required.');
      return;
    }
    if (!mohFile) {
      window.alert('Please select a hold music file.');
      return;
    }
    try {
      const res = await uploadMohFile({ category: trimmedCategory, file: mohFile });
      if (!res?.response) {
        window.alert(res?.message || 'Upload failed.');
        return;
      }
      // Optimistic category update to prevent temporary empty dropdown state.
      setMohClasses((prev) => Array.from(new Set([...prev, trimmedCategory])));
      await refreshMohClasses();
      // Keep uploaded category selected so user can verify file in that category.
      setPromptMohCategory(trimmedCategory);
      setMohCategoryName('');
      setMohFile(null);
      await loadMohFiles();
    } catch (e) {
      window.alert(e?.message || 'Upload failed.');
    }
  };

  const refreshCustomPrompts = async () => {
    setCustomLoading(true);
    try {
      const res = await listCustomPrompts();
      if (!res?.response) {
        setCustomItems([]);
        return;
      }
      const list = normalizeList(res);
      setCustomItems(
        list.map((it, idx) => ({
          id: it?.id ?? `${idx}`,
          recordingName: String(it?.recording_name || it?.name || it?.filename || '').replace(/\.[^/.]+$/, ''),
          fileName: safeFilename(it?.filename || it?.file_name || it?.file || ''),
          extension: String(it?.extension || it?.ext || '--'),
          sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
          uploadedAt: it?.uploaded_at || it?.uploaded || it?.date || '',
        }))
      );
    } catch {
      setCustomItems([]);
    } finally {
      setCustomLoading(false);
    }
  };

  const handleUploadCustomPrompt = async () => {
    if (!customFile) {
      window.alert('Please select a custom prompt file.');
      return;
    }
    try {
      const res = await uploadCustomPrompt({ file: customFile });
      if (!res?.response) {
        window.alert(res?.message || 'Failed to upload custom prompt.');
        return;
      }
      setCustomFile(null);
      await refreshCustomPrompts();
    } catch (e) {
      window.alert(e?.message || 'Failed to upload custom prompt.');
    }
  };

  const openRecordModal = () => {
    setRecordFileName('');
    setRecordExtension(extensions[0] || '');
    setRecordModalOpen(true);
  };

  const handleSaveRecordedPrompt = () => {
    const trimmed = recordFileName.trim();
    if (!trimmed) {
      window.alert('File Name is required.');
      return;
    }
    if (!recordExtension) {
      window.alert('Please select extension.');
      return;
    }
    const run = async () => {
      try {
        const res = await recordNewCustomPrompt({ file_name: trimmed, extension: recordExtension });
        if (!res?.response) {
          window.alert(toMessageText(res?.message, 'Failed to start recording.'));
          return;
        }
        window.alert(toMessageText(res?.message, 'Recording started.'));
        setRecordModalOpen(false);
        await refreshCustomPrompts();
      } catch (e) {
        window.alert(toMessageText(e?.response?.data?.message || e?.message, 'Failed to start recording.'));
      }
    };
    run();
  };

  const actionBtnSx = {
    minWidth: 90,
    height: 28,
    px: 1.5,
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#fff',
    background: 'linear-gradient(to bottom, #4fc3ff 0%, #1f9fe0 60%, #1684c2 100%)',
    '&:hover': {
      background: 'linear-gradient(to bottom, #1f9fe0 0%, #4fc3ff 100%)',
    },
  };
  const toolIconBtnSx = {
    width: 22,
    height: 22,
    border: '1px solid #c2c8d0',
    borderRadius: 0.5,
    backgroundColor: '#f5f7fa',
    p: 0,
    '&:hover': {
      backgroundColor: '#e8edf3',
    },
  };

  const stopMohPlayer = () => {
    if (mohAudioRef.current) {
      mohAudioRef.current.pause();
      mohAudioRef.current.currentTime = 0;
    }
    if (mohAudioUrl) {
      URL.revokeObjectURL(mohAudioUrl);
      setMohAudioUrl('');
    }
  };

  const stopCustomPlayer = () => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.currentTime = 0;
    }
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl('');
    }
  };

  useEffect(() => {
    return () => {
      if (mohAudioUrl) URL.revokeObjectURL(mohAudioUrl);
      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    };
  }, [mohAudioUrl, customAudioUrl]);

  return (
    <div className="w-full max-w-[1040px] mx-auto p-2">
      <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0" style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}>
        Voice Prompts
      </div>

      <div className="bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
        <div className="border-b border-gray-300 bg-white">
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            TabIndicatorProps={{ style: { backgroundColor: '#10b7d4', height: 2 } }}
          >
            <Tab value="promptPreference" label="PROMPT PREFERENCE" sx={{ minHeight: 36, fontSize: 12, fontWeight: 600 }} />
            <Tab value="musicOnHold" label="MUSIC ON HOLD" sx={{ minHeight: 36, fontSize: 12, fontWeight: 600 }} />
            <Tab value="customPrompt" label="CUSTOM PROMPT" sx={{ minHeight: 36, fontSize: 12, fontWeight: 600 }} />
          </Tabs>
        </div>

        <div className="p-3">
          <div className="max-w-[980px] mx-auto">
          {activeTab === 'promptPreference' && (
            <div className="bg-white border border-gray-300 rounded-md p-3">
              <div className="grid grid-cols-1 md:grid-cols-[200px_260px] justify-center gap-x-4 gap-y-3 items-center">
                <label className="text-[13px] text-gray-700 font-medium text-left">Music On Hold</label>
                <FormControl size="small" sx={{ width: 260 }}>
                  <Select
                    value={promptMohCategory}
                    onChange={(e) => setPromptMohCategory(e.target.value)}
                    displayEmpty
                    sx={{ '& .MuiOutlinedInput-input': { fontSize: 13, padding: '6px 8px' } }}
                  >
                    {categories.length === 0 ? (
                      promptMohCategory ? (
                        <MenuItem value={promptMohCategory}>
                          {promptMohCategory}
                        </MenuItem>
                      ) : (
                        <MenuItem value="" disabled>
                          <em>No uploaded music yet</em>
                        </MenuItem>
                      )
                    ) : (
                      categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <label className="text-[13px] text-gray-700 font-medium text-left">Play Call Forwarding Prompt</label>
                <div className="flex flex-col items-start justify-start gap-1">
                  <input
                    type="checkbox"
                    checked={playCallForwardingPrompt}
                    onChange={(e) => setPlayCallForwardingPrompt(e.target.checked)}
                  />
                  <span className="text-[11px] text-gray-500">
                    If enabled, the system plays default forwarding prompt before transfer.
                  </span>
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <Button onClick={handleSavePreferences} disabled={savingPrefs} sx={actionBtnSx}>
                  {savingPrefs ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'musicOnHold' && (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-gray-300 rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-[130px_460px] justify-center gap-x-3 gap-y-2 items-center">
                  <label className="text-[13px] text-gray-700 font-medium text-left">Category</label>
                  <TextField
                    size="small"
                    sx={{ width: 460, maxWidth: '100%' }}
                    value={mohCategoryName}
                    onChange={(e) => setMohCategoryName(e.target.value)}
                    placeholder="Enter category name (default)"
                    inputProps={{ style: { fontSize: 13, padding: '6px 8px' } }}
                  />

                  <label className="text-[13px] text-gray-700 font-medium text-left">File Path</label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      ref={mohFileInputRef}
                      type="file"
                      onChange={(e) => setMohFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => mohFileInputRef.current?.click()}
                      sx={{
                        minWidth: 94,
                        height: 28,
                        px: 1.2,
                        fontSize: '11px',
                        textTransform: 'none',
                        color: '#374151',
                        backgroundColor: '#e5e7eb',
                        borderColor: '#9ca3af',
                        '&:hover': {
                          backgroundColor: '#d1d5db',
                          borderColor: '#6b7280',
                        },
                      }}
                    >
                      Choose File
                    </Button>
                    <span className="text-[12px] text-gray-600 truncate">
                      {mohFile?.name || 'No file chosen'}
                    </span>
                    <Button onClick={handleUploadMoh} sx={{ ...actionBtnSx, minWidth: 96, ml: 1 }}>
                      UPLOAD
                    </Button>
                  </div>
                </div>
                <div className="text-[11px] text-gray-700 mt-3">
                  Note: only supports uploading G711A, G711U, PCM16 encoding, 8000Hz sampling rate, mono wav, MP3 files.
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-md p-3 overflow-x-auto">
                <div className="text-[13px] font-semibold text-[#e2584d] mb-2">All Uploaded MOH Files</div>
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left text-[12px] text-[#2368a0] py-1">File Name</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Category</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">File Size</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Uploaded</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mohLoading ? (
                      <tr>
                        <td colSpan={5} className="text-[12px] text-gray-500 py-2">Loading...</td>
                      </tr>
                    ) : mohFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-[12px] text-gray-700 py-2">No hold music uploaded yet.</td>
                      </tr>
                    ) : (
                      mohFiles.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="text-[12px] py-1">{item.filename}</td>
                          <td className="text-[12px] py-1">{item.category || '--'}</td>
                          <td className="text-[12px] py-1">{formatSize(item.sizeBytes)}</td>
                          <td className="text-[12px] py-1">{formatDateTime(item.uploadedAt)}</td>
                          <td className="text-[12px] py-1">
                            <div className="flex items-center gap-2">
                              <Tooltip title="Play">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    try {
                                      const resp = await playMohFile({ category: item.id, filename: item.id });
                                      const url = URL.createObjectURL(resp.data);
                                      stopCustomPlayer();
                                      if (mohAudioUrl) URL.revokeObjectURL(mohAudioUrl);
                                      setMohAudioUrl(url);
                                      setTimeout(() => mohAudioRef.current?.play?.(), 0);
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to play file.');
                                    }
                                  }}
                                >
                                  <PlayArrowRoundedIcon sx={{ fontSize: 16, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    if (!window.confirm(`Delete ${item.filename}?`)) return;
                                    try {
                                      const res = await deleteMohFile({ category: item.id, filename: item.id });
                                      if (!res?.response) {
                                        window.alert(res?.message || 'Failed to delete file.');
                                        return;
                                      }
                                      const classes = await refreshMohClasses();
                                      if (!classes.includes(promptMohCategory)) {
                                        const nextCategory = classes[0] || '';
                                        setPromptMohCategory(nextCategory);
                                        await loadMohFiles();
                                        return;
                                      }
                                      await loadMohFiles();
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to delete file.');
                                    }
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    try {
                                      const resp = await playMohFile({ category: item.id, filename: item.id });
                                      triggerBrowserDownload(resp.data, item.filename);
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to download file.');
                                    }
                                  }}
                                >
                                  <DownloadRoundedIcon sx={{ fontSize: 15, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {mohAudioUrl && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <audio ref={mohAudioRef} controls src={mohAudioUrl} className="w-full" />
                      <Tooltip title="Stop / Hide player">
                        <IconButton size="small" sx={toolIconBtnSx} onClick={stopMohPlayer}>
                          <StopRoundedIcon sx={{ fontSize: 16, color: '#8b96a5' }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'customPrompt' && (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-gray-300 rounded-md p-3">
                <div className="flex justify-start mb-3 pl-1">
                  <Button onClick={openRecordModal} sx={actionBtnSx}>
                    RECORD NEW
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[130px_460px] justify-center gap-x-3 gap-y-2 items-center">
                  <label className="text-[13px] text-gray-700 font-medium text-left">File Path</label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      ref={customFileInputRef}
                      type="file"
                      onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => customFileInputRef.current?.click()}
                      sx={{
                        minWidth: 94,
                        height: 28,
                        px: 1.2,
                        fontSize: '11px',
                        textTransform: 'none',
                        color: '#374151',
                        backgroundColor: '#e5e7eb',
                        borderColor: '#9ca3af',
                        '&:hover': {
                          backgroundColor: '#d1d5db',
                          borderColor: '#6b7280',
                        },
                      }}
                    >
                      Choose File
                    </Button>
                    <span className="text-[12px] text-gray-600 truncate">
                      {customFile?.name || 'No file chosen'}
                    </span>
                    <Button onClick={handleUploadCustomPrompt} sx={{ ...actionBtnSx, minWidth: 96, ml: 1 }}>
                      UPLOAD
                    </Button>
                  </div>
                </div>
                <div className="text-[11px] text-gray-700 mt-3">
                  Note: supports uploading .wav, .mp3, .gsm files.
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-md p-3 overflow-x-auto">
                <div className="text-[16px] italic font-semibold text-[#e2584d] mb-2">Recordings</div>
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Recording Name</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">File Name</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">File Size</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Uploaded</th>
                      <th className="text-left text-[12px] text-[#2368a0] py-1">Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customLoading ? (
                      <tr>
                        <td colSpan={5} className="text-[12px] text-gray-500 py-2">Loading...</td>
                      </tr>
                    ) : customItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-[12px] text-gray-500 py-2">No custom prompts uploaded/recorded yet.</td>
                      </tr>
                    ) : (
                      customItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="text-[12px] py-1">{item.recordingName}</td>
                          <td className="text-[12px] py-1">{item.fileName}</td>
                          <td className="text-[12px] py-1">{formatSize(item.sizeBytes)}</td>
                          <td className="text-[12px] py-1">{formatDateTime(item.uploadedAt)}</td>
                          <td className="text-[12px] py-1">
                            <div className="flex items-center gap-2">
                              <Tooltip title="Play">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    try {
                                      const resp = await playCustomPrompt({ filename: item.fileName });
                                      const url = URL.createObjectURL(resp.data);
                                      stopMohPlayer();
                                      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
                                      setCustomAudioUrl(url);
                                      setTimeout(() => customAudioRef.current?.play?.(), 0);
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to play file.');
                                    }
                                  }}
                                >
                                  <PlayArrowRoundedIcon sx={{ fontSize: 16, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    if (!window.confirm(`Delete ${item.fileName}?`)) return;
                                    try {
                                      const res = await deleteCustomPrompt({ filename: item.fileName });
                                      if (!res?.response) {
                                        window.alert(res?.message || 'Failed to delete file.');
                                        return;
                                      }
                                      await refreshCustomPrompts();
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to delete file.');
                                    }
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  sx={toolIconBtnSx}
                                  onClick={async () => {
                                    try {
                                      const resp = await playCustomPrompt({ filename: item.fileName });
                                      triggerBrowserDownload(resp.data, item.fileName);
                                    } catch (e) {
                                      window.alert(e?.message || 'Failed to download file.');
                                    }
                                  }}
                                >
                                  <DownloadRoundedIcon sx={{ fontSize: 15, color: '#8b96a5' }} />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {customAudioUrl && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <audio ref={customAudioRef} controls src={customAudioUrl} className="w-full" />
                      <Tooltip title="Stop / Hide player">
                        <IconButton size="small" sx={toolIconBtnSx} onClick={stopCustomPlayer}>
                          <StopRoundedIcon sx={{ fontSize: 16, color: '#8b96a5' }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <Dialog open={recordModalOpen} onClose={() => setRecordModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}
        >
          Record New Prompt
        </DialogTitle>
        <DialogContent className="pt-4 pb-2 px-4">
          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-[90px_1fr] items-center gap-2">
              <label className="text-[14px] text-gray-700 font-medium">File Name <span className="text-red-500">*</span></label>
              <TextField
                size="small"
                fullWidth
                value={recordFileName}
                onChange={(e) => setRecordFileName(e.target.value)}
                inputProps={{ style: { fontSize: 13, padding: '6px 8px' } }}
              />
            </div>
            <div className="grid grid-cols-[90px_1fr] items-center gap-2">
              <label className="text-[14px] text-gray-700 font-medium">Extension <span className="text-red-500">*</span></label>
              <FormControl size="small" fullWidth>
                <Select
                  value={recordExtension}
                  onChange={(e) => setRecordExtension(e.target.value)}
                  displayEmpty
                  sx={{ '& .MuiOutlinedInput-input': { fontSize: 13, padding: '6px 8px' } }}
                >
                  <MenuItem value="" disabled>
                    <em>Select extension</em>
                  </MenuItem>
                  {extensions.map((ext) => (
                    <MenuItem key={ext} value={ext}>
                      {ext}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="pb-3 justify-center gap-2">
          <Button
            onClick={handleSaveRecordedPrompt}
            sx={{
              minWidth: 96,
              height: 30,
              px: 1.5,
              borderRadius: 1.5,
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#fff',
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              boxShadow: '0 2px 8px #b3e0ff',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              },
            }}
          >
            RECORD
          </Button>
          <Button
            onClick={() => setRecordModalOpen(false)}
            sx={{
              minWidth: 96,
              height: 30,
              px: 1.5,
              borderRadius: 1.5,
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#374151',
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
              },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VoicePromptsPage;