import { social_media_type, prisma } from "@linkbase/prisma";
export { prisma };

// Helper function to generate URL from handle based on platform
export function generateSocialMediaUrl(
  type: social_media_type,
  handle: string
): string {
  // For email and phone, use the handle as-is (no @ removal)
  if (type === social_media_type.EMAIL) {
    return `mailto:${handle}`;
  }

  if (type === social_media_type.PHONE) {
    // Clean phone number for tel: link (remove spaces, dashes, etc. but keep +)
    const cleanPhone = handle.replace(/[^\d+]/g, "");
    return `tel:${cleanPhone}`;
  }

  // For other platforms, remove @ prefix if present
  const cleanHandle = handle.replace(/^@/, "");

  const urlPatterns: Record<social_media_type, string> = {
    [social_media_type.EMAIL]: `mailto:${handle}`, // This won't be used due to early return above
    [social_media_type.PHONE]: `tel:${handle}`, // This won't be used due to early return above
    [social_media_type.INSTAGRAM]: `https://instagram.com/${cleanHandle}`,
    [social_media_type.FACEBOOK]: `https://facebook.com/${cleanHandle}`,
    [social_media_type.TWITTER]: `https://twitter.com/${cleanHandle}`,
    [social_media_type.TIKTOK]: `https://tiktok.com/@${cleanHandle}`,
    [social_media_type.LINKEDIN]: `https://linkedin.com/in/${cleanHandle}`,
    [social_media_type.YOUTUBE]: `https://youtube.com/@${cleanHandle}`,
    [social_media_type.SNAPCHAT]: `https://snapchat.com/add/${cleanHandle}`,
    [social_media_type.PINTEREST]: `https://pinterest.com/${cleanHandle}`,
    [social_media_type.REDDIT]: `https://reddit.com/u/${cleanHandle}`,
    [social_media_type.TWITCH]: `https://twitch.tv/${cleanHandle}`,
    [social_media_type.GITHUB]: `https://github.com/${cleanHandle}`,
    [social_media_type.BEHANCE]: `https://behance.net/${cleanHandle}`,
    [social_media_type.DRIBBBLE]: `https://dribbble.com/${cleanHandle}`,
    [social_media_type.MEDIUM]: `https://medium.com/@${cleanHandle}`,
    [social_media_type.SUBSTACK]: `https://${cleanHandle}.substack.com`,
    [social_media_type.SPOTIFY]: `https://open.spotify.com/user/${cleanHandle}`,
    [social_media_type.SOUNDCLOUD]: `https://soundcloud.com/${cleanHandle}`,
    [social_media_type.BANDCAMP]: `https://${cleanHandle}.bandcamp.com`,
    [social_media_type.THREADS]: `https://threads.net/@${cleanHandle}`,
    [social_media_type.MASTODON]: `https://mastodon.social/@${cleanHandle}`,
    [social_media_type.BLUESKY]: `https://bsky.app/profile/${cleanHandle}`,
    [social_media_type.TUMBLR]: `https://${cleanHandle}.tumblr.com`,
    [social_media_type.FLICKR]: `https://flickr.com/people/${cleanHandle}`,
    [social_media_type.VIMEO]: `https://vimeo.com/${cleanHandle}`,
  };

  return urlPatterns[type] || cleanHandle;
}
