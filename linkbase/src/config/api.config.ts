import { getApiBaseUrl } from "@linkbase/shared/src/api.config";

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(__DEV__),
  TIMEOUT: 10000,
};
