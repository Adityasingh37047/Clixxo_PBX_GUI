import React from "react";
import { Alert } from "@mui/material";
import {
  RINGING_SCHEME_CARD_TITLE,
  RINGING_SCHEME_RESET_LABEL,
  RINGING_SCHEME_SAVE_LABEL,
} from "../../../constants/RingingSchemeConstants";
import { Btn } from "../../../components/common";
import { useRingingSchemePage } from "./hooks/useRingingSchemePage";
import { getRingingSchemeMatchColumn } from "./utils/RingingSchemeTransformers";
import {
  MatchingSchemeRow,
  RingingSchemeBreadcrumb,
  RingingSchemeMatchingSelect,
  RingingSchemePageShell,
  RingingSchemeTable,
} from "./components/RingingSchemeFormFields";
import {
  ringingSchemeCardStyle,
  ringingSchemeCardTitleBarStyle,
  ringingSchemeFixedAlertSx,
  ringingSchemeFooterStyle,
  ringingSchemeFormBodyStyle,
  ringingSchemeFormBtnStyle,
} from "./components/RingingSchemeTableHelpers";

const RingingSchemePage = () => {
  const vm = useRingingSchemePage();
  const {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleSchemeChange,
    handleKeyPress,
    handleKeyPress1,
    handleSave,
    handleReset,
  } = vm;

  const isCallerId = formData.ringScheme === "0";
  const { label: matchColumnLabel, headerTooltipKey: matchColumnTooltip } =
    getRingingSchemeMatchColumn(isCallerId);

  return (
    <RingingSchemePageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={ringingSchemeFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <RingingSchemeBreadcrumb />

      <div style={ringingSchemeCardStyle}>
        <div style={ringingSchemeCardTitleBarStyle}>
          {RINGING_SCHEME_CARD_TITLE}
        </div>

        <div style={ringingSchemeFormBodyStyle}>
          <MatchingSchemeRow>
            <RingingSchemeMatchingSelect
              value={formData.ringScheme}
              onSchemeChange={handleSchemeChange}
            />
          </MatchingSchemeRow>

          <RingingSchemeTable
            formData={formData}
            isCallerId={isCallerId}
            matchColumnLabel={matchColumnLabel}
            matchColumnTooltip={matchColumnTooltip}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onKeyPress1={handleKeyPress1}
          />
        </div>

        <div style={ringingSchemeFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={ringingSchemeFormBtnStyle}
          >
            {RINGING_SCHEME_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={ringingSchemeFormBtnStyle}
          >
            {RINGING_SCHEME_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </RingingSchemePageShell>
  );
};

export default RingingSchemePage;
