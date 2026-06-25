// Initial form state for Ringing Scheme
export const RINGING_SCHEME_INITIAL_FORM = {
  ringScheme: '0', // 0 = CallerID Matching, 1 = Alert-Info Matching
  
  // Scheme 1
  ringCallerId1: '',
  ringAlertInfo1: '',
  ringMode1: '',
  ringMode1bak: '',
  
  // Scheme 2
  ringCallerId2: '',
  ringAlertInfo2: '',
  ringMode2: '',
  ringMode2bak: '',
  
  // Scheme 3
  ringCallerId3: '',
  ringAlertInfo3: '',
  ringMode3: '',
  ringMode3bak: '',
  
  // Scheme 4
  ringCallerId4: '',
  ringAlertInfo4: '',
  ringMode4: '',
  ringMode4bak: '',
};

const ringModeTooltip = (n) =>
  `Comma-separated ringing cadence for scheme ${n}.\nFormat type 1: 1,ON_ms,OFF_ms.\nFormat type 2: 2,T1,T2,T3,T4.\nEach ON/OFF duration ≥ 50 ms; last OFF ≥ 1700 ms when FSK CID follows ring.\nRequired when the matching CallerID or Alert-Info value is set.`;

const ringCallerIdTooltip = (n) =>
  `CallerID pattern for scheme ${n} (CallerID Matching mode).\nAllowed: 0–9, A–Z, a–z, '.', '[', ']', '-', ',', '*'.\nMax 128 characters. Must be unique across schemes.`;

const ringAlertInfoTooltip = (n) =>
  `SIP Alert-Info header value for scheme ${n} (Alert-Info Matching mode).\nBlocked characters: space and !\"&'();=\\|~.\nMust be unique across schemes.`;

/** Ringing scheme matching (RingingSchemePage) — local form state */
export const RINGING_SCHEME_FIELD_TOOLTIPS = {
  ringScheme:
    "Matching method for custom ring cadences.\nCallerID Matching — match inbound CallerID.\nAlert-Info Matching — match SIP Alert-Info header.",
  ringCallerId1: ringCallerIdTooltip(1),
  ringCallerId2: ringCallerIdTooltip(2),
  ringCallerId3: ringCallerIdTooltip(3),
  ringCallerId4: ringCallerIdTooltip(4),
  ringAlertInfo1: ringAlertInfoTooltip(1),
  ringAlertInfo2: ringAlertInfoTooltip(2),
  ringAlertInfo3: ringAlertInfoTooltip(3),
  ringAlertInfo4: ringAlertInfoTooltip(4),
  ringMode1: ringModeTooltip(1),
  ringMode2: ringModeTooltip(2),
  ringMode3: ringModeTooltip(3),
  ringMode4: ringModeTooltip(4),
};

