import { CONFIG_FILE_HOSTS_VALUE } from "../../../../constants/ConfigFileConstants";

export function isConfigHostsFile(selectedFile) {
  return selectedFile === CONFIG_FILE_HOSTS_VALUE;
}
