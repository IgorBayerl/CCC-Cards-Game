import axios, { type AxiosRequestConfig } from 'axios'
import isRunningInDiscord from '~/lib/isDiscord';

export function getBaseURL() {
  if (isRunningInDiscord()) {
    return '/api'; // If running within Discord, use the Discord proxy
  }
  return process.env.NEXT_PUBLIC_GAME_SERVER || 'http://localhost:2567';
}

export function getWsUrl() {
  if (isRunningInDiscord()) {
    return `wss://${location.host}/api`
  }
  return process.env.NEXT_PUBLIC_GAME_SERVER_WS || 'ws://localhost:2567';
}

const axiosConfig: AxiosRequestConfig = {
  baseURL: getBaseURL(),
}

const api = axios.create(axiosConfig)

export default api