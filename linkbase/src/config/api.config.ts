import { getApiBaseUrl } from "../../../common/api.config";

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl("linkbase", __DEV__),
  TIMEOUT: 10000,
};
