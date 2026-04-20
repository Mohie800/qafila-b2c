import axios from "axios";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach auth token when available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("qafila_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — unwrap data, normalize errors, handle 401
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("qafila_token");
        localStorage.removeItem("qafila_user");
        window.dispatchEvent(new Event("qafila:logout"));
      }
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
