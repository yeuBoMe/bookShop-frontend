import { theme as antdAlgorithms, type ThemeConfig } from "antd";

/**
 * Cấu hình theme cho Ant Design.
 *
 * Giữ cho component của antd và CSS tự viết dùng CHUNG một hệ thống thiết kế.
 * Trước đây antd chạy màu mặc định #1677ff trong khi SCSS dùng màu riêng, nên
 * trên cùng một màn hình có hai sắc xanh khác nhau (nút antd vs nút tự viết).
 *
 * Hai trục biến thiên:
 *   - khu vực: client (xanh dương azure) / admin (xanh lá emerald)
 *   - chế độ : sáng / tối
 * Khu quản trị bọc thêm một <ConfigProvider> lồng bên trong (admin.layout.tsx)
 * nên đổi màu admin không đụng gì tới trang khách.
 *
 * Mọi giá trị dưới đây phải khớp với biến CSS trong src/styles/global.scss
 * (chế độ sáng/tối) và src/styles/admin/admin.layout.scss (khu quản trị).
 */

export type ThemeArea = "client" | "admin";

type Palette = {
    /** Nền nút / mảng đặc. Bắt buộc ≥4.5:1 với chữ trắng ở CẢ hai chế độ. */
    primary: string;
    /**
     * Trạng thái hover — chọn ĐẬM hơn primary, không sáng hơn: antd mặc định
     * làm sáng lên khiến chữ trắng tụt xuống ~3.3:1, không đạt WCAG AA.
     */
    primaryHover: string;
    primaryActive: string;
    /** Màu CHỮ/liên kết. Ở chế độ tối màu này sáng lên, ngược chiều với primary. */
    text: string;
    /** Nền nhạt: mục menu đang chọn, hàng bảng khi rê chuột. */
    soft: string;
    /** Viền focus (3px) — dùng rgba để không che mất viền input. */
    ring: string;
    /** Nền chung của Layout — hơi ngả về phía màu thương hiệu. */
    bgLayout: string;
};

const PALETTES: Record<ThemeArea, Record<"light" | "dark", Palette>> = {
    client: {
        light: {
            primary: "#0b74d4",
            primaryHover: "#0a5fae",
            primaryActive: "#0d4d8a",
            text: "#0a5fae",
            soft: "#ecf6ff",
            ring: "rgba(11, 116, 212, 0.18)",
            bgLayout: "#f8fafc",
        },
        dark: {
            primary: "#0d6fca",
            primaryHover: "#0a5fae",
            primaryActive: "#0d4d8a",
            text: "#7cc3fd",
            soft: "#10243a",
            ring: "rgba(64, 168, 250, 0.25)",
            bgLayout: "#0f172a",
        },
    },
    admin: {
        light: {
            primary: "#05835c",
            primaryHover: "#047857",
            primaryActive: "#065f46",
            text: "#047857",
            soft: "#ecfdf5",
            ring: "rgba(5, 131, 92, 0.22)",
            bgLayout: "#f3fbf7",
        },
        dark: {
            primary: "#05835c",
            primaryHover: "#047857",
            primaryActive: "#065f46",
            text: "#6ee7b7",
            soft: "#0d2f26",
            ring: "rgba(52, 211, 153, 0.25)",
            bgLayout: "#0e1a16",
        },
    },
};

/** Màu trung tính, khớp với biến CSS ở global.scss. */
const NEUTRALS = {
    light: {
        text: "#374151",
        textHeading: "#111827",
        textSecondary: "#4b5563",
        textTertiary: "#6b7280",
        bgContainer: "#ffffff",
        bgElevated: "#ffffff",
        border: "#e5e7eb",
        borderSecondary: "#f1f5f9",
        tableHeaderBg: "#f8fafc",
        shadow: "0 4px 12px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.04)",
        shadowSecondary:
            "0 12px 28px rgba(15, 23, 42, 0.09), 0 4px 8px rgba(15, 23, 42, 0.04)",
    },
    dark: {
        text: "#cbd5e1",
        textHeading: "#f1f5f9",
        textSecondary: "#94a3b8",
        textTertiary: "#7c8ba1",
        bgContainer: "#1a2436",
        bgElevated: "#212d42",
        border: "#2b374d",
        borderSecondary: "#24304a",
        tableHeaderBg: "#1e293b",
        shadow: "0 4px 12px rgba(0, 0, 0, 0.55), 0 2px 4px rgba(0, 0, 0, 0.4)",
        shadowSecondary: "0 12px 28px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.45)",
    },
} as const;

