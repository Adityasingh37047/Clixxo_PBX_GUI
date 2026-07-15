import React from "react";
import Button from "@mui/material/Button";
import { useHaPage } from "./hooks/useHaPage";
import { HaFormBody } from "./components/HaFormFields";
import { haPageBg, haSaveResetBtnSx } from "./components/HaTableHelpers";

const HaPage = () => {
  const vm = useHaPage();
  const {
    enabled,
    setEnabled,
    virtualIp,
    setVirtualIp,
    primaryBackup,
    setPrimaryBackup,
    haEth,
    setHaEth,
    ipTouched,
    setIpTouched,
    ipIsValid,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-200px)] py-0 flex flex-col items-center"
      style={{ backgroundColor: haPageBg }}
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          HA
        </div>
        <div
          className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col"
          style={{ backgroundColor: haPageBg }}
        >
          <div className="flex-1 py-6 px-20">
            <HaFormBody
              enabled={enabled}
              setEnabled={setEnabled}
              virtualIp={virtualIp}
              setVirtualIp={setVirtualIp}
              setIpTouched={setIpTouched}
              ipIsValid={ipIsValid}
              ipTouched={ipTouched}
              primaryBackup={primaryBackup}
              setPrimaryBackup={setPrimaryBackup}
              haEth={haEth}
              setHaEth={setHaEth}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="contained" sx={haSaveResetBtnSx} onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" sx={haSaveResetBtnSx} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HaPage;
