import React, { useState } from "react";
import {
  CDR_QUERY_INITIAL_FORM,
  PORT_OPTIONS,
  CALL_DIRECTION_OPTIONS,
} from "../../../sections/advanced/constants/CdrQueryConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Btn,
  C,
  muiTextFieldSx,
  muiSelectSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

const CDR_LABEL_WIDTH = 190;
const CDR_FIELD_GAP = 16;

const CdrFieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: CDR_FIELD_GAP,
    }}
  >
    <label
      style={{
        width: CDR_LABEL_WIDTH,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 59) || key === 45 || key === 32) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 ||
      key === 46 ||
      key === 95 ||
      key === 8 ||
      (key >= 48 && key <= 57) ||
      (key >= 65 && key <= 90) ||
      (key >= 97 && key <= 122)
    ) {
    } else {
      e.preventDefault();
    }
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleQuery = () => {
    if (
      formData.startdate &&
      formData.enddate &&
      formData.startdate > formData.enddate
    ) {
      alert("The Ending Date should not be earlier than the Starting Date!");
      return;
    }

    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (
      formData.mintalktime &&
      formData.maxtalktime &&
      minTalkTime > maxTalkTime
    ) {
      alert(
        "The max talk duration should not be smaller than the min talk duration!",
      );
      return;
    }

    alert("Query submitted successfully!");
  };

  const compactFieldSx = {
    ...muiTextFieldSx,
    width: 132,
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
      <AdvancedBreadcrumb current="CDR Query" />
      <AdvancedFormCard
        title="CDR Query"
        footer={
          <Btn
            variant="primary"
            onClick={handleQuery}
            style={advancedFormBtnStyle}
          >
            Query
          </Btn>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <CdrFieldRow label="Starting Date">
              <TextField
                id="startdate"
                type="date"
                value={formData.startdate || ""}
                onChange={(e) => handleInputChange("startdate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Ending Date">
              <TextField
                id="enddate"
                type="date"
                value={formData.enddate || ""}
                onChange={(e) => handleInputChange("enddate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Port">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  sx={muiSelectSx}
                >
                  {PORT_OPTIONS.map((opt) => (
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
            </CdrFieldRow>
            <CdrFieldRow label="Call Direction">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.billtype}
                  onChange={(e) =>
                    handleInputChange("billtype", e.target.value)
                  }
                  sx={muiSelectSx}
                >
                  {CALL_DIRECTION_OPTIONS.map((opt) => (
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
            </CdrFieldRow>
            <CdrFieldRow label="CallerID">
              <TextField
                id="callingnum"
                value={formData.callingnum || ""}
                onChange={(e) =>
                  handleInputChange("callingnum", e.target.value)
                }
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="CalleeID">
              <TextField
                id="callednum"
                value={formData.callednum || ""}
                onChange={(e) => handleInputChange("callednum", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Call Duration(s)">
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TextField
                  id="mintalktime"
                  value={formData.mintalktime || ""}
                  onChange={(e) =>
                    handleInputChange("mintalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
                <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
                <TextField
                  id="maxtalktime"
                  value={formData.maxtalktime || ""}
                  onChange={(e) =>
                    handleInputChange("maxtalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </div>
            </CdrFieldRow>
            <CdrFieldRow label="Keyword">
              <TextField
                id="keyword"
                value={formData.keyword || ""}
                onChange={(e) => handleInputChange("keyword", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
          </div>
        </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default CdrQueryPage;
