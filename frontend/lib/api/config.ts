import axios from "axios"

axios.defaults.withCredentials = true

const baseApi = "http://localhost:4000/secure/api"

export const apiClient = axios.create({
  baseURL: baseApi,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
})

// Add response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message)
    return Promise.reject(error)
  },
)

export { baseApi }
