import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "styles/client/checkout/order-fail.scss";

const CheckoutFail = () => {
    const navigate = useNavigate();

    return (
        <div className="order-fail-container">
            <div className="fail-content">
                <div className="fail-icon">
                    <CloseCircleOutlined />
                </div>
                <h2>Thanh toán thất bại</h2>
                <p>Rất tiếc, giao dịch của bạn chưa được thực hiện thành công.</p>
                <p className="order-info">
                    Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.
                    Nếu đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ của BookShop để được xử lý.
                </p>
                <div className="fail-actions">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate("/books")}
                    >
                        Thử lại
                    </Button>
                    <Button size="large" onClick={() => navigate("/")}>
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutFail;
