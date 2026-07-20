import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  PORT_FXS_TABLE_COLUMNS,
  PORT_FXS_BATCH_MODIFY_TITLE,
  PORT_FXS_EMPTY_MESSAGE,
  PORT_FXS_PAGE_BREADCRUMB_ROOT,
  PORT_FXS_PAGE_BREADCRUMB_SECTION,
  PORT_FXS_PAGE_TITLE,
} from "../../../constants/PortFxsPageConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PortFxsBreadcrumb,
  ExtensionPagination as PortFxsPagination,
  extensionPageWrapStyle as portFxsPageWrapStyle,
  extensionPageInnerStyle as portFxsPageInnerStyle,
  extensionCardStyle as portFxsCardStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { usePortFxsPage } from "./hooks/usePortFxsPage";
import PortFxsBatchModifyPage from "./PortFxsBatchModifyPage";
import PortFxsModifyPage from "./PortFxsModifyPage";
import {
  PortFxsRegStatusBadge,
  addNewModalBackdropSlotProps,
  addNewModalDialogContentSx,
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  fxsDialogPaperSx,
  fxsDialogSx,
  fxsDialogTitleStyle,
  fxsToolbarCancelBtnStyle,
  fxsToolbarPrimaryBtnStyle,
  portFxsHeaderStyle,
  portFxsTableBodyStyle,
  renderPortFxsTableColumnHeader,
} from "./components/PortFxsFormFields";
import {
  PCM_TRUNK_GROUP_TH_GAP,
  getPortFxsRowBg,
  handlePortFxsEditIconHover,
  portFxsEditIconStyle,
  portFxsPaginationStyle,
  routeTdStyle,
  routeThExtra,
  tableSectionBorder,
} from "./components/PortFxsTableHelpers";

