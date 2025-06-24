import { PrismaClient, SocialMediaType } from "@prisma/client";
import { env } from "../env";

// Import types from their respective query files
import type { CreateConnectionInput } from "../queries/connections/create";
import type { UpdateConnectionInput } from "../queries/connections/update";

const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Helper function to generate URL from handle based on platform
function generateSocialMediaUrl(type: SocialMediaType, handle: string): string {
  // For email and phone, use the handle as-is (no @ removal)
  if (type === SocialMediaType.EMAIL) {
    return `mailto:${handle}`;
  }

  if (type === SocialMediaType.PHONE) {
    // Clean phone number for tel: link (remove spaces, dashes, etc. but keep +)
    const cleanPhone = handle.replace(/[^\d+]/g, "");
    return `tel:${cleanPhone}`;
  }

  // For other platforms, remove @ prefix if present
  const cleanHandle = handle.replace(/^@/, "");

  const urlPatterns: Record<SocialMediaType, string> = {
    [SocialMediaType.EMAIL]: `mailto:${handle}`, // This won't be used due to early return above
    [SocialMediaType.PHONE]: `tel:${handle}`, // This won't be used due to early return above
    [SocialMediaType.INSTAGRAM]: `https://instagram.com/${cleanHandle}`,
    [SocialMediaType.FACEBOOK]: `https://facebook.com/${cleanHandle}`,
    [SocialMediaType.TWITTER]: `https://twitter.com/${cleanHandle}`,
    [SocialMediaType.TIKTOK]: `https://tiktok.com/@${cleanHandle}`,
    [SocialMediaType.LINKEDIN]: `https://linkedin.com/in/${cleanHandle}`,
    [SocialMediaType.YOUTUBE]: `https://youtube.com/@${cleanHandle}`,
    [SocialMediaType.SNAPCHAT]: `https://snapchat.com/add/${cleanHandle}`,
    [SocialMediaType.PINTEREST]: `https://pinterest.com/${cleanHandle}`,
    [SocialMediaType.REDDIT]: `https://reddit.com/u/${cleanHandle}`,
    [SocialMediaType.TWITCH]: `https://twitch.tv/${cleanHandle}`,
    [SocialMediaType.GITHUB]: `https://github.com/${cleanHandle}`,
    [SocialMediaType.BEHANCE]: `https://behance.net/${cleanHandle}`,
    [SocialMediaType.DRIBBBLE]: `https://dribbble.com/${cleanHandle}`,
    [SocialMediaType.MEDIUM]: `https://medium.com/@${cleanHandle}`,
    [SocialMediaType.SUBSTACK]: `https://${cleanHandle}.substack.com`,
    [SocialMediaType.SPOTIFY]: `https://open.spotify.com/user/${cleanHandle}`,
    [SocialMediaType.SOUNDCLOUD]: `https://soundcloud.com/${cleanHandle}`,
    [SocialMediaType.BANDCAMP]: `https://${cleanHandle}.bandcamp.com`,
    [SocialMediaType.THREADS]: `https://threads.net/@${cleanHandle}`,
    [SocialMediaType.MASTODON]: `https://mastodon.social/@${cleanHandle}`,
    [SocialMediaType.BLUESKY]: `https://bsky.app/profile/${cleanHandle}`,
    [SocialMediaType.TUMBLR]: `https://${cleanHandle}.tumblr.com`,
    [SocialMediaType.FLICKR]: `https://flickr.com/people/${cleanHandle}`,
    [SocialMediaType.VIMEO]: `https://vimeo.com/${cleanHandle}`,
  };

  return urlPatterns[type] || cleanHandle;
}

export class ConnectionService {
  async createConnection(data: CreateConnectionInput) {
    const { name, metAt, facts, socialMedias = [] } = data;

    return await prisma.connection.create({
      data: {
        name,
        metAt,
        facts,
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
  }

  async getAllConnections(limit: number = 20, offset: number = 0) {
    return await prisma.connection.findMany({
      skip: offset,
      take: limit,
      include: {
        socialMedias: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getConnectionById(id: string) {
    return await prisma.connection.findUnique({
      where: { id },
      include: {
        socialMedias: true,
      },
    });
  }

  async updateConnection(id: string, data: UpdateConnectionInput) {
    const { socialMedias, ...connectionData } = data;

    return await prisma.connection.update({
      where: { id },
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
          {
            socialMedias: {
              some: {
                handle: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      include: {
        socialMedias: true,
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
