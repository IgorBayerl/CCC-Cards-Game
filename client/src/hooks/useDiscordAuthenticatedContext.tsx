import * as React from 'react';
import { toast } from 'react-toastify'
import { getUserAvatarUrl } from '../lib/getUserAvatarUrl';
import type { IGuildsMembersRead, TAuthenticateResponse, TAuthenticatedContext } from '../lib/types';
import { getUserDisplayName } from '../lib/getUserDisplayName';
import useDiscordSdk from './useDiscordSdk';
import { getDiscordToken } from '~/api/discord';
import LoadingFullScreen from '~/components/Atoms/LoadingFullScreen';
import isRunningInDiscord from '~/lib/isDiscord';


const AuthenticatedContext = React.createContext<TAuthenticatedContext>({
  isDiscordAuthenticated: false,
  user: {
    id: '',
    username: '',
    discriminator: '',
    avatar: null,
    public_flags: 0,
  },
  access_token: '',
  scopes: [],
  expires: '',
  application: {
    rpc_origins: undefined,
    id: '',
    name: '',
    icon: null,
    description: '',
  },
  guildMember: null,
  user_parsed_info: {
    userId: '',
    username: '',
    picture: '',
  }
});

export function DiscordAuthenticatedContextProvider({ children }: { children: React.ReactNode }) {
  const authenticatedContext = useDiscordAuthenticatedContextSetup();

  // if (!isRunningInDiscord()) {
  //   return children
  // }

  if (authenticatedContext == null) {
    return children
  }

  return <AuthenticatedContext.Provider value={authenticatedContext}>{children}</AuthenticatedContext.Provider>;
}

export function useDiscordAuthenticatedContext() {
  return React.useContext(AuthenticatedContext);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This is a helper hook which is used to connect your embedded app with Discord and Colyseus
 */
function useDiscordAuthenticatedContextSetup() {
  const [auth, setAuth] = React.useState<TAuthenticatedContext | null>(null);
  const [done, setDone] = React.useState(false);
  const discordSdk = useDiscordSdk();

  React.useEffect(() => {

    const setUpDiscordSdk = async () => {
      if (!discordSdk) return;
      if (done) return;

      const clientId = `1219394178379681842`;

      await sleep(1000) // BUG: For some reason this solves the next command never returning anything

      // Authorize with Discord Client
      const { code } = await discordSdk.commands.authorize({
        client_id: clientId,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [
          'identify',
          'guilds',
          'guilds.members.read',
          'rpc.voice.read',
        ],
      });


      // Retrieve an access_token from your embedded app's server
      const accessToken = await getDiscordToken(code);

      // Authenticate with Discord client (using the access_token)
      const newAuth: TAuthenticateResponse = await discordSdk.commands.authenticate({
        access_token: accessToken,
      });



      // Get guild specific nickname and avatar, and fallback to user name and avatar
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const guildMember: IGuildsMembersRead | null = await fetch(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `/discord/api/users/@me/guilds/${discordSdk.guildId}/member`,
        {
          method: 'get',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
        .then((j) => j.json())
        .catch(() => {
          return null;
        });


      const avatarUri = getUserAvatarUrl({
        guildMember,
        user: newAuth.user,
        discordSdk: discordSdk,
      });

      // Get the user's guild nickname. If none set, fall back to global_name, or username
      const name = getUserDisplayName({
        guildMember,
        user: newAuth.user,
      });


      const user_parsed_info = {
        userId: newAuth.user.id,
        username: name,
        picture: avatarUri,
      }

      setAuth({ ...newAuth, guildMember, user_parsed_info, isDiscordAuthenticated: true });
      setDone(true);
    };


    void setUpDiscordSdk();
  }, [discordSdk, done]);

  return auth;
}
