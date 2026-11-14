import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { LANGUAGE_STORAGE_KEY } from "@/i18n";

const baseURL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://bookshop-backend-k6vv.onrender.com";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_URL = "/api/v1/auth/refresh";

/** Các endpoint không bao giờ được thử refresh (tránh lặp vô hạn). */
const NO_REFRESH_PATHS = [
  REFRESH_URL,
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/logout",
];

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Instance riêng để gọi refresh: không có interceptor bắt 401 nên không đệ quy.
 *
 * Vẫn phải bóc `response.data` giống instance chính, vì `src/types/axios.d.ts`
 * khai báo `AxiosResponse<T> extends Promise<T>` — tức là toàn bộ code trong dự án
 * coi kết quả `await` của một request LÀ body luôn. Thiếu interceptor này thì
 * kiểu dữ liệu và giá trị thật lúc chạy sẽ lệch nhau.
 */
const refreshInstance = axios.create({ baseURL, withCredentials: true });
refreshInstance.interceptors.response.use((response) =>
  response && response.data ? response.data : response
);

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const clearAccessToken = () =>
  localStorage.removeItem(ACCESS_TOKEN_KEY);

// ---------------------------------------------------------------------------
// Request interceptor: gắn Bearer token
// ---------------------------------------------------------------------------
/** Ngôn ngữ đang chọn, đọc trực tiếp từ localStorage để không phụ thuộc vòng đời React. */
const readLanguage = (): string => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "vi";
  } catch {
    return "vi";
  }
};

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    // Backend dịch message theo header này (messages.properties / messages_vi.properties).
    // Thiếu header thì luôn nhận tiếng Anh dù giao diện đang để tiếng Việt.
    config.headers.set("Accept-Language", readLanguage());
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Tự động refresh access token khi gặp 401
//
// Backend đã có sẵn GET /api/v1/auth/refresh (đọc cookie httpOnly refresh_token)
// nhưng frontend chưa bao giờ gọi, nên người dùng bị văng ra ngay khi access
// token hết hạn. Đoạn dưới gọi refresh đúng MỘT lần và cho các request bị 401
// cùng lúc xếp hàng đợi token mới thay vì mỗi request tự refresh.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const body = await refreshInstance.get<IBackendRes<ILogin>>(REFRESH_URL);
  const newToken = body?.data?.access_token;
  if (!newToken) throw new Error("Refresh response không chứa access_token");

  setAccessToken(newToken);
  return newToken;
};

const onSessionExpired = () => {
  clearAccessToken();
  // Không dùng navigate() được ở đây (ngoài React tree). Chỉ chuyển hướng khi
  // đang ở trang cần đăng nhập, để trang công khai không bị đá về /login.
  const { pathname } = window.location;
  const isPublicPage = ["/", "/books", "/about", "/login", "/register"].some(
    (p) => pathname === p || pathname.startsWith("/books/")
  );
  if (!isPublicPage) {
    window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
  }
};

instance.interceptors.response.use(
  (response) => (response && response.data ? response.data : response),

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = originalRequest?.url ?? "";
    const isRefreshable =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (isRefreshable) {
      // Đã có một lượt refresh đang chạy → xếp hàng chờ token mới
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest._retry = true;
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        flushQueue(null, newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return instance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        onSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error?.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
