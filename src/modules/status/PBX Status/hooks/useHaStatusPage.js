import { useCallback, useEffect, useRef, useState } from "react";
import {
  getHaCheck,
  getHaPeerStatus,
  getHaPhoneCheck,
  getHaStatus,
  postHaSyncDb,
} from "../../../../api/apiService";
import {
  HA_STATUS_BTN_CHECK,
  HA_STATUS_BTN_PHONE_CHECK,
  HA_STATUS_BTN_SYNC_DB,
  HA_STATUS_BUSY,
  HA_STATUS_CHECK_FAILED,
  HA_STATUS_LOAD_FAILED,
  HA_STATUS_PHONE_CHECK_FAILED,
  HA_STATUS_SPLIT_BRAIN,
  HA_STATUS_SYNC_DB_FAILED,
} from "../../../../constants/HaStatusConstants";
import {
  assertHaApiOk,
  formatHaCommandOutput,
  formatHaPhoneCheckOutput,
  getHaStatusErrorMessage,
  isHaStatusEnabled,
  normalizeHaPeerStatus,
  normalizeHaStatusNode,
} from "../utils/HaStatusTransformers";

const emptyPeer = {
  reachable: false,
  peer: "",
  error: "",
  status: normalizeHaStatusNode({}),
};

export function useHaStatusPage() {
  const [localStatus, setLocalStatus] = useState(null);
  const [peerStatus, setPeerStatus] = useState(emptyPeer);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [syncDbOpen, setSyncDbOpen] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [output, setOutput] = useState("");
  const silentRefreshRef = useRef(false);
  const syncDbOpenRef = useRef(false);

  const showBanner = useCallback((type, text) => {
    setBanner({ type, text });
  }, []);

  const appendOutput = useCallback((command, body) => {
    setOutput((prev) => `${prev}${formatHaCommandOutput(command, body)}`);
  }, []);

  const loadStatus = useCallback(
    async ({ silent = false } = {}) => {
      if (syncDbOpenRef.current) return;
      if (silent) {
        if (silentRefreshRef.current) return;
        silentRefreshRef.current = true;
      } else {
        setIsRefreshing(true);
      }

      try {
        const localRes = assertHaApiOk(
          await getHaStatus(),
          HA_STATUS_LOAD_FAILED,
        );
        const local = normalizeHaStatusNode(localRes);
        setLocalStatus(local);

        if (isHaStatusEnabled(local)) {
          try {
            const peerRes = assertHaApiOk(
              await getHaPeerStatus(),
              HA_STATUS_LOAD_FAILED,
            );
            setPeerStatus(normalizeHaPeerStatus(peerRes));
          } catch (peerError) {
            if (!silent) {
              showBanner(
                "error",
                getHaStatusErrorMessage(peerError, HA_STATUS_LOAD_FAILED),
              );
            }
          }
        } else {
          setPeerStatus(emptyPeer);
        }
      } catch (error) {
        if (!silent) {
          showBanner(
            "error",
            getHaStatusErrorMessage(error, HA_STATUS_LOAD_FAILED),
          );
        }
      } finally {
        setLoading(false);
        if (silent) {
          silentRefreshRef.current = false;
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [showBanner],
  );

  useEffect(() => {
    loadStatus({ silent: false });
  }, [loadStatus]);

  const runAction = useCallback(
    async (command, runner, failedFallback) => {
      if (actionBusy) return;
      setActionBusy(command);
      try {
        const res = assertHaApiOk(await runner(), failedFallback);
        return res;
      } catch (error) {
        const text = getHaStatusErrorMessage(error, failedFallback);
        showBanner("error", text);
        appendOutput(command, text);
        return null;
      } finally {
        setActionBusy("");
      }
    },
    [actionBusy, appendOutput, showBanner],
  );

  const handlePhoneCheck = useCallback(async () => {
    const res = await runAction(
      HA_STATUS_BTN_PHONE_CHECK,
      getHaPhoneCheck,
      HA_STATUS_PHONE_CHECK_FAILED,
    );
    if (!res) return;

    appendOutput(HA_STATUS_BTN_PHONE_CHECK, formatHaPhoneCheckOutput(res));

    if (res.split_brain) {
      showBanner("error", res.message || HA_STATUS_SPLIT_BRAIN);
      return;
    }
    if (res.ok === false || res.enabled === false) {
      showBanner("warning", res.message || HA_STATUS_PHONE_CHECK_FAILED);
    } else {
      setBanner({ type: "", text: "" });
    }
  }, [appendOutput, runAction, showBanner]);

  const handleCheck = useCallback(async () => {
    const res = await runAction(
      HA_STATUS_BTN_CHECK,
      getHaCheck,
      HA_STATUS_CHECK_FAILED,
    );
    if (!res) return;

    appendOutput(HA_STATUS_BTN_CHECK, res.output || formatHaPhoneCheckOutput(res));

    if (res.ok === false) {
      const problems = res.problem_count;
      showBanner(
        "warning",
        res.message ||
          (problems
            ? `check found ${problems} problem(s).`
            : HA_STATUS_CHECK_FAILED),
      );
    } else {
      setBanner({ type: "", text: "" });
    }
  }, [appendOutput, runAction, showBanner]);

  const handleSyncDb = useCallback(async () => {
    if (actionBusy) return;
    setActionBusy(HA_STATUS_BTN_SYNC_DB);
    setSyncDbOpen(true);
    syncDbOpenRef.current = true;
    try {
      const res = assertHaApiOk(await postHaSyncDb(), HA_STATUS_SYNC_DB_FAILED);
      appendOutput(
        HA_STATUS_BTN_SYNC_DB,
        res.output || res.message || "Database sync finished.",
      );
      if (res.status && typeof res.status === "object") {
        setLocalStatus(normalizeHaStatusNode(res.status));
      }
      showBanner("success", res.message || "Database sync finished.");
    } catch (error) {
      const text = getHaStatusErrorMessage(error, HA_STATUS_SYNC_DB_FAILED);
      const busyText =
        error?.response?.status === 409 || error?.response?.data?.busy
          ? error?.response?.data?.message ||
            error?.response?.data?.error ||
            HA_STATUS_BUSY
          : text;
      showBanner("error", busyText);
      appendOutput(HA_STATUS_BTN_SYNC_DB, busyText);
    } finally {
      syncDbOpenRef.current = false;
      setSyncDbOpen(false);
      setActionBusy("");
    }
    loadStatus({ silent: true });
  }, [actionBusy, appendOutput, loadStatus, showBanner]);

  const haEnabled = isHaStatusEnabled(localStatus || {});

  return {
    localStatus,
    peerStatus,
    haEnabled,
    loading,
    isRefreshing,
    actionBusy,
    syncDbOpen,
    banner,
    output,
    setBanner,
    setOutput,
    loadStatus,
    handlePhoneCheck,
    handleCheck,
    handleSyncDb,
  };
}
