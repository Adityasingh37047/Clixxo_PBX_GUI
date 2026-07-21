import React from "react";
import {
  ExtensionBreadcrumb,
  ExtensionTableListEmptyState,
  ExtensionTableListLoading,
} from "../../../../components/common";
import { VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS } from "../../../../constants/ViewVoicemailConstants";
import { C } from "../../../../theme/pbxTokens";
import { viewVoicemailTdStyle } from "./ViewVoicemailTableHelpers";

export const ViewVoicemailBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS[0]}
    section={VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS[1]}
    current={VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

export const TD = ({ children, align = "center", mono, muted, bg, style: extra }) => (
  <td style={{
    ...viewVoicemailTdStyle, textAlign: align, color: mono ? C.accent : muted ? C.mutedText : C.valueText,
    fontFamily: mono ? "monospace, monospace" : "inherit", fontWeight: mono ? 600 : 400,
    ...(bg != null ? { background: bg } : {}), ...extra,
  }}>
    {children ?? <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

export const TableListLoading = ExtensionTableListLoading;

export const TableListEmptyState = ({ message }) => (
  <ExtensionTableListEmptyState message={message} showButton={false} />
);

export const NewBadge = () => (
  <span style={{
    background: "#dcfce7", color: C.successGreen, padding: "2px 7px", borderRadius: 999,
    fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
  }}>
    New
  </span>
);

export const ReadBadge = () => (
  <span style={{
    background: "#f1f5f9", color: "#64748b", padding: "2px 7px", borderRadius: 999,
    fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
  }}>
    Read
  </span>
);
