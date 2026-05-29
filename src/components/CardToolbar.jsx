import React from "react";
import {
  cardToolbarStyle,
  cardToolbarTitleStyle,
  cardToolbarActionsStyle,
} from "../styles/cardToolbar";

/**
 * Card header row with consistent vertical padding around action buttons.
 * @param {string} title
 * @param {React.ReactNode} [actions] - buttons on the right
 * @param {object} [style] - extra styles merged onto toolbar bar
 * @param {boolean} [actionsOnly] - omit title span (custom title via children)
 * @param {React.ReactNode} [children] - full custom content instead of title+actions
 */
const CardToolbar = ({
  title,
  actions,
  style,
  actionsOnly = false,
  children,
}) => {
  if (children) {
    return <div style={{ ...cardToolbarStyle, ...style }}>{children}</div>;
  }

  return (
    <div style={{ ...cardToolbarStyle, ...style }}>
      {!actionsOnly && <span style={cardToolbarTitleStyle}>{title}</span>}
      {actions ? (
        <div style={cardToolbarActionsStyle}>{actions}</div>
      ) : null}
    </div>
  );
};

export default CardToolbar;
