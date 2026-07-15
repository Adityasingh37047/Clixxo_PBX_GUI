import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Checkbox } from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  TH,
  tdStyle,
  ExtensionTableListLoading as SipRegisterTableListLoading,
  ExtensionTableListEmptyState as SipRegisterTableListEmptyState,
  extensionTableCheckboxSx as sipRegisterTableCheckboxSx,
} from "../../../../components/common";
import { Pill } from "./SipRegisterFormFields";
import {
  TRUNK_TABLE_SCROLL_CLASS,
  trunkTableScrollStyle,
  trunkTableInnerStyle,
  SIP_REGISTER_VISIBLE_TABLE_FIELDS,
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
            overflowX: allowHorizontalScroll ? "auto" : "hidden",
            borderBottom: "none",
          }}
        >
          <div
            style={{
              ...trunkTableInnerStyle,
              minWidth: allowHorizontalScroll ? tableMinWidth : "100%",
              width: allowHorizontalScroll ? tableMinWidth : "100%",
              borderBottom: "none",
            }}
          >
            <table
              style={{
                width: allowHorizontalScroll ? tableMinWidth : "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: allowHorizontalScroll ? "auto" : "fixed",
                minWidth: allowHorizontalScroll ? tableMinWidth : "100%",
              }}
            >
              <colgroup>
                <col
                  style={{
                    width: allowHorizontalScroll ? 40 : "3%",
                  }}
                />
                <col
                  style={{
                    width: allowHorizontalScroll ? 44 : "3%",
                  }}
                />
                {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                  <col
                    key={field.name}
                    style={{
                      width: allowHorizontalScroll
                        ? sipRegisterFieldColumnWidths[field.name]
                        : sipRegisterFieldColumnPercents[field.name],
                    }}
                  />
                ))}
                <col
                  style={{
                    width: allowHorizontalScroll ? 118 : "10%",
                  }}
                />
                <col
                  style={{
                    width: allowHorizontalScroll ? 72 : "6%",
                  }}
                />
              </colgroup>
              <thead>
                <tr>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterCheckboxCellStyle,
                        allowHorizontalScroll,
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
                        allowHorizontalScroll,
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
                        allowHorizontalScroll,
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
                        allowHorizontalScroll,
                      ),
                      ...getSipRegisterHeaderCellStyle(allowHorizontalScroll),
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
                        allowHorizontalScroll,
                      ),
                      ...getSipRegisterHeaderCellStyle(allowHorizontalScroll),
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
                  const rowBg = isSelected
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
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
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterCheckboxCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
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
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterIdCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
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
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight:
                                field.name === "trunk_id" ? 600 : 400,
                              ...getSipRegisterDataCellStyle(
                                allowHorizontalScroll,
                              ),
                              ...lastRowCellStyle,
                            }}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterStatusCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
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
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterModifyCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            style={{
                              cursor: loading.delete
                                ? "not-allowed"
                                : "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: loading.delete ? 0.4 : 0.7,
                              transition: "opacity 0.15s ease",
                            }}
                            onClick={() =>
                              !loading.delete &&
                              handleOpenModal(trunk, realIdx)
                            }
                            onMouseEnter={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "0.7";
                            }}
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
