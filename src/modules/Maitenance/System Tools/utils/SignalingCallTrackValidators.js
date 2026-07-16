export function canStartCallTrack(busy, isTracking) {
  return !busy && !isTracking;
}

export function canStopCallTrack(busy, isTracking) {
  return !busy && isTracking;
}

export function hasTrackData(trackMessage) {
  return Boolean(trackMessage.trim());
}
