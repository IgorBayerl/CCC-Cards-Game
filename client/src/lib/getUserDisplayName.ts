import { type IGuildsMembersRead } from './types';
import { type Types } from '@discord/embedded-app-sdk';

interface GetUserDisplayNameArgs {
  guildMember: IGuildsMembersRead | null;
  user: Partial<Types.User>;
}

function handleGenerateFallbackUsername() {
  const coolNameText = 'CoolName'
  const randomString = Math.random().toString().slice(-4).toUpperCase()
  const randomUsername = `${coolNameText}${randomString}`
  return randomUsername
}

export function getUserDisplayName({ guildMember, user }: GetUserDisplayNameArgs) {
  if (guildMember?.nick != null && guildMember.nick !== '') return guildMember.nick;

  if (user.discriminator !== '0') return `${String(user.username)}#${String(user.discriminator)}`;

  if (user.global_name != null && user.global_name !== '') return user.global_name;

  return user.username || handleGenerateFallbackUsername()
}
