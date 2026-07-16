import {
  SIGNALING_CALL_TEST_TYPE_OPTIONS,
  SIGNALING_CALL_TEST_LOG_CANDIDATES,
  SIGNALING_CALL_TEST_COMMANDS,
  SIGNALING_CALL_TEST_TRACE_HEADERS,
} from "../../../../constants/SignalingCallTestConstants";

export function extractCmdOutput(res) {
  return String(res?.responseData ?? res?.data ?? "").trim();
}

export async function resolveAsteriskLogPath(postLinuxCmd) {
  for (const path of SIGNALING_CALL_TEST_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: SIGNALING_CALL_TEST_COMMANDS.CHECK_READABLE(path),
    });
    if (extractCmdOutput(res) === "OK") return path;
  }
  return SIGNALING_CALL_TEST_LOG_CANDIDATES[0];
}

export function getTestTypeLabel(value) {
  return (
    SIGNALING_CALL_TEST_TYPE_OPTIONS.find((opt) => opt.value === value)?.label ||
    value
  );
}

export function getTrunkGroupLabel(value, options) {
  return options.find((opt) => opt.value === value)?.label || value;
}

export function buildTrunkGroupOptions(groups) {
  return groups
    .map((group) => {
      const id = String(group.group_id ?? group.id ?? "").trim();
      if (!id) return null;
      return { value: id, label: `SIP Trunk Group[${id}]` };
    })
    .filter(Boolean);
}

export function buildTraceHeader({
  testType,
  trunkGroup,
  trunkGroupOptions,
  caller,
  called,
  original,
}) {
  return [
    `=== ${SIGNALING_CALL_TEST_TRACE_HEADERS.TITLE} ===`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.TIME}: ${new Date().toLocaleString()}`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.TEST_TYPE}: ${getTestTypeLabel(testType)}`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.TRUNK_GROUP}: ${getTrunkGroupLabel(trunkGroup, trunkGroupOptions)}`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.CALLER_ID}: ${caller || SIGNALING_CALL_TEST_TRACE_HEADERS.EMPTY}`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.CALLED_ID}: ${called}`,
    `${SIGNALING_CALL_TEST_TRACE_HEADERS.ORIGINAL_CALLEE}: ${original || SIGNALING_CALL_TEST_TRACE_HEADERS.EMPTY}`,
    "",
  ].join("\n");
}

export function buildOriginatePayload(called, caller) {
  const payload = { extension: called };
  if (caller) {
    payload.callerid = `"${caller}" <${caller}>`;
  }
  return payload;
}

export function appendTraceChunk(prev, chunk) {
  if (!chunk) return prev;
  return prev ? `${prev}\n${chunk}` : chunk;
}

export function hasClearableCallTestData({
  trace,
  callerId,
  calledId,
  originalCallee,
}) {
  return (
    Boolean(trace.trim()) ||
    Boolean(callerId.trim()) ||
    Boolean(calledId.trim()) ||
    Boolean(originalCallee.trim())
  );
}
