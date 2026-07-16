export const mapCallBackFromApi = (item) => ({
  id: item.id,
  name: item.name || "",
  delay: item.delay_sec != null ? String(item.delay_sec) : "10",
  strip: item.strip_digits != null ? String(item.strip_digits) : "",
  prepend: item.prepend || "",
  destination: item.destination || "",
  throughAuto: item.through_mode === "auto",
  throughFromComeIn: item.through_mode === "from_in",
  throughSelect: item.through_mode === "select",
});

export const normalizeCallBackList = (res) => {
  const raw = res?.message ?? res?.data ?? res;
  return Array.isArray(raw) ? raw : [];
};

export const mapSipExtensionsFromApi = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res)
      ? res
      : [];
  return list
    .map((item) => String(item.extension ?? ""))
    .filter((x) => x)
    .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
};

export const mapTrunkIdsFromApi = (res) => {
  const raw = res?.message ?? res?.data ?? res;
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((t) => t?.trunk_id || t?.id || t)
    .filter(Boolean)
    .map(String);
};

export const callBackFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  delay: row.delay ?? "",
  strip: row.strip ?? "",
  prepend: row.prepend ?? "",
  destination: row.destination || "",
  throughAuto: !!row.throughAuto,
  throughFromComeIn: !!row.throughFromComeIn,
  throughSelect: !!row.throughSelect,
});

export const buildCallBackApiPayload = ({
  name,
  delay,
  strip,
  prepend,
  destination,
  throughSelect,
  throughFromComeIn,
}) => {
  const trimmedName = name.trim();
  const delaySec = Number(delay) || 0;
  const stripDigits = strip === "" ? 0 : Number(strip) || 0;

  let through_mode = "auto";
  if (throughSelect) through_mode = "select";
  else if (throughFromComeIn) through_mode = "from_in";

  return {
    name: trimmedName,
    delay_sec: delaySec,
    strip_digits: stripDigits,
    prepend,
    destination,
    through_mode,
    enabled: true,
    trunks: [],
  };
};
