import React from "react";
import {
  ExtensionBreadcrumb as NumManipulateBreadcrumb,
  extensionPageWrapStyle as numManipulatePageWrapStyle,
  extensionPageInnerStyle as numManipulatePageInnerStyle,
  extensionCardStyle as numManipulateCardStyle,
} from "../../../components/common";

const NumManipulatePage = () => {
  return (
    <div style={numManipulatePageWrapStyle}>
      <div style={numManipulatePageInnerStyle}>
        <NumManipulateBreadcrumb
          root="FXS"
          section="Num Manipulate"
          current="Num Manipulate"
        />
        <div style={numManipulateCardStyle}>NumManipulatePage</div>
      </div>
    </div>
  );
};

export default NumManipulatePage;
