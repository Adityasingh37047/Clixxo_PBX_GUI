import { useState } from "react";
import { NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM } from "../../../../constants/E1PriCallerIDPoolConstants";
import {
  buildCallerIDPoolRowFromModal,
  parseCallerIDPoolRowForEdit,
} from "../utils/E1PriCallerIDPoolTransformers";

export function useE1PriCallerIDPoolPage() {
  const [prefix, setPrefix] = useState("");
  const [startDate, setStartDate] = useState("");
  const [usageCycle, setUsageCycle] = useState("0");
  const [outboundCallerId, setOutboundCallerId] = useState("0");
  const [designationMode, setDesignationMode] = useState("SIP Side Reject");
  const [destinationPcm, setDestinationPcm] = useState("PCM");

  const [rowsIpPstn, setRowsIpPstn] = useState([]);
  const [checkedIpPstn, setCheckedIpPstn] = useState([]);
  const [rowsPstnIp, setRowsPstnIp] = useState([]);
  const [checkedPstnIp, setCheckedPstnIp] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(
    NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM,
  );
  const [editIndex, setEditIndex] = useState(null);
  const [modalTable, setModalTable] = useState("ip_pstn");

  const handleCheck = (table, idx) => {
    if (table === "ip_pstn") {
      setCheckedIpPstn((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    } else {
      setCheckedPstnIp((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    }
  };

  const handleCheckAll = (table, selectAll) => {
    if (table === "ip_pstn") {
      setCheckedIpPstn(selectAll ? rowsIpPstn.map((_, idx) => idx) : []);
    } else {
      setCheckedPstnIp(selectAll ? rowsPstnIp.map((_, idx) => idx) : []);
    }
  };

  const handleDelete = (table) => {
    if (table === "ip_pstn") {
      setRowsIpPstn((rows) =>
        rows.filter((_, idx) => !checkedIpPstn.includes(idx)),
      );
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp((rows) =>
        rows.filter((_, idx) => !checkedPstnIp.includes(idx)),
      );
      setCheckedPstnIp([]);
    }
  };

  const handleClear = (table) => {
    if (table === "ip_pstn") {
      setRowsIpPstn([]);
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp([]);
      setCheckedPstnIp([]);
    }
  };

  const handleAddNew = (table) => {
    setModalData(NUM_MANIPULATE_CALLERID_POOL_INITIAL_FORM);
    setEditIndex(null);
    setModalTable(table);
    setShowModal(true);
  };

  const handleEdit = (table, idx) => {
    const row = table === "ip_pstn" ? rowsIpPstn[idx] : rowsPstnIp[idx];
    setModalData(parseCallerIDPoolRowForEdit(row));
    setEditIndex(idx);
    setModalTable(table);
    setShowModal(true);
  };

  const handleModalChange = (key, value) => {
    setModalData((data) => ({ ...data, [key]: value }));
  };

  const handleModalSave = () => {
    const dataToSave = buildCallerIDPoolRowFromModal(modalData);
    if (modalTable === "ip_pstn") {
      if (editIndex !== null) {
        setRowsIpPstn((rows) =>
          rows.map((row, idx) => (idx === editIndex ? dataToSave : row)),
        );
      } else {
        setRowsIpPstn((rows) => [...rows, dataToSave]);
      }
    } else if (editIndex !== null) {
      setRowsPstnIp((rows) =>
        rows.map((row, idx) => (idx === editIndex ? dataToSave : row)),
      );
    } else {
      setRowsPstnIp((rows) => [...rows, dataToSave]);
    }
    setShowModal(false);
    setEditIndex(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditIndex(null);
  };

  const handleSet = (e) => {
    e.preventDefault();
  };

  return {
    prefix,
    setPrefix,
    startDate,
    setStartDate,
    usageCycle,
    setUsageCycle,
    outboundCallerId,
    setOutboundCallerId,
    designationMode,
    setDesignationMode,
    destinationPcm,
    setDestinationPcm,
    rowsIpPstn,
    checkedIpPstn,
    rowsPstnIp,
    checkedPstnIp,
    showModal,
    modalData,
    modalTable,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClear,
    handleAddNew,
    handleEdit,
    handleModalChange,
    handleModalSave,
    handleModalClose,
    handleSet,
  };
}
