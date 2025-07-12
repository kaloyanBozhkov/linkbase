import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
import {
  createConnectionQuery,
  getAllConnectionsQuery,
  getConnectionByIdQuery,
  updateConnectionQuery,
  deleteConnectionQuery,
  searchConnectionsQuery,
} from "../../queries/linkbase/connections";
import {
  createUserQuery,
  getUserByUuidQuery,
} from "../../queries/linkbase/users";
import { SocialMediaType } from "@common/types";

// Input schemas
const connectionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  metAt: z.string().min(1, "Meeting place is required"),
  facts: z.array(z.string()).optional().default([]),
  socialMedias: z
    .array(
      z.object({
        type: z.nativeEnum(SocialMediaType),
        handle: z.string().min(1, "Handle is required"),
      })
    )
    .optional()
    .default([]),
});

const connectionUpdateSchema = connectionCreateSchema.partial();

const connectionSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

const connectionIdSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

const userUuidSchema = z.object({
  uuid: z.string().min(1, "User UUID is required"),
});

// Create the linkbase router
export const linkbaseRouter = createTRPCRouter({
  // Connection procedures
  connections: createTRPCRouter({
    // Get all connections
    getAll: protectedProcedure
      .input(paginationSchema)
      .query(async ({ ctx, input }) => {
        const { limit, offset } = input;
        const { userId } = ctx;

        const result = await getAllConnectionsQuery({
          limit,
          offset,
          userId,
        });

        return {
          connections: result.connections,
          pagination: result.pagination,
        };
      }),

    // Get connection by ID
    getById: protectedProcedure
      .input(connectionIdSchema)
      .query(async ({ ctx, input }) => {
        const { id } = input;
        const { userId } = ctx;

        const connection = await getConnectionByIdQuery({ id, userId });

        if (!connection) {
          throw new Error("Connection not found");
        }

        return connection;
      }),

    // Create connection
    create: protectedProcedure
      .input(connectionCreateSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const connection = await createConnectionQuery({
          ...input,
          userId,
        });

        return connection;
      }),

    // Update connection
    update: protectedProcedure
      .input(connectionIdSchema.extend(connectionUpdateSchema.shape))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;
        const { userId } = ctx;

        const connection = await updateConnectionQuery(id, {
          ...updateData,
          userId,
        });

        return connection;
      }),

    // Delete connection
    delete: protectedProcedure
      .input(connectionIdSchema)
      .mutation(async ({ ctx, input }) => {
        const { id } = input;
        const { userId } = ctx;

        await deleteConnectionQuery({ id, userId });

        return { success: true };
      }),

    // Search connections
    search: protectedProcedure
      .input(connectionSearchSchema)
      .query(async ({ ctx, input }) => {
        const { userId } = ctx;

        const connections = await searchConnectionsQuery({
          ...input,
          userId,
        });

        return {
          connections,
          query: input.query,
        };
      }),
  }),

  // User procedures
  users: createTRPCRouter({
    // Get user by UUID
    getByUuid: protectedProcedure
      .input(userUuidSchema)
      .query(async ({ input }) => {
        const { uuid } = input;

        const user = await getUserByUuidQuery(uuid);

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      }),

    // Create user
    create: publicProcedure.mutation(async () => {
      const userId = await createUserQuery({});

      return { userId };
    }),
  }),
});
