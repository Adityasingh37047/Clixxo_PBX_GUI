import { CircularProgress } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Btn,
  ExtensionToolbarSearchBar,
  extensionToolbarStyle,
  extensionSelectedBadgeStyle,
  extensionCancelBtnStyle,
  extensionPrimaryBtnStyle,
} from "../../../../components/common";

function ExtensionsToolbar(props) {
  const {
    isCompact,
    selected,
    searchQuery,
    setSearchQuery,
    setPage,
    setSelected,
    handleDelete,
    loading,
    setShowImportModal,
    setImportFile,
    handleExport,
    openBulkModal,
    handleOpenModal,
  } = props;
  return (
    <div
      style={{
        ...extensionToolbarStyle,
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
          flex: 1,
          minWidth: 0,
        }}
      >
        {selected.length > 0 && (
          <span style={extensionSelectedBadgeStyle}>
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Right: search + buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <ExtensionToolbarSearchBar
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search extension, context, status..."
          fitPlaceholder
          style={{ borderRadius: "4px" }}
        />

        <Btn
          onClick={handleDelete}
          disabled={loading.delete || !selected.length}
          variant="cancel"
          style={extensionCancelBtnStyle}
        >
          {loading.delete ? (
            <CircularProgress size={11} style={{ color: "#374151" }} />
          ) : null}
          <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
          Delete Selected
        </Btn>

        <Btn
          onClick={() => {
            setShowImportModal(true);
            setImportFile(null);
          }}
          disabled={loading.fetch}
          variant="cancel"
          style={extensionCancelBtnStyle}
        >
          ⬇ Import
        </Btn>

        <Btn
          onClick={handleExport}
          disabled={loading.fetch}
          variant="cancel"
          style={extensionCancelBtnStyle}
        >
          ⬆ Export
        </Btn>
        <Btn
          onClick={openBulkModal}
          disabled={loading.fetch || loading.save}
          variant="cancel"
          style={extensionCancelBtnStyle}
        >
          + Bulk Add
        </Btn>

        <Btn
          onClick={() => handleOpenModal()}
          disabled={loading.fetch || loading.save}
          variant="primary"
          style={extensionPrimaryBtnStyle}
        >
          + Add New
        </Btn>
      </div>
    </div>
  );
}

export default ExtensionsToolbar;
