export {
  PcmSharedTH as PcmReceptionTimeoutTH,
  PcmSharedFieldLabel as PcmReceptionTimeoutFieldLabel,
  pcmSharedFormPanelStyle as pcmReceptionTimeoutFormPanelStyle,
  pcmSharedInputStyle as pcmReceptionTimeoutInputStyle,
  pcmSharedInputInteraction as pcmReceptionTimeoutInputInteraction,
  pcmSharedAddNewModalFooterStyle as pcmReceptionTimeoutAddNewModalFooterStyle,
  pcmSharedAddNewModalFooterBtnStyle as pcmReceptionTimeoutAddNewModalFooterBtnStyle,
  pcmSharedAddNewModalFooterCancelBtnStyle as pcmReceptionTimeoutAddNewModalFooterCancelBtnStyle,
  pcmSharedTdStyle as pcmReceptionTimeoutTdStyle,
  pcmSharedC as pcmReceptionTimeoutC,
  pcmSharedCardStyle as pcmReceptionTimeoutCardStyle,
  pcmSharedToolbarStyle as pcmReceptionTimeoutToolbarStyle,
  PCM_SHARED_COMPACT_MQ as PCM_RECEPTION_TIMEOUT_COMPACT_MQ,
  createPcmSharedDialogConfig,
  createPcmSharedBreadcrumb,
} from "./PcmSharedFormFields";

import {
  createPcmSharedBreadcrumb as createBreadcrumb,
  createPcmSharedDialogConfig,
} from "./PcmSharedFormFields";
import {
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_ROOT,
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION,
  PCM_RECEPTION_TIMEOUT_PAGE_TITLE,
} from "../../../../constants/PcmReceptionTimeoutConstants";

export const PcmReceptionTimeoutBreadcrumb = createBreadcrumb(
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_ROOT,
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION,
  PCM_RECEPTION_TIMEOUT_PAGE_TITLE,
);

export const pcmReceptionTimeoutDialogConfig =
  createPcmSharedDialogConfig(500);
