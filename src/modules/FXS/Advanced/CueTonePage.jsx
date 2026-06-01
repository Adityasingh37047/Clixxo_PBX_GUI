import React, { useState, useRef } from "react";
import {
  CUE_TONE_FILE_TYPES,
  CUE_TONE_INITIAL_FORM,
} from "../../../sections/advanced/constants/CueToneConstants";
import { Select as MuiSelect, MenuItem, FormControl } from "@mui/material";
import {
  C,
  Btn,
  muiSelectSx,
  numManipulateCardStyle,
  AdvancedBreadcrumb,
  FieldRow,
  SectionHeading,
  advancedFormPanelStyle,
  advancedFormActionsStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
} from "../../../sections/advanced/advancedSharedUi";

const CueTonePage = () => {
  const [formData, setFormData] = useState(CUE_TONE_INITIAL_FORM);
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleFileTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, fileType: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const checkFileExt = (ext) => {
    if (!ext.match(/.wav/i)) {
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!formData.file) {
      showMessage("error", "Please select a file to upload!");
      return;
    }

    const fileExt = formData.file.name
      .substring(formData.file.name.lastIndexOf("."))
      .toLowerCase();
    if (!checkFileExt(fileExt)) {
      showMessage("error", "Only wav files can be uploaded!");
      return;
    }

    if (formData.file.size > 200 * 1024) {
      showMessage("error", "File size must be less than 200KB!");
      return;
    }

    showMessage("success", "File uploaded successfully!");
  };

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
        {message.text && (
          <div
            style={{
              background:
                message.type === "error"
                  ? "#fef2f2"
                  : message.type === "success"
                    ? "#f0fdf4"
                    : "#eff6ff",
              borderLeft: `3px solid ${message.type === "error" ? "#f87171" : message.type === "success" ? "#4ade80" : "#60a5fa"}`,
              color:
                message.type === "error"
                  ? "#b91c1c"
                  : message.type === "success"
                    ? "#166534"
                    : "#1e40af",
              padding: "10px 14px",
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{message.text}</span>
            <span
              onClick={() => setMessage({ type: "", text: "" })}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        <AdvancedBreadcrumb current="Cue Tone" />

        <div style={numManipulateCardStyle}>
          <div style={{ padding: 24 }}>
            <SectionHeading title="Upload Cue Tone" />

            <div style={advancedFormPanelStyle}>
              <FieldRow label="Cue Tone Type">
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={formData.fileType}
                    onChange={handleFileTypeChange}
                    sx={muiSelectSx}
                  >
                    {CUE_TONE_FILE_TYPES.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        sx={{ fontSize: 13 }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </FieldRow>

              <FieldRow label="File Path">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="cue-tone-file-input"
                  />
                  <Btn
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose File
                  </Btn>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.mutedText,
                      maxWidth: 250,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fileName}
                  </span>
                </div>
              </FieldRow>
            </div>

            <div
              style={{
                marginTop: 24,
                fontSize: 12,
                color: C.mutedText,
                lineHeight: 1.6,
                background: "#f8fafc",
                padding: "12px 16px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontWeight: 600, color: C.labelText }}>Note:</span>{" "}
              The file should be a wav file with 8000Hz sampling rate, 16-bit
              mono, A-law formatted, and less than 200KB in size.
            </div>
          </div>

          <div style={advancedFormActionsStyle}>
            <Btn
              variant="primary"
              onClick={handleUpload}
              style={{ height: 33, minWidth: 100 }}
            >
              Upload
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CueTonePage;
