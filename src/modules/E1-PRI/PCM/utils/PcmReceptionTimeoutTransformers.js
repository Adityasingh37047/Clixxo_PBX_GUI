import { PCM_RECEPTION_TIMEOUT_INITIAL_FORM } from "../../../../constants/PcmReceptionTimeoutConstants";

export const buildDefaultPcmReceptionTimeoutForm = () => ({
  ...PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
});

export const pcmReceptionTimeoutFormFromRow = (timeoutData) => ({
  ...timeoutData,
});

export const formatPcmReceptionTimeoutCell = (value) =>
  value ?? "—";
