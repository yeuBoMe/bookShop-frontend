import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { App, Button } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import "styles/client/checkout/order-success.scss";
import { useEffect } from "react";

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {message} = App.useApp();

    const { t } = useTranslation();

    useEffect(() => {
        if (searchParams.get("vnp_ResponseCode") === "00") {
            // thành công từ VNPAY return
            message.success(t("checkout.vnpaySuccess"));
        }
    }, []);

    return (
        <div className="order-success-container">
            <div className="success-content">
                <div className="success-icon">
                    <CreditCardOutlined />
                </div>
                <h2>{t("checkout.successTitle")}</h2>
                <p>{t("checkout.successThanks")}</p>
                <p className="order-info">
                    {t("checkout.successNote")}
                </p>
                <div className="success-actions">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate("/order-history")}
                    >
                        {t("checkout.viewOrders")}
                    </Button>
                    <Button size="large" onClick={() => navigate("/books")}>
                        {t("checkout.keepShopping")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;