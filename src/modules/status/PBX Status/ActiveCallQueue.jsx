import React from "react";
import { useActiveCallQueuePage } from "./hooks/useActiveCallQueuePage";
import {
  CallQueueStatistics,
  ActiveCallQueuePageContent,
} from "./components/ActiveCallQueueFormFields";

const ActiveCallQueue = () => {
  const page = useActiveCallQueuePage();
  if (page.showStats) {
    const qNum = page.selectedQueue
      ? (page.selectedQueue.queue_number ?? page.selectedQueue.number ?? "")
      : "";
    return (
      <CallQueueStatistics
        onBack={() => page.setShowStats(false)}
        initialQueue={qNum}
      />
    );
  }
  return (
    <ActiveCallQueuePageContent
      {...page}
      onShowStats={() => page.setShowStats(true)}
    />
  );
};

export default ActiveCallQueue;
