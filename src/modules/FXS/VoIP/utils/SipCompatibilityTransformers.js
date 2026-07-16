import { SIP_COMPATIBILITY_FIELDS } from "../../../../constants/SipCompatibilityConstants";

export const SIP_COMPATIBILITY_LEFT_COLUMN_LAYOUT = [
  {
    type: "fields",
    keys: ["obtainCalleeId", "callerIdPosition", "obtainCallerId"],
  },
  { type: "group", parent: "callTransferMode", children: ["internalHandle"] },
  { type: "group", parent: "callFlashMode", children: ["holdMusicSource"] },
  {
    type: "fields",
    keys: ["maxWaitAnswer", "sipIdentifying", "maxWaitRtp"],
  },
  { type: "group", parent: "manageRefer", children: ["fxoHangupTime"] },
];

export const SIP_COMPATIBILITY_RIGHT_COLUMN_LAYOUT = [
  {
    type: "fields",
    keys: ["useSourceAddress", "useContactAddress", "twoStageDialing"],
  },
  { type: "group", parent: "abnormalHangup", children: ["abnormalHangupCycle"] },
  {
    type: "group",
    parent: "serverStatusDetection",
    children: ["cycle", "sendCueTone"],
  },
  {
    type: "group",
    parent: "sipEncryption",
    children: ["encryptionCriterion", "identifier", "key"],
  },
  { type: "fields", keys: ["rtpEncryption", "invite100rel", "ignoreAck"] },
  {
    type: "group",
    parent: "userDefinedSipCode",
    children: ["noIdlePort", "calledPartyDisconnected", "routeFailed"],
  },
  { type: "fields", keys: ["useIptables"] },
];

export const getSipCompatibilityInitialState = () => {
  const state = {};
  SIP_COMPATIBILITY_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

export const getSipCompatibilityFieldByKey = (key) =>
  SIP_COMPATIBILITY_FIELDS.find((field) => field.key === key);
