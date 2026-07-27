import React from "react";
import { Checkbox } from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  TH,
  Pill,
  ExtensionEditIcon,
  getExtensionRowBg,
  getExtensionTdStyle,
  ExtensionTableListLoading as SipRegisterTableListLoading,
  ExtensionTableListEmptyState as SipRegisterTableListEmptyState,
  extensionTableCheckboxSx as sipRegisterTableCheckboxSx,
} from "../../../../components/common";
import {
  TRUNK_TABLE_SCROLL_CLASS,
  trunkTableScrollStyle,
  trunkTableInnerStyle,
  SIP_REGISTER_VISIBLE_TABLE_FIELDS,
  SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH,
  SIP_REGISTER_TABLE_HEADER_LABELS,
  sipRegisterCheckboxCellStyle,
  sipRegisterCheckboxWrapStyle,
  sipRegisterIdCellStyle,
  sipRegisterIdCenterWrapStyle,
  sipRegisterStatusCellStyle,
  sipRegisterModifyCellStyle,
  getSipRegisterDataCellStyle,
  getSipRegisterHeaderCellStyle,
  sipRegisterFieldColumnWidths,
  sipRegisterFieldColumnPercents,
  sipRegisterFixedCellStyle,
  formatSipRegisterStatusLabel,
  getSipRegisterStatusStyle,
} from "./SipRegisterTableHelpers";
import { SIP_PREFIX_FIELDS } from "../utils/SipRegisterTransformers";

function SipRegisterTable({
  isCompact,
  isInitialLoad,
  dataEmpty,
  tableScrollRef,
  allowHorizontalScroll,
  tableMinWidth,
  allPageSelected,
  somePageSelected,
  handleToggleAll,
  pagedRows,
  page,
  itemsPerPage,
  selectedIds,
  handleToggleRow,
  loading,
  handleOpenModal,
}) {
  const wideTable = allowHorizontalScroll || isCompact;

  return (
  <div style={{ position: "relative" }}>
    {isInitialLoad ? (
      <SipRegisterTableListLoading />
    ) : dataEmpty ? (
      <SipRegisterTableListEmptyState
        message="No SIP register trunks found."
        onAddNew={() => handleOpenModal()}
      />
    ) : (
      <>
        <div
          ref={tableScrollRef}
          className={TRUNK_TABLE_SCROLL_CLASS}
          style={{
            ...trunkTableScrollStyle,
            overflowX: wideTable ? "auto" : "hidden",
            WebkitOverflowScrolling: wideTable ? "touch" : undefined,
            borderBottom: "none",
          }}
        >
          <div
            style={{
              ...trunkTableInnerStyle,
              minWidth: wideTable ? SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH : "100%",
              width: wideTable ? SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH : "100%",
              borderBottom: "none",
            }}
          >
            <table
              style={{
                width: wideTable ? SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH : "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: wideTable ? "auto" : "fixed",
                minWidth: wideTable ? SIP_REGISTER_TABLE_COMPACT_MIN_WIDTH : "100%",
              }}
            >
              <colgroup>
                <col
                  style={{
                    width: wideTable ? 40 : "3%",
                  }}
                />
                <col
                  style={{
                    width: wideTable ? 44 : "3%",
                  }}
                />
                {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                  <col
                    key={field.name}
                    style={{
                      width: wideTable
                        ? sipRegisterFieldColumnWidths[field.name]
                        : sipRegisterFieldColumnPercents[field.name],
                    }}
                  />
                ))}
                <col
                  style={{
                    width: wideTable ? 118 : "10%",
                  }}
                />
                <col
                  style={{
                    width: wideTable ? 72 : "6%",
                  }}
                />
              </colgroup>
              <thead>
                <tr>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterCheckboxCellStyle,
                        wideTable,
                      ),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterCheckboxWrapStyle}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={sipRegisterTableCheckboxSx}
                      />
                    </div>
                  </TH>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterIdCellStyle,
                        wideTable,
                      ),
                      textAlign: "center",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterIdCenterWrapStyle}>ID</div>
                  </TH>
                  {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                    <TH
                      key={field.name}
                      title={field.label}
                      style={getSipRegisterHeaderCellStyle(
                        wideTable,
                      )}
                    >
                      {SIP_REGISTER_TABLE_HEADER_LABELS[field.name] ??
                        field.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterStatusCellStyle,
                        wideTable,
                      ),
                      ...getSipRegisterHeaderCellStyle(wideTable),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterIdCenterWrapStyle}>Status</div>
                  </TH>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterModifyCellStyle,
                        wideTable,
                      ),
                      ...getSipRegisterHeaderCellStyle(wideTable),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((trunk, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected =
                    trunk.trunk_id && selectedIds.includes(trunk.trunk_id);
                  const isLastRow = idx === pagedRows.length - 1;
                  const rowBg = getExtensionRowBg(isSelected, idx);
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  const { bg: statusBg, color: statusColor } =
                    getSipRegisterStatusStyle(trunk.registerStatus);
                  return (
                    <tr
                      key={trunk.trunk_id || idx}
                      style={{
                        background: rowBg,
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = rowBg;
                      }}
                    >
                      <td
                        style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                          ...sipRegisterFixedCellStyle(
                            sipRegisterCheckboxCellStyle,
                            wideTable,
                          ),
                        })}
                      >
                        <div style={sipRegisterCheckboxWrapStyle}>
                          <Checkbox
                            size="small"
                            disabled={!trunk.trunk_id}
                            checked={
                              !!trunk.trunk_id &&
                              selectedIds.includes(trunk.trunk_id)
                            }
                            onChange={() => handleToggleRow(trunk.trunk_id)}
                            sx={sipRegisterTableCheckboxSx}
                          />
                        </div>
                      </td>
                      <td
                        style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                          ...sipRegisterFixedCellStyle(
                            sipRegisterIdCellStyle,
                            wideTable,
                          ),
                        })}
                      >
                        <div style={sipRegisterIdCenterWrapStyle}>
                          {(page - 1) * itemsPerPage + idx + 1}
                        </div>
                      </td>
                      {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => {
                        const value = trunk[field.name];
                        const hasValue =
                          value !== undefined &&
                          value !== null &&
                          value !== "";
                        const displayValue =
                          hasValue && SIP_PREFIX_FIELDS.includes(field.name)
                            ? `sip:${value}`
                            : hasValue
                              ? value
                              : "—";
                        return (
                          <td
                            key={field.name}
                            title={String(displayValue)}
                            style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                              fontWeight:
                                field.name === "trunk_id" ? 600 : 400,
                              ...getSipRegisterDataCellStyle(
                                wideTable,
                              ),
                            })}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                      <td
                        style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                          ...sipRegisterFixedCellStyle(
                            sipRegisterStatusCellStyle,
                            wideTable,
                          ),
                        })}
                      >
                        <div style={sipRegisterIdCenterWrapStyle}>
                          {trunk.registerStatus ? (
                            <Pill
                              text={formatSipRegisterStatusLabel(
                                trunk.registerStatus,
                              )}
                              bg={statusBg}
                              color={statusColor}
                            />
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </div>
                      </td>
                      <td
                        style={getExtensionTdStyle(rowBg, lastRowCellStyle, {
                          ...sipRegisterFixedCellStyle(
                            sipRegisterModifyCellStyle,
                            wideTable,
                          ),
                        })}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <ExtensionEditIcon
                            disabled={loading.delete}
                            onClick={() => handleOpenModal(trunk, realIdx)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </div>

  );
}

export default SipRegisterTable;
