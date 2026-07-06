import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  Btn,
  ExtensionModalTabs,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle,
} from "../../../../components/common";
import BasicTab from "./BasicTab";
import FeaturesTab from "./FeaturesTab";
import AdvancedTab from "./AdvancedTab";

function ExtensionFormDialog(props) {
  const {
    showModal, loading, handleCloseModal, formMode, editIndex, activeTab,
    setActiveTab, modalScrollRef, handleSave, handleBulkSave,
  } = props;
  return (
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
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
            width: 760,
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
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {formMode === "bulk"
            ? "Bulk Add Extensions"
            : editIndex !== null
              ? "Edit Extension"
              : "Add Extension"}
        </DialogTitle>
        <ExtensionModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "features", label: "FEATURES" },
            { id: "advanced", label: "ADVANCED" },
          ]}
        />

        <DialogContent
          ref={modalScrollRef}
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={{
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Tab content container matching PcmPstnPage styling */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            {activeTab === "basic" && <BasicTab {...props} />}
            {activeTab === "features" && <FeaturesTab {...props} />}
            {activeTab === "advanced" && <AdvancedTab {...props} />}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={formMode === "single" ? handleSave : handleBulkSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={extensionModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
  );
}

export default ExtensionFormDialog;
