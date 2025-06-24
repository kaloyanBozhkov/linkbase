import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for creating connections
export const createConnectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  igHandle: z.string().optional(),
  metAt: z
    .string()
    .min(1, "Meeting place is required")
    .max(200, "Meeting place must be less than 200 characters"),
  facts: z.array(z.string()).min(1, "At least one fact is required"),
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
  return await connectionService.createConnection(validatedData);
};
