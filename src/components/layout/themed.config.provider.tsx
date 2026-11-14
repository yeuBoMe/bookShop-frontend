import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { useTheme } from "@/components/context/theme.context";
import { getAntdTheme, type ThemeArea } from "@/styles/antd-theme";

/**
 * Nối Ant Design vào hai lựa chọn của người dùng: ngôn ngữ và chế độ sáng/tối.
 *
 * Tách riêng khỏi main.tsx vì cần đọc context (useTheme, useTranslation) —
 * main.tsx là nơi khai báo provider nên không đứng trong phạm vi của chúng.
 *
 * Dùng hai lần, lồng nhau:
 *   - main.tsx        → area="client", phủ toàn bộ ứng dụng
 *   - admin.layout.tsx → area="admin", chỉ đổi bảng màu cho khu quản trị
 */
const ThemedConfigProvider = ({
    area = "client",
    children,
}: {
    area?: ThemeArea;
    children: ReactNode;
}) => {
    const { resolved } = useTheme();
    const { i18n } = useTranslation();

    // Locale quyết định chữ tiếng Việt/Anh trong DatePicker, Pagination, Table,
    // Popconfirm... (trước đây đang để mặc định en_US nên lệch với phần còn lại)
    const locale = i18n.language === "en" ? enUS : viVN;

    return (
        <ConfigProvider locale={locale} theme={getAntdTheme(area, resolved === "dark")}>
            {children}
        </ConfigProvider>
    );
};

export default ThemedConfigProvider;
