import {
  SIP_ACCOUNT_DEFAULT_FORM,
  SIP_ACCOUNT_UPLOAD,
} from "../../../../constants/SIPAccountGeneratorConstants";

export function createSipGenInitialForm() {
  return { ...SIP_ACCOUNT_DEFAULT_FORM };
}

export function applySipGenFieldChange(prev, { name, value }) {
  return { ...prev, [name]: value };
}

export function resolveSipGenFileSelection(file) {
  return {
    file: file || null,
    fileName: file ? file.name : SIP_ACCOUNT_UPLOAD.noFile,
  };
}
