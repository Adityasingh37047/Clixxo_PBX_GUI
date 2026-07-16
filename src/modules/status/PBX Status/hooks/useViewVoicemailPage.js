import { useEffect, useRef, useState } from "react";
import {
  deleteVoicemail,
  listVoicemails,
  playVoicemail,
} from "../../../../api/apiService";
import { VIEW_VOICEMAIL_PAGE_LIMIT } from "../../../../constants/ViewVoicemailConstants";
import { fmtDate, parseCallerId } from "../utils/ViewVoicemailTransformers";

export const useViewVoicemailPage = () => {
  const [extensionInput, setExtensionInput] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(VIEW_VOICEMAIL_PAGE_LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [playLoading, setPlayLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selected, setSelected] = useState([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef("");
  const hasInitialLoadRef = useRef(false);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(
    () => () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  const stopPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = "";
    setAudioUrl("");
    setPlayingId(null);
  };

  const loadMessages = async (
    pg = 1,
    ext = extensionInput,
    folder = folderFilter,
  ) => {
    const trimmed = ext.trim();
    setLoading(true);
    setError("");
    try {
      const res = await listVoicemails({
        extension: trimmed || undefined,
        folder: folder && folder !== "all" ? folder : undefined,
        page: pg,
        limit,
      });
      if (res?.response) {
        setRows(Array.isArray(res.data) ? res.data : []);
        setTotal(Number(res.total) || 0);
        setPage(pg);
        setHasLoaded(true);
        stopPlayer();
      } else {
        setError(
          typeof res?.message === "string"
            ? res.message
            : "Failed to load voicemails.",
        );
        setRows([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load voicemails.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadMessages(1, "", "all");
    }
  }, []);

  const handlePlay = async (row) => {
    if (playingId === row.id && audioUrl) {
      stopPlayer();
      return;
    }
    stopPlayer();
    setPlayLoading(row.id);
    try {
      const blob = await playVoicemail(row.id);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setPlayingId(row.id);
    } catch (e) {
      setError(e.message || "Failed to play message.");
    } finally {
      setPlayLoading(null);
    }
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete voicemail from ${parseCallerId(row.callerid)} received at ${fmtDate(row.received_at)}?`,
      )
    )
      return;
    if (playingId === row.id) stopPlayer();
    setDeleteLoading(row.id);
    try {
      const res = await deleteVoicemail(row.id);
      if (res?.response) {
        setSelected((prev) => prev.filter((id) => id !== String(row.id)));
        await loadMessages(page);
      } else {
        setError(
          typeof res?.message === "string"
            ? res.message
            : "Failed to delete message.",
        );
      }
    } catch (e) {
      setError(e.message || "Failed to delete message.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) {
      setError("Please select voicemails to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} voicemail(s)?`,
      )
    )
      return;
    if (playingId && selected.includes(String(playingId))) stopPlayer();
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selected.map((id) => deleteVoicemail(id)),
      );
      const ok = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      const bad = results.length - ok;
      if (bad) {
        setError(`Failed to delete ${bad} voicemail(s).`);
      }
      setSelected([]);
      await loadMessages(page);
    } catch (e) {
      setError(e.message || "Failed to delete voicemails.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const allPageSelected =
    rows.length > 0 && rows.every((row) => selected.includes(String(row.id)));
  const somePageSelected =
    rows.some((row) => selected.includes(String(row.id))) && !allPageSelected;
  const handleToggleAll = () => {
    const pageKeys = rows.map((row) => String(row.id));
    if (allPageSelected) {
      setSelected((prev) => prev.filter((key) => !pageKeys.includes(key)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageKeys])));
    }
  };
  const handleToggleRow = (id) => {
    const key = String(id);
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };

  return {
    audioRef,
    audioUrl,
    allPageSelected,
    bulkDeleting,
    deleteLoading,
    error,
    extensionInput,
    folderFilter,
    handleBulkDelete,
    handleDelete,
    handlePlay,
    handleToggleAll,
    handleToggleRow,
    hasLoaded,
    limit,
    loadMessages,
    loading,
    page,
    playLoading,
    playingId,
    rows,
    selected,
    setError,
    setExtensionInput,
    setFolderFilter,
    somePageSelected,
    stopPlayer,
    total,
    totalPages,
  };
};
