import api from '~/services/api'

interface DiscordTokenResponse {
  access_token: string;
}

export async function getDiscordToken(code: string) {
  const response = await api.post<DiscordTokenResponse>('/ds/token', {
    code,
  });
  console.log(`Discord TOKEN Request`, response.data);
  return response.data.access_token;
}
