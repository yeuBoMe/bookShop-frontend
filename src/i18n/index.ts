import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "./locales/vi.json";
import en from "./locales/en.json";

/**
 * Cấu hình đa ngôn ngữ.
 *
 * Tiếng Việt là ngôn ngữ gốc (fallback): toàn bộ giao diện được viết bằng
 * tiếng Việt trước, nên khi thiếu key ở bản tiếng Anh người dùng vẫn đọc được
 * chứ không thấy tên key trần.
 *
 * Ngôn ngữ đã chọn lưu ở localStorage để giữ nguyên sau khi tải lại trang.
 * Việc đổi locale của Ant Design (vi_VN / en_US) do ThemedConfigProvider lo.
 */
export const LANGUAGE_STORAGE_KEY = "bookshop_language";

export const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const isSupported = (value: string | null): value is LanguageCode =>
  SUPPORTED_LANGUAGES.some((l) => l.code === value);

const readStoredLanguage = (): LanguageCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupported(stored)) return stored;
    // Chưa từng chọn thì đoán theo ngôn ngữ trình duyệt
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "vi";
  } catch {
    // localStorage có thể bị chặn (chế độ ẩn danh, trình duyệt khoá cookie)
    return "vi";
  }
};

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false, // React đã tự chống XSS
  },
});

// Đồng bộ thuộc tính lang của <html> — trình đọc màn hình dựa vào đây để chọn
// giọng đọc, và trình duyệt dựa vào đây để gợi ý dịch trang.
const syncDocumentLanguage = (lng: string) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Không lưu được thì thôi, phiên hiện tại vẫn chạy đúng
  }
};

// Cho phép viết {{entity, capitalize}} trong bản dịch.
// Tiếng Anh cần hoa chữ đầu khi tên thực thể đứng đầu câu ("Book created"),
// tiếng Việt thì không ("Thêm sách thành công") — nên việc hoa hay không là
// quyết định của từng bản dịch, không viết cứng vào dữ liệu.
i18n.services.formatter?.add("capitalize", (value) =>
  typeof value === "string" ? value.charAt(0).toUpperCase() + value.slice(1) : value
);

syncDocumentLanguage(i18n.language);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
