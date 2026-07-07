import { Checkbox } from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  TH,
  getExtensionRowBg,
  getExtensionTdStyle,
  extensionNoResultsRowStyle,
  ExtensionEditIcon,
  ExtensionDeleteIcon,
  extensionTableCheckboxSx,
  Pill,
  statusStyle,
} from "../../../../components/common";

function ExtensionsTable(props) {
  const {
    isCompact,
    pagedAccounts,
    searchQuery,
    page,
    itemsPerPage,
    selected,
    handleToggleAll,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    loading,
    handleOpenModal,
    handleDeleteSingle,
  } = props;
  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "auto",
        flex: 1,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "auto",
          minWidth: 900,
          ...(isCompact ? { minWidth: 720 } : {}),
        }}
      >
        <thead>
          <tr>
            {/* Select-all checkbox */}
            <TH
              style={{
                width: 40,
                padding: 0,
                borderLeft: "none",
              }}
            >
              <Checkbox
                size="small"
                checked={allPageSelected}
                indeterminate={somePageSelected}
                onChange={handleToggleAll}
                sx={extensionTableCheckboxSx}
              />
            </TH>
            <TH style={{ width: 36 }}>ID</TH>
            <TH>Extension</TH>
            <TH>Context</TH>
            <TH>Codecs</TH>
            <TH>Password</TH>
            <TH>Status</TH>
            <TH style={{ width: 100, borderRight: "none" }}>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {pagedAccounts.length === 0 ? (
            <tr>
              <td colSpan={8} style={extensionNoResultsRowStyle}>
                {`No results for "${searchQuery}"`}
              </td>
            </tr>
          ) : (
            pagedAccounts.map((item, idx) => {
              const realIdx = (page - 1) * itemsPerPage + idx;
              const isSelected = selected.includes(String(item.extension));
              const rowBg = getExtensionRowBg(isSelected, idx);
              const ss = statusStyle(item.status);
              const isLastRow = idx === pagedAccounts.length - 1;
              const lastRowCellStyle = isLastRow
                ? { borderBottom: "none" }
                : {};
              const dataCellStyle = { fontWeight: 400 };

              return (
                <tr
                  key={realIdx}
                  style={{
                    background: rowBg,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = rowBg;
                  }}
                >
                  <td
                    style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                      width: 36,
                      borderLeft: "none",
                    })}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleToggleRow(item.extension)}
                      disabled={loading.delete}
                      sx={extensionTableCheckboxSx}
                    />
                  </td>
                  <td
                    style={getExtensionTdStyle(
                      rowBg,
                      lastRowCellStyle,
                      dataCellStyle,
                    )}
                  >
                    {realIdx + 1}
                  </td>
                  <td
                    style={getExtensionTdStyle(
                      rowBg,
                      lastRowCellStyle,
                      dataCellStyle,
                    )}
                  >
                    {item.extension || (
                      <span style={{ color: C.mutedText }}>—</span>
                    )}
                  </td>
                  <td
                    style={getExtensionTdStyle(
                      rowBg,
                      lastRowCellStyle,
                      dataCellStyle,
                    )}
                  >
                    {item.context || (
                      <span style={{ color: C.mutedText }}>—</span>
                    )}
                  </td>
                  <td
                    style={getExtensionTdStyle(
                      rowBg,
                      lastRowCellStyle,
                      dataCellStyle,
                    )}
                  >
                    {item.allow_codecs || (
                      <span style={{ color: C.mutedText }}>—</span>
                    )}
                  </td>
                  <td
                    style={getExtensionTdStyle(
                      rowBg,
                      lastRowCellStyle,
                      dataCellStyle,
                    )}
                  >
                    {"•".repeat(Math.min(item.password?.length || 0, 10))}
                  </td>
                  <td style={getExtensionTdStyle(rowBg, lastRowCellStyle)}>
                    {item.status ? (
                      <Pill text={item.status} bg={ss.bg} color={ss.color} />
                    ) : (
                      <span style={{ color: C.mutedText }}>—</span>
                    )}
                  </td>
                  <td
                    style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                      borderRight: "none",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ExtensionEditIcon
                        disabled={loading.delete}
                        onClick={() => handleOpenModal(item, realIdx)}
                      />
                      <ExtensionDeleteIcon
                        disabled={loading.delete}
                        onClick={() => handleDeleteSingle(item.extension)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExtensionsTable;
