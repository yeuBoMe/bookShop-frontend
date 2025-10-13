import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Empty, Steps } from "antd";
import {
    ShoppingCartOutlined,
    SolutionOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import "styles/client/checkout/checkout.scss";
import OrderSuccess from "@/components/client/checkout/order-success";
import Cart from "@/components/client/checkout/cart";
import Payment from "@/components/client/checkout/payment";

interface UserCheckoutValues {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
}

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user, carts, setCarts } = useCurrentApp();
    const { message } = App.useApp();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map((item) => {
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

    const handlePaymentSubmit = (values: UserCheckoutValues) => {
        // Logic thanh toán sẽ được thêm vào đây
        console.log(">>> data order ", values);

        // Giả lập thanh toán thành công
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const steps = [
        { title: "Giỏ hàng" },
        { title: "Đặt hàng" },
        { title: "Thanh toán" },
    ];

    if (!carts || carts.length === 0) {
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
            {/* Steps Component */}
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
                    <p className="cart-count">({carts.length} sản phẩm)</p>
                )}
            </div>

            {/* Bước 1: Giỏ hàng */}
            {currentStep === 0 && (
                <Cart
                    carts={carts}
                    setCarts={setCarts}
                    totalPrice={totalPrice}
                    onContinueToPayment={handleContinueToPayment}
                />
            )}

            {/* Bước 2: Đặt hàng */}
            {currentStep === 1 && (
                <Payment
                    carts={carts}
                    totalPrice={totalPrice}
                    user={user}
                    onBackToCart={handleBackToCart}
                    onPaymentSubmit={handlePaymentSubmit}
                />
            )}

            {/* Bước 3: Thanh toán */}
            {currentStep === 2 && <OrderSuccess />}
        </div>
    );
};

export default CheckoutPage;