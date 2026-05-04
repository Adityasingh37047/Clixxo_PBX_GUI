import React, { useState } from "react";
import { ACTION_URL_INITIAL_FORM } from "./constants/ActionUrlConstants";
import { TextField, Button } from "@mui/material";

const ActionUrlPage = () => {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Form validation can be added here if needed
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(ACTION_URL_INITIAL_FORM);
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4"
      style={{ backgroundColor: "#dde0e4" }}
    >
      <div style={{ width: "750px", maxWidth: "95%", margin: "0 auto" }}>
        {/* Blue header bar */}
        <div className="rounded-t-lg w-full h-8 bg-gradient-to-b from-\[#b3e0ff] via-\[#6ec1f7] to-\[#3b8fd6] flex items-center justify-center font-semibold text-lg text-white shadow mb-0">
          Channel State Report Settings
        </div>

        <div className="rounded-b-lg bg-white border-2 border-gray-400 border-t-0 shadow-sm p-4">
          <table style={{ width: "100%", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "65%" }} />
            </colgroup>
            <tbody>
              {/* Header row */}
              <tr style={{ height: "22px" }}>
                <td></td>
                <td style={{ fontSize: "14px", color: "#333" }}>
                  Channel State
                </td>
                <td style={{ fontSize: "14px", color: "#333" }}>
                  Report States to URL
                </td>
              </tr>
              <tr>
                <td style={{ height: "8px" }}></td>
              </tr>

              {/* Channel Pick up row */}
              <tr style={{ height: "26px" }}>
                <td></td>
                <td style={{ fontSize: "14px", color: "#333" }}>
                  Channel Pick up
                </td>
                <td>
                  <TextField
                    id="ChPickUpActionUrl"
                    value={formData.chPickUpActionUrl || ""}
                    onChange={(e) =>
                      handleInputChange("chPickUpActionUrl", e.target.value)
                    }
                    size="small"
                    variant="outlined"
                    inputProps={{
                      maxLength: 256,
                      style: { fontSize: 14, padding: "4px 8px" },
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "28px",
                        backgroundColor: "white",
                        "& fieldset": { borderColor: "#bbb" },
                        "&:hover fieldset": { borderColor: "#999" },
                        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ height: "8px" }}></td>
              </tr>

              {/* Channel Hang up row */}
              <tr style={{ height: "26px" }}>
                <td></td>
                <td style={{ fontSize: "14px", color: "#333" }}>
                  Channel Hang up
                </td>
                <td>
                  <TextField
                    id="ChHangUpActionUrl"
                    value={formData.chHangUpActionUrl || ""}
                    onChange={(e) =>
                      handleInputChange("chHangUpActionUrl", e.target.value)
                    }
                    size="small"
                    variant="outlined"
                    inputProps={{
                      maxLength: 256,
                      style: { fontSize: 14, padding: "4px 8px" },
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "28px",
                        backgroundColor: "white",
                        "& fieldset": { borderColor: "#bbb" },
                        "&:hover fieldset": { borderColor: "#999" },
                        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ height: "8px" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save and Reset Buttons */}
      <div
        className="flex justify-center gap-4"
        style={{ marginTop: "24px", marginBottom: "16px" }}
      >
        <button
          type="button"
          onClick={handleSave}
          style={{
            background:
              "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            borderRadius: "6px",
            minWidth: "100px",
            height: "42px",
            textTransform: "none",
            padding: "6px 24px",
            boxShadow: "0 2px 8px #3E5475",
            border: "1px solid #2C3E57",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.target.style.background =
              "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background =
              "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
          }}
        >
          Save
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            background:
              "linear-gradient(to bottom, #9CA3AF 0%, #6B7280 60%, #4B5563 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            borderRadius: "6px",
            minWidth: "100px",
            height: "42px",
            textTransform: "none",
            padding: "6px 24px",
            boxShadow: "0 2px 8px #6B7280",
            border: "1px solid #4B5563",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.target.style.background =
              "linear-gradient(to bottom, #9CA3AF 0%, #6B7280 60%, #4B5563 100%)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background =
              "linear-gradient(to bottom, #6B7280 0%, #9CA3AF 100%)";
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ActionUrlPage;
