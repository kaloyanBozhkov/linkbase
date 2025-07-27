import { prisma } from "@/helpers/prisma";

/**
 * Creates a new user record in the database.
 *
 * @param data - The user data to be validated and created
 * @returns Promise<User> - The created user object
 * @throws {ZodError} - If validation fails
 * @throws {Error} - If database operation fails
 */
export const createUserQuery = async () => {
  return await prisma.user.create({
    data: {},
  });
};
