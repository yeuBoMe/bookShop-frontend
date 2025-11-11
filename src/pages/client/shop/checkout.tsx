import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Empty, Steps, App } from "antd";
import {
    ShoppingCartOutlined,
    SolutionOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import { createAnOrderAPI } from "@/services/api.service";
import "styles/client/checkout/checkout.scss";
import CheckoutSuccess from "@/components/client/checkout/checkout-success";
import Cart from "@/components/client/checkout/cart";
import Payment from "@/components/client/checkout/payment";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const { carts, setCarts } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
    const finalTotalPrice = totalPrice + (totalPrice >= 150000 ? 0 : 30000);

    // THÊM: Ref để track đã xử lý VNPay callback chưa
    const hasProcessedVnpay = useRef(false);

    useEffect(() => {
        handleVnpayCallback();
    }, []);

    const handleVnpayCallback = async () => {
        const hash = window.location.hash.slice(1); // trả về phần sau dấu # trong URL và bỏ kí tự đầu.

        // Kiểm tra đã xử lý chưa
        if (hasProcessedVnpay.current) {
            return;
        }

        if (hash === 'vnpay-success') {
            // Đánh dấu đang xử lý
            hasProcessedVnpay.current = true;

            try {
                setIsPaymentLoading(true);
                const pending = localStorage.getItem('pendingVnpayOrder');

                if (!pending) {
                    throw new Error('Không tìm thấy thông tin đơn hàng');
                }

                const orderData = JSON.parse(pending);

                // Xóa pending ngay để tránh retry
                localStorage.removeItem('pendingVnpayOrder');

                const response = await createAnOrderAPI(orderData);

                if (response.data) {
                    localStorage.removeItem('carts');
                    setCarts([]);
                    setCurrentStep(2);
                    notification.success({
                        message: 'Thanh toán thành công!',
                        description: 'Đơn hàng của bạn đã được tạo thành công.'
                    });
                }
            } catch (err: any) {
                // Reset flag nếu lỗi để có thể retry
                hasProcessedVnpay.current = false;

                notification.error({
                    message: 'Lỗi tạo đơn hàng',
                    description: err.message || 'Có lỗi xảy ra khi tạo đơn hàng'
                });
            } finally {
                setIsPaymentLoading(false);
                // Xóa hash khỏi URL
                window.history.replaceState({}, '', '/checkout');
            }
        } else if (hash.startsWith('vnpay-cancel')) {
            // Đánh dấu đã xử lý
            hasProcessedVnpay.current = true;

            const code = hash.split(':')[1];
            // hash lúc này là "vnp_ResponseCode:00".
            // .split(':') tách chuỗi thành mảng: ["vnp_ResponseCode", "00"].
            // Lấy phần tử[1] chính là "00" → mã kết quả thanh toán.
            const errorMessages: Record<string, string> = {
                '07': 'Giao dịch bị nghi ngờ gian lận',
                '09': 'Giao dịch chưa đăng ký InternetBanking',
                '10': 'Xác thực thông tin không chính xác quá 3 lần',
                '11': 'Hết thời gian thanh toán',
                '12': 'Tài khoản bị khóa',
                '13': 'Sai mật khẩu OTP',
                '24': 'Khách hàng hủy giao dịch',
                '51': 'Tài khoản không đủ số dư',
                '65': 'Vượt quá số lần nhập mã OTP',
                '75': 'Ngân hàng đang bảo trì',
                '79': 'Giao dịch vượt quá số tiền cho phép',
                '97': 'Chữ ký không hợp lệ'
            };

            notification.error({
                message: 'Thanh toán thất bại',
                description: code ? (errorMessages[code] || `Mã lỗi: ${code}`) : 'Giao dịch không thành công'
            });

            // Xóa hash và pending order
            localStorage.removeItem('pendingVnpayOrder');
            window.history.replaceState({}, '', '/checkout');
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.forEach((item) => {
                sum += item.detail.price * item.quantity;
            });
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts]);

    const handleContinueToPayment = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToCart = () => {
        setCurrentStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const steps = [
        { title: "Giỏ hàng" },
        { title: "Đặt hàng" },
        { title: "Thanh toán" },
    ];

    if ((!carts || carts.length === 0) && currentStep !== 2) {
        return (
            <div className="cart-page-container">
                <div className="cart-empty">
                    <Empty
                        image={
                            <ShoppingCartOutlined
                                style={{ fontSize: 80, color: "#ccc" }}
                            />
                        }
                        description={
                            <div className="empty-text">
                                <h3>Giỏ hàng của bạn đang trống</h3>
                                <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate("/books")}
                        >
                            Khám phá sản phẩm
                        </Button>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="checkout-steps">
                <Steps
                    current={currentStep}
                    items={steps}
                    responsive={true}
                    className="custom-steps"
                />
            </div>

            <div className="cart-header">
                <h1>
                    {currentStep === 0 && (
                        <>
                            <ShoppingCartOutlined /> Giỏ hàng của bạn
                        </>
                    )}
                    {currentStep === 1 && (
                        <>
                            <SolutionOutlined /> Thông tin đặt hàng
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <CreditCardOutlined /> Thanh toán thành công
                        </>
                    )}
                </h1>
                {currentStep === 0 && (
                    <p className="cart-count">({carts ? carts.length : 0} sản phẩm)</p>
                )}
            </div>

            {currentStep === 0 && (
                <Cart
                    carts={carts || []}
                    setCarts={setCarts}
                    totalPrice={totalPrice}
                    onContinueToPayment={handleContinueToPayment}
                />
            )}

            {currentStep === 1 && (
                <Payment
                    carts={carts || []}
                    totalPrice={totalPrice}
                    finalTotalPrice={finalTotalPrice}
                    isPaymentLoading={isPaymentLoading}
                    setIsPaymentLoading={setIsPaymentLoading}
                    setCurrentStep={setCurrentStep}
                    onBackToCart={handleBackToCart}
                />
            )}

            {currentStep === 2 && <CheckoutSuccess />}
        </div>
    );
};

export default CheckoutPage;