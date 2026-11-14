import type React from "react";
import { useTranslation } from "react-i18next";
import { useCurrentApp } from "@/components/context/app.context";
import { Button, Result } from "antd";
import { Link, Navigate, useLocation } from "react-router-dom";

interface IProps {
    children: React.ReactNode;
    /** Bắt buộc quyền ADMIN mới vào được (dùng cho nhánh /admin). */
    requireAdmin?: boolean;
}

const ProtectedRoute = (props: IProps) => {
    const { children, requireAdmin = false } = props;
    const { isAuthenticated, user } = useCurrentApp();
    const location = useLocation();

    const { t } = useTranslation();

    /**
     * Chưa đăng nhập → chuyển thẳng tới /login và nhớ trang đang muốn vào.
     *
     * Trước đây trường hợp này hiển thị màn hình "404 - trang không tồn tại",
     * vừa sai ngữ nghĩa (401/403 chứ không phải 404) vừa khiến người dùng
     * bị mất trang đang định vào sau khi đăng nhập xong.
     */
    if (!isAuthenticated) {
        const redirectTo = location.pathname + location.search;
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
    }

    /**
     * Đã đăng nhập nhưng không đủ quyền.
     *
     * Quyền được xác định bằng prop `requireAdmin` do route khai báo, thay vì
     * đoán từ `location.pathname.includes("admin")` như trước — cách cũ sẽ nhận
     * nhầm bất kỳ URL nào có chữ "admin" (ví dụ /books/admin-guide).
     */
    if (requireAdmin && user?.role?.name !== "ADMIN") {
        return (
            <Result
                status="403"
                title="403"
                subTitle={t("error.forbidden")}
                extra={
                    <Button type="primary">
                        <Link to="/">{t("error.backHome")}</Link>
                    </Button>
                }
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
