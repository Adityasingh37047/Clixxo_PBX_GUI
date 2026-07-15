import { useEffect, useRef, useState, useCallback } from "react";
import {
  postAsteriskCLI,
  postLinuxCmd,
  amiOriginate,
  listGroups,
} from "../../../../api/apiService";
import {
  SIGNALING_CALL_TEST_TYPE_OPTIONS,
  SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS,
  SIGNALING_CALL_TEST_POLL_MS,
  SIGNALING_CALL_TEST_POLL_DURATION_MS,
  SIGNALING_CALL_TEST_MESSAGES,
  SIGNALING_CALL_TEST_COMMANDS,
  SIGNALING_CALL_TEST_LOG_MESSAGES,
  SIGNALING_CALL_TEST_TRACE_HEADERS,
  SIGNALING_CALL_TEST_DEFAULTS,
} from "../../../../constants/SignalingCallTestConstants";
import {
  extractCmdOutput,
  resolveAsteriskLogPath,
  buildTrunkGroupOptions,
  buildTraceHeader,
  buildOriginatePayload,
  appendTraceChunk,
  hasClearableCallTestData,
} from "../utils/SignalingCallTestTransformers";
import { validateCalledId } from "../utils/SignalingCallTestValidators";

export function useSignalingCallTestPage() {
  const outputRef = useRef(null);
  const [testType, setTestType] = useState(
    SIGNALING_CALL_TEST_TYPE_OPTIONS[0].value,
  );
  const [trunkGroup, setTrunkGroup] = useState(
    SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS[0].value,
  );
  const [trunkGroupOptions, setTrunkGroupOptions] = useState(
    SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS,
  );
  const [callerId, setCallerId] = useState("");
  const [calledId, setCalledId] = useState("");
  const [originalCallee, setOriginalCallee] = useState("");
  const [trace, setTrace] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(SIGNALING_CALL_TEST_DEFAULTS.toast);

  const logPathRef = useRef("");
  const lineCountRef = useRef(0);
  const pollRef = useRef(null);
  const pollStopRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!outputRef.current || !trace) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [trace]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(SIGNALING_CALL_TEST_DEFAULTS.toast),
      SIGNALING_CALL_TEST_DEFAULTS.toastTimeout,
    );
  };

  const appendTrace = useCallback((chunk) => {
    if (!chunk) return;
    setTrace((prev) => appendTraceChunk(prev, chunk));
  }, []);

  const stopTestSession = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (pollStopRef.current) {
      clearTimeout(pollStopRef.current);
      pollStopRef.current = null;
    }
    if (isRunningRef.current) {
      try {
        await postAsteriskCLI({
          command: SIGNALING_CALL_TEST_COMMANDS.LOGGER_OFF,
        });
      } catch (_) {
        // ignore logger off errors
      }
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const pollLogChunk = useCallback(async () => {
    const logPath = logPathRef.current;
    if (!logPath) return;

    try {
      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.COUNT_LINES(logPath),
      });
      const lineCount = parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.TAIL_LINES(newLines, logPath),
      });
      const chunk = extractCmdOutput(tailRes);
      lineCountRef.current = lineCount;
      appendTrace(chunk);
    } catch (error) {
      console.error(SIGNALING_CALL_TEST_LOG_MESSAGES.POLL_ERROR, error);
    }
  }, [appendTrace]);

  const runAsteriskCmd = async (command) => {
    const res = await postAsteriskCLI({ command });
    if (!res?.response) {
      throw new Error(res?.message || `Failed: ${command}`);
    }
    return extractCmdOutput(res);
  };

  useEffect(() => {
    const loadTrunkGroups = async () => {
      try {
        const res = await listGroups();
        const groups = Array.isArray(res?.message) ? res.message : [];
        if (!groups.length) return;

        const options = buildTrunkGroupOptions(groups);
        if (options.length) {
          setTrunkGroupOptions(options);
          setTrunkGroup((prev) =>
            options.some((opt) => opt.value === prev)
              ? prev
              : options[0].value,
          );
        }
      } catch (error) {
        console.warn(SIGNALING_CALL_TEST_LOG_MESSAGES.TRUNK_LOAD_ERROR, error);
      }
    };

    loadTrunkGroups();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (pollStopRef.current) clearTimeout(pollStopRef.current);
      if (isRunningRef.current) {
        postAsteriskCLI({
          command: SIGNALING_CALL_TEST_COMMANDS.LOGGER_OFF,
        }).catch(() => {});
      }
    };
  }, []);

  const handleStart = async () => {
    if (busy || isRunning) return;

    const caller = callerId.trim();
    const called = calledId.trim();
    const original = originalCallee.trim();

    const calledError = validateCalledId(called);
    if (calledError) {
      showToast(calledError, "error");
      return;
    }

    setBusy(true);
    await stopTestSession();

    const header = buildTraceHeader({
      testType,
      trunkGroup,
      trunkGroupOptions,
      caller,
      called,
      original,
    });

    setTrace(header);

    try {
      const logPath = await resolveAsteriskLogPath(postLinuxCmd);
      logPathRef.current = logPath;

      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TEST_COMMANDS.COUNT_LINES(logPath),
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd(SIGNALING_CALL_TEST_COMMANDS.LOGGER_ON);
      isRunningRef.current = true;
      setIsRunning(true);

      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SIGNALING_CALL_TEST_POLL_MS);

      pollStopRef.current = setTimeout(async () => {
        await stopTestSession();
        appendTrace(`\n${SIGNALING_CALL_TEST_TRACE_HEADERS.TITLE}`);
        showToast(SIGNALING_CALL_TEST_MESSAGES.SIGNALING_FINISHED, "info");
      }, SIGNALING_CALL_TEST_POLL_DURATION_MS);

      appendTrace(SIGNALING_CALL_TEST_MESSAGES.SENDING_ORIGINATE);
      const origRes = await amiOriginate(
        buildOriginatePayload(called, caller),
      );
      if (origRes?.response === false) {
        appendTrace(
          `Originate failed: ${origRes?.message || SIGNALING_CALL_TEST_MESSAGES.UNKNOWN_ERROR}`,
        );
        showToast(
          origRes?.message || SIGNALING_CALL_TEST_MESSAGES.ORIGINATE_FAILED,
          "error",
        );
      } else {
        appendTrace(
          origRes?.message ||
            origRes?.responseData ||
            SIGNALING_CALL_TEST_MESSAGES.ORIGINATE_REQUEST_SENT,
        );
        showToast(SIGNALING_CALL_TEST_MESSAGES.SIGNALING_STARTED, "success");
      }

      await pollLogChunk();
    } catch (error) {
      console.error(SIGNALING_CALL_TEST_LOG_MESSAGES.SIGNALING_ERROR, error);
      await stopTestSession();
      appendTrace(
        `${SIGNALING_CALL_TEST_LOG_MESSAGES.SIGNALING_ERROR}: ${error.message || SIGNALING_CALL_TEST_MESSAGES.FAILED_TO_START_TEST}`,
      );
      showToast(
        error.message || SIGNALING_CALL_TEST_MESSAGES.FAILED_TO_START_TEST,
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    await stopTestSession();
    setCallerId("");
    setCalledId("");
    setOriginalCallee("");
    setTrace("");
    showToast(SIGNALING_CALL_TEST_MESSAGES.FORM_CLEARED, "success");
  };

  const canStart = Boolean(calledId.trim());
  const hasClearableData = hasClearableCallTestData({
    trace,
    callerId,
    calledId,
    originalCallee,
  });

  return {
    outputRef,
    testType,
    setTestType,
    trunkGroup,
    setTrunkGroup,
    trunkGroupOptions,
    callerId,
    setCallerId,
    calledId,
    setCalledId,
    originalCallee,
    setOriginalCallee,
    trace,
    busy,
    isRunning,
    toast,
    setToast,
    handleStart,
    handleClear,
    canStart,
    hasClearableData,
  };
}
