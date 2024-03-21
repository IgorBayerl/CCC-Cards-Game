import type { AsyncReturnType } from 'type-fest';
import { type discordSdk } from './discordSdk';

export type TAuthenticateResponse = AsyncReturnType<typeof discordSdk.commands.authenticate>;

export interface IUserParsedInfo {
  userId: string;
  username: string;
  picture: string;
}

// export type TAuthenticatedContext = TAuthenticateResponse & {guildMember: IGuildsMembersRead | null} & IColyseus;
export type TAuthenticatedContext = TAuthenticateResponse & {
  guildMember: IGuildsMembersRead | null
  user_parsed_info: IUserParsedInfo
  isDiscordAuthenticated: boolean
}

export interface IGuildsMembersRead {
  roles: string[];
  nick: string | null;
  avatar: string | null;
  premium_since: string | null;
  joined_at: string;
  is_pending: boolean;
  pending: boolean;
  communication_disabled_until: string | null;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
  };
  mute: boolean;
  deaf: boolean;
}
