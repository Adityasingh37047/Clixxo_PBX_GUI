import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  CALL_BACK_ORDER_OPTIONS,
  CALL_BACK_THROUGH_OPTIONS,
  CALL_BACK_TRUNK_ROW_COUNT,
} from "../../../constants/CallBackConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as CallBackBreadcrumb,
  ExtensionTableListLoading as CallBackTableListLoading,
  ExtensionTableListEmptyState as CallBackTableListEmptyState,
  ExtensionPagination as CallBackPagination,
  extensionTableCheckboxSx as callBackTableCheckboxSx,
  extensionFixedAlertSx as callBackFixedAlertSx,
  extensionPageWrapStyle as callBackPageWrapStyle,
  extensionPageInnerStyle as callBackPageInnerStyle,
  extensionCardStyle as callBackCardStyle,
  extensionToolbarStyle as callBackToolbarStyle,
  extensionSelectedBadgeStyle as callBackSelectedBadgeStyle,
  extensionCancelBtnStyle as callBackCancelBtnStyle,
  extensionPrimaryBtnStyle as callBackPrimaryBtnStyle,
} from "../../../components/common";
import { useCallBackPage } from "./hooks/useCallBackPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  CallBackFieldRow,
  callBackModalCancelBtnStyle,
  callBackModalFormStyle,
  callBackModalPaperSx,
  callBackModalSelectSx,
  callBackModalTextFieldFullSx,
  callBackModalTitleStyle,
  callBackRadioSx,
} from "./components/CallBackFormFields";
import {
  callBackEditIconStyle,
  delayCellStyle,
  handleCallBackEditIconHover,
  renderThrough,
  throughCellStyle,
} from "./components/CallBackTableHelpers";

const CallBackPage = () => {
  const vm = useCallBackPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    error,
    setError,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    searchQuery,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    delay,
    setDelay,
    strip,
    setStrip,
    prepend,
    setPrepend,
    destination,
    setDestination,
    throughFromComeIn,
    throughSelect,
    extensionOptions,
    trunkOptions,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
    handleThroughChange,
  } = vm;

  return (
    <div
      style={{
        ...callBackPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={callBackPageInnerStyle}>
        {error.text && (
          <Alert
            severity={
              error.type === "error"
                ? "error"
                : error.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setError({ type: "", text: "" })}
            sx={callBackFixedAlertSx}
          >
            {error.text}
          </Alert>
        )}

        <CallBackBreadcrumb section="Call Features" current="CallBack" />

        <div style={callBackCardStyle}>
          <div
            style={{
              ...callBackToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={callBackSelectedBadgeStyle}>
                  {selected.length} selected
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search callbacks..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11,
                      color: C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}

              {/* <Btn
                onClick={handlePrev}
                disabled={loading.fetch || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={handleNext}
                disabled={loading.fetch || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={callBackCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>

              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
                style={callBackPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <CallBackTableListLoading />
            ) : rows.length === 0 ? (
              <CallBackTableListEmptyState
                message="No callbacks found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <CallBackTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={callBackTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Delay (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Strip
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Prepend
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Through
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
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
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={callBackTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span style={delayCellStyle}>{row.delay}</span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.strip || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.prepend || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.destination || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span style={throughCellStyle(row)}>
                            {renderThrough(row)}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={callBackEditIconStyle}
                            onMouseEnter={(e) =>
                              handleCallBackEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleCallBackEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <CallBackPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            ...callBackModalPaperSx,
            borderRadius:
              editId == null ? "4px" : callBackModalPaperSx.borderRadius,
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <DialogTitle style={callBackModalTitleStyle}>
          {editId != null ? "Edit CallBack Rule" : "Add CallBack"}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={callBackModalFormStyle}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <CallBackFieldRow label="Name" tooltipKey="name">
                <TextField
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={callBackModalTextFieldFullSx}
                />
              </CallBackFieldRow>

              <CallBackFieldRow label="Strip" tooltipKey="strip">
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={strip}
                  onChange={(e) => setStrip(e.target.value)}
                  sx={callBackModalTextFieldFullSx}
                />
              </CallBackFieldRow>

              <CallBackFieldRow label="Destination" tooltipKey="destination">
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    displayEmpty
                    sx={callBackModalSelectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                      <span style={{ color: C.mutedText }}>
                        {loading.extensions
                          ? "Loading..."
                          : "Select Destination"}
                      </span>
                    </MenuItem>
                    {extensionOptions.map((ext) => (
                      <MenuItem key={ext} value={ext} sx={{ fontSize: 13 }}>
                        {ext}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </CallBackFieldRow>

              <CallBackFieldRow label="Delay (s)" tooltipKey="delay">
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  sx={callBackModalTextFieldFullSx}
                />
              </CallBackFieldRow>

              <CallBackFieldRow label="Prepend" tooltipKey="prepend">
                <TextField
                  size="small"
                  fullWidth
                  value={prepend}
                  onChange={(e) => setPrepend(e.target.value)}
                  sx={callBackModalTextFieldFullSx}
                />
              </CallBackFieldRow>

              <CallBackFieldRow label="Through" tooltipKey="through" alignTop>
                <RadioGroup
                  value={
                    throughSelect
                      ? "select"
                      : throughFromComeIn
                        ? "from_in"
                        : "auto"
                  }
                  onChange={(e) => handleThroughChange(e.target.value)}
                  sx={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {CALL_BACK_THROUGH_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" sx={callBackRadioSx} />}
                      label={
                        <span style={{ fontSize: 13 }}>{opt.label}</span>
                      }
                      sx={{ m: 0 }}
                    />
                  ))}
                </RadioGroup>
              </CallBackFieldRow>
            </div>

            {throughSelect && (
              <div style={{ marginTop: 16, paddingTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                    paddingLeft: 0,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                    }}
                  >
                    Trunk
                  </div>
                  <div
                    style={{
                      width: 80,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      textAlign: "center",
                    }}
                  >
                    Order
                  </div>
                </div>
                {Array.from({ length: CALL_BACK_TRUNK_ROW_COUNT }, (_, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value=""
                          displayEmpty
                          sx={callBackModalSelectSx}
                        >
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            {trunkOptions.length
                              ? "Select trunk"
                              : "No trunks"}
                          </MenuItem>
                          {trunkOptions.map((t) => (
                            <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>
                              {t}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </div>
                    <div style={{ width: 80 }}>
                      <FormControl size="small" fullWidth>
                        <MuiSelect value={0} sx={callBackModalSelectSx}>
                          {CALL_BACK_ORDER_OPTIONS.map((val) => (
                            <MenuItem key={val} value={val} sx={{ fontSize: 13 }}>
                              {val}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Rule"
            ) : (
              "Create"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={callBackModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallBackPage;
