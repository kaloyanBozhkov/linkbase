import { PrismaClient } from "@prisma/client";
import {
  CreateConnectionInput,
  UpdateConnectionInput,
} from "../helpers/validation";
import { env } from "../env";

const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export class ConnectionService {
  async createConnection(data: CreateConnectionInput & { igUrl?: string }) {
    const { name, igHandle, metAt, facts, igUrl } = data;

    return await prisma.connection.create({
      data: {
        name,
        igHandle,
        igUrl: igHandle
          ? `https://instagram.com/${igHandle.replace("@", "")}`
          : igUrl,
        metAt,
        facts,
      },
    });
  }

  async getAllConnections(limit: number = 20, offset: number = 0) {
    return await prisma.connection.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getConnectionById(id: string) {
    return await prisma.connection.findUnique({
      where: { id },
    });
  }

  async updateConnection(id: string, data: UpdateConnectionInput) {
    const updateData: any = { ...data };

    if (data.igHandle) {
      updateData.igUrl = `https://instagram.com/${data.igHandle.replace(
        "@",
        ""
      )}`;
    }

    return await prisma.connection.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteConnection(id: string) {
    return await prisma.connection.delete({
      where: { id },
    });
  }

  async searchConnections(
    query: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return await prisma.connection.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            facts: {
              hasSome: [query],
            },
          },
          {
            metAt: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getConnectionsCount() {
    return await prisma.connection.count();
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export const connectionService = new ConnectionService();
