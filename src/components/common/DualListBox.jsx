import React from "react";
import { useMediaQuery } from "@mui/material";
import { C, EXTENSION_COMPACT_MQ } from "../../theme/pbxTokens";

const extensionDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const extensionDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const extensionDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const ExtensionDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      ...extensionDualListBtnStyle,
      fontWeight: reorder ? 400 : extensionDualListBtnStyle.fontWeight,
      transition:
        "background-color 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
      userSelect: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.backgroundColor = "#b3bac4";
      e.currentTarget.style.transform = "translateY(1px) scale(0.97)";
      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    {children}
  </button>
);

const EXTENSION_MONITOR_DUAL_LIST_LABEL_OFFSET = 28;

const ExtensionMonitorDualListbox = ({ available, selected, onChange }) => {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [leftSel, setLeftSel] = React.useState([]);
  const [rightSel, setRightSel] = React.useState([]);

  const addSelected = () => {
    if (!leftSel.length) return;
    onChange([...selected, ...leftSel.filter((e) => !selected.includes(e))]);
    setLeftSel([]);
  };
  const addAll = () => {
    onChange([...selected, ...available]);
    setLeftSel([]);
  };
  const removeSelected = () => {
    if (!rightSel.length) return;
    onChange(selected.filter((e) => !rightSel.includes(e)));
    setRightSel([]);
  };
  const removeAll = () => {
    onChange([]);
    setRightSel([]);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 48px 1fr",
        ...(isCompact ? { gridTemplateColumns: "1fr", gap: 12 } : {}),
        gap: 12,
        alignItems: "start",
        marginTop: 12,
      }}
    >
      <div>
        <div style={extensionDualListLabelStyle}>Available</div>
        <select
          multiple
          value={leftSel}
          onChange={(e) =>
            setLeftSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={extensionDualListSelectStyle}
        >
          {available.length === 0 ? (
            <option disabled>No extensions available</option>
          ) : (
            available.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))
          )}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: extensionDualListSelectStyle.height,
          paddingTop: EXTENSION_MONITOR_DUAL_LIST_LABEL_OFFSET,
          boxSizing: "content-box",
        }}
      >
        <ExtensionDualListBtn onClick={addSelected}>&gt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={addAll}>&gt;&gt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={removeSelected}>&lt;</ExtensionDualListBtn>
        <ExtensionDualListBtn onClick={removeAll}>&lt;&lt;</ExtensionDualListBtn>
      </div>

      <div>
        <div style={extensionDualListLabelStyle}>Selected</div>
        <select
          multiple
          value={rightSel}
          onChange={(e) =>
            setRightSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={extensionDualListSelectStyle}
        >
          {selected.length === 0 ? (
            <option disabled>No selected extensions</option>
          ) : (
            selected.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export {
  ExtensionDualListBtn,
  ExtensionMonitorDualListbox,
  extensionDualListLabelStyle,
  extensionDualListSelectStyle,
  extensionDualListBtnStyle,
};
