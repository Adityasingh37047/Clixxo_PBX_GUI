export const getSystemInfoLoadErrorMessage = (error) => {
  let errorMessage = "Failed to load system information. Please try again.";

  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    errorMessage =
      "Request timeout. Please check your connection and try again.";
  } else if (error.response?.status === 404) {
    errorMessage =
      "System information not found. Please contact administrator.";
  } else if (error.response?.status >= 500) {
    errorMessage =
      "Server error. Please try again later or contact support.";
  } else if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    errorMessage =
      "Network connection failed. Please check your internet connection.";
  } else if (error.message?.includes("timeout of 10000ms exceeded")) {
    errorMessage =
      "Request timeout. The server is taking too long to respond. Please try again.";
  }

  return errorMessage;
};
