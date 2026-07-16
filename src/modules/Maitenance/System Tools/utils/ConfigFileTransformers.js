import {
  CONFIG_FILE_CONTENT_MAP,
  CONFIG_FILE_OPTIONS,
} from "../../../../constants/ConfigFileConstants";

export function getConfigFileDefaultSelection() {
  return CONFIG_FILE_OPTIONS[0].value;
}

export function getConfigFileDefaultContent() {
  return CONFIG_FILE_CONTENT_MAP[CONFIG_FILE_OPTIONS[0].value];
}

export function getMappedConfigContent(fileValue) {
  return CONFIG_FILE_CONTENT_MAP[fileValue] || "";
}
