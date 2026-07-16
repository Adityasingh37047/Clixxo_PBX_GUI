import { useEffect, useState } from "react";
import { ROUTE_IP_PSTN_INITIAL_FORM } from "../../../../constants/FxsRouteIPtoPstnConstants";
import {
  buildDefaultRouteIpToTelForm,
  getAvailableRouteIpToTelIndices,
  normalizeRouteIpToTelRule,
  routeIpToTelFormFromRow,
  routeTableMinWidthForZoom,
} from "../utils/RouteIpToTelTransformers";
import { validateRouteIpToTelForm } from "../utils/RouteIpToTelValidators";

const ROUTE_IP_TO_TEL_ITEMS_PER_PAGE = 20;
const ROUTE_IP_TO_TEL_TABLE_WIDE_PX = 1200;

export function useRouteIpToTelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pcmTrunkGroups] = useState([
    { group_id: 1, id: 1 },
    { group_id: 2, id: 2 },
    { group_id: 3, id: 3 },
    { group_id: 4, id: 4 },
    { group_id: 5, id: 5 },
  ]);
  const [indexSelect, setIndexSelect] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  const itemsPerPage = ROUTE_IP_TO_TEL_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please|invalid|must|already exists/i.test(msg) &&
      !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(ROUTE_IP_TO_TEL_TABLE_WIDE_PX));
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      const formPayload = routeIpToTelFormFromRow(item);
      setFormData(formPayload);
      setIndexSelect(String(item.index || ""));
      setEditIndex(index);
    } else {
      const { defaultFormData, firstAvailable } =
        buildDefaultRouteIpToTelForm(rules);
      setFormData(defaultFormData);
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(ROUTE_IP_PSTN_INITIAL_FORM);
    setIndexSelect("");
    setEditIndex(null);
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData((prev) => ({ ...prev, index: value }));
  };

  const handleSave = async () => {
    const validationError = validateRouteIpToTelForm({
      formData,
      editIndex,
      rules,
    });
    if (validationError) {
      alert(validationError);
      return;
    }

    const normalized = normalizeRouteIpToTelRule(formData, editIndex, rules);

    try {
      if (editIndex !== null && editIndex > -1) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        alert("Route updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        alert("Route created successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving route:", error);
      alert(error.message || "Failed to save route");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );

  const handleDelete = () => {
    if (selected.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;
    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      alert("Selected routes deleted successfully!");
    } catch (error) {
      console.error("Error deleting routes:", error);
      alert(error.message || "Failed to delete routes");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      alert("No routes to clear.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      alert("All routes deleted successfully!");
    } catch (error) {
      console.error("Error clearing all routes:", error);
      alert(error.message || "Failed to clear all routes");
    }
  };

  return {
    isModalOpen,
    formData,
    setFormData,
    rules,
    selected,
    page,
    pcmTrunkGroups,
    indexSelect,
    editIndex,
    toast,
    setToast,
    tableMinWidth,
    itemsPerPage,
    totalPages,
    pagedRules,
    getAvailableIndices: (currentEditIndex) =>
      getAvailableRouteIpToTelIndices(rules, currentEditIndex),
    handleOpenModal,
    handleCloseModal,
    handleIndexSelectChange,
    handleSave,
    handleInputChange,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
  };
}
