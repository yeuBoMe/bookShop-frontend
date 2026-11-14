import { Dropdown, type MenuProps } from "antd";
import { FiCheck, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/i18n";
import "styles/common/app-controls.scss";

/**
 * Nút đổi ngôn ngữ — dùng CHUNG cho cả trang bán hàng và khu quản trị.
 *
 * Bấm vào hiện hai lựa chọn: Tiếng Việt và English. Lựa chọn được lưu ở
 * localStorage (xem src/i18n) nên giữ nguyên sau khi tải lại trang.
 *
 * Về khả năng tiếp cận: cờ chỉ là hình trang trí (aria-hidden) vì cờ quốc gia
 * không đại diện cho ngôn ngữ; phần trình đọc màn hình đọc được nằm ở
 * aria-label và nhãn chữ trong menu.
 */
const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
    const { i18n, t } = useTranslation();

    const current =
        SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ??
        SUPPORTED_LANGUAGES[0];

    const items: MenuProps["items"] = SUPPORTED_LANGUAGES.map((language) => ({
        key: language.code,
        label: (
            <span className="app-control__option">
                <span aria-hidden="true">{language.flag}</span>
                <span className="app-control__option-label">{language.label}</span>
                {language.code === current.code && (
                    <FiCheck className="app-control__check" aria-hidden="true" />
                )}
            </span>
        ),
        onClick: () => i18n.changeLanguage(language.code as LanguageCode),
    }));

    return (
        <Dropdown
            menu={{ items, selectedKeys: [current.code] }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <button
                type="button"
                className="app-control"
                aria-haspopup="menu"
                aria-label={`${t("language.switch")} — ${t("language.current", {
                    language: current.label,
                })}`}
            >
                <FiGlobe size={17} aria-hidden="true" />
                {!compact && (
                    <span className="app-control__text">
                        {current.code.toUpperCase()}
                    </span>
                )}
            </button>
        </Dropdown>
    );
};

export default LanguageSwitcher;
