import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import {
  createConnectionQuery,
  getAllConnectionsQuery,
  getConnectionByIdQuery,
  updateConnectionQuery,
  deleteConnectionQuery,
  searchConnectionsQuery,
} from "@/queries/linkbase/connections";
import { createUserQuery, getUserByUuidQuery } from "@/queries/linkbase/users";
import { SocialMediaType } from "@linkbase/prisma";
import { infiniteResponse } from "@/helpers/infiniteResponse";

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

const connectionIdSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

const userUuidSchema = z.object({
  uuid: z.string().min(1, "User UUID is required"),
});

const PAGE_SIZE = 20;

export const linkbaseRouter = createTRPCRouter({
  connections: createTRPCRouter({
    getAll: protectedProcedure
      .input(z.object({ cursor: z.number().default(0) }))
      .query(async ({ ctx: { userId }, input: { cursor } }) => {
        const connections = await getAllConnectionsQuery({
          cursor,
          userId,
          pageSize: PAGE_SIZE,
        });

        return infiniteResponse(connections, cursor, PAGE_SIZE);
      }),
    getById: protectedProcedure
      .input(connectionIdSchema)
      .query(({ ctx: { userId }, input: { id } }) => {
        return getConnectionByIdQuery({ id, userId });
      }),
    create: protectedProcedure
      .input(connectionCreateSchema)
      .mutation(({ ctx: { userId }, input }) => {
        return createConnectionQuery({
          ...input,
          userId,
        });
      }),
    update: protectedProcedure
      .input(connectionIdSchema.extend(connectionUpdateSchema.shape))
      .mutation(({ ctx: { userId }, input: { id, ...updateData } }) => {
        return updateConnectionQuery(id, {
          ...updateData,
          userId,
        });
      }),
    delete: protectedProcedure
      .input(connectionIdSchema)
      .mutation(async ({ ctx: { userId }, input: { id } }) => {
        await deleteConnectionQuery({ id, userId });
        return { success: true };
      }),
    search: protectedProcedure
      .input(
        z.object({
          query: z.string(),
          cursor: z.number().default(0),
        })
      )
      .query(async ({ ctx: { userId }, input: { query, cursor } }) => {
        if (!query.trim()) {
          return infiniteResponse([], cursor, PAGE_SIZE);
        }

        const connections = await searchConnectionsQuery({
          query,
          cursor,
          userId,
          pageSize: PAGE_SIZE,
        });

        return infiniteResponse(connections, cursor, PAGE_SIZE);
      }),
  }),
  users: createTRPCRouter({
    getByUuid: protectedProcedure
      .input(userUuidSchema)
      .query(({ input: { uuid } }) => getUserByUuidQuery(uuid)),
    create: publicProcedure.mutation(async () => {
      return createUserQuery();
    }),
  }),
});
