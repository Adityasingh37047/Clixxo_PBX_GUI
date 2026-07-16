import { useEffect, useState } from "react";
import { ROUTE_IP_PSTN_INITIAL_FORM } from "../../../../constants/RouteIPtoPstnConstants";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
  listPstnGroups,
} from "../../../../api/apiService";
import {
  ROUTE_IP_PSTN_ITEMS_PER_PAGE,
  ROUTE_IP_PSTN_ROUTE_TYPE,
  ROUTE_IP_PSTN_TABLE_WIDE_PX,
  buildDefaultRouteIpPstnForm,
  buildIpPstnApiPayload,
  mapIpPstnRouteFromApi,
  routeIpPstnFormFromRow,
  routeTableMinWidthForZoom,
} from "../utils/RouteIpPstnTransformers";
import { validateRouteIpPstnForm } from "../utils/RouteIpPstnValidators";

export function useRouteIpPstnPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = ROUTE_IP_PSTN_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchSipTrunkGroups = async () => {
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

  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setPcmTrunkGroups(pcmGroups);
      } else {
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      setPcmTrunkGroups([]);
    }
  };

  const fetchIpPstnRoutes = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listIpPstnRoutes(ROUTE_IP_PSTN_ROUTE_TYPE);
      if (response.response && Array.isArray(response.message)) {
        setRules(response.message.map(mapIpPstnRouteFromApi));
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching IP PSTN routes:", error);
      showMessage("error", error.message || "Failed to load IP PSTN routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.allSettled([
        fetchIpPstnRoutes(),
        fetchSipTrunkGroups(),
        fetchPcmTrunkGroups(),
      ]);
    };
    loadAllData();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(ROUTE_IP_PSTN_TABLE_WIDE_PX));
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
    if (item) {
      setFormData(routeIpPstnFormFromRow(item, index));
    } else {
      setFormData(buildDefaultRouteIpPstnForm(sipTrunkGroups, pcmTrunkGroups));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    const { originalIndex, ...dataToSave } = formData;
    const validationError = validateRouteIpPstnForm(dataToSave);
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    const apiData = buildIpPstnApiPayload(dataToSave);

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(
          rules[originalIndex].id,
          apiData,
          ROUTE_IP_PSTN_ROUTE_TYPE,
        );
        if (response?.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", response?.message || "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(
          apiData,
          ROUTE_IP_PSTN_ROUTE_TYPE,
        );
        if (response?.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", response?.message || "Failed to create route");
        }
      }
    } catch (e) {
      console.error("Error saving route:", e);
      showMessage("error", e.message || "Failed to save route");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
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
        await deleteIpPstnRoute(id, ROUTE_IP_PSTN_ROUTE_TYPE);
      }
      await fetchIpPstnRoutes();
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
        await deleteIpPstnRoute(r.id, ROUTE_IP_PSTN_ROUTE_TYPE);
      }
      await fetchIpPstnRoutes();
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
    setFormData,
    rules,
    selected,
    page,
    itemsPerPage,
    sipTrunkGroups,
    pcmTrunkGroups,
    loading,
    message,
    setMessage,
    tableMinWidth,
    totalPages,
    pagedRules,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
  };
}
