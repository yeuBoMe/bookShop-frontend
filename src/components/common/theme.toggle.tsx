import { Dropdown, type MenuProps } from "antd";
import { FiCheck, FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemeMode } from "@/components/context/theme.context";
import "styles/common/app-controls.scss";

/**
 * Nút đổi giao diện sáng / tối — dùng CHUNG cho cả trang bán hàng và khu quản trị.
 *
 * Ba lựa chọn chứ không phải hai: "Theo hệ thống" là mặc định, để người đã bật
 * chế độ tối ở cấp hệ điều hành không bị loá mắt ngay lần mở trang đầu tiên.
 * Biểu tượng trên nút hiển thị màu ĐANG dùng thật, còn dấu tích trong menu
 * cho biết người dùng đã chọn chế độ nào.
 */
const MODE_ICONS: Record<ThemeMode, typeof FiSun> = {
    light: FiSun,
    dark: FiMoon,
    system: FiMonitor,
};

const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
    const { mode, resolved, setMode } = useTheme();
    const { t } = useTranslation();

    const modes: ThemeMode[] = ["light", "dark", "system"];

    const items: MenuProps["items"] = modes.map((value) => {
        const Icon = MODE_ICONS[value];
        return {
            key: value,
            label: (
                <span className="app-control__option">
                    <Icon size={15} aria-hidden="true" />
                    <span className="app-control__option-label">{t(`theme.${value}`)}</span>
                    {value === mode && (
                        <FiCheck className="app-control__check" aria-hidden="true" />
                    )}
                </span>
            ),
            onClick: () => setMode(value),
        };
    });

    const CurrentIcon = MODE_ICONS[resolved];

    return (
        <Dropdown
            menu={{ items, selectedKeys: [mode] }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <button
                type="button"
                className="app-control"
                aria-haspopup="menu"
                aria-label={`${t("theme.switch")} — ${t("theme.current", {
                    mode: t(`theme.${mode}`),
                })}`}
            >
                <CurrentIcon size={17} aria-hidden="true" />
                {!compact && (
                    <span className="app-control__text">{t(`theme.${mode}`)}</span>
                )}
            </button>
        </Dropdown>
    );
};

export default ThemeToggle;
