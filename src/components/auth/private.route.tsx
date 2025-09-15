import type React from "react";
import { useCurrentApp } from "@/components/context/app.context";
import { Button, Result } from "antd";
import { Link, useLocation } from "react-router-dom";

interface IProps {
    children: React.ReactNode;  
}

const ProtectedRoute = (props: IProps) => {
    const { isAuthenticated, user } = useCurrentApp();
    const location = useLocation();
    const isAdminRoute = location.pathname.includes("admin");

    if (isAuthenticated === true) {
        if (isAdminRoute === true) {
            const roleOfCurrentUser = user?.role?.name;
            if (!roleOfCurrentUser || roleOfCurrentUser !== "ADMIN") {
                return (
                    <Result
                        status="403"
                        title="Unauthorize!"
                        subTitle="Sorry, you are not authorized to access this page."
                        extra={
                            <Button type="primary">
                                <Link to="/">
                                    <span>Back Home</span>
                                </Link>
                            </Button>
                        }
                    />
                );
            }
            return <>{props.children}</>;
        }
    }

    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary">
                    <Link to="/">Back Home</Link>
                </Button>
            }
        />
    );
};

export default ProtectedRoute;