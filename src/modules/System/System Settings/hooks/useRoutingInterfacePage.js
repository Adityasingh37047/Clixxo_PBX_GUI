import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import {
  ROUTING_INTERFACE_ERROR_LOAD_FAILED,
  ROUTING_INTERFACE_ERROR_GET_ROUTING_INFO,
  ROUTING_INTERFACE_ERROR_CHANGE_ROUTING,
  ROUTING_INTERFACE_ERROR_APPLY_FAILED,
  ROUTING_INTERFACE_CONFIRM_SWITCH,
  ROUTING_INTERFACE_SUCCESS_SWITCHED,
} from "../../../../constants/RoutingInterfaceConstants";
import { validateRoutingForm } from "../utils/RoutingInterfaceValidators";
import {
  createEmptyCurrent,
  createEmptyFormErrors,
  createInitialSwitchForm,
  mapRoutingInfoToState,
  buildSwitchFormFromInterface,
  buildChangeRoutingPayload,
} from "../utils/RoutingInterfaceTransformers";

const fetchRoutingInfo = async () => {
  const res = await axiosInstance.get("/get-routing-info");
  if (!res.data?.response)
    throw new Error(res.data?.message || ROUTING_INTERFACE_ERROR_GET_ROUTING_INFO);
  return res.data.data;
};

const changeRouting = async (payload) => {
  const res = await axiosInstance.post("/change-routing", payload);
  if (!res.data?.response)
    throw new Error(res.data?.message || ROUTING_INTERFACE_ERROR_CHANGE_ROUTING);
  return res.data;
};

export function useRoutingInterfacePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [current, setCurrent] = useState(createEmptyCurrent);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [interfaces, setInterfaces] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createInitialSwitchForm);
  const [formIp, setFormIp] = useState("");
  const [formSubnet, setFormSubnet] = useState("");
  const [errors, setErrors] = useState(createEmptyFormErrors);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchRoutingInfo();
      const mapped = mapRoutingInfoToState(data);
      setCurrent(mapped.current);
      setActiveRoutes(mapped.activeRoutes);
      setInterfaces(mapped.interfaces);
    } catch (e) {
      setErrorMsg(e?.message || ROUTING_INTERFACE_ERROR_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenForm = () => {
    if (interfaces.length === 0) return;
    const built = buildSwitchFormFromInterface(interfaces[0]);
    setForm(built.form);
    setFormIp(built.formIp);
    setFormSubnet(built.formSubnet);
    setErrors(createEmptyFormErrors());
    setShowForm(true);
  };

  const handleIfaceChange = (ifaceName) => {
    const found = interfaces.find((i) => i.interface === ifaceName);
    if (!found) return;
    const built = buildSwitchFormFromInterface(found);
    setForm(built.form);
    setFormIp(built.formIp);
    setFormSubnet(built.formSubnet);
    setErrors(createEmptyFormErrors());
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    const validation = validateRoutingForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const confirmed = window.confirm(
      ROUTING_INTERFACE_CONFIRM_SWITCH(
        form.interface,
        form.gateway,
        form.metric,
      ),
    );
    if (!confirmed) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const result = await changeRouting(buildChangeRoutingPayload(form));
      setSuccessMsg(
        result.message || ROUTING_INTERFACE_SUCCESS_SWITCHED(form.interface),
      );
      setShowForm(false);
      await loadData();
    } catch (e) {
      setErrorMsg(e?.message || ROUTING_INTERFACE_ERROR_APPLY_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setErrors(createEmptyFormErrors());
  };

  return {
    loading,
    saving,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    current,
    activeRoutes,
    interfaces,
    showForm,
    form,
    formIp,
    formSubnet,
    errors,
    handleOpenForm,
    handleIfaceChange,
    handleFormChange,
    handleSave,
    handleCancel,
  };
}
