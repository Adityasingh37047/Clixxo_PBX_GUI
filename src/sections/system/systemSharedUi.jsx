/**
 * System › System Settings — fill-box borders match PBX Extension Group › Group Name.
 */
import { C } from "../numManipulate/numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  modalTextFieldSx,
  modalSelectSx,
  nativeFieldInputStyle,
  nativeFieldInteraction,
  getNativeFieldInteraction,
} from "../shared/outlinedFieldUi";

export {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  modalTextFieldSx,
  modalSelectSx,
  nativeFieldInputStyle,
  nativeFieldInteraction,
  getNativeFieldInteraction,
};

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

/** Standard system settings text input (10px radius) */
export const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

export const systemFieldInputStyleNarrow = {
  ...systemFieldInputStyle,
  maxWidth: "280px",
};

/** Native &lt;select&gt; — extra vertical padding so label text is not clipped */
export const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
};

/** PING / TRACERT / CLI tool fields (280px column) */
export const systemToolFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

export const systemToolFieldSelectStyle = {
  ...systemToolFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
};

/** Modal / dialog 32px fields */
export const systemModalFieldInputStyle = {
  ...nativeFieldBase,
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  lineHeight: 1.35,
  color: "#1e293b",
};

/** MUI Select in System modals — centered label, no vertical clip */
export const systemModalSelectSx = {
  ...modalSelectSx,
  height: 36,
  "& .MuiOutlinedInput-root": {
    height: 36,
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

export const inputInteraction = nativeFieldInteraction;