/**
 * Dựng ThemeConfig cho một khu vực ở một chế độ sáng/tối.
 *
 * @param area  "client" (xanh dương) hoặc "admin" (xanh lá)
 * @param dark  true nếu đang ở chế độ tối
 */
export const getAntdTheme = (area: ThemeArea, dark: boolean): ThemeConfig => {
    const p = PALETTES[area][dark ? "dark" : "light"];
    const n = NEUTRALS[dark ? "dark" : "light"];

    return {
        algorithm: dark ? antdAlgorithms.darkAlgorithm : antdAlgorithms.defaultAlgorithm,

        token: {
            // --- Màu thương hiệu ---
            colorPrimary: p.primary,
            colorPrimaryHover: p.primaryHover,
            colorPrimaryActive: p.primaryActive,
            colorPrimaryBg: p.soft,
            colorLink: p.text,
            colorLinkHover: p.primaryHover,
            colorInfo: p.primary,
            colorSuccess: dark ? "#34d399" : "#05835c",
            colorWarning: dark ? "#fbbf24" : "#b45309",
            colorError: dark ? "#f87171" : "#dc2626",

            // --- Chữ ---
            fontFamily:
                '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 14,
            colorText: n.text,
            colorTextHeading: n.textHeading,
            colorTextSecondary: n.textSecondary,
            colorTextTertiary: n.textTertiary,

            // --- Bề mặt & viền ---
            colorBgLayout: p.bgLayout,
            colorBgContainer: n.bgContainer,
            colorBgElevated: n.bgElevated,
            colorBorder: n.border,
            colorBorderSecondary: n.borderSecondary,

            // --- Hình khối ---
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,

            // --- Đổ bóng: nhẹ và có chiều sâu, thay cho bóng xám phẳng mặc định ---
            boxShadow: n.shadow,
            boxShadowSecondary: n.shadowSecondary,

            // --- Điều khiển ---
            controlHeight: 38,
            controlHeightLG: 44,
            controlHeightSM: 30,

            wireframe: false,
        },

        components: {
            Button: {
                fontWeight: 600,
                primaryShadow: "none",
                defaultShadow: "none",
            },
            Table: {
                headerBg: n.tableHeaderBg,
                headerColor: n.textHeading,
                headerSplitColor: "transparent",
                rowHoverBg: p.soft,
                rowSelectedBg: p.soft,
                borderColor: n.borderSecondary,
            },
            Menu: {
                itemSelectedBg: p.soft,
                itemSelectedColor: p.text,
                itemHoverBg: n.borderSecondary,
                itemBorderRadius: 8,
            },
            Card: {
                headerBg: "transparent",
                boxShadowTertiary: n.shadow,
            },
            Steps: {
                colorPrimary: p.primary,
            },
            Tabs: {
                inkBarColor: p.primary,
                itemSelectedColor: p.text,
                itemHoverColor: p.primaryHover,
                titleFontSize: 14,
            },
            Input: {
                activeShadow: `0 0 0 3px ${p.ring}`,
            },
            Select: {
                optionSelectedBg: p.soft,
            },
            Rate: {
                // Sao đánh giá giữ vàng hổ phách ở mọi khu vực và mọi chế độ — đây là
                // quy ước chung, đổi theo màu thương hiệu sẽ khó nhận ra là "sao".
                starColor: "#f59e0b",
            },
            Pagination: {
                itemActiveBg: p.primary,
            },
            Modal: {
                titleFontSize: 18,
            },
            Drawer: {
                footerPaddingBlock: 16,
            },
        },
    };
};
