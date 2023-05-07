import axios, { type AxiosRequestConfig } from "axios";

const axiosConfig: AxiosRequestConfig = {
  baseURL: 'http://localhost:3365',
}

const api = axios.create(axiosConfig);

export default api;
