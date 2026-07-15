export const validateFormData = (data, editIndex, allData) => {
  const errors = [];

  // Required field validation
  if (!data.id || data.id.toString().trim() === "") {
    errors.push("Span ID is required");
  }
  if (!data.context || data.context.trim() === "") {
    errors.push("Context is required");
  }
  if (!data.signalling || data.signalling.trim() === "") {
    errors.push("Signalling is required");
  }
  if (!data.bchan || data.bchan.trim() === "") {
    errors.push("Channel is required");
  }

  // Numeric validation
  if (data.id && isNaN(Number(data.id))) {
    errors.push("Span ID must be a valid number");
  }
  if (data.group && isNaN(Number(data.group))) {
    errors.push("Group must be a valid number");
  }
  if (data.pickupgroup && isNaN(Number(data.pickupgroup))) {
    errors.push("Pickup Group must be a valid number");
  }
  if (data.callgroup && isNaN(Number(data.callgroup))) {
    errors.push("Call Group must be a valid number");
  }
  if (data.rxgain && isNaN(Number(data.rxgain))) {
    errors.push("Rx Gain must be a valid number");
  }
  if (data.txgain && isNaN(Number(data.txgain))) {
    errors.push("Tx Gain must be a valid number");
  }

  // Duplicate Span ID validation (only for new items, not for editing)
  if (editIndex === -1 && data.id) {
    const spanIdExists = allData.some(
      (item) =>
        (item.span_id || item.span?.id)?.toString() === data.id.toString(),
    );
    if (spanIdExists) {
      errors.push(
        `Span ID ${data.id} already exists. Please use a different number.`,
      );
    }
  }

  return errors;
};
