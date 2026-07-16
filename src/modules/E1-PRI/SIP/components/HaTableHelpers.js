/** HaPage is intentionally local/legacy styled — no shared e1Pri table chrome. */

export const haPageBg = "#dde0e4";

export const haSaveResetBtnSx = {
  background: "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "12px",
  minWidth: 100,
  minHeight: 30,
  px: 2,
  py: 0.5,
  boxShadow: "0 2px 8px #b3e0ff",
  textTransform: "none",
  "&:hover": {
    background: "linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)",
    color: "#fff",
  },
};

export const haSelectSx = {
  fontSize: 16,
  height: 36,
  backgroundColor: "#ffffff",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    height: 36,
    "& fieldset": {
      borderColor: "#999999",
    },
    "&:hover fieldset": {
      borderColor: "#999999",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#999999",
    },
  },
  "& .MuiSelect-select": {
    backgroundColor: "#ffffff",
    padding: "6px 14px",
    height: "auto",
    display: "flex",
    alignItems: "center",
  },
};
