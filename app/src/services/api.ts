import axios from "axios";
import {
  Connection,
  CreateConnectionInput,
  User,
} from "../hooks/useConnectionStore";
import { API_CONFIG } from "../config/api.config";
import { useSessionUserStore } from "@/hooks/useGetSessionUser";

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const { userId } = useSessionUserStore.getState();
    if (userId) {
      config.headers["x-user-id"] = userId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    const response = await api.get<{ data: Connection[] }>("/connections");
    return response.data.data;
  },

  async getById(id: string): Promise<Connection> {
    const response = await api.get<{ data: Connection }>(`/connections/${id}`);
    return response.data.data;
  },

  async create(data: CreateConnectionInput): Promise<Connection> {
    const response = await api.post<{ data: Connection }>("/connections", data);
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

export const userApi = {
  async getUser() {
    const response = await api.get<{ data: User }>("/users");
    return response.data.data;
  },

  async getUserByUuid(uuid: string) {
    const response = await api.get<{ data: User }>(`/users/${uuid}`);
    return response.data.data;
  },

  async createUser(): Promise<User["id"]> {
    const existingUserId = await useSessionUserStore
      .getState()
      .getStoredUserId();
    if (existingUserId) return existingUserId;

    const response = await api.post<{ data: User }>("/users");
    await useSessionUserStore.getState().saveUserId(response.data.data.id);
    return response.data.data.id;
  },
};
