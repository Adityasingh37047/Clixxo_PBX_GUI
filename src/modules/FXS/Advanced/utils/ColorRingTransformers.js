import { COLOR_RING_INITIAL_FORM } from "../../../../constants/ColorRingConstants";

export function resetColorRingForm() {
  return { ...COLOR_RING_INITIAL_FORM };
}

export function colorRingFormFromItem(item) {
  return {
    index: String(item.index),
    description: item.description || "default",
    file: null,
  };
}

export function transformColorRingFileChange(file) {
  if (file) {
    return { fileName: file.name, file };
  }
  return { fileName: "No file chosen", file: null };
}

export function buildColorRingItem({ formData, editIndex, rules }) {
  return {
    id: editIndex !== null ? rules[editIndex].id : Date.now(),
    index: parseInt(formData.index, 10),
    description: formData.description.trim(),
    fileName: formData.file.name,
    file: formData.file,
  };
}
