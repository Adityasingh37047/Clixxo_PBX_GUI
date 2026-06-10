import React, { useState, useRef } from "react";
import { Alert, Select, MenuItem, FormControl } from "@mui/material";
import {
  CUE_TONE_FILE_TYPES,
  CUE_TONE_INITIAL_FORM,
} from "../../../sections/advanced/constants/CueToneConstants";
import {
  Btn,
  C,
  muiSelectSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  FieldRow,
  wavFileNoteStyle,
} from "../../../shared/fxsSharedUi";

/** Choose file & Upload — same size; gray cancel styling on file picker */
const cueToneFileBtnStyle = { height: 30, fontSize: 12, minWidth: 100 };

const CueTonePage = () => {
  const [formData, setFormData] = useState(CUE_TONE_INITIAL_FORM);
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const handleUpload = () => {
    if (!formData.file) {
      showToast("Please select a file to upload!", "error");
      return;
    }
    const fileExt = formData.file.name
      .substring(formData.file.name.lastIndexOf("."))
      .toLowerCase();
    if (!fileExt.match(/\.wav/i)) {
      showToast("Only wav files can be uploaded!", "error");
      return;
    }
    if (formData.file.size > 200 * 1024) {
      showToast("File size must be less than 200KB!", "error");
      return;
    }
    showToast("File uploaded successfully!");
  };

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <AdvancedBreadcrumb current="Cue Tone" />
      <AdvancedFormCard title="Upload" fullWidthContent>
        <FieldRow label="Upload a file of cue tone">
          <FormControl size="small" fullWidth>
            <Select
              value={formData.fileType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fileType: e.target.value }))
              }
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
            </Select>
          </FormControl>
        </FieldRow>
        <FieldRow label="File" align="flex-start">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="cue-tone-file-input"
            />
            <Btn
              variant="cancel"
              onClick={() => fileInputRef.current?.click()}
              style={cueToneFileBtnStyle}
            >
              Choose file
            </Btn>
            <span style={{ fontSize: 13, color: C.mutedText }}>{fileName}</span>
            <Btn
              variant="primary"
              onClick={handleUpload}
              style={cueToneFileBtnStyle}
            >
              Upload
            </Btn>
          </div>
        </FieldRow>
        <p style={{ ...wavFileNoteStyle, color: "#dc2626" }}>
          Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.
        </p>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default CueTonePage;
