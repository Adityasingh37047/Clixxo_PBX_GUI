import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Alert, Checkbox } from "@mui/material";
import {
  COLOR_RING_EMPTY_MESSAGE,
  COLOR_RING_PAGE_BREADCRUMB_SECTION,
  COLOR_RING_PAGE_TITLE,
} from "../../../constants/ColorRingConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as ColorRingBreadcrumb,
  extensionPageWrapStyle as colorRingPageWrapStyle,
  extensionPageInnerStyle as colorRingPageInnerStyle,
  extensionCardStyle as colorRingCardStyle,
  extensionFixedAlertSx as colorRingFixedAlertSx,
} from "../../../components/common";
import { useColorRingPage } from "./hooks/useColorRingPage";
import { ColorRingUploadModal } from "./components/ColorRingFormFields";
import {
  COLOR_RING_CHECKBOX_SX,
  COLOR_RING_TD_GAP,
  COLOR_RING_TH_GAP,
  DATA_COLUMNS,
  colorRingEditIconStyle,
  colorRingEmptyMessageStyle,
  colorRingEmptyStateStyle,
  colorRingHeaderStyle,
  colorRingPaginationBtnStyle,
  colorRingPaginationInfoStyle,
  colorRingPaginationPageBadgeStyle,
  colorRingPaginationStyle,
  colorRingSelectedBadgeStyle,
  colorRingTableBodyStyle,
  colorRingTableStyle,
  colorRingToolbarCancelBtnStyle,
  colorRingToolbarPrimaryBtnStyle,
  colorRingToolbarBtnStyle,
  getColorRingRowBg,
  handleColorRingEditIconHover,
} from "./components/ColorRingTableHelpers";

const ColorRingPage = () => {
  const vm = useColorRingPage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    fileName,
    fileInputRef,
    toast,
    clearToast,
    itemsPerPage,
    totalPages,
    pagedRules,
    pagedSelectedCount,
    allPagedChecked,
    handleOpenModal,
    handleCloseModal,
    handleReturn,
    handleInputChange,
    handleFileChange,
    handleUpload,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleHeaderCheckboxChange,
  } = vm;

  return (
    <div style={colorRingPageWrapStyle}>
      <div style={colorRingPageInnerStyle}>
        {toast.msg && (
          <Alert severity={toast.type} onClose={clearToast} sx={colorRingFixedAlertSx}>
            {toast.msg}
          </Alert>
        )}

        <ColorRingBreadcrumb
          section={COLOR_RING_PAGE_BREADCRUMB_SECTION}
          current={COLOR_RING_PAGE_TITLE}
        />

        <div style={colorRingCardStyle}>
        <div style={colorRingHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selected.length > 0 && (
              <span style={colorRingSelectedBadgeStyle}>
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
              variant="cancel"
              onClick={handleInverse}
              disabled={rules.length === 0}
              style={colorRingToolbarCancelBtnStyle}
            >
              Inverse
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selected.length === 0}
              style={colorRingToolbarCancelBtnStyle}
            >
              Delete
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={rules.length === 0}
              style={colorRingToolbarCancelBtnStyle}
            >
              Clear All
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              style={colorRingToolbarPrimaryBtnStyle}
            >
              + Add New
            </Btn>
          </div>
        </div>

        <div style={colorRingTableBodyStyle}>
          {rules.length === 0 ? (
            <div style={colorRingEmptyStateStyle}>
              <div style={colorRingEmptyMessageStyle}>
                {COLOR_RING_EMPTY_MESSAGE}
              </div>
              <Btn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={colorRingToolbarCancelBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          ) : (
            <table style={colorRingTableStyle}>
              <thead>
                <tr>
                  <TH
                    style={{
                      width: 40,
                      padding: 0,
                      borderLeft: "none",
                      ...COLOR_RING_TH_GAP,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={allPagedChecked}
                      indeterminate={pagedSelectedCount > 0 && !allPagedChecked}
                      onChange={(e) =>
                        handleHeaderCheckboxChange(e.target.checked)
                      }
                      sx={COLOR_RING_CHECKBOX_SX}
                    />
                  </TH>
                  {DATA_COLUMNS.map((col) => (
                    <TH key={col.key} style={COLOR_RING_TH_GAP}>
                      {col.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      ...COLOR_RING_TH_GAP,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRules.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected = selected.includes(realIdx);
                  const isLastRow = idx === pagedRules.length - 1;
                  const rowBg = getColorRingRowBg(isSelected, idx);
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};

                  return (
                    <tr
                      key={realIdx}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          ...COLOR_RING_TD_GAP,
                          background: rowBg,
                          borderLeft: "none",
                          width: 36,
                          ...lastRowCellStyle,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(idx)}
                          sx={COLOR_RING_CHECKBOX_SX}
                        />
                      </td>
                      {DATA_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            ...tdStyle,
                            ...COLOR_RING_TD_GAP,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item[col.key]}
                        </td>
                      ))}
                      <td
                        style={{
                          ...tdStyle,
                          ...COLOR_RING_TD_GAP,
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
                            style={colorRingEditIconStyle}
                            onMouseEnter={(e) =>
                              handleColorRingEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleColorRingEditIconHover(e, false)
                            }
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {rules.length > 0 && (
          <div style={colorRingPaginationStyle}>
            <span style={colorRingPaginationInfoStyle}>
              Showing {pagedRules.length} record
              {pagedRules.length !== 1 ? "s" : ""} on page {page}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                variant="outline"
                style={colorRingPaginationBtnStyle}
              >
                ← Prev
              </Btn>
              <span style={colorRingPaginationPageBadgeStyle}>
                Page {page} of {totalPages}
              </span>
              <Btn
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                variant="outline"
                style={colorRingPaginationBtnStyle}
              >
                Next →
              </Btn>
            </div>
          </div>
        )}
      </div>

      <ColorRingUploadModal
        open={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        fileName={fileName}
        fileInputRef={fileInputRef}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        onReturn={handleReturn}
      />
      </div>
    </div>
  );
};

export default ColorRingPage;
