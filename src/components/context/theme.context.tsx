import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

/**
 * Chế độ giao diện sáng / tối.
 *
 * Có BA lựa chọn chứ không phải hai: ngoài "sáng" và "tối" còn có "theo hệ
 * thống" — đây mới là mặc định. Nhiều người đã bật chế độ tối ở cấp hệ điều
 * hành (thường vì nhạy sáng hoặc dùng ban đêm); ép trang luôn sáng sẽ chói mắt
 * ngay lần mở đầu tiên, trước khi họ kịp tìm thấy nút đổi.
 */
export type ThemeMode = "light" | "dark" | "system";

/** Chế độ thực tế đang hiển thị sau khi đã quy đổi "system". */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "bookshop_theme";

type ThemeContextValue = {
    /** Lựa chọn của người dùng — có thể là "system". */
    mode: ThemeMode;
    /** Màu đang hiển thị thật sự — luôn là "light" hoặc "dark". */
    resolved: ResolvedTheme;
    setMode: (mode: ThemeMode) => void;
    /** Đảo nhanh sáng ↔ tối, dựa trên màu đang hiển thị. */
    toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const prefersDark = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const readStoredMode = (): ThemeMode => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored;
        }
    } catch {
        // localStorage có thể bị chặn — rơi về mặc định
    }
    return "system";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
    const [systemDark, setSystemDark] = useState<boolean>(prefersDark);

    // Người dùng có thể đổi sáng/tối ở hệ điều hành TRONG LÚC trang đang mở
    // (macOS/Windows tự đổi theo giờ). Ở chế độ "system" phải bám theo.
    useEffect(() => {
        const query = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!query) return;

        const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    const resolved: ResolvedTheme = useMemo(() => {
        if (mode === "system") return systemDark ? "dark" : "light";
        return mode;
    }, [mode, systemDark]);

    // Toàn bộ CSS đọc màu qua biến khai báo dưới :root và [data-theme="dark"]
    // trong global.scss, nên chỉ cần đặt một thuộc tính ở đây là cả trang đổi.
    useEffect(() => {
        document.documentElement.dataset.theme = resolved;
        // Báo cho trình duyệt biết để vẽ ô nhập liệu, thanh cuộn... theo đúng tông
        document.documentElement.style.colorScheme = resolved;
    }, [resolved]);

    const setMode = useCallback((next: ThemeMode) => {
        setModeState(next);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Không lưu được thì phiên hiện tại vẫn chạy đúng
        }
    }, []);

    const toggle = useCallback(() => {
        setMode(resolved === "dark" ? "light" : "dark");
    }, [resolved, setMode]);

    const value = useMemo(
        () => ({ mode, resolved, setMode, toggle }),
        [mode, resolved, setMode, toggle]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme phải được dùng bên trong <ThemeProvider>");
    }
    return context;
};
