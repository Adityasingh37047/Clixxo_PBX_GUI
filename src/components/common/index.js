// Barrel for the shared PBX UI library. Import page-agnostic primitives from here.
export * from "./Button";
export * from "./Pill";
export * from "./MessageBanner";
export * from "./Pagination";
export * from "./ToolbarSearchBar";
export * from "./tableKit";
export * from "./modalKit";
export * from "./DualListBox";
export * from "./RecordingActionBtn";
export * from "./RecordingPlayerBar";
export * from "./filterFormKit";

// Generic aliases for reuse on non-Extensions pages.
export { ExtensionPagination as Pagination } from "./Pagination";
export { ExtensionToolbarSearchBar as ToolbarSearchBar } from "./ToolbarSearchBar";
export { ExtensionModalTabs as ModalTabs } from "./modalKit";
export { ExtensionBreadcrumb as Breadcrumb } from "./modalKit";
