import { useEffect, useState } from "react";
import { ROUTE_IP_IP_INITIAL_FORM } from "../../../../constants/RouteIPIPConstants";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
} from "../../../../api/apiService";
import {
  ROUTE_IP_TO_IP_ITEMS_PER_PAGE,
  ROUTE_IP_TO_IP_ROUTE_TYPE,
  ROUTE_IP_TO_IP_TABLE_WIDE_PX,
  applyRouteIPToIPSourceDestConstraint,
  buildDefaultRouteIPToIPForm,
  buildIpToIpApiPayload,
  mapIpToIpRouteFromApi,
  routeIPToIPFormFromRow,
  routeTableMinWidthForZoom,
} from "../utils/RouteIPToIPTransformers";
import { validateRouteIPToIPForm } from "../utils/RouteIPToIPValidators";

export function useRouteIPToIPPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = ROUTE_IP_TO_IP_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationMessage, setValidationMessage] = useState("");
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchSipGroups = async () => {
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setSipTrunkGroups(sipGroups);
      } else {
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      setSipTrunkGroups([]);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const response = await listIpPstnRoutes(ROUTE_IP_TO_IP_ROUTE_TYPE);
      if (response.response && Array.isArray(response.message)) {
        setRules(response.message.map(mapIpToIpRouteFromApi));
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Failed to load IP->IP routes", error);
      showMessage("error", error.message || "Failed to load IP->IP routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchSipGroups();
    fetchRules();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(ROUTE_IP_TO_IP_TABLE_WIDE_PX));
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    window.visualViewport?.addEventListener("resize", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      window.visualViewport?.removeEventListener(
        "resize",
        updateTableWidthForZoom,
      );
    };
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    setValidationMessage("");
    if (item) {
      setFormData(routeIPToIPFormFromRow(item, index));
    } else {
      setFormData(buildDefaultRouteIPToIPForm());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setValidationMessage("");
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const { originalIndex, ...dataToSave } = formData;
    const validationError = validateRouteIPToIPForm(dataToSave);
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    const apiData = buildIpToIpApiPayload(dataToSave);

    try {
      setLoading((prev) => ({ ...prev, save: true }));
      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(
          rules[originalIndex].id,
          apiData,
          ROUTE_IP_TO_IP_ROUTE_TYPE,
        );
        if (response?.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchRules();
        } else {
          showMessage("error", response?.message || "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(
          apiData,
          ROUTE_IP_TO_IP_ROUTE_TYPE,
        );
        if (response?.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchRules();
        } else {
          showMessage("error", response?.message || "Failed to create route");
        }
      }
    } catch (e) {
      console.error("Error saving IP->IP rule:", e);
      showMessage("error", e.message || "Failed to save IP->IP rule");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => {
      const { newData, validationMessage: nextMsg } =
        applyRouteIPToIPSourceDestConstraint(prev, key, value);
      if (nextMsg) {
        setValidationMessage(nextMsg);
        setTimeout(() => setValidationMessage(""), 3000);
      } else {
        setValidationMessage("");
      }
      return newData;
    });
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

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("warning", "Please select items to delete");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = rules
        .filter((_, idx) => selected.includes(idx))
        .map((r) => r.id);
      for (const id of idsToDelete) {
        await deleteIpPstnRoute(id, ROUTE_IP_TO_IP_ROUTE_TYPE);
      }
      await fetchRules();
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("error", error.message || "Failed to delete routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("warning", "No routes to clear");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const r of rules) {
        await deleteIpPstnRoute(r.id, ROUTE_IP_TO_IP_ROUTE_TYPE);
      }
      await fetchRules();
      setSelected([]);
      setPage(1);
      showMessage("success", "All routes deleted successfully!");
    } catch (error) {
      showMessage("error", "Failed to clear all routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    itemsPerPage,
    sipTrunkGroups,
    loading,
    message,
    setMessage,
    validationMessage,
    tableMinWidth,
    totalPages,
    pagedRules,
    handleOpenModal,
    handleCloseModal,
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
