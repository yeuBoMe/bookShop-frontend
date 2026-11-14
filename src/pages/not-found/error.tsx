import { Button, Result } from "antd";
import { Link, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface RouteError {
    statusText?: string;
    message?: string;
}

const ErrorPage = () => {
    const error = useRouteError() as RouteError;
    const { t } = useTranslation();

    return (
        <Result
            status="404"
            title={t("error.oops")}
            // Thông báo của router là tiếng Anh cố định; nếu không có thì dùng
            // câu đã dịch thay vì để trống
            subTitle={error.statusText || error.message || t("error.notFound")}
            extra={
                <Button type="primary">
                    <Link to="/">
                        <span>{t("error.backHome")}</span>
                    </Link>
                </Button>
            }
        />
    );
};

export default ErrorPage;