const PortFxsPage = () => {
  const vm = usePortFxsPage();
  const {
    error,
    batchInitialPorts,
    maxPorts,
    page,
    refreshKey,
    tableMinWidth,
    hasHorizontalScroll,
    showBatchModify,
    setShowBatchModify,
    showSingleModify,
    selectedPort,
    modifySaving,
    setModifySaving,
    tableScrollRef,
    modifyFormRef,
    totalPages,
    pagedPorts,
    hasData,
    handlePageChange,
    handleBatchModify,
    handleOpenSingleModify,
    handleCloseSingleModify,
    handleSingleModifySaved,
    handleBatchModifySaved,
  } = vm;

  const renderEmptyState = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#3E5475",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {PORT_FXS_EMPTY_MESSAGE}
      </div>
      <Btn
        variant="cancel"
        onClick={handleBatchModify}
        style={fxsToolbarCancelBtnStyle}
      >
        Batch Modify
      </Btn>
    </div>
  );

  const renderTableCell = (col, port, rowBg, isLastRow) => {
    const cellStyle = {
      ...routeTdStyle,
      background: rowBg,
      borderBottom: isLastRow ? "none" : routeTdStyle.borderBottom,
      ...(col.key === "modify" ? { borderRight: "none" } : {}),
    };

    if (col.key === "modify") {
      return (
        <td key={col.key} style={cellStyle}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EditDocumentIcon
              titleAccess="Modify"
              style={portFxsEditIconStyle}
              onClick={() => handleOpenSingleModify(port)}
              onMouseEnter={(e) => handlePortFxsEditIconHover(e, true)}
              onMouseLeave={(e) => handlePortFxsEditIconHover(e, false)}
            />
          </div>
        </td>
      );
    }

    const value =
      col.key === "regStatus" ? (
        <PortFxsRegStatusBadge regStatus={port.regStatus} />
      ) : (
        port[col.key]
      );

    return (
      <td key={col.key} style={cellStyle}>
        {value}
      </td>
    );
  };

  return (
    <div style={portFxsPageWrapStyle}>
      <div style={portFxsPageInnerStyle}>
        <PortFxsBreadcrumb
          root={PORT_FXS_PAGE_BREADCRUMB_ROOT}
          section={PORT_FXS_PAGE_BREADCRUMB_SECTION}
          current={PORT_FXS_PAGE_TITLE}
        />

        <div style={portFxsCardStyle}>
          <div style={portFxsHeaderStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="primary"
                onClick={handleBatchModify}
                style={fxsToolbarPrimaryBtnStyle}
              >
                Batch Modify
              </Btn>
            </div>
          </div>

          <div ref={tableScrollRef} key={refreshKey} style={portFxsTableBodyStyle}>
            {error ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 240,
                  padding: 24,
                  fontSize: 13,
                  color: C.amber,
                  textAlign: "center",
                }}
              >
                Error: {error}
              </div>
            ) : !hasData ? (
              renderEmptyState()
            ) : (
              <div
                style={{
                  minWidth: tableMinWidth,
                  width: tableMinWidth === "100%" ? "100%" : "max-content",
                  borderBottom: hasHorizontalScroll ? tableSectionBorder : undefined,
                  boxSizing: "border-box",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      {PORT_FXS_TABLE_COLUMNS.map((col) => {
                        if (col.key === "modify") {
                          return (
                            <TH
                              key={col.key}
                              style={{
                                width: 70,
                                borderRight: "none",
                                ...routeThExtra,
                                ...PCM_TRUNK_GROUP_TH_GAP,
                              }}
                            >
                              {renderPortFxsTableColumnHeader(col)}
                            </TH>
                          );
                        }
                        return (
                          <TH
                            key={col.key}
                            style={{ ...routeThExtra, ...PCM_TRUNK_GROUP_TH_GAP }}
                          >
                            {renderPortFxsTableColumnHeader(col)}
                          </TH>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPorts.map((port, idx) => {
                      const rowBg = getPortFxsRowBg(idx);
                      const isLastRow = idx === pagedPorts.length - 1;
                      return (
                        <tr
                          key={port.port}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = rowBg;
                          }}
                        >
                          {PORT_FXS_TABLE_COLUMNS.map((col) =>
                            renderTableCell(col, port, rowBg, isLastRow),
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {hasData && (
            <PortFxsPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedPorts.length}
              onPageChange={handlePageChange}
              style={portFxsPaginationStyle}
            />
          )}
        </div>

        <Dialog
          open={showBatchModify}
          onClose={() => setShowBatchModify(false)}
          maxWidth={false}
          slotProps={addNewModalBackdropSlotProps}
          sx={fxsDialogSx}
          PaperProps={{ sx: fxsDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={fxsDialogTitleStyle}>
            {PORT_FXS_BATCH_MODIFY_TITLE}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
          >
            <PortFxsBatchModifyPage
              key={`batch-${batchInitialPorts?.startingPort ?? "0"}-${batchInitialPorts?.endingPort ?? "0"}`}
              inDialog
              formId="fxs-batch-modify-form"
              initialPorts={batchInitialPorts}
              maxPorts={maxPorts}
              onSaved={handleBatchModifySaved}
              onClose={() => setShowBatchModify(false)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-batch-modify-form"
              style={addNewModalFooterBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => setShowBatchModify(false)}
              style={addNewModalFooterCancelBtnStyle}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showSingleModify && !!selectedPort}
          onClose={handleCloseSingleModify}
          maxWidth={false}
          slotProps={addNewModalBackdropSlotProps}
          sx={fxsDialogSx}
          PaperProps={{ sx: fxsDialogPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={fxsDialogTitleStyle}>FXS-Modify</DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
          >
            {selectedPort && (
              <PortFxsModifyPage
                ref={modifyFormRef}
                key={`modify-${selectedPort}`}
                inDialog
                formId="fxs-modify-form"
                port={selectedPort}
                maxPorts={maxPorts}
                onSavingChange={setModifySaving}
                onSaved={handleSingleModifySaved}
                onClose={() => {
                  handleCloseSingleModify();
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="fxs-modify-form"
              disabled={modifySaving}
              style={addNewModalFooterBtnStyle}
            >
              {modifySaving ? "Saving..." : "Modify"}
            </Btn>
            <Btn
              variant="cancel"
              type="button"
              onClick={() => modifyFormRef.current?.reset()}
              disabled={modifySaving}
              style={addNewModalFooterCancelBtnStyle}
            >
              Reset
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseSingleModify}
              style={addNewModalFooterCancelBtnStyle}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortFxsPage;
