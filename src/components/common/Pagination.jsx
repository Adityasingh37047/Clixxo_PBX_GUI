import { C } from "../../theme/pbxTokens";
import { Btn } from "./Button";

const EXTENSION_TABLE_CARD_RADIUS = 4;

const extensionPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: EXTENSION_TABLE_CARD_RADIUS,
  borderBottomRightRadius: EXTENSION_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const extensionPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const ExtensionPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...extensionPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        ← Prev
      </Btn>
      <span style={extensionPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        Next →
      </Btn>
    </div>
  </div>
);

export { ExtensionPagination, extensionPaginationStyle, extensionPageBadgeStyle };
