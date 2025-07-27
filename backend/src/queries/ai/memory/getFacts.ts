import { prisma } from "@/helpers/prisma";
import { fact } from "@linkbase/prisma";

export const getFacts = async (connectionId: string, facts: string[]) => {
  const result = await prisma.fact.findMany({
    where: {
      connection_id: connectionId,
      text: {
        in: facts,
      },
    },
  });

  return result as fact[];
};
