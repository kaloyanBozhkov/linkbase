import axios from "axios";
import { Connection, CreateConnectionInput } from "../hooks/useConnectionStore";
import { API_CONFIG } from "../config/api.config";

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === "NETWORK_ERROR" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Unable to connect to server. Please check your connection."
      );
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
);

export const connectionApi = {
  async getAll(): Promise<Connection[]> {
    const response = await api.get("/connections");
    return response.data.data;
  },

  async getById(id: string): Promise<Connection> {
    const response = await api.get(`/connections/${id}`);
    return response.data.data;
  },

  async create(data: CreateConnectionInput): Promise<Connection> {
    const response = await api.post("/connections", data);
    return response.data.data;
  },

  async update(
    id: string,
    data: Partial<CreateConnectionInput>
  ): Promise<Connection> {
    const response = await api.put(`/connections/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/connections/${id}`);
  },

  async search(query: string): Promise<Connection[]> {
    const response = await api.get(
      `/connections/search?query=${encodeURIComponent(query)}`
    );
    return response.data.data;
  },
};
