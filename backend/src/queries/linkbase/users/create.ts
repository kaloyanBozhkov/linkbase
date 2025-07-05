import { z } from "zod";
import { prisma } from "../../../helpers/prisma";

// Validation schema for creating a user
export const createUserSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  email: z.string().email().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Creates a new user record in the database.
 *
 * @param data - The user data to be validated and created
 * @returns Promise<User> - The created user object
 * @throws {ZodError} - If validation fails
 * @throws {Error} - If database operation fails
 */
export const createUserQuery = async (data: unknown) => {
  const validatedData = createUserSchema.parse(data);
  const { uuid, email } = validatedData;

  return await prisma.user.create({
    data: {
      uuid,
      email,
    },
  });
};
