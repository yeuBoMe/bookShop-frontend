import { Button, Result } from "antd";
import { Link, useRouteError } from "react-router-dom";

interface RouteError {
    statusText?: string;
    message?: string;
}

const ErrorPage = () => {
    const error = useRouteError() as RouteError;

    return (
        <Result
            status="404"
            title="Oops"
            subTitle={error.statusText || error.message}
            extra={
                <Button type="primary">
                    <Link to="/">
                        <span>Back Home</span>
                    </Link>
                </Button>
            }
        />
    );
};

export default ErrorPage;