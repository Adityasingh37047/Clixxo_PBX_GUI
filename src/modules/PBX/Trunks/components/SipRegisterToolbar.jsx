import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { CircularProgress } from "@mui/material";
import {
  Btn,
  extensionToolbarStyle as sipRegisterToolbarStyle,
  extensionSelectedBadgeStyle as sipRegisterSelectedBadgeStyle,
  extensionCancelBtnStyle as sipRegisterCancelBtnStyle,
  extensionPrimaryBtnStyle as sipRegisterPrimaryBtnStyle,
} from "../../../../components/common";

function SipRegisterToolbar({
  isCompact,
  selectedIds,
  loading,
  trunks,
  handleInverse,
  handleClearAll,
  handleDelete,
  handleOpenModal,
}) {
  return (
  <div
    style={{
      ...sipRegisterToolbarStyle,
      ...(isCompact
        ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
        : {}),
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {selectedIds.length > 0 && (
        <span style={sipRegisterSelectedBadgeStyle}>
          {selectedIds.length} selected
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
        disabled={loading.delete || loading.fetch || trunks.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        Inverse
      </Btn>
      <Btn
        variant="cancel"
        onClick={handleClearAll}
        disabled={loading.delete || trunks.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        Clear All
      </Btn>
      <Btn
        variant="cancel"
        onClick={handleDelete}
        disabled={loading.delete || selectedIds.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        {loading.delete ? (
          <CircularProgress size={12} color="inherit" />
        ) : (
          <>
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            Delete
          </>
        )}
      </Btn>
      <Btn
        variant="primary"
        onClick={() => handleOpenModal()}
        disabled={loading.fetch}
        style={sipRegisterPrimaryBtnStyle}
      >
        + Add New
      </Btn>
    </div>
  </div>

  );
}

export default SipRegisterToolbar;
