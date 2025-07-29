import { prisma } from "@linkbase/prisma";

export const deleteFactQuery = async ({
  factId,
  connectionId,
}: {
  factId: string;
  connectionId: string;
}) => {
  await prisma.fact.delete({
    where: {
      id: factId,
      connection_id: connectionId,
    },
  });
};

export const deleteAllFactsQuery = async ({
  connectionId,
}: {
  connectionId: string;
}) => {
  await prisma.fact.deleteMany({
    where: {
      connection_id: connectionId,
    },
  });
}; 