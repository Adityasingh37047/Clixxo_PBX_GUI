#!/usr/bin/env node
/**
 * Generates factored Num Manipulate page files from page configs.
 * Run: node scripts/factor-fxs-num-manipulate.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const NUM_DIR = path.join(ROOT, "src/modules/FXS/Num Manipulate");

const PAGES = [
  {
    prefix: "IPCallInCallerID",
    hook: "useIPCallInCallerIDPage",
    component: "IPCallInCallerID",
    file: "FxsIPCallInCallerID.jsx",
    constants: "FxsIPCallInCallerIDConstants",
    constPrefix: "IP_CALL_IN_CALLERID",
    manipulationType: "ip_in_callerid",
    isPstn: false,
    requiredField: "call_initiator",
    requiredMessage: "Call Initiator is required.",
    dialogPrefix: "FXS_IP_CALL_IN_CALLER_ID",
  },
  {
    prefix: "IPCallInCalleeID",
    hook: "useIPCallInCalleeIDPage",
    component: "IPCallInCalleeID",
    file: "FxsIPCallInCalleeID.jsx",
    constants: "FxsIPCallInCalleeIDConstants",
    constPrefix: "IP_CALL_IN_CALLEEID",
    manipulationType: "ip_in_calleeid",
    isPstn: false,
    requiredField: "call_initiator",
    requiredMessage: "Call Initiator is required.",
    dialogPrefix: "FXS_IP_CALL_IN_CALLEE_ID",
  },
  {
    prefix: "PSTNCallInCallerID",
    hook: "usePSTNCallInCallerIDPage",
    component: "PSTNCallInCallerID",
    file: "FxsPSTNCallInCallerID.jsx",
    constants: "FxsPSTNCallInCallerIDConstants",
    constPrefix: "PSTN_CALL_IN_CALLERID",
    manipulationType: "pstn_in_callerid",
    isPstn: true,
    requiredField: "call_initiator",
    requiredMessage: "Source Port Group is required.",
    dialogPrefix: "FXS_PSTN_CALL_IN_CALLER_ID",
    localStorageKey: "pstnCallInCallerIdRules",
  },
  {
    prefix: "PSTNCallInCalleeID",
    hook: "usePSTNCallInCalleeIDPage",
    component: "PSTNCallInCalleeID",
    file: "FxsPSTNCallInCalleeID.jsx",
    constants: "FxsPSTNCallInCalleeIDConstants",
    constPrefix: "PSTN_CALL_IN_CALLEEID",
    manipulationType: "pstn_in_calleeid",
    isPstn: true,
    requiredField: "call_initiator",
    requiredMessage: "Source Port Group is required.",
    dialogPrefix: "FXS_PSTN_CALL_IN_CALLEE_ID",
    localStorageKey: "pstnCallInCalleeIdRules",
  },
];

function write(relPath, content) {
  const full = path.join(NUM_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", relPath);
}

for (const p of PAGES) {
  const camel = p.prefix.charAt(0).toLowerCase() + p.prefix.slice(1);

  write(
    `utils/${p.prefix}Validators.js`,
    `export const validate${p.prefix}Form = (formData) => {
  if (!formData.${p.requiredField}) {
    return "${p.requiredMessage}";
  }
  if (!formData.callerid_prefix) {
    return "CallerID Prefix is required.";
  }
  if (!formData.calleeid_prefix) {
    return "CalleeID Prefix is required.";
  }
  return null;
};
`,
  );

  write(
    `utils/${p.prefix}Transformers.js`,
    `import { ${p.constPrefix}_INITIAL_FORM } from "../../../../constants/${p.constants}";

export const normalize${p.prefix}FormDigits = (formData) => ({
  ...formData,
  stripped_digits_from_left:
    formData.stripped_digits_from_left === "" ||
    formData.stripped_digits_from_left == null
      ? "0"
      : String(formData.stripped_digits_from_left),
  stripped_digits_from_right:
    formData.stripped_digits_from_right === "" ||
    formData.stripped_digits_from_right == null
      ? "0"
      : String(formData.stripped_digits_from_right),
  reserved_digits_from_right:
    formData.reserved_digits_from_right === "" ||
    formData.reserved_digits_from_right == null
      ? "0"
      : String(formData.reserved_digits_from_right),
});

export const ${p.prefix}FormFromRow = (item) =>
  normalize${p.prefix}FormDigits({ ...item });

export const build${p.prefix}UpdatePayload = (normalized, editId) => ({
  id: editId,
  call_initiator: normalized.call_initiator,
  callerid_prefix: normalized.callerid_prefix,
  calleeid_prefix: normalized.calleeid_prefix,
  with_original_calleeid: normalized.with_original_calleeid || "No",
  stripped_digits_from_left: normalized.stripped_digits_from_left,
  stripped_digits_from_right: normalized.stripped_digits_from_right,
  reserved_digits_from_right: normalized.reserved_digits_from_right,
  prefix_to_add: normalized.prefix_to_add,
  suffix_to_add: normalized.suffix_to_add,
  description: normalized.description,
});

export const render${p.prefix}CellValue = (col, item${p.isPstn ? ", pcmTrunkGroups, getPcmGroupIdLabel" : ""}) => {
${p.isPstn ? `  if (col.key === "call_initiator") {
    return \`PCM Trunk Group [\${getPcmGroupIdLabel(item[col.key])}]\`;
  }` : ""}
  if (
    item[col.key] !== undefined &&
    item[col.key] !== null &&
    item[col.key] !== ""
  ) {
    return String(item[col.key]);
  }
  return "--";
};
${p.isPstn ? `
export const get${p.prefix}PcmGroupIdLabel = (groupId, pcmTrunkGroups) => {
  const group = pcmTrunkGroups.find(
    (g) => String(g.group_id || g.id || g) === String(groupId),
  );
  const gid = group ? (group.group_id ?? group.id ?? groupId) : groupId;
  return String(gid);
};

export const get${p.prefix}UpdatedFields = (fields, pcmTrunkGroups) =>
  fields.map((field) => {
    if (field.name === "call_initiator") {
      return {
        ...field,
        options: pcmTrunkGroups.map((group) => ({
          value: String(group.group_id ?? group.id ?? group),
          label: \`PCM Trunk Group [\${String(group.group_id ?? group.id ?? group)}]\`,
        })),
      };
    }
    return field;
  });

export const buildDefault${p.prefix}Form = (initialForm, pcmTrunkGroups) => {
  const defaultForm = { ...initialForm };
  if (pcmTrunkGroups.length > 0) {
    const firstGroupId =
      pcmTrunkGroups[0].group_id ||
      pcmTrunkGroups[0].id ||
      pcmTrunkGroups[0];
    defaultForm.call_initiator = String(firstGroupId);
  }
  return defaultForm;
};
` : ""}
`,
  );

  const pstnHookExtra = p.isPstn
    ? `
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);

  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setPcmTrunkGroups(pcmGroups);

        if (pcmGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            pcmGroups[0].group_id || pcmGroups[0].id || pcmGroups[0];
          setFormData((prev) => ({
            ...prev,
            call_initiator: String(firstGroupId),
          }));
        }
      } else {
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to load PCM trunk groups");
      }
      setPcmTrunkGroups([]);
    }
  };

  const getPcmGroupIdLabel = (groupId) =>
    get${p.prefix}PcmGroupIdLabel(groupId, pcmTrunkGroups);

  const getUpdatedFields = () =>
    get${p.prefix}UpdatedFields(${p.constPrefix}_FIELDS, pcmTrunkGroups);
`
    : `
  const getUpdatedFields = () => ${p.constPrefix}_FIELDS;
`;

  const pstnOpenModalElse = p.isPstn
    ? `const defaultForm = buildDefault${p.prefix}Form(
        { ...${p.constPrefix}_INITIAL_FORM },
        pcmTrunkGroups,
      );
      setFormData(defaultForm);`
    : `setFormData({ ...${p.constPrefix}_INITIAL_FORM });`;

  const pstnImports = p.isPstn
    ? `  buildDefault${p.prefix}Form,
  get${p.prefix}PcmGroupIdLabel,
  get${p.prefix}UpdatedFields,`
    : "";

  const pstnTransformerImports = p.isPstn
    ? `,
  buildDefault${p.prefix}Form,
  get${p.prefix}PcmGroupIdLabel,
  get${p.prefix}UpdatedFields`
    : "";

  write(
    `hooks/${p.hook}.js`,
    `import { useEffect, useRef, useState } from "react";
import {
  ${p.constPrefix}_FIELDS,
  ${p.constPrefix}_INITIAL_FORM,
} from "../../../../constants/${p.constants}";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,${p.isPstn ? "\n  listPstnGroups," : ""}
} from "../../../../api/apiService";
import {
  ${p.prefix}FormFromRow,
  build${p.prefix}UpdatePayload,
  normalize${p.prefix}FormDigits,${pstnTransformerImports}
} from "../utils/${p.prefix}Transformers";
import { validate${p.prefix}Form } from "../utils/${p.prefix}Validators";

const ${p.prefix.toUpperCase()}_ITEMS_PER_PAGE = 20;

export function ${p.hook}() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(${p.constPrefix}_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = ${p.prefix.toUpperCase()}_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const tableScrollRef = useRef(null);
${pstnHookExtra}
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listNumberManipulations("${p.manipulationType}");
      if (response.response && response.message) {
        setRules(response.message);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching number manipulations:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        alert(
          "Server error. The number manipulations endpoint may have issues.",
        );
      } else {
        alert(error.message || "Failed to load number manipulations");
      }
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(${p.prefix}FormFromRow(item));
      setEditIndex(item.id);
    } else {
      ${pstnOpenModalElse}
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    const validationError = validate${p.prefix}Form(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const normalized = normalize${p.prefix}FormDigits(formData);

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        response = await updateNumberManipulation(
          build${p.prefix}UpdatePayload(normalized, editIndex),
          "${p.manipulationType}",
        );
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch {
            setRules((prev) =>
              prev.map((rule) =>
                rule.id === editIndex ? { ...rule, ...normalized } : rule,
              ),
            );
          }
        } else {
          alert("Failed to update number manipulation");
        }
      } else {
        response = await createNumberManipulation(
          normalized,
          "${p.manipulationType}",
        );
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch {
            const newItem = {
              ...normalized,
              id: Date.now(),
              manipulation_type: "${p.manipulationType}",
            };
            setRules((prev) => [...prev, newItem]);
          }
        } else {
          alert("Failed to create number manipulation");
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving number manipulation:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to save number manipulation");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert("Please select items to delete");
      return;
    }
    const confirmed = window.confirm(
      \`Are you sure you want to delete \${selected.length} selected item(s)?\`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(\`\${successCount} item(s) deleted successfully\`);
        try {
          await fetchNumberManipulations();
        } catch {
          const selectedItems = selected.map((idx) => rules[idx]);
          const selectedIds = selectedItems.map((item) => item.id);
          setRules((prev) =>
            prev.filter((item) => !selectedIds.includes(item.id)),
          );
        }
        setSelected([]);
      }

      if (failCount > 0) {
        alert(\`Failed to delete \${failCount} item(s)\`);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to delete selected items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert("No data to clear");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete ALL number manipulations? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(\`All \${successCount} item(s) deleted successfully\`);
        try {
          await fetchNumberManipulations();
        } catch {
          setRules([]);
        }
        setSelected([]);
        setPage(1);
      }

      if (failCount > 0) {
        alert(\`Failed to delete \${failCount} item(s)\`);
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to clear all items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleTableScroll = (e) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    fetchNumberManipulations();${p.isPstn ? "\n    fetchPcmTrunkGroups();" : ""}
  }, []);

  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    toast,
    setToast,
    tableScrollRef,
    itemsPerPage,
    totalPages,
    pagedRules,${p.isPstn ? "\n    pcmTrunkGroups,\n    getPcmGroupIdLabel," : ""}
    getUpdatedFields,
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
    handleTableScroll,
    handleRefresh,
  };
}
`,
  );
}

console.log("Done generating hooks/utils for Num Manipulate pages");
