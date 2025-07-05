import { z } from "zod";
import { SocialMediaType } from "@prisma/client";
import { prisma, generateSocialMediaUrl } from "../../../helpers/prisma";

// Zod schema for social media entries
export const socialMediaSchema = z.object({
  type: z.nativeEnum(SocialMediaType),
  handle: z.string().min(1, "Handle is required"),
});

// Zod schema for creating connections
export const createConnectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  metAt: z
    .string()
    .min(1, "Meeting place is required")
    .max(200, "Meeting place must be less than 200 characters"),
  facts: z.array(z.string()).optional().default([]),
  socialMedias: z.array(socialMediaSchema).optional().default([]),
  userId: z.string().min(1, "User ID is required"),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;

/**
 * Creates a new connection record in the database.
 *
 * @param data - The connection data to be validated and created
 * @returns Promise<Connection> - The created connection object
 * @throws {ZodError} - If validation fails
 * @throws {Error} - If database operation fails
 */
export const createConnectionQuery = async (data: unknown) => {
  const validatedData = createConnectionSchema.parse(data);
  const { name, metAt, facts, socialMedias = [], userId } = validatedData;

  return await prisma.connection.create({
    data: {
      name,
      metAt,
      facts,
      userId: userId || "default-user", // Provide default user ID until migration
      socialMedias: {
        create: socialMedias.map((sm) => ({
          type: sm.type,
          handle: sm.handle,
          url: generateSocialMediaUrl(sm.type, sm.handle),
        })),
      },
    },
    include: {
      socialMedias: true,
    },
  });
};
