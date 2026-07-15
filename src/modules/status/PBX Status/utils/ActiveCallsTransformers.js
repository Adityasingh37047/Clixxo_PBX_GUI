/**
 * Phone often shows 1s less than our timer (we mark Up slightly before phone counts,
 * or phone starts on media). Subtract this many seconds from displayed talking time.
 */
export const TALKING_DISPLAY_OFFSET_SEC = 1;

/** Hangup on 2nd leg returns ARI 404 after 1st leg already tore down — treat as OK */
export function isChannelAlreadyGone(resOrErr) {
  const msg = JSON.stringify(resOrErr?.message ?? resOrErr ?? "");
  return /channel not found/i.test(msg) || /ARI 404/i.test(msg);
}

/** Parse creationtime e.g. "2026-03-12T10:55:20.580+0530" to Date */
export function parseCreationTime(iso) {
  if (!iso || typeof iso !== "string") return null;
  // Java-style offset +0530 → +05:30 for ISO parsing
  const normalized = iso.replace(
    /([+-])(\d{2})(\d{2})$/,
    (_, s, h, m) => `${s}${h}:${m}`,
  );
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Stable key per call instance (new call = new channel ids) */
export function callInstanceKey(ch) {
  const ids = ch._mergedChannelIds?.length
    ? [...ch._mergedChannelIds]
    : ch.id
      ? [ch.id]
      : [];
  if (!ids.length) return "";
  return [...ids].sort().join(",");
}

/** Persist talking start across route changes (ref is lost on unmount) */
export const TALKING_START_STORAGE_KEY = "activeCallsTalkingStarts";

export function loadTalkingStartsPersisted() {
  try {
    const raw = sessionStorage.getItem(TALKING_START_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function saveTalkingStartsPersisted(obj) {
  try {
    sessionStorage.setItem(TALKING_START_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* quota or private mode */
  }
}

/**
 * Format elapsed as H:MM:SS from Date or timestamp ms.
 * offsetSec: subtract from elapsed (e.g. align GUI with phone timer).
 */
export function formatDuration(startDateOrMs, offsetSec = 0) {
  if (startDateOrMs == null) return "0:00:00";
  const t =
    typeof startDateOrMs === "number"
      ? startDateOrMs
      : (startDateOrMs.getTime?.() ?? 0);
  if (!t) return "0:00:00";
  const rawSec = Math.floor((Date.now() - t) / 1000);
  const sec = Math.max(0, rawSec - (offsetSec | 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Map API state to display label */
export function stateLabel(state) {
  if (!state) return "—";
  const u = String(state).toLowerCase();
  if (u === "up") return "Talking";
  if (u === "ring") return "Ringing";
  if (u === "ringing") return "Ringing";
  return state;
}

/**
 * ARI returns one channel per leg (1005→1004 and 1004→1005). Same call → same
 * unordered pair of numbers. Merge into one card and hang up all legs.
 */
export function normalizeEndpoint(n) {
  return String(n || "").trim();
}

/** Stable key for two-party call: sorted numbers joined. Single unknown → no merge. */
export function callPairKey(ch) {
  const a = normalizeEndpoint(ch.caller?.number);
  const b = normalizeEndpoint(ch.connected?.number);
  if (!a || !b) return null;
  if (a === b) return null; // same both sides, don't merge with others by pair
  return [a, b].sort().join("\u0000");
}

/**
 * Extract the dialed number from ARI app_data when app_name is "Dial".
 * e.g. "PJSIP/07309377930@bsnl,30,..." → "07309377930"
 */
export function extractDialedFromAppData(appName, appData) {
  if (appName !== "Dial" || !appData) return null;
  const m = String(appData).match(/^(?:PJSIP|SIP)\/(\+?\d+)[@,\/]/i);
  return m ? m[1] : null;
}

/**
 * Merge channels that share the same two endpoints (reciprocal legs).
 * Uses earliest creationtime across legs so duration starts from first leg, not second.
 * "Down" state channels are helper subroutines (e.g. set-pai) and are filtered out first.
 */
export function mergeCallLegs(list) {
  if (!Array.isArray(list)) return [];
  // Filter out "Down" channels — these are completed helper subroutines, not real call legs
  const active = list.filter(
    (ch) => String(ch.state || "").toLowerCase() !== "down",
  );
  if (active.length <= 1)
    return active.map((ch) => ({ ...ch, _allLegs: [ch] }));

  const byKey = new Map();
  const noKey = [];

  for (const ch of active) {
    const key = callPairKey(ch);
    if (!key) {
      noKey.push(ch);
      continue;
    }
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(ch);
  }

  const merged = [];
  for (const [, group] of byKey) {
    if (group.length === 1) {
      merged.push({ ...group[0], _allLegs: group });
      continue;
    }
    // Same pair, multiple legs → one logical call
    const dates = group
      .map((ch) => ({ ch, d: parseCreationTime(ch.creationtime) }))
      .filter((x) => x.d);
    const earliest = dates.length
      ? dates.reduce((min, x) => (x.d < min.d ? x : min), dates[0])
      : null;
    const primary = earliest ? earliest.ch : group[0];
    const channelIds = group.map((c) => c.id).filter(Boolean);
    merged.push({
      ...primary,
      _mergedChannelIds: channelIds,
      _allLegs: group,
      _mergedCreationTime: earliest
        ? earliest.d
        : parseCreationTime(primary.creationtime),
    });
  }

  return [...merged, ...noKey];
}

/** Returns true if the string is a real number (not ARI placeholder "s") */
export function isRealNumber(n) {
  if (!n || typeof n !== "string") return false;
  const t = n.trim();
  return t.length > 0 && t !== "s" && t !== "unknown" && t !== "anonymous";
}

/** Extract endpoint id from ARI channel name, e.g. "PJSIP/1002-00000094" → "1002" */
export function extractEndpointFromName(name) {
  const m = String(name || "").match(/^(?:PJSIP|SIP)\/([^-\/]+)/i);
  return m ? m[1] : null;
}

/** True if string looks like a phone number or extension (digits only, 3+) */
export function isNumberLike(s) {
  return /^\d{3,}$/.test(s || "");
}

/**
 * Resolve the real caller and callee from a (possibly merged) channel.
 *
 * Strategy:
 *  - Originating leg: app_name !== "AppDial" (the leg that placed the call)
 *  - Destination leg: app_name === "AppDial" (the leg that was dialed)
 *
 * Caller  → originating leg's caller.number (if real) or extract from its name
 * Callee  → destination leg's channel name endpoint (best for ext→ext / inbound PSTN)
 *           then originating leg's connected.number (best for outbound ext→PSTN)
 */
export function resolveCallerCallee(ch) {
  const legs = ch._allLegs || [ch];

  const origLeg =
    legs.find((l) => l.dialplan?.app_name !== "AppDial") ?? legs[0];
  const destLeg = legs.find((l) => l.dialplan?.app_name === "AppDial") ?? null;

  const rawCallerNum = origLeg?.caller?.number;
  const rawConnectedNum = origLeg?.connected?.number;
  // When caller.number === connected.number both sides carry the DID/caller-ID,
  // not the real endpoint — fall back to extracting from the channel name.
  const sameOnBothSides =
    isRealNumber(rawCallerNum) && rawCallerNum === rawConnectedNum;

  // --- Caller ---
  let caller = null;
  if (!sameOnBothSides && isRealNumber(rawCallerNum)) caller = rawCallerNum;
  if (!caller && !sameOnBothSides && isRealNumber(origLeg?.caller?.name))
    caller = origLeg.caller.name;
  // Always try channel name as fallback (gives extension id like "1001")
  if (!caller) {
    const ep = extractEndpointFromName(origLeg?.name);
    if (ep && isNumberLike(ep)) caller = ep;
  }

  // --- Callee ---
  let callee = null;
  // 1. Dialed number from app_data ("PJSIP/07309377930@bsnl,...") — best for outbound
  const fromAppData = extractDialedFromAppData(
    origLeg?.dialplan?.app_name,
    origLeg?.dialplan?.app_data,
  );
  if (fromAppData) callee = fromAppData;
  // 2. Numeric endpoint from destination leg name (inbound PSTN→ext, ext→ext)
  if (!callee && destLeg) {
    const ep = extractEndpointFromName(destLeg.name);
    if (ep && isNumberLike(ep)) callee = ep;
  }
  // 3. connected number — only if it differs from caller (not a DID-mirror)
  if (
    !callee &&
    isRealNumber(rawConnectedNum) &&
    rawConnectedNum !== rawCallerNum
  )
    callee = rawConnectedNum;
  if (
    !callee &&
    isRealNumber(origLeg?.connected?.name) &&
    origLeg.connected.name !== rawCallerNum
  )
    callee = origLeg.connected.name;
  // 4. destLeg's caller number
  if (!callee && destLeg && isRealNumber(destLeg?.caller?.number))
    callee = destLeg.caller.number;

  return { caller: caller || "—", callee: callee || "—" };
}

/**
 * Build a display line like external_wan/+number from channel name + caller
 */
export function channelDisplayLine(channel) {
  const name = channel?.name || "";
  const callerNum = channel?.caller?.number || "";
  const ctx = channel?.dialplan?.context || "";
  // SS-style first line: external_wan/+number when context + caller present
  if (ctx && callerNum) {
    return `${ctx}/${callerNum}`;
  }
  if (name.startsWith("PJSIP/")) {
    const part = name.split("/")[1] || "";
    const endpoint = part.split("-")[0] || part;
    if (callerNum && callerNum !== endpoint) return `${endpoint}/${callerNum}`;
    return callerNum || name;
  }
  return callerNum || name || "—";
}
