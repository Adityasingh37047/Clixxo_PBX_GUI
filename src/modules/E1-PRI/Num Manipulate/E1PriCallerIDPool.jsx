import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS,
  NUM_MANIPULATE_CALLERID_POOL_MODAL_FIELDS,
  NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS,
  NUM_MANIPULATE_CALLERID_POOL_IP_PSTN_PANEL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_PSTN_IP_PANEL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_MODAL_TITLE,
  NUM_MANIPULATE_CALLERID_POOL_ADD_NEW_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_DELETE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_CLEAR_ALL_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_SAVE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_CLOSE_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_SET_LABEL,
  NUM_MANIPULATE_CALLERID_POOL_NOTE,
} from "../../../constants/E1PriCallerIDPoolConstants";
import { useE1PriCallerIDPoolPage } from "./hooks/useE1PriCallerIDPoolPage";
import {
  E1PriCallerIDPoolBreadcrumb,
  E1PriCallerIDPoolBtn,
  E1PriCallerIDPoolTH,
  E1PriCallerIDPoolFieldRow,
  e1PriCallerIDPoolInputStyle,
  e1PriCallerIDPoolSelectStyle,
  e1PriCallerIDPoolInputInteraction,
  e1PriCallerIDPoolFormPanelStyle,
  e1PriCallerIDPoolAddNewModalFooterStyle,
  e1PriCallerIDPoolAddNewModalFooterBtnStyle,
  e1PriCallerIDPoolAddNewModalFooterCancelBtnStyle,
  e1PriCallerIDPoolCheckboxSx,
  e1PriCallerIDPoolTdStyle,
  e1PriCallerIDPoolC as C,
  e1PriCallerIDPoolDialogConfig,
} from "./components/E1PriCallerIDPoolFormFields";
import {
  getE1PriCallerIDPoolRowBg,
  e1PriCallerIDPoolEditIconStyle,
  handleE1PriCallerIDPoolEditIconHover,
  e1PriCallerIDPoolPageWrapStyle,
  e1PriCallerIDPoolPageInnerStyle,
  e1PriCallerIDPoolPanelCardStyle,
  e1PriCallerIDPoolPanelToolbarStyle,
  e1PriCallerIDPoolPanelSectionTitleStyle,
  e1PriCallerIDPoolPanelFooterStyle,
  e1PriCallerIDPoolTopControlsCardStyle,
  e1PriCallerIDPoolTopControlsBodyStyle,
  e1PriCallerIDPoolHeaderCheckThStyle,
  e1PriCallerIDPoolSelectedBadgeStyle,
  e1PriCallerIDPoolNoteStyle,
} from "./components/E1PriCallerIDPoolTableHelpers";

