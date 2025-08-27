import { z } from "zod";
import { social_media_type } from "@linkbase/prisma";
import { prisma, generateSocialMediaUrl } from "@/helpers/prisma";
import { getConnectionMemory } from "@/ai/linkbase/memory";

// Input schema for import
export const importConnectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  metAt: z.string().min(1, "Meeting place is required"),
  metWhen: z.date().optional(),
  facts: z.array(z.string()).optional().default([]),
  socialMedias: z.array(z.object({
    type: z.nativeEnum(social_media_type),
    handle: z.string().min(1, "Handle is required"),
  })).optional().default([]),
});

export const importConnectionsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  connections: z.array(importConnectionSchema),
});

export type ImportConnectionsInput = z.infer<typeof importConnectionsSchema>;

/**
 * Imports connections for a user, avoiding duplicates.
 * A connection is considered a duplicate if name + met_at already exists.
 * Facts are deduplicated per connection.
 *
 * @param data - The import data containing userId and connections array
 * @returns Promise<{imported: number, skipped: number, errors: string[]}> - Import results
 */
export const importConnectionsQuery = async (data: ImportConnectionsInput) => {
  const validatedData = importConnectionsSchema.parse(data);
  const { userId, connections } = validatedData;

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const connectionData of connections) {
    try {
      // Check if connection already exists (duplicate detection)
      const existingConnection = await prisma.connection.findFirst({
        where: {
          user_id: userId,
          name: connectionData.name,
          met_at: connectionData.metAt,
        },
        select: {
          id: true,
          facts: {
            select: {
              text: true,
            },
          },
        },
      });

      if (existingConnection) {
        skipped++;
        continue;
      }

      // Create new connection
      const connection = await prisma.connection.create({
        data: {
          name: connectionData.name,
          met_at: connectionData.metAt,
          met_when: connectionData.metWhen || new Date(),
          user_id: userId,
          social_medias: {
            create: connectionData.socialMedias.map((sm) => ({
              type: sm.type,
              handle: sm.handle,
              url: generateSocialMediaUrl(sm.type, sm.handle),
            })),
          },
        },
        include: {
          social_medias: true,
        },
      });

      // Add facts, avoiding duplicates
      const existingFacts = new Set();
      const uniqueFacts = connectionData.facts.filter(fact => {
        const trimmed = fact.trim();
        if (!trimmed || existingFacts.has(trimmed)) {
          return false;
        }
        existingFacts.add(trimmed);
        return true;
      });

      if (uniqueFacts.length > 0) {
        const connectionMemory = getConnectionMemory({ userId });
        await connectionMemory.addFacts(connection.id, uniqueFacts);
      }

      imported++;
    } catch (error) {
      console.error(`Error importing connection "${connectionData.name}":`, error);
      errors.push(`Failed to import connection "${connectionData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    imported,
    skipped,
    errors,
  };
};
