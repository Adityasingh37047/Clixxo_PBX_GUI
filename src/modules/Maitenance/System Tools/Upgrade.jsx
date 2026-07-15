import React from "react";
import { useUpgradePage } from "./hooks/useUpgradePage";
import { UpgradePageView } from "./components/UpgradeFormFields";

const Upgrade = () => {
  const vm = useUpgradePage();
  return <UpgradePageView {...vm} />;
};

export default Upgrade;
