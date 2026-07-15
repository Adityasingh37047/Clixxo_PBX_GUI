import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  DISA_ENABLE_OPTIONS,
  DISA_SECOND_DIAL_OPTIONS,
  DISA_TITLE,
  DISA_TRANSPARENT_OPTIONS,
} from "../../../constants/DisaConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as DisaBreadcrumb,
  ExtensionTableListLoading as DisaTableListLoading,
  ExtensionTableListEmptyState as DisaTableListEmptyState,
  ExtensionPagination as DisaPagination,
  extensionTableCheckboxSx as disaTableCheckboxSx,
  extensionFixedAlertSx as disaFixedAlertSx,
  extensionPageWrapStyle as disaPageWrapStyle,
  extensionPageInnerStyle as disaPageInnerStyle,
  extensionCardStyle as disaCardStyle,
  extensionToolbarStyle as disaToolbarStyle,
  extensionSelectedBadgeStyle as disaSelectedBadgeStyle,
  extensionCancelBtnStyle as disaCancelBtnStyle,
  extensionPrimaryBtnStyle as disaPrimaryBtnStyle,
  ExtensionCodecDualList as DisaCodecDualList,
} from "../../../components/common";
import { useDisaPage } from "./hooks/useDisaPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  DisaFieldRow,
  DisaSectionHeading,
  disaModalCancelBtnStyle,
  disaModalContentWrapStyle,
  disaModalDialogContainerSx,
  disaModalDialogContentSx,
  disaModalPaperSx,
  disaModalSectionStyle,
  disaModalSelectSx,
  disaModalTextFieldFullSx,
  disaModalTitleStyle,
} from "./components/DisaFormFields";
import {
  disaEditIconStyle,
  enableDisableCellStyle,
  getDisaRowBg,
  handleDisaEditIconHover,
} from "./components/DisaTableHelpers";
import { formatOutboundRoutesCell } from "./utils/DisaTransformers";

