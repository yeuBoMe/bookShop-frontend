import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Empty, Steps, App } from "antd";
import { useTranslation } from "react-i18next";
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
import { calculateSubtotal, calculateGrandTotal, clearCart } from "@/services/cart.service";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { notification } = App.useApp();

    const { t } = useTranslation();
    const { carts, setCarts } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
    const finalTotalPrice = calculateGrandTotal(totalPrice);

    const hasProcessedCallback = useRef(false);

    useEffect(() => {
        handlePaymentCallback();
    }, [searchParams]);

    /**
     * CẢNH BÁO BẢO MẬT — cần sửa ở BACKEND, không thể vá triệt để ở đây.
     *
     * Đơn hàng hiện được TẠO Ở FRONTEND sau khi cổng thanh toán redirect về,
     * dựa trên `localStorage.pendingVnpayOrder` và query param `status=success`.
     * Hệ quả:
     *   1. Người dùng tự gõ /checkout?payment=vnpay&status=success là tạo được
     *      đơn "đã thanh toán" mà không trả một đồng nào.
     *   2. `totalPrice` và `status` nằm trong localStorage nên sửa được tùy ý.
     *   3. Trả tiền xong mà đóng tab trước khi redirect => mất tiền, không có đơn.
     *
     * Cách sửa đúng: backend tạo đơn TRƯỚC khi redirect sang cổng (status UNPAID),
     * dùng chính mã đơn làm vnp_TxnRef, rồi IPN/return của cổng mới cập nhật
     * sang PAID sau khi verify chữ ký. Frontend chỉ đọc trạng thái đơn.
     */
    const handlePaymentCallback = async () => {
        // Lấy params từ URL
        const payment = searchParams.get('payment');
        const status = searchParams.get('status');
        const code = searchParams.get('code');

        // Nếu không có payment param hoặc đã xử lý rồi thì return
        if (!payment || hasProcessedCallback.current) {
            return;
        }

        // Đánh dấu đang xử lý
        hasProcessedCallback.current = true;

        try {
            if (payment === 'vnpay') {
                await handleVnpayCallback(status, code);
            } else if (payment === 'momo') {
                await handleMomoCallback(status, code);
            }
        } finally {
            // Xóa query params khỏi URL, giữ lại /checkout sạch
            window.history.replaceState({}, '', '/checkout');
        }
    };

    const handleVnpayCallback = async (status: string | null, code: string | null) => {
        if (status === 'success') {
            setIsPaymentLoading(true);

            try {
                const pending = localStorage.getItem('pendingVnpayOrder');

                if (!pending) {
                    throw new Error(t('checkout.orderNotFound'));
                }

                const orderData = JSON.parse(pending);
                localStorage.removeItem('pendingVnpayOrder');

                const response = await createAnOrderAPI(orderData);

                if (response.data) {
                    setCarts(clearCart());
                    setCurrentStep(2);
                    notification.success({
                        message: t('checkout.vnpaySuccess'),
                        description: t('checkout.orderCreated')
                    });
                }
            } catch (err: any) {
                hasProcessedCallback.current = false;
                notification.error({
                    message: t('checkout.createOrderError'),
                    description: err.message || t('checkout.createOrderErrorDesc')
                });
            } finally {
                setIsPaymentLoading(false);
            }
        } else if (status === 'fail') {

            localStorage.removeItem('pendingVnpayOrder');

            notification.error({
                message: t('checkout.vnpayFailed'),
                description: code
                    ? t(`checkout.vnpayError.${code}`, { defaultValue: t("checkout.errorCode", { code }) })
                    : t("checkout.transactionFailed")
            });
        }
    };

    const handleMomoCallback = async (status: string | null, code: string | null) => {
        if (status === 'success') {
            const pending = localStorage.getItem("pendingMomoOrder");

            if (pending) {
                const orderData = JSON.parse(pending);
                localStorage.removeItem("pendingMomoOrder");

                try {
                    await createAnOrderAPI(orderData);
                    setCarts(clearCart());
                    setCurrentStep(2);
                    notification.success({
                        message: t("checkout.momoSuccess"),
                        description: t('checkout.orderCreated')
                    });
                } catch (err) {
                    hasProcessedCallback.current = false;
                    notification.error({
                        message: t("checkout.createOrderError"),
                        description: t("checkout.createOrderErrorDesc")
                    });
                }
            }
        } else if (status === 'fail') {

            localStorage.removeItem("pendingMomoOrder");

            notification.error({
                message: t("checkout.momoFailed"),
                description: code
                    ? t(`checkout.momoError.${code}`, { defaultValue: t("checkout.errorCode", { code }) })
                    : t("checkout.transactionFailed")
            });
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTotalPrice(calculateSubtotal(carts));
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
        { title: t("checkout.stepCart") },
        { title: t("checkout.stepOrder") },
        { title: t("checkout.stepPay") },
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
                                <h3>{t("checkout.emptyTitle")}</h3>
                                <p>{t("checkout.emptyDesc")}</p>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate("/books")}
                        >
                            {t("checkout.explore")}
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
                            <ShoppingCartOutlined /> {t("checkout.yourCart")}
                        </>
                    )}
                    {currentStep === 1 && (
                        <>
                            <SolutionOutlined /> {t("checkout.orderInfo")}
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <CreditCardOutlined /> {t("checkout.paySuccess")}
                        </>
                    )}
                </h1>
                {currentStep === 0 && (
                    <p className="cart-count">{t("checkout.itemCount", { count: carts ? carts.length : 0 })}</p>
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