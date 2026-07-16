import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import {
  RADIUS_CARD_TITLE,
  RADIUS_TOAST_DEFAULT,
} from "../../../constants/RadiusConstants";
import { useRadiusPage } from "./hooks/useRadiusPage";
import {
  RADIUS_COMPACT_MQ,
  RADIUS_GRID_TWO_COL_MQ,
  RadiusPageShell,
  RadiusBreadcrumb,
  RadiusFormPanel,
  RadiusActionFooter,
  radiusFixedAlertSx,
} from "./components/RadiusFormFields";
import {
  radiusTableContainerStyle,
  radiusHeaderStyle,
} from "./components/RadiusTableHelpers";

const Radius = () => {
  const vm = useRadiusPage();
  const {
    form,
    toast,
    setToast,
    handleChange,
    handleCallTypeChange,
    handleReset,
    handleSave,
  } = vm;
  const isCompact = useMediaQuery(RADIUS_COMPACT_MQ);
  const isGridTwoCol = useMediaQuery(RADIUS_GRID_TWO_COL_MQ);

  return (
    <RadiusPageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(RADIUS_TOAST_DEFAULT)}
          sx={{
            ...radiusFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <RadiusBreadcrumb />

      <form onSubmit={handleSave} autoComplete="off">
        <div style={radiusTableContainerStyle}>
          <div style={radiusHeaderStyle}>
            <span>{RADIUS_CARD_TITLE}</span>
          </div>

          <RadiusFormPanel
            form={form}
            isCompact={isCompact}
            isGridTwoCol={isGridTwoCol}
            onChange={handleChange}
            onCallTypeChange={handleCallTypeChange}
          />

          <RadiusActionFooter onReset={handleReset} />
        </div>
      </form>
    </RadiusPageShell>
  );
};

export default Radius;