const DisaPage = () => {
  const vm = useDisaPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    form,
    setForm,
    showPassword,
    setShowPassword,
    routeNameById,
    getOutboundRouteLabel,
    allOutboundRouteOptions,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...disaPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={disaPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={disaFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <DisaBreadcrumb section="Call Features" current={DISA_TITLE} />

        <div style={disaCardStyle}>
          <div
            style={{
              ...disaToolbarStyle,
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
                <span style={disaSelectedBadgeStyle}>
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
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={disaCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={disaPrimaryBtnStyle}
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
              <DisaTableListLoading />
            ) : rows.length === 0 ? (
              <DisaTableListEmptyState
                message="No DISA entries found."
                onAddNew={handleOpenAddModal}
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
                        sx={disaTableCheckboxSx}
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
                      Response Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Digit Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Second Dial
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Transparent
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Pin Type
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Outbound Routes
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
                    const rowBg = getDisaRowBg(isSelected, idx);

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
                            sx={disaTableCheckboxSx}
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
                          {row.responseTimeout}
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
                          {row.digitTimeout}
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
                          <span style={enableDisableCellStyle(row.secondDial)}>
                            {row.secondDial}
                          </span>
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
                          <span style={enableDisableCellStyle(row.transparent)}>
                            {row.transparent}
                          </span>
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
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {row.pinType}
                          </span>
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
                          {formatOutboundRoutesCell(
                            row.outboundRoutes,
                            routeNameById,
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={disaEditIconStyle}
                            onMouseEnter={(e) =>
                              handleDisaEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleDisaEditIconHover(e, false)
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
            <DisaPagination
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
        onClose={loading.save || loading.get ? null : handleCloseModal}
        maxWidth={false}
        sx={disaModalDialogContainerSx}
        PaperProps={{
          sx: {
            ...disaModalPaperSx,
            borderRadius:
              editId == null ? "4px" : disaModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={disaModalTitleStyle}>
          {editId != null ? `Edit ${DISA_TITLE}` : `Add ${DISA_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...disaModalDialogContentSx,
            padding: "0 24px 24px",
            backgroundColor: "#ffffff",
          }}
        >
          {loading.get ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <CircularProgress size={30} style={{ color: C.accent }} />
            </div>
          ) : (
            <div style={disaModalContentWrapStyle}>
              <div style={{ background: "#ffffff" }}>
                <div style={disaModalSectionStyle}>
                  <DisaSectionHeading title="General Settings" isFirst />

                  <div
                    style={{
                      marginTop: 8,
                      width: "100%",
                      maxWidth: 720,
                      margin: "0 auto",
                      display: "grid",
                      gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                      gap: isCompact ? "16px" : "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <DisaFieldRow label="Name" tooltipKey="name" required>
                        <TextField
                          size="small"
                          fullWidth
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          sx={disaModalTextFieldFullSx}
                        />
                      </DisaFieldRow>

                      <DisaFieldRow
                        label="Response Timeout (s)"
                        tooltipKey="response_timeout"
                        required
                      >
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={form.responseTimeout}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              responseTimeout: e.target.value,
                            }))
                          }
                          inputProps={{ min: 1 }}
                          sx={disaModalTextFieldFullSx}
                        />
                      </DisaFieldRow>

                      <DisaFieldRow label="Second Dial" tooltipKey="second_dial">
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={form.secondDial}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                secondDial: e.target.value,
                              }))
                            }
                            sx={disaModalSelectSx}
                          >
                            {DISA_SECOND_DIAL_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </DisaFieldRow>

                      <DisaFieldRow
                        label="Pin Type"
                        tooltipKey="pin_type"
                        alignTop
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 24,
                              height: 32,
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 13,
                                cursor: "pointer",
                                color: C.labelText,
                              }}
                            >
                              <input
                                type="radio"
                                name="pinType"
                                value="None"
                                checked={form.pinType === "None"}
                                onChange={() =>
                                  setForm((f) => ({
                                    ...f,
                                    pinType: "None",
                                    pin: "",
                                  }))
                                }
                                style={{ cursor: "pointer" }}
                              />
                              None
                            </label>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 13,
                                cursor: "pointer",
                                color: C.labelText,
                              }}
                            >
                              <input
                                type="radio"
                                name="pinType"
                                value="Single Pin"
                                checked={form.pinType === "Single Pin"}
                                onChange={() =>
                                  setForm((f) => ({
                                    ...f,
                                    pinType: "Single Pin",
                                  }))
                                }
                                style={{ cursor: "pointer" }}
                              />
                              Single Pin
                            </label>
                          </div>
                          {form.pinType === "Single Pin" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="Enter pin number"
                                type={showPassword ? "text" : "password"}
                                value={form.pin}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    pin: e.target.value,
                                  }))
                                }
                                sx={disaModalTextFieldFullSx}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setShowPassword(!showPassword)
                                        }
                                      >
                                        {showPassword ? (
                                          <VisibilityOff
                                            sx={{ fontSize: 16 }}
                                          />
                                        ) : (
                                          <Visibility sx={{ fontSize: 16 }} />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </DisaFieldRow>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <DisaFieldRow
                        label="Digit Timeout (s)"
                        tooltipKey="digit_timeout"
                        required
                      >
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={form.digitTimeout}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              digitTimeout: e.target.value,
                            }))
                          }
                          inputProps={{ min: 1 }}
                          sx={disaModalTextFieldFullSx}
                        />
                      </DisaFieldRow>

                      <DisaFieldRow label="Transparent" tooltipKey="transparent">
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={form.transparent}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                transparent: e.target.value,
                              }))
                            }
                            sx={disaModalSelectSx}
                          >
                            {DISA_TRANSPARENT_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </DisaFieldRow>

                      <DisaFieldRow label="Enabled" tooltipKey="enabled">
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={form.enabled ? "Yes" : "No"}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                enabled: e.target.value === "Yes",
                              }))
                            }
                            sx={disaModalSelectSx}
                          >
                            {DISA_ENABLE_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </DisaFieldRow>
                    </div>
                  </div>

                  <DisaSectionHeading
                    title="Outbound Routes"
                    tooltipKey="outbound_routes"
                  />

                  <DisaCodecDualList
                    style={{ marginTop: 8 }}
                    allOptions={allOutboundRouteOptions}
                    selected={form.outboundRoutes}
                    onChange={(outboundRoutes) =>
                      setForm((f) => ({ ...f, outboundRoutes }))
                    }
                    getLabel={getOutboundRouteLabel}
                    emptyTextAvailable="No routes available"
                    emptyTextSelected="No selected routes"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save || loading.get}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update DISA"
                : "Create DISA"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save || loading.get}
            style={disaModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisaPage;
