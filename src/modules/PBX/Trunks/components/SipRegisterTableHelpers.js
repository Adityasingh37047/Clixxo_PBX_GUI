import { sipRegisterFields } from "../../../../constants/SipRegisterConstants";
import { C } from "../../../../theme/pbxTokens";

export const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";

export const trunkTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

export const trunkTableInnerStyle = {
  minWidth: "100%",
  width: "max-content",
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

export const formatSipRegisterStatusLabel = (raw) => {
  const s = String(raw || "").trim();
  if (s.toLowerCase() === "not registering") return "Not registered";
  return s;
};

export const getSipRegisterStatusStyle = (raw) => {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return { bg: "transparent", color: "#475569" };

  const isFailure =
    s === "unregistered" ||
    s === "not registered" ||
    s === "not registering" ||
    s.startsWith("not regist") ||
    s === "rejected" ||
    s.includes("reject") ||
    s.includes("failed") ||
    s.includes("failure");

  if (isFailure) {
    return { bg: "transparent", color: "#dc2626" };
  }

  if (s === "pending" || s === "registering" || s.includes("pending")) {
    return { bg: "transparent", color: "#d97706" };
  }

  if (s === "registered" || s.includes("registered")) {
    return { bg: "transparent", color: "#16a34a" };
  }

  return { bg: "transparent", color: "#475569" };
};

export const SIP_REGISTER_TABLE_WIDE_MIN = 1200;

const SIP_REGISTER_HIDDEN_TABLE_FIELDS = [
  "index",
  "auth_username",
  "password",
  "provider",
  "Domain name",
  "Contact User",
  "Outbound Proxy",
  "sip_header",
  "from_user",
  "expire_in_sec",
  "context",
  "allow_codecs",
];

export const SIP_REGISTER_VISIBLE_TABLE_FIELDS = sipRegisterFields.filter(
  (f) => !SIP_REGISTER_HIDDEN_TABLE_FIELDS.includes(f.name),
);

export const sipRegisterCheckboxCellStyle = {
  width: 40,
  minWidth: 40,
  maxWidth: 40,
  padding: 0,
  borderLeft: "none",
  textAlign: "center",
  verticalAlign: "middle",
};

export const sipRegisterCheckboxWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 32,
};

export const sipRegisterIdCellStyle = {
  width: 44,
  minWidth: 44,
  maxWidth: 44,
  textAlign: "center",
  padding: "6px 2px",
};

export const sipRegisterIdCenterWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  textAlign: "center",
};

export const sipRegisterStatusCellStyle = {
  width: 118,
  minWidth: 118,
  maxWidth: 118,
  textAlign: "center",
  padding: "7px 4px",
};

export const sipRegisterModifyCellStyle = {
  width: 70,
  minWidth: 70,
  maxWidth: 70,
  padding: "7px 6px",
  borderRight: "none",
};

const sipRegisterHeaderCellStyle100 = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: 10,
  letterSpacing: "0.04em",
  padding: "6px 4px",
  lineHeight: 1.3,
  verticalAlign: "middle",
};

const sipRegisterDataCellStyle100 = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: 11,
  paddingLeft: 5,
  paddingRight: 5,
  lineHeight: 1.3,
  verticalAlign: "middle",
  maxWidth: 0,
};

export const SIP_REGISTER_TABLE_HEADER_LABELS = {
  trunk_id: "Trunk ID",
  username: "Username",
  server_domain: "Server Domain",
  client_domain: "Client Domain",
  identity_ip: "Ident. IP",
};

const sipRegisterZoomCellStyle = {
  whiteSpace: "nowrap",
  overflow: "visible",
  maxWidth: "none",
};

export const getSipRegisterDataCellStyle = (zoomed) =>
  zoomed ? sipRegisterZoomCellStyle : sipRegisterDataCellStyle100;

export const getSipRegisterHeaderCellStyle = (zoomed) =>
  zoomed ? sipRegisterZoomCellStyle : sipRegisterHeaderCellStyle100;

export const sipRegisterFieldColumnWidths = {
  trunk_id: 100,
  username: 140,
  server_domain: 240,
  client_domain: 320,
  identity_ip: 130,
};

export const sipRegisterFieldColumnPercents = {
  trunk_id: "8%",
  username: "11%",
  server_domain: "16%",
  client_domain: "22%",
  identity_ip: "10%",
};

export const SIP_REGISTER_ZOOM_TABLE_WIDTH = Math.max(
  SIP_REGISTER_TABLE_WIDE_MIN,
  40 +
    44 +
    118 +
    72 +
    Object.values(sipRegisterFieldColumnWidths).reduce(
      (sum, width) => sum + width,
      0,
    ),
);

export const SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH = SIP_REGISTER_ZOOM_TABLE_WIDTH;

export const sipRegisterFixedCellStyle = (baseStyle, zoomed) =>
  zoomed
    ? { ...baseStyle, maxWidth: "none" }
    : {
        ...baseStyle,
        width: undefined,
        minWidth: undefined,
        maxWidth: undefined,
      };
