export const buildCallerIDReservePoolSaveData = (formData) => {
  const { originalIndex, ...dataToSave } = formData;
  return dataToSave;
};
