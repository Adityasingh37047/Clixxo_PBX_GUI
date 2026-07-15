import { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  PCM_TRUNK_INITIAL_FORM,
  PCM_TRUNK_ITEMS_PER_PAGE,
  PCM_TRUNK_TS_COUNT,
} from "../../../../constants/PcmTrunkConstants";
import { PCM_TRUNK_COMPACT_MQ } from "../components/PcmTrunkFormFields";

export function usePcmTrunkPage() {
  const isCompact = useMediaQuery(PCM_TRUNK_COMPACT_MQ);
  const [trunks, setTrunks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(PCM_TRUNK_INITIAL_FORM);
  const [checkAll, setCheckAll] = useState(true);
  const [selected, setSelected] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(trunks.length / PCM_TRUNK_ITEMS_PER_PAGE),
  );
  const pagedTrunks = trunks.slice(
    (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE,
    page * PCM_TRUNK_ITEMS_PER_PAGE,
  );

  const handleOpenModal = (item = null, idx = -1) => {
    setForm(item ? { ...item } : PCM_TRUNK_INITIAL_FORM);
    setEditIndex(idx);
    setCheckAll(item ? item.ts.every(Boolean) : true);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTSChange = (idx) => {
    const newTs = [...form.ts];
    newTs[idx] = !newTs[idx];
    setForm((prev) => ({ ...prev, ts: newTs }));
    setCheckAll(newTs.every(Boolean));
  };

  const handleCheckAllTs = () => {
    const newVal = !checkAll;
    setCheckAll(newVal);
    setForm((prev) => ({
      ...prev,
      ts: Array(PCM_TRUNK_TS_COUNT).fill(newVal),
    }));
  };

  const handleSave = () => {
    setTrunks((prev) => {
      let updated;
      if (editIndex > -1) {
        updated = [...prev];
        updated[(page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + editIndex] = form;
      } else {
        updated = [...prev, form];
      }
      return updated;
    });
    setIsModalOpen(false);
    setEditIndex(-1);
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };
  const handleCheckAllRows = () => setSelected(trunks.map((_, idx) => idx));
  const handleUncheckAllRows = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      trunks
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );
  const handleDelete = () => {
    const newTrunks = trunks.filter((_, idx) => !selected.includes(idx));
    setTrunks(newTrunks);
    setSelected([]);
  };
  const handleClearAll = () => {
    setTrunks([]);
    setSelected([]);
    setPage(1);
  };
  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  return {
    isCompact,
    trunks,
    isModalOpen,
    form,
    checkAll,
    selected,
    editIndex,
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
    handleCheckAllRows,
    handleUncheckAllRows,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
  };
}
