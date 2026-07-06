import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  Btn,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle,
} from "../../../../components/common";

function ImportDialog(props) {
  const {
    showImportModal, importLoading, setShowImportModal, setImportFile,
    importFile, importFileRef, handleImportSubmit,
  } = props;
  return (
      <Dialog
        open={showImportModal}
        onClose={() => {
          if (!importLoading) {
            setShowImportModal(false);
            setImportFile(null);
          }
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: "96vw",
            margin: 24,
            maxHeight: "calc(100vh - 80px - 48px)",
            display: "flex",
            flexDirection: "column",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            py: 1.5,
          }}
        >
          Import Extensions
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: C.pageBg, padding: "20px 24px 12px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 4,
            }}
          >
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              Select a CSV or JSON file containing extension data to import.
            </p>
            <div
              onClick={() => importFileRef.current?.click()}
              style={{
                border: "2px dashed #9ca3af",
                borderRadius: 8,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: importFile ? "#16a34a" : "#64748b",
                  fontWeight: importFile ? 600 : 400,
                }}
              >
                {importFile
                  ? importFile.name
                  : "Click to choose file (CSV / JSON)"}
              </span>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {importLoading && (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            )}
            Import
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="cancel"
            style={extensionModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
  );
}

export default ImportDialog;
