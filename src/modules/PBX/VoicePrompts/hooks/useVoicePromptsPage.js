import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
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
} from "../../../../api/apiService";
import {
  mapCustomPromptListFromApi,
  mapMohFileListFromApi,
  mapVoicePromptExtensionsFromApi,
  mapVoicePromptPreferencesFromApi,
  normalizeMohClassList,
  toMessageText,
  triggerBrowserDownload,
} from "../utils/VoicePromptsTransformers";
import {
  validateCustomUpload,
  validateMohUpload,
  validateRecordPrompt,
} from "../utils/VoicePromptsValidators";

const VOICE_PROMPTS_COMPACT_MQ = "(max-width: 768px)";

export function useVoicePromptsPage() {
  const isCompact = useMediaQuery(VOICE_PROMPTS_COMPACT_MQ);
  const [activeTab, setActiveTab] = useState("promptPreference");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [playCallForwardingPrompt, setPlayCallForwardingPrompt] =
    useState(false);
  const [promptMohCategory, setPromptMohCategory] = useState("default");

  const [mohCategoryName, setMohCategoryName] = useState("");
  const [mohFile, setMohFile] = useState(null);
  const [mohFiles, setMohFiles] = useState([]);
  const [mohLoading, setMohLoading] = useState(false);

  const [customFile, setCustomFile] = useState(null);
  const [customItems, setCustomItems] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordFileName, setRecordFileName] = useState("");
  const [recordExtension, setRecordExtension] = useState("");
  const [extensions, setExtensions] = useState([]);

  const mohFileInputRef = useRef(null);
  const customFileInputRef = useRef(null);

  const [mohAudioUrl, setMohAudioUrl] = useState("");
  const [customAudioUrl, setCustomAudioUrl] = useState("");
  const mohAudioRef = useRef(null);
  const customAudioRef = useRef(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const categories = useMemo(() => {
    const listCats = mohFiles
      .map((f) => String(f?.category || "").trim())
      .filter(Boolean);
    return Array.from(new Set(listCats));
  }, [mohFiles]);

  const loadMohFiles = async () => {
    setMohLoading(true);
    try {
      const res = await listMohFiles();
      if (!res?.response) {
        setMohFiles([]);
        return;
      }
      setMohFiles(mapMohFileListFromApi(res));
    } catch {
      setMohFiles([]);
    } finally {
      setMohLoading(false);
    }
  };

  const refreshMohClasses = async () => {
    try {
      const clsRes = await listMohClasses();
      if (!clsRes?.response) return [];
      return normalizeMohClassList(clsRes);
    } catch {
      return [];
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
      setCustomItems(mapCustomPromptListFromApi(res));
    } catch {
      setCustomItems([]);
    } finally {
      setCustomLoading(false);
    }
  };

  const loadInitial = async () => {
    try {
      const prefRes = await getVoicePromptPreferences();
      if (prefRes?.response) {
        const prefs = mapVoicePromptPreferencesFromApi(prefRes);
        setPromptMohCategory(prefs.promptMohCategory);
        setPlayCallForwardingPrompt(prefs.playCallForwardingPrompt);
      }
    } catch {}

    await loadMohFiles();

    try {
      const extRes = await listVoicePromptExtensions();
      if (extRes?.response) {
        setExtensions(mapVoicePromptExtensionsFromApi(extRes));
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
        setCustomItems(mapCustomPromptListFromApi(res));
      } else {
        setCustomItems([]);
      }
    } catch {
      setCustomItems([]);
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(promptMohCategory)) {
      setPromptMohCategory(categories[0]);
      return;
    }
    if (categories.length === 0 && !mohLoading) {
      setPromptMohCategory("");
    }
  }, [categories, promptMohCategory, mohLoading]);

  useEffect(() => {
    if (activeTab === "musicOnHold") {
      loadMohFiles();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (mohAudioUrl) URL.revokeObjectURL(mohAudioUrl);
      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    };
  }, [mohAudioUrl, customAudioUrl]);

  const stopMohPlayer = () => {
    if (mohAudioRef.current) {
      mohAudioRef.current.pause();
      mohAudioRef.current.currentTime = 0;
    }
    if (mohAudioUrl) {
      URL.revokeObjectURL(mohAudioUrl);
      setMohAudioUrl("");
    }
  };

  const stopCustomPlayer = () => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.currentTime = 0;
    }
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl("");
    }
  };

  const handleTabChange = (tabId) => {
    stopMohPlayer();
    stopCustomPlayer();
    setActiveTab(tabId);
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await updateVoicePromptPreferences({
        music_on_hold: promptMohCategory,
        play_call_forwarding_prompt: playCallForwardingPrompt,
      });
      if (!res?.response)
        return showMsg(
          "error",
          res?.message || "Failed to update preferences.",
        );
      showMsg("success", "Preferences updated successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to update preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUploadMoh = async () => {
    const validationError = validateMohUpload({ mohCategoryName, mohFile });
    if (validationError) return showMsg("error", validationError);

    const trimmedCategory = mohCategoryName.trim();

    try {
      const res = await uploadMohFile({
        category: trimmedCategory,
        file: mohFile,
      });
      if (!res?.response)
        return showMsg("error", res?.message || "Upload failed.");

      await refreshMohClasses();
      setPromptMohCategory(trimmedCategory);
      setMohCategoryName("");
      setMohFile(null);
      await loadMohFiles();
      showMsg("success", "MOH File uploaded successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Upload failed.");
    }
  };

  const handleUploadCustomPrompt = async () => {
    const validationError = validateCustomUpload({ customFile });
    if (validationError) return showMsg("error", validationError);

    try {
      const res = await uploadCustomPrompt({ file: customFile });
      if (!res?.response)
        return showMsg(
          "error",
          res?.message || "Failed to upload custom prompt.",
        );

      setCustomFile(null);
      await refreshCustomPrompts();
      showMsg("success", "Custom prompt uploaded successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to upload custom prompt.");
    }
  };

  const openRecordModal = () => {
    setRecordFileName("");
    setRecordExtension(extensions[0] || "");
    setRecordModalOpen(true);
  };

  const handleSaveRecordedPrompt = async () => {
    const validationError = validateRecordPrompt({
      recordFileName,
      recordExtension,
    });
    if (validationError) return showMsg("error", validationError);

    const trimmed = recordFileName.trim();

    try {
      const res = await recordNewCustomPrompt({
        file_name: trimmed,
        extension: recordExtension,
      });
      if (!res?.response)
        return showMsg(
          "error",
          toMessageText(res?.message, "Failed to start recording."),
        );

      showMsg("success", toMessageText(res?.message, "Recording started."));
      setRecordModalOpen(false);
      await refreshCustomPrompts();
    } catch (e) {
      showMsg(
        "error",
        toMessageText(
          e?.response?.data?.message || e?.message,
          "Failed to start recording.",
        ),
      );
    }
  };

  const handlePlayMoh = async (item) => {
    try {
      const resp = await playMohFile({
        category: item.category,
        filename: item.filename,
      });
      const url = URL.createObjectURL(resp.data);
      stopCustomPlayer();
      if (mohAudioUrl) URL.revokeObjectURL(mohAudioUrl);
      setMohAudioUrl(url);
      setTimeout(() => mohAudioRef.current?.play?.(), 0);
    } catch (e) {
      showMsg("error", e?.message || "Failed to play file.");
    }
  };

  const handleDownloadMoh = async (item) => {
    try {
      const resp = await playMohFile({
        category: item.category,
        filename: item.filename,
      });
      triggerBrowserDownload(resp.data, item.filename);
    } catch (e) {
      showMsg("error", e?.message || "Failed to download file.");
    }
  };

  const handleDeleteMoh = async (item) => {
    if (!window.confirm(`Delete ${item.filename}?`)) return;
    try {
      const res = await deleteMohFile({
        category: item.category,
        filename: item.filename,
      });
      if (!res?.response)
        return showMsg("error", res?.message || "Failed to delete file.");
      const classes = await refreshMohClasses();
      if (!classes.includes(promptMohCategory)) {
        setPromptMohCategory(classes[0] || "");
      }
      await loadMohFiles();
      showMsg("success", "File deleted successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to delete file.");
    }
  };

  const handlePlayCustom = async (item) => {
    try {
      const resp = await playCustomPrompt({
        filename: item.fileName,
      });
      const url = URL.createObjectURL(resp.data);
      stopMohPlayer();
      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl(url);
      setTimeout(() => customAudioRef.current?.play?.(), 0);
    } catch (e) {
      showMsg("error", e?.message || "Failed to play file.");
    }
  };

  const handleDownloadCustom = async (item) => {
    try {
      const resp = await playCustomPrompt({
        filename: item.fileName,
      });
      triggerBrowserDownload(resp.data, item.fileName);
    } catch (e) {
      showMsg("error", e?.message || "Failed to download file.");
    }
  };

  const handleDeleteCustom = async (item) => {
    if (!window.confirm(`Delete ${item.fileName}?`)) return;
    try {
      const res = await deleteCustomPrompt({
        filename: item.fileName,
      });
      if (!res?.response)
        return showMsg("error", res?.message || "Failed to delete file.");
      await refreshCustomPrompts();
      showMsg("success", "File deleted successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to delete file.");
    }
  };

  return {
    isCompact,
    activeTab,
    message,
    setMessage,
    playCallForwardingPrompt,
    setPlayCallForwardingPrompt,
    promptMohCategory,
    setPromptMohCategory,
    mohCategoryName,
    setMohCategoryName,
    mohFile,
    setMohFile,
    mohFiles,
    mohLoading,
    customFile,
    setCustomFile,
    customItems,
    customLoading,
    recordModalOpen,
    setRecordModalOpen,
    recordFileName,
    setRecordFileName,
    recordExtension,
    setRecordExtension,
    extensions,
    mohFileInputRef,
    customFileInputRef,
    mohAudioUrl,
    customAudioUrl,
    mohAudioRef,
    customAudioRef,
    savingPrefs,
    categories,
    handleTabChange,
    handleSavePreferences,
    handleUploadMoh,
    handleUploadCustomPrompt,
    openRecordModal,
    handleSaveRecordedPrompt,
    stopMohPlayer,
    stopCustomPlayer,
    handlePlayMoh,
    handleDownloadMoh,
    handleDeleteMoh,
    handlePlayCustom,
    handleDownloadCustom,
    handleDeleteCustom,
  };
}