const CallerIDPool = () => {
  const vm = useE1PriCallerIDPoolPage();
  const {
    prefix,
    setPrefix,
    startDate,
    setStartDate,
    usageCycle,
    setUsageCycle,
    outboundCallerId,
    setOutboundCallerId,
    designationMode,
    setDesignationMode,
    destinationPcm,
    setDestinationPcm,
    rowsIpPstn,
    checkedIpPstn,
    rowsPstnIp,
    checkedPstnIp,
    showModal,
    modalData,
    modalTable,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClear,
    handleAddNew,
    handleEdit,
    handleModalChange,
    handleModalSave,
    handleModalClose,
    handleSet,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = e1PriCallerIDPoolDialogConfig;

  const renderTablePanel = ({
    title,
    rows,
    checkedItems,
    tableKey,
    onCheck,
    onCheckAll,
    onDelete,
    onClear,
    onAddNew,
    onEdit,
  }) => {
    const columns =
      tableKey === "pstn_ip"
        ? NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS.map((col) =>
            col.key === "destinationPcm"
              ? { ...col, label: "Source PCM" }
              : col,
          )
        : NUM_MANIPULATE_CALLERID_POOL_TABLE_COLUMNS;

    const dataColumns = columns.filter(
      (col) => col.key !== "check" && col.key !== "modify",
    );
    const allChecked = rows.length > 0 && checkedItems.length === rows.length;
    const someChecked = checkedItems.length > 0 && !allChecked;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={e1PriCallerIDPoolPanelCardStyle}>
          <div style={e1PriCallerIDPoolPanelToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={e1PriCallerIDPoolPanelSectionTitleStyle}>{title}</span>
              {checkedItems.length > 0 && (
                <span style={e1PriCallerIDPoolSelectedBadgeStyle}>
                  {checkedItems.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <E1PriCallerIDPoolBtn
                variant="cancel"
                onClick={onDelete}
                disabled={checkedItems.length === 0}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_CALLERID_POOL_DELETE_LABEL}
              </E1PriCallerIDPoolBtn>
              <E1PriCallerIDPoolBtn
                variant="cancel"
                onClick={onClear}
                disabled={rows.length === 0}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                {NUM_MANIPULATE_CALLERID_POOL_CLEAR_ALL_LABEL}
              </E1PriCallerIDPoolBtn>
              <E1PriCallerIDPoolBtn
                variant="primary"
                onClick={onAddNew}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                {NUM_MANIPULATE_CALLERID_POOL_ADD_NEW_LABEL}
              </E1PriCallerIDPoolBtn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 360 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 500,
              }}
            >
              <thead>
                <tr>
                  <E1PriCallerIDPoolTH
                    style={{
                      width: 56,
                      borderLeft: "none",
                      ...e1PriCallerIDPoolHeaderCheckThStyle,
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onCheckAll(!allChecked)}
                      size="small"
                      sx={e1PriCallerIDPoolCheckboxSx}
                      disabled={rows.length === 0}
                    />
                  </E1PriCallerIDPoolTH>
                  {dataColumns.map((col) => (
                    <E1PriCallerIDPoolTH key={col.key}>
                      {col.label}
                    </E1PriCallerIDPoolTH>
                  ))}
                  <E1PriCallerIDPoolTH style={{ width: 80, borderRight: "none" }}>
                    Modify
                  </E1PriCallerIDPoolTH>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={dataColumns.length + 2}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                        fontWeight: 600,
                        borderBottom: "none",
                      }}
                    >
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    const isLastRow = idx === rows.length - 1;
                    const rowBg = getE1PriCallerIDPoolRowBg(isChecked, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={idx}
                        style={{
                          background: rowBg,
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...e1PriCallerIDPoolTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onCheck(idx)}
                            size="small"
                            sx={e1PriCallerIDPoolCheckboxSx}
                          />
                        </td>
                        {dataColumns.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...e1PriCallerIDPoolTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row[col.key]}
                          </td>
                        ))}
                        <td
                          style={{
                            ...e1PriCallerIDPoolTdStyle,
                            background: rowBg,
                            borderRight: "none",
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
                              style={e1PriCallerIDPoolEditIconStyle}
                              onClick={() => onEdit(idx)}
                              onMouseEnter={(e) =>
                                handleE1PriCallerIDPoolEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleE1PriCallerIDPoolEditIconHover(e, false)
                              }
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

          {rows.length > 0 && (
            <div style={e1PriCallerIDPoolPanelFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={e1PriCallerIDPoolPageWrapStyle}>
      <div style={e1PriCallerIDPoolPageInnerStyle}>
        <E1PriCallerIDPoolBreadcrumb />

        <form onSubmit={handleSet}>
          <div style={e1PriCallerIDPoolTopControlsCardStyle}>
            <div style={e1PriCallerIDPoolTopControlsBodyStyle}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <E1PriCallerIDPoolFieldRow
                  label="Manipulate IP->PSTN CallerIDs with Designated Prefix:"
                  tooltipKey="prefix"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={320}
                >
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    style={e1PriCallerIDPoolInputStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  />
                </E1PriCallerIDPoolFieldRow>

                <E1PriCallerIDPoolFieldRow
                  label="Starting Date:"
                  tooltipKey="startDate"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={140}
                >
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={e1PriCallerIDPoolInputStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  />
                </E1PriCallerIDPoolFieldRow>

                <E1PriCallerIDPoolFieldRow
                  label="Usage Cycle (Day):"
                  tooltipKey="usageCycle"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={140}
                >
                  <input
                    type="number"
                    value={usageCycle}
                    onChange={(e) => setUsageCycle(e.target.value)}
                    style={e1PriCallerIDPoolInputStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  />
                </E1PriCallerIDPoolFieldRow>

                <E1PriCallerIDPoolFieldRow
                  label="Destination PCM:"
                  tooltipKey="destinationPcm"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={140}
                >
                  <select
                    value={destinationPcm}
                    onChange={(e) => setDestinationPcm(e.target.value)}
                    style={e1PriCallerIDPoolSelectStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  >
                    <option value="PCM">PCM</option>
                    <option value="Any">PCM Group</option>
                  </select>
                </E1PriCallerIDPoolFieldRow>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <E1PriCallerIDPoolFieldRow
                  label="IP->PSTN Outbound Calls with Designated CallerID:"
                  tooltipKey="outboundCallerId"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={320}
                >
                  <input
                    type="text"
                    value={outboundCallerId}
                    onChange={(e) => setOutboundCallerId(e.target.value)}
                    style={e1PriCallerIDPoolInputStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  />
                </E1PriCallerIDPoolFieldRow>

                <E1PriCallerIDPoolFieldRow
                  label="IP->PSTN Designation Mode:"
                  tooltipKey="designationMode"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_TOP_FIELD_TOOLTIPS}
                  labelWidth={200}
                >
                  <select
                    value={designationMode}
                    onChange={(e) => setDesignationMode(e.target.value)}
                    style={e1PriCallerIDPoolSelectStyle}
                    {...e1PriCallerIDPoolInputInteraction}
                  >
                    <option value="SIP Side Reject">SIP Side Reject</option>
                    <option value="Other">Designated CallerID</option>
                  </select>
                </E1PriCallerIDPoolFieldRow>

                <E1PriCallerIDPoolBtn
                  type="submit"
                  variant="primary"
                  style={e1PriCallerIDPoolAddNewModalFooterBtnStyle}
                >
                  {NUM_MANIPULATE_CALLERID_POOL_SET_LABEL}
                </E1PriCallerIDPoolBtn>
              </div>
            </div>
          </div>
        </form>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            width: "100%",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          {renderTablePanel({
            title: NUM_MANIPULATE_CALLERID_POOL_IP_PSTN_PANEL_TITLE,
            rows: rowsIpPstn,
            checkedItems: checkedIpPstn,
            tableKey: "ip_pstn",
            onCheck: (idx) => handleCheck("ip_pstn", idx),
            onCheckAll: (selectAll) => handleCheckAll("ip_pstn", selectAll),
            onDelete: () => handleDelete("ip_pstn"),
            onClear: () => handleClear("ip_pstn"),
            onAddNew: () => handleAddNew("ip_pstn"),
            onEdit: (idx) => handleEdit("ip_pstn", idx),
          })}
          {renderTablePanel({
            title: NUM_MANIPULATE_CALLERID_POOL_PSTN_IP_PANEL_TITLE,
            rows: rowsPstnIp,
            checkedItems: checkedPstnIp,
            tableKey: "pstn_ip",
            onCheck: (idx) => handleCheck("pstn_ip", idx),
            onCheckAll: (selectAll) => handleCheckAll("pstn_ip", selectAll),
            onDelete: () => handleDelete("pstn_ip"),
            onClear: () => handleClear("pstn_ip"),
            onAddNew: () => handleAddNew("pstn_ip"),
            onEdit: (idx) => handleEdit("pstn_ip", idx),
          })}
        </div>

        <p style={e1PriCallerIDPoolNoteStyle}>{NUM_MANIPULATE_CALLERID_POOL_NOTE}</p>

        <Dialog
          open={showModal}
          onClose={handleModalClose}
          maxWidth={false}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle
            style={{
              ...modalTitleStyle,
              padding: "14px 24px",
              letterSpacing: "-0.01em",
            }}
          >
            {NUM_MANIPULATE_CALLERID_POOL_MODAL_TITLE}
          </DialogTitle>

          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          >
            <div style={{ ...e1PriCallerIDPoolFormPanelStyle, gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {NUM_MANIPULATE_CALLERID_POOL_MODAL_FIELDS.filter(
                  (f) => f.key !== "callerIdRange",
                ).map((field) => (
                  <E1PriCallerIDPoolFieldRow
                    key={field.key}
                    label={
                      field.key === "destinationPcm" && modalTable === "pstn_ip"
                        ? "Source PCM:"
                        : `${field.label}:`
                    }
                    tooltipKey={field.key}
                    tooltips={NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS}
                    labelWidth={140}
                  >
                    {field.type === "select" ? (
                      <select
                        value={modalData[field.key]}
                        onChange={(e) =>
                          handleModalChange(field.key, e.target.value)
                        }
                        style={e1PriCallerIDPoolSelectStyle}
                        {...e1PriCallerIDPoolInputInteraction}
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={modalData[field.key] ?? ""}
                        onChange={(e) =>
                          handleModalChange(field.key, e.target.value)
                        }
                        style={e1PriCallerIDPoolInputStyle}
                        {...e1PriCallerIDPoolInputInteraction}
                      />
                    )}
                  </E1PriCallerIDPoolFieldRow>
                ))}

                <E1PriCallerIDPoolFieldRow
                  label="CallerID:"
                  tooltipKey="callerIdRange"
                  tooltips={NUM_MANIPULATE_CALLERID_POOL_FIELD_TOOLTIPS}
                  labelWidth={140}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Start"
                      value={modalData.callerIdRangeStart ?? ""}
                      onChange={(e) =>
                        handleModalChange("callerIdRangeStart", e.target.value)
                      }
                      style={e1PriCallerIDPoolInputStyle}
                      {...e1PriCallerIDPoolInputInteraction}
                    />
                    <span
                      style={{
                        color: C.mutedText,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      --
                    </span>
                    <input
                      type="text"
                      placeholder="End"
                      value={modalData.callerIdRangeEnd ?? ""}
                      onChange={(e) =>
                        handleModalChange("callerIdRangeEnd", e.target.value)
                      }
                      style={e1PriCallerIDPoolInputStyle}
                      {...e1PriCallerIDPoolInputInteraction}
                    />
                  </div>
                </E1PriCallerIDPoolFieldRow>
              </div>
            </div>
          </DialogContent>

          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={e1PriCallerIDPoolAddNewModalFooterStyle}
          >
            <E1PriCallerIDPoolBtn
              onClick={handleModalSave}
              variant="primary"
              style={e1PriCallerIDPoolAddNewModalFooterBtnStyle}
            >
              {NUM_MANIPULATE_CALLERID_POOL_SAVE_LABEL}
            </E1PriCallerIDPoolBtn>
            <E1PriCallerIDPoolBtn
              onClick={handleModalClose}
              variant="cancel"
              style={e1PriCallerIDPoolAddNewModalFooterCancelBtnStyle}
            >
              {NUM_MANIPULATE_CALLERID_POOL_CLOSE_LABEL}
            </E1PriCallerIDPoolBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default CallerIDPool;
