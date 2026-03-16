import axios from "axios";

function getBaseURL() {
  const url = new URL(window.location.origin);
  const ip = url.hostname;
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  const isLocalhost =
    ip === "localhost" || ip === "127.0.0.1" || ip === "0.0.0.0";

  if (isLocalhost) {
  let testIp='192.168.0.93';
    // Local development → backend usually runs on 5000
    return `https://${testIp}:443/api`;
  } else {
    // Production → use whatever URL the site is running on
    console.log('Production → use whatever URL the site is running on', ip, port);
    return `${url.protocol}//${ip}:${port}/api`;
  }
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
