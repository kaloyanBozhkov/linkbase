import { Prisma } from "@linkbase/prisma";

export const enquote = (text: string) =>
  Prisma.raw(`'${text.replace(/'/g, "''")}'`);

export const vectorize = (embedding: number[]) =>
  Prisma.raw(`'${JSON.stringify(embedding)}'::vector`);
