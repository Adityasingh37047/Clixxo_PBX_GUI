import { useEffect, useRef, useState } from "react";
import { fetchHostsFile, updateHostsFile } from "../../../../api/apiService";
import {
  CONFIG_FILE_CONTENT_MAP,
  CONFIG_FILE_MESSAGES,
  CONFIG_FILE_MESSAGE_DEFAULT,
  CONFIG_FILE_MESSAGE_TIMEOUT_MS,
  CONFIG_FILE_NETWORK_ERROR,
  CONFIG_FILE_HOSTS_VALUE,
} from "../../../../constants/ConfigFileConstants";
import {
  getConfigFileDefaultContent,
  getConfigFileDefaultSelection,
  getMappedConfigContent,
} from "../utils/ConfigFileTransformers";
import { isConfigHostsFile } from "../utils/ConfigFileValidators";

export function useConfigFilePage() {
  const [selectedFile, setSelectedFile] = useState(getConfigFileDefaultSelection);
  const [content, setContent] = useState(getConfigFileDefaultContent);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState({ fetch: false, save: false });
  const [message, setMessage] = useState(CONFIG_FILE_MESSAGE_DEFAULT);
  const textareaRef = useRef(null);
  const hasInitialLoadRef = useRef(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(
      () => setMessage(CONFIG_FILE_MESSAGE_DEFAULT),
      CONFIG_FILE_MESSAGE_TIMEOUT_MS,
    );
  };

  const loadHostsFile = async () => {
    if (loading.fetch) return;

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchHostsFile();
      if (response.response && response.responseData) {
        setContent(response.responseData);
        showMessage("success", CONFIG_FILE_MESSAGES.LOAD_SUCCESS);
      } else {
        showMessage("error", CONFIG_FILE_MESSAGES.LOAD_FAILED);
      }
    } catch (error) {
      if (error.message === CONFIG_FILE_NETWORK_ERROR) {
        showMessage("error", CONFIG_FILE_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || CONFIG_FILE_MESSAGES.LOAD_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const saveHostsFile = async () => {
    if (loading.save) return;

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response = await updateHostsFile(content);
      if (response.message) {
        showMessage(
          "success",
          response.message || CONFIG_FILE_MESSAGES.SAVE_SUCCESS,
        );
        setIsEditing(true);
      } else {
        showMessage("error", CONFIG_FILE_MESSAGES.SAVE_FAILED);
      }
    } catch (error) {
      if (error.message === CONFIG_FILE_NETWORK_ERROR) {
        showMessage("error", CONFIG_FILE_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || CONFIG_FILE_MESSAGES.SAVE_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  useEffect(() => {
    if (selectedFile === CONFIG_FILE_HOSTS_VALUE && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHostsFile();
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const value = e.target.value;
    setSelectedFile(value);

    if (isConfigHostsFile(value)) {
      loadHostsFile();
    } else {
      setContent(getMappedConfigContent(value));
    }
    setIsEditing(true);
  };

  const handleTextareaClick = () => {
    if (!isEditing && !loading.fetch) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (isConfigHostsFile(selectedFile)) {
      saveHostsFile();
    } else {
      setIsEditing(true);
    }
  };

  const handleReset = () => {
    if (isConfigHostsFile(selectedFile)) {
      loadHostsFile();
    } else {
      setContent(CONFIG_FILE_CONTENT_MAP[selectedFile] || "");
    }
  };

  return {
    selectedFile,
    content,
    setContent,
    isEditing,
    loading,
    message,
    setMessage,
    textareaRef,
    handleFileChange,
    handleTextareaClick,
    handleSave,
    handleReset,
  };
}
