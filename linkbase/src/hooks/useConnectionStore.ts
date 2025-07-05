import { create } from "zustand";
import { connectionApi } from "../services/api";

export enum SocialMediaType {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  TIKTOK = "TIKTOK",
  LINKEDIN = "LINKEDIN",
  YOUTUBE = "YOUTUBE",
  SNAPCHAT = "SNAPCHAT",
  PINTEREST = "PINTEREST",
  REDDIT = "REDDIT",
  TWITCH = "TWITCH",
  GITHUB = "GITHUB",
  BEHANCE = "BEHANCE",
  DRIBBBLE = "DRIBBBLE",
  MEDIUM = "MEDIUM",
  SUBSTACK = "SUBSTACK",
  SPOTIFY = "SPOTIFY",
  SOUNDCLOUD = "SOUNDCLOUD",
  BANDCAMP = "BANDCAMP",
  THREADS = "THREADS",
  MASTODON = "MASTODON",
  BLUESKY = "BLUESKY",
  TUMBLR = "TUMBLR",
  FLICKR = "FLICKR",
  VIMEO = "VIMEO",
}

export const socialMediaDisplayNames: Record<SocialMediaType, string> = {
  [SocialMediaType.EMAIL]: "Email",
  [SocialMediaType.PHONE]: "Phone",
  [SocialMediaType.INSTAGRAM]: "Instagram",
  [SocialMediaType.FACEBOOK]: "Facebook",
  [SocialMediaType.TWITTER]: "Twitter/X",
  [SocialMediaType.TIKTOK]: "TikTok",
  [SocialMediaType.LINKEDIN]: "LinkedIn",
  [SocialMediaType.YOUTUBE]: "YouTube",
  [SocialMediaType.SNAPCHAT]: "Snapchat",
  [SocialMediaType.PINTEREST]: "Pinterest",
  [SocialMediaType.REDDIT]: "Reddit",
  [SocialMediaType.TWITCH]: "Twitch",
  [SocialMediaType.GITHUB]: "GitHub",
  [SocialMediaType.BEHANCE]: "Behance",
  [SocialMediaType.DRIBBBLE]: "Dribbble",
  [SocialMediaType.MEDIUM]: "Medium",
  [SocialMediaType.SUBSTACK]: "Substack",
  [SocialMediaType.SPOTIFY]: "Spotify",
  [SocialMediaType.SOUNDCLOUD]: "SoundCloud",
  [SocialMediaType.BANDCAMP]: "Bandcamp",
  [SocialMediaType.THREADS]: "Threads",
  [SocialMediaType.MASTODON]: "Mastodon",
  [SocialMediaType.BLUESKY]: "Bluesky",
  [SocialMediaType.TUMBLR]: "Tumblr",
  [SocialMediaType.FLICKR]: "Flickr",
  [SocialMediaType.VIMEO]: "Vimeo",
};

export interface SocialMedia {
  id?: string;
  type: SocialMediaType;
  handle: string;
  url?: string;
}

export interface Connection {
  id: string;
  name: string;
  metAt: string;
  metWhen: string;
  facts: string[];
  socialMedias: SocialMedia[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateConnectionInput {
  name: string;
  metAt: string;
  facts: string[];
  socialMedias?: SocialMedia[];
  userId: string;
}

interface ConnectionStore {
  connections: Connection[];
  loading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchConnections: () => Promise<void>;
  createConnection: (data: CreateConnectionInput) => Promise<void>;
  updateConnection: (
    id: string,
    data: Partial<CreateConnectionInput>
  ) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export type User = {
  id: string;
  uuid: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  connections?: Connection[];
};

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  loading: false,
  error: null,
  searchQuery: "",

  fetchConnections: async () => {
    try {
      set({ loading: true, error: null });
      const connections = await connectionApi.getAll();
      set({ connections, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch connections",
        loading: false,
      });
    }
  },

  createConnection: async (data: CreateConnectionInput) => {
    try {
      set({ loading: true, error: null });
      const newConnection = await connectionApi.create(data);
      set((state) => ({
        connections: [newConnection, ...state.connections],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to create connection",
        loading: false,
      });
      throw error;
    }
  },

  updateConnection: async (
    id: string,
    data: Partial<CreateConnectionInput>
  ) => {
    try {
      set({ loading: true, error: null });
      const updatedConnection = await connectionApi.update(id, data);
      set((state) => ({
        connections: state.connections.map((conn) =>
          conn.id === id ? updatedConnection : conn
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update connection",
        loading: false,
      });
      throw error;
    }
  },

  deleteConnection: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await connectionApi.delete(id);
      set((state) => ({
        connections: state.connections.filter((conn) => conn.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete connection",
        loading: false,
      });
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (query.trim()) {
      connectionApi
        .search(query)
        .then((connections) => set({ connections }))
        .catch((error) => set({ error: error.message || "Search failed" }));
    } else {
      get().fetchConnections();
    }
  },

  clearError: () => set({ error: null }),
}));
