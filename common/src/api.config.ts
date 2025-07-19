const DEV_HOST_IP = "192.168.1.14"; // This will be auto-detected & replaced

export const getApiBaseUrl = (__DEV__: boolean) => {
  if (__DEV__) {
    // In development, use the detected IP for physical devices and simulators
    return `http://${DEV_HOST_IP}:3000/api`;
  } else {
    // In production, you'd use your actual production API URL
    return `https://linkbase-kappa.vercel.app/api`;
  }
};
