import fs from "fs";

const jsx = fs.readFileSync(
  "src/modules/E1-PRI/PCM/_split_tmp/PcmTrunk-jsx.jsx",
  "utf8",
);

let body = jsx.replace(
  /\{\/\* Breadcrumb \*\/\}[\s\S]*?<\/div>\n        \{trunks/,
  "{/* Breadcrumb */}\n        <PcmTrunkBreadcrumb />\n        {trunks",
);

const page = `import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  PCM_TRUNK_INDEX_OPTIONS,
  PCM_TRUNK_PCM_NO_OPTIONS,
  PCM_TRUNK_ITEMS_PER_PAGE,
  PCM_TRUNK_FIELD_TOOLTIPS,
  PCM_TRUNK_EMPTY_MESSAGE,
  PCM_TRUNK_MODAL_TITLE,
  PCM_TRUNK_SAVE_LABEL,
  PCM_TRUNK_CLOSE_LABEL,
} from "../../../constants/PcmTrunkConstants";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import { usePcmTrunkPage } from "./hooks/usePcmTrunkPage";
import {
  Btn,
  TH,
  C,
  checkboxSx,
  cellStyle,
  tableContainerStyle,
  CARD_RADIUS,
  PcmTrunkBreadcrumb,
  PcmTrunkFieldLabel,
  PCM_TRUNK_ADD_NEW_DIALOG_SX,
  PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX,
  pcmTrunkModalFormPanelStyle,
  pcmTrunkSelectStyle,
  pcmTrunkInputInteraction,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  pcmTrunkModalCancelBtnStyle,
} from "./components/PcmTrunkFormFields";

const PcmTrunkPage = () => {
  const {
    isCompact,
    trunks,
    isModalOpen,
    form,
    checkAll,
    selected,
    page,
    totalPages,
    pagedTrunks,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleTSChange,
    handleCheckAllTs,
    handleSave,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
  } = usePcmTrunkPage();

  ${body}
};

export default PcmTrunkPage;
`;

fs.writeFileSync("src/modules/E1-PRI/PCM/PcmTrunkPage.jsx", page);
console.log("wrote PcmTrunkPage", page.length);
