export function isValidPid(pid) {
  return Boolean(pid && /^\d+$/.test(pid));
}

export function isPidRunningStatus(status) {
  return status === "RUNNING";
}

export function canStartCapture(isCapturing, isStopping, slotRecording) {
  const anySlot =
    slotRecording.ts.some(Boolean) || slotRecording.e1.some(Boolean);
  return !isCapturing && !isStopping && !anySlot;
}

export function canCleanData(isStopping, slotStopping) {
  return (
    !isStopping &&
    !slotStopping.ts.some(Boolean) &&
    !slotStopping.e1.some(Boolean)
  );
}
