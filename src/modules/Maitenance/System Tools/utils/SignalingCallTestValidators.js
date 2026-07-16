import { SIGNALING_CALL_TEST_MESSAGES } from "../../../../constants/SignalingCallTestConstants";

export function validateCalledId(called) {
  if (!called.trim()) {
    return SIGNALING_CALL_TEST_MESSAGES.CALLED_ID_REQUIRED;
  }
  return null;
}

export function canStartCallTest(busy, isRunning, calledId) {
  return !busy && !isRunning && Boolean(calledId.trim());
}

export function shouldBlockCallTestStart(busy, isRunning) {
  return busy || isRunning;
}
