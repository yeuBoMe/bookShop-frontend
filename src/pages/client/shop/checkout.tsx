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
import CheckoutSuccess from "@/components/client/checkout/checkout-success";
import Cart from "@/components/client/checkout/cart";
import Payment from "@/components/client/checkout/payment";
import { createAnOrderAPI } from "@/services/api.service";

interface UserCheckoutValues {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
}

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { carts, setCarts } = useCurrentApp();
    const { notification, message } = App.useApp();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
    const finalTotalPrice = totalPrice + (totalPrice >= 150000 ? 0 : 30000);

    console.log("Check cart >>> ", carts)

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

    const handlePaymentSubmit = async (values: UserCheckoutValues) => {
        // Logic thanh toán sẽ được thêm vào đây
        // console.log(">>> data order ", values);
        if (!carts) return;
        if (values.paymentMethod === "vnpay") return;

        try {
            setIsPaymentLoading(true);

            const orderData = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                address: values.address,
                paymentMethod: values.paymentMethod,
                totalPrice: finalTotalPrice,
                status: "PENDING",
                detail: carts.map((item) => ({
                    book: { id: item.id },
                    quantity: item.quantity,
                    bookName: item.detail.name
                }))
            };

            const createOrderResponse = await createAnOrderAPI(orderData);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            if (createOrderResponse.data) {
                console.log(">>> order data: ", createOrderResponse)
                message.success("Thanh toán thành công!");
                localStorage.removeItem("carts");
                setCarts([]);

                // Giả lập thanh toán thành công
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "An error happens when handle payment",
                duration: 5,
                placement: "topRight",
            });
            console.log("error order >>>", error);
        } finally {
            setIsPaymentLoading(false);
        }
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
                    <p className="cart-count">({carts ? carts.length : 0} sản phẩm)</p>
                )}
            </div>

            {/* Bước 1: Giỏ hàng */}
            {currentStep === 0 && (
                <Cart
                    carts={carts || []}
                    setCarts={setCarts}
                    totalPrice={totalPrice}
                    onContinueToPayment={handleContinueToPayment}
                />
            )}

            {/* Bước 2: Đặt hàng */}
            {currentStep === 1 && (
                <Payment
                    carts={carts || []}
                    totalPrice={totalPrice}
                    finalTotalPrice={finalTotalPrice}
                    isPaymentLoading={isPaymentLoading}
                    setIsPaymentLoading={setIsPaymentLoading}
                    onBackToCart={handleBackToCart}
                    onPaymentSubmit={handlePaymentSubmit}
                />
            )}

            {/* Bước 3: Thanh toán */}
            {currentStep === 2 && <CheckoutSuccess />}
        </div>
    );
};

export default CheckoutPage;