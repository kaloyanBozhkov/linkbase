import { z } from "zod";
import { SocialMediaType } from "@common/types";
import { prisma, generateSocialMediaUrl } from "../../../helpers/prisma";

// Zod schema for social media entries
export const socialMediaSchema = z.object({
  type: z.nativeEnum(SocialMediaType),
  handle: z.string().min(1, "Handle is required"),
});

// Zod schema for updating connections
export const updateConnectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  metAt: z
    .string()
    .min(1, "Meeting place is required")
    .max(200, "Meeting place must be less than 200 characters")
    .optional(),
  facts: z.array(z.string()).optional(),
  socialMedias: z.array(socialMediaSchema).optional(),
  userId: z.string().min(1, "User ID is required"),
});

export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;

/**
 * Updates an existing connection record in the database.
 *
 * @param id - The connection ID to update
 * @param data - The update data to be validated and applied
 * @returns Promise<Connection> - The updated connection object
 * @throws {ZodError} - If validation fails
 * @throws {Error} - If database operation fails (including P2025 for not found)
 */
export const updateConnectionQuery = async (
  id: string,
  data: Partial<UpdateConnectionInput>
) => {
  const validatedData = updateConnectionSchema.parse(data);
  const { socialMedias, userId, ...connectionData } = validatedData;

  return await prisma.connection.update({
    where: {
      id,
    },
    data: {
      ...connectionData,
      socialMedias: socialMedias
        ? {
            deleteMany: {},
            create: socialMedias.map((sm) => ({
              type: sm.type,
              handle: sm.handle,
              url: generateSocialMediaUrl(sm.type, sm.handle),
            })),
          }
        : undefined,
    },
    include: {
      socialMedias: true,
    },
  });
};
