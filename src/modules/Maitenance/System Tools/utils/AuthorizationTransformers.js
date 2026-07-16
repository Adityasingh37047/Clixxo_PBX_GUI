import {
  DEFAULT_DEVICE_TYPE,
  DEFAULT_EXPIRY_DATE,
  DEFAULT_MAX_E1_PRI,
} from "../../../../constants/AuthorizationConstants";

function strOrEmpty(v) {
  return v === "" || v === undefined || v === null ? "" : String(v);
}

export function createEmptyLicenseInfo() {
  return {
    serial: "",
    deviceType: "",
    expireDate: "",
    sipExtensions: "",
    fxsPorts: "",
    maxFxoChannels: "",
    maxSipTrunkChannels: "",
    maxE1: "",
  };
}

export function parseLicensePayload(responseData) {
  if (responseData == null || responseData === "") {
    return createEmptyLicenseInfo();
  }
  let parsed = responseData;
  if (typeof responseData === "string") {
    try {
      parsed = JSON.parse(responseData);
    } catch {
      return {
        ...createEmptyLicenseInfo(),
        serial: String(responseData).trim(),
      };
    }
  }
  if (typeof parsed !== "object" || parsed === null) {
    return createEmptyLicenseInfo();
  }

  const sipExt =
    parsed.max_sip_extensions ??
    parsed.sip_extensions ??
    parsed.total_extensions ??
    parsed.max_extensions ??
    parsed.extension_count ??
    parsed.extensions ??
    parsed.num_extensions ??
    "";

  const fxs =
    parsed.max_fxs_ports ??
    parsed.fxs_ports ??
    parsed.number_of_fxs_ports ??
    parsed.fxs_port_count ??
    parsed.num_fxs ??
    "";

  const fxoCh =
    parsed.max_fxo_channels ??
    parsed.max_fxo ??
    parsed.fxo_channels ??
    parsed.number_of_fxo_channels ??
    parsed.num_fxo_channels ??
    parsed.fxo_channel_count ??
    "";

  const tr =
    parsed.max_trunks ??
    parsed.number_of_trunks ??
    parsed.trunks ??
    parsed.trunk_count ??
    parsed.num_trunks ??
    "";

  const sipTrunkCh =
    parsed.max_sip_trunk_channels ??
    parsed.sip_trunk_channels ??
    parsed.max_trunk_channels ??
    parsed.trunk_sip_channels ??
    parsed.sip_trunk_channel_count ??
    parsed.channels_sip_trunks ??
    "";

  const sipTrunkDisplay = strOrEmpty(sipTrunkCh) || strOrEmpty(tr);

  const e1 =
    parsed.max_e1 ??
    parsed.max_e1_channels ??
    parsed.e1_channels ??
    parsed.number_of_e1 ??
    parsed.num_e1 ??
    parsed.e1 ??
    "";

  return {
    serial:
      parsed.license_key ||
      parsed.Serial_Number ||
      parsed.serial_number ||
      parsed.serial ||
      "",
    deviceType:
      parsed.device_type ||
      parsed.deviceType ||
      parsed.product_type ||
      parsed.model ||
      parsed.product ||
      "",
    expireDate:
      parsed.expire_date ||
      parsed.expiry_date ||
      parsed.expireDate ||
      parsed.expiration_date ||
      "",
    sipExtensions: strOrEmpty(sipExt),
    fxsPorts: strOrEmpty(fxs),
    maxFxoChannels: strOrEmpty(fxoCh),
    maxSipTrunkChannels: sipTrunkDisplay,
    maxE1: strOrEmpty(e1),
  };
}

export function applyLicenseDefaults(parsed) {
  return {
    serial: parsed.serial || "",
    deviceType: parsed.deviceType || DEFAULT_DEVICE_TYPE,
    expireDate: parsed.expireDate || DEFAULT_EXPIRY_DATE,
    sipExtensions: parsed.sipExtensions || "",
    fxsPorts: parsed.fxsPorts || "",
    maxFxoChannels: parsed.maxFxoChannels || "",
    maxSipTrunkChannels: parsed.maxSipTrunkChannels || "",
    maxE1: parsed.maxE1 || DEFAULT_MAX_E1_PRI,
  };
}

export function formatDisplayDate(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) return String(v).trim();
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  return String(v);
}

export function extractSerialFromSystemInfo(data) {
  if (!data?.success || !data?.details) return "";
  const versionInfo = Array.isArray(data.details.VERSION_INFO)
    ? data.details.VERSION_INFO
    : [];
  const serialEntry = versionInfo.find((item) => {
    const label = String(item?.label || "")
      .trim()
      .toLowerCase();
    return (
      label === "serial number" ||
      label === "serial" ||
      label === "serial no"
    );
  });
  const serialValue = String(serialEntry?.value || "").trim();
  if (serialValue && serialValue.toLowerCase() !== "unavailable") {
    return serialValue;
  }
  return "";
}

export function extractSerialFromAstLicense(responseData) {
  const out = String(responseData || "");
  const lines = out.split(/\r?\n/);
  const astLicLine =
    lines.find((l) => l.trim().toLowerCase().startsWith("astlic:")) || "";
  if (!astLicLine) return "";
  const afterColon = astLicLine.split(":").slice(1).join(":");
  const fields = afterColon.split(",").map((s) => s.trim());
  if (fields.length >= 2 && fields[1]) return fields[1];
  return "";
}
