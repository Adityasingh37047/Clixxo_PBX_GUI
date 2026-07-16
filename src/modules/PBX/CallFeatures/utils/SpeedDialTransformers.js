export const normalizeSpeedDialList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

export const mapSpeedDialFromApi = (item) => ({
  id: item?.id,
  name: String(item?.name || ""),
  speedDialNumber: String(item?.speed_number || ""),
  destination: String(item?.destination || ""),
});

export const speedDialFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  speedDialNumber: row.speedDialNumber || "",
  destination: row.destination || "",
});

export const buildSpeedDialApiPayload = ({ name, speedDialNumber, destination }) => ({
  name: name.trim(),
  speed_number: speedDialNumber.trim(),
  destination: destination.trim(),
});
