import React from "react";
import { useLicencePage } from "./hooks/useLicencePage";
import { LicencePageView } from "./components/LicenceFormFields";

const Licence = () => {
  const vm = useLicencePage();
  return <LicencePageView {...vm} />;
};

export default Licence;
