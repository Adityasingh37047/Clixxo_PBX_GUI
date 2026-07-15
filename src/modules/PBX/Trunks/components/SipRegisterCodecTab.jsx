import React from "react";
import { SIP_REGISTER_CODEC_OPTIONS } from "../../../../constants/SipRegisterConstants";
import { ExtensionCodecDualList as SipRegisterCodecDualList } from "../../../../components/common";
import { TrunkModalSectionHeading } from "./SipRegisterFormFields";

function SipRegisterCodecTab({
  selectedCodecList,
  updateCodecList,
  getCodecLabel,
  validationErrors,
}) {
  return (
  <div className="p-3 sm:p-5">
    <TrunkModalSectionHeading title="CODEC Priority" isFirst />
    <SipRegisterCodecDualList
      allOptions={SIP_REGISTER_CODEC_OPTIONS}
      selected={selectedCodecList}
      onChange={updateCodecList}
      getLabel={getCodecLabel}
      style={{ maxWidth: 720, margin: "0 auto" }}
    />
    {validationErrors.allow_codecs && (
      <div className="text-red-500 text-xs mt-3 text-center">
        {validationErrors.allow_codecs}
      </div>
    )}
  </div>

  );
}

export default SipRegisterCodecTab;
