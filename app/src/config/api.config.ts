// This will be dynamically updated by our build script
const DEV_HOST_IP = "192.168.1.40"; // This will be auto-detected

const getApiBaseUrl = () => {
  if (__DEV__) {
    // In development, use the detected IP for physical devices and simulators
    return `http://${DEV_HOST_IP}:3000/api`;
  } else {
    // In production, you'd use your actual production API URL
    return "https://linkbase-kappa.vercel.app/api";
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  DEV_HOST_IP,
};
