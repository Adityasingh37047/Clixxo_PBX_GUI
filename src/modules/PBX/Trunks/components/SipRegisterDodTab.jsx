import React from "react";
import {
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Btn, ExtensionCodecDualList as SipRegisterCodecDualList } from "../../../../components/common";
import {
  TrunkFieldLabel,
  trunkDodToolbarBtnStyle,
  trunkDodCompactInputStyle,
  nativeFieldInteraction,
  sipRegisterModalTextFieldSx,
} from "./SipRegisterFormFields";

function SipRegisterDodTab({
  dodRows,
  setDodRows,
  dodSelected,
  setDodSelected,
  showDodAddModal,
  setShowDodAddModal,
  dodAddName,
  setDodAddName,
  dodAddNumber,
  setDodAddNumber,
  dodMemberExtensions,
  setDodMemberExtensions,
  dodAvailableExtensions,
  dodAvailableEmptyText,
  getDodExtLabel,
  handleOpenDodAddModal,
  handleConfirmDodAdd,
  resetDodAddForm,
  showMessage,
}) {
  return (
  <div className="p-3 sm:p-5">
    <div className="flex flex-wrap gap-2 mb-3">
      {["ADD", "DELETE", "IMPORT", "EXPORT"].map((lbl) => (
        <Btn
          key={lbl}
          type="button"
          variant="cancel"
          style={trunkDodToolbarBtnStyle}
          onClick={() => {
            if (lbl === "ADD") handleOpenDodAddModal();
            else if (lbl === "DELETE") {
              if (!dodSelected.length) {
                showMessage("error", "Select DOD rows to delete");
                return;
              }
              setDodRows((rows) =>
                rows.filter((_, i) => !dodSelected.includes(i)),
              );
              setDodSelected([]);
            } else
              showMessage(
                "info",
                `${lbl} is not connected to the API yet.`,
              );
          }}
        >
          {lbl}
        </Btn>
      ))}
    </div>

    {showDodAddModal ? (
      <div className="mt-2 bg-white border border-gray-200 rounded-md p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-4 w-full">
          <div className="flex items-center gap-8 min-w-0">
            <TrunkFieldLabel
              tooltipKey="dod_name"
              required
              className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
              style={{ width: 110 }}
            >
              DOD Name
            </TrunkFieldLabel>
            <input
              className="flex-1 min-w-0"
              style={trunkDodCompactInputStyle}
              value={dodAddName}
              onChange={(e) => setDodAddName(e.target.value)}
              {...nativeFieldInteraction}
            />
          </div>
          <div className="flex items-center gap-8 min-w-0">
            <TrunkFieldLabel
              tooltipKey="dod_number"
              required
              className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
              style={{ width: 110 }}
            >
              DOD Number
            </TrunkFieldLabel>
            <input
              className="flex-1 min-w-0"
              style={trunkDodCompactInputStyle}
              value={dodAddNumber}
              onChange={(e) => setDodAddNumber(e.target.value)}
              {...nativeFieldInteraction}
            />
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <SipRegisterCodecDualList
            hideReorder
            allOptions={dodAvailableExtensions}
            selected={dodMemberExtensions}
            onChange={setDodMemberExtensions}
            getLabel={getDodExtLabel}
            emptyTextAvailable={dodAvailableEmptyText}
            emptyTextSelected="No selected extensions"
          />
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Btn
            type="button"
            variant="primary"
            onClick={handleConfirmDodAdd}
            style={trunkDodToolbarBtnStyle}
          >
            ENSURE
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={() => {
              setShowDodAddModal(false);
              resetDodAddForm();
            }}
            style={trunkDodToolbarBtnStyle}
          >
            CANCEL
          </Btn>
        </div>
      </div>
    ) : (
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-2 w-10 text-left">
                <input
                  type="checkbox"
                  aria-label="select all dod"
                  onChange={(e) =>
                    e.target.checked
                      ? setDodSelected(dodRows.map((_, i) => i))
                      : setDodSelected([])
                  }
                  checked={
                    dodRows.length > 0 &&
                    dodSelected.length === dodRows.length
                  }
                />
              </th>
              <th className="p-2 text-left font-medium">
                DOD Number
              </th>
              <th className="p-2 text-left font-medium">
                DOD Name
              </th>
              <th className="p-2 text-left font-medium">
                Bind Extension
              </th>
            </tr>
          </thead>
          <tbody>
            {dodRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400"
                >
                  No DOD entries. Click ADD to add a row.
                </td>
              </tr>
            ) : (
              dodRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={dodSelected.includes(i)}
                      onChange={() =>
                        setDodSelected((s) =>
                          s.includes(i)
                            ? s.filter((x) => x !== i)
                            : [...s, i],
                        )
                      }
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={row.dodNumber}
                      onChange={(e) =>
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  dodNumber: e.target.value,
                                }
                              : x,
                          ),
                        )
                      }
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={row.dodName}
                      onChange={(e) =>
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? { ...x, dodName: e.target.value }
                              : x,
                          ),
                        )
                      }
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={
                        Array.isArray(row.bindExtensions)
                          ? row.bindExtensions.join(", ")
                          : row.bindExtension || ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value || "";
                        const list = raw
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  bindExtensions: list,
                                  bindExtension: raw,
                                }
                              : x,
                          ),
                        );
                      }}
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>

  );
}

export default SipRegisterDodTab;
