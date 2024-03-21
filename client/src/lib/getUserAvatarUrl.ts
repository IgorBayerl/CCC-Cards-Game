import { type IGuildsMembersRead } from './types';
import { type DiscordSDKMock, type DiscordSDK, type Types } from '@discord/embedded-app-sdk';

interface GetUserAvatarArgs {
  guildMember: IGuildsMembersRead | null;
  user: Partial<Types.User>;
  cdn?: string;
  size?: number;
  discordSdk?: DiscordSDK | DiscordSDKMock; // Adjusted to optionally accept discordSdk or guildId directly
}

export function getUserAvatarUrl({
  guildMember,
  user,
  cdn = `https://cdn.discordapp.com`,
  size = 256,
  discordSdk, // Accept discordSdk or relevant data as an argument
}: GetUserAvatarArgs): string {
  const userId = user.id || '';
  if (guildMember?.avatar != null && discordSdk?.guildId != null) {
    return `${cdn}/guilds/${discordSdk.guildId}/users/${userId}/avatars/${guildMember.avatar}.png?size=${size}`;
  }
  if (user.avatar != null) {
    return `${cdn}/avatars/${userId}/${user.avatar}.png?size=${size}`;
  }

  const defaultAvatarIndex = Math.abs(Number(userId) >> 22) % 6;
  return `${cdn}/embed/avatars/${defaultAvatarIndex}.png?size=${size}`;
}
