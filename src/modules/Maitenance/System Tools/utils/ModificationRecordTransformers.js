export function toModificationRecordText(responseData) {
  return String(responseData || "").trim();
}

export function triggerAuthLogDownload(logData, fileName = "auth.log") {
  const blob = new Blob([logData], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
