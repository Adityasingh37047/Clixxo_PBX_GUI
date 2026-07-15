import { CERTIFICATE_FIELDS } from "../../../../constants/CertificateManageConstants";

export function createCertificateEmptyForm() {
  return CERTIFICATE_FIELDS.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

export function updateCertificateFormField(form, name, value) {
  return { ...form, [name]: value };
}
