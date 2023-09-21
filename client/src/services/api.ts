import axios, { type AxiosRequestConfig } from 'axios'

const axiosConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_GAME_SERVER || 'http://localhost:2567',
}

const api = axios.create(axiosConfig)

export default api
