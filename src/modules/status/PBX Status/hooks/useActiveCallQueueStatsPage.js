import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCallQueueAgentStats, fetchCallQueueQueueStats } from "../../../../api/apiService";
import { ACTIVE_CALL_QUEUE_POLL_INTERVAL_MS, ACTIVE_CALL_QUEUE_TAB_VALUES } from "../../../../constants/ActiveCallQueueConstants";
import { filterActiveCallQueueAgents } from "../utils/ActiveCallQueueTransformers";

export const useActiveCallQueueStatsPage = (initialQueue) => {
  const [activeTab, setActiveTab] = useState(ACTIVE_CALL_QUEUE_TAB_VALUES.agent);
  const [agentSearch, setAgentSearch] = useState("");
  const [agentData, setAgentData] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  const selectedQueue = initialQueue || "";

  const loadAgentStats = useCallback(async () => {
    if (!selectedQueue) return;
    try {
      const data = await fetchCallQueueAgentStats(selectedQueue);
      setAgentData(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      /* silently keep last data */
    }
  }, [selectedQueue]);

  const loadQueueStats = useCallback(async () => {
    if (!selectedQueue) return;
    try {
      const data = await fetchCallQueueQueueStats(selectedQueue);
      setQueueData(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      /* silently keep last data */
    }
  }, [selectedQueue]);

  // Initial load
  useEffect(() => {
    if (!selectedQueue) return;
    const load = async () => {
      setLoadingAgent(true);
      setLoadingQueue(true);
      try {
        const d = await fetchCallQueueAgentStats(selectedQueue);
        setAgentData(Array.isArray(d) ? d : []);
      } catch {
        /**/
      } finally {
        setLoadingAgent(false);
      }
      try {
        const d = await fetchCallQueueQueueStats(selectedQueue);
        setQueueData(Array.isArray(d) ? d : []);
      } catch {
        /**/
      } finally {
        setLoadingQueue(false);
      }
      setLastUpdated(new Date());
    };
    load();
  }, [selectedQueue]);

  // Poll on active tab
  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.agent) {
      pollRef.current = setInterval(loadAgentStats, ACTIVE_CALL_QUEUE_POLL_INTERVAL_MS);
    } else {
      pollRef.current = setInterval(loadQueueStats, ACTIVE_CALL_QUEUE_POLL_INTERVAL_MS);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, loadAgentStats, loadQueueStats]);

  // Reset search on tab change
  useEffect(() => {
    setAgentSearch("");
  }, [activeTab]);

  const filteredAgents = filterActiveCallQueueAgents(agentData, agentSearch);
  return { activeTab, setActiveTab, agentSearch, setAgentSearch, agentData, setAgentData, queueData, setQueueData, loadingAgent, loadingQueue, lastUpdated, filteredAgents };
};
