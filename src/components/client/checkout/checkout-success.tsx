import { useNavigate, useSearchParams } from "react-router-dom";
import { App, Button } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import "styles/client/checkout/order-success.scss";
import { useEffect } from "react";

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {message} = App.useApp();

    useEffect(() => {
        if (searchParams.get("vnp_ResponseCode") === "00") {
            // thành công từ VNPAY return
            message.success("Thanh toán VNPAY thành công!");
        }
    }, []);

    return (
        <div className="order-success-container">
            <div className="success-content">
                <div className="success-icon">
                    <CreditCardOutlined />
                </div>
                <h2>Thanh toán thành công!</h2>
                <p>Cảm ơn bạn đã mua hàng tại BookShop</p>
                <p className="order-info">
                    Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời
                    gian sớm nhất.
                </p>
                <div className="success-actions">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate("/order-history")}
                    >
                        Xem đơn hàng
                    </Button>
                    <Button size="large" onClick={() => navigate("/books")}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;