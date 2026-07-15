import { FACTORY_RESET_COMMANDS } from "../../../../constants/FactoryResetConstants";

export function getFactoryResetCommand() {
  return FACTORY_RESET_COMMANDS.RESET;
}

export function extractFactoryResetErrorOutput(apiResponse) {
  return String(apiResponse?.responseData || "").trim();
}
