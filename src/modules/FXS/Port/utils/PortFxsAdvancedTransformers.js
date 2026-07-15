import {
  PORT_FXS_ADVANCED_INITIAL_DATA,
  PORT_FXS_ADVANCED_TOTAL_PORTS,
  WEEK_DAYS,
} from "../../../../constants/PortFxsAdvancedPageConstants";

export const initializePortFxsAdvancedData = () =>
  Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => ({
    ...PORT_FXS_ADVANCED_INITIAL_DATA,
    port: i + 1,
  }));

export const getInitialPortFxsAdvancedBatchForm = () => {
  const form = {
    port: "1",
    type: "FXS",
    forbidOutgoingCall: false,
    wayOfForbidOutgoingCall: "All time",
    blacklistOfFxsOutCalls: "",
    prohibitLimitCount: 1,
  };

  for (let i = 1; i <= 5; i++) {
    form[`period${i}Start1`] = "00:00:00";
    form[`period${i}End1`] = "00:00:00";
    form[`period${i}Start2`] = "00:00:00";
    form[`period${i}End2`] = "00:00:00";
    form[`period${i}Start3`] = "00:00:00";
    form[`period${i}End3`] = "00:00:00";
    WEEK_DAYS.forEach((day, idx) => {
      form[`period${i}Week${idx}`] = false;
    });
  }

  return form;
};

export const portFxsAdvancedBatchFormFromRow = (port) => ({
  ...getInitialPortFxsAdvancedBatchForm(),
  port: String(port.port),
  type: port.type || "FXS",
});

export const shouldShowPortFxsAdvancedField = (field, batchForm) => {
  if (!field.conditional) return true;
  return !!batchForm[field.conditional];
};
