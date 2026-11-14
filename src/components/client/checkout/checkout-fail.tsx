import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "styles/client/checkout/order-fail.scss";

const CheckoutFail = () => {
    const navigate = useNavigate();

    const { t } = useTranslation();

    return (
        <div className="order-fail-container">
            <div className="fail-content">
                <div className="fail-icon">
                    <CloseCircleOutlined />
                </div>
                <h2>{t("checkout.failTitle")}</h2>
                <p>{t("checkout.failLead")}</p>
                <p className="order-info">
                    {t("checkout.failNote1")}
                    {t("checkout.failNote2")}
                </p>
                <div className="fail-actions">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate("/books")}
                    >
                        {t("checkout.retry")}
                    </Button>
                    <Button size="large" onClick={() => navigate("/")}>
                        {t("checkout.backHome")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutFail;
