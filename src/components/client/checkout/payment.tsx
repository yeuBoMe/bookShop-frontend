import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { App, Button, Form, Input, Radio, type FormProps } from "antd";
import { ShoppingOutlined, CreditCardOutlined, QrcodeOutlined } from "@ant-design/icons";
import "styles/client/checkout/payment.scss";
import { useCurrentApp } from "@/components/context/app.context";
import { createAnOrderAPI, createMomopayUrlAPI, createVnpayUrlAPI } from "@/services/api.service";
import { clearCart, calculateShippingFee } from "@/services/cart.service";
import { formatPrice, getBookImageUrl } from "@/services/helper";

interface UserCheckoutValues {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
}

interface PaymentProps {
    carts: ICart[];
    totalPrice: number;
    finalTotalPrice: number;
    isPaymentLoading: boolean;
    setIsPaymentLoading: (v: boolean) => void;
    setCurrentStep: (v: number) => void;
    onBackToCart: () => void;
}

const Payment = (props: PaymentProps) => {
    const { user, setCarts } = useCurrentApp();
    const {
        carts,
        totalPrice,
        finalTotalPrice,
        isPaymentLoading,
        setIsPaymentLoading,
        setCurrentStep,
        onBackToCart,
    } = props;
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [form] = Form.useForm<UserCheckoutValues>();
    const [_paymentMethod, setPaymentMethod] = useState<string>("cod");

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.fullName,
                email: user.email,
                phone: user.phone
            });
        }
    }, [user]);

    const createOrderAndSuccess = async (values: UserCheckoutValues, successMessage: string) => {
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

        if (createOrderResponse.data) {
            setCarts(clearCart());
            message.success(successMessage);
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    const handlePayment: FormProps<UserCheckoutValues>['onFinish'] = async (values) => {
        if (!carts) return;

        try {
            setIsPaymentLoading(true);

            if (values.paymentMethod === "vnpay") {
                const orderInfo = JSON.stringify({
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    address: values.address,
                    paymentMethod: values.paymentMethod,
                    totalPrice: finalTotalPrice,
                    status: "PAID",
                    detail: carts.map((item) => ({
                        book: { id: item.id },
                        quantity: item.quantity,
                        bookName: item.detail.name
                    }))
                });

                // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi return
                localStorage.setItem("pendingVnpayOrder", orderInfo);

                const vnPayUrl = await createVnpayUrlAPI(finalTotalPrice, `Order_${Date.now()}`);

                if (vnPayUrl.data) {
                    window.location.href = vnPayUrl.data.paymentUrl;
                }
                return;
            }

            if (values.paymentMethod === "momo") {
                const orderInfo = JSON.stringify({
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    address: values.address,
                    paymentMethod: values.paymentMethod,
                    totalPrice: finalTotalPrice,
                    status: "PAID",
                    detail: carts.map((item) => ({
                        book: { id: item.id },
                        quantity: item.quantity,
                        bookName: item.detail.name
                    }))
                });

                // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi return
                localStorage.setItem("pendingMomoOrder", orderInfo);

                const momoPayUrl = await createMomopayUrlAPI(finalTotalPrice, `Order_${Date.now()}`);

                if (momoPayUrl.data) {
                    window.location.href = momoPayUrl.data.paymentUrl;
                }
                return;
            }

            if (values.paymentMethod === "cod") {
                await createOrderAndSuccess(values, t("payment.codSuccess"));
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message || "An error happens when handle payment",
                duration: 5,
                placement: "topRight",
            });
        } finally {
            setIsPaymentLoading(false);
        }
    };

    return (
        <>
            <div className="cart-content">
                <div className="cart-items-section">
                    <div className="payment-info-section">
                        <h3>{t("payment.recipient")}</h3>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handlePayment}
                            initialValues={{
                                paymentMethod: "cod",
                            }}
                        >
                            <Form.Item<UserCheckoutValues>
                                label={t("field.fullName")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("validate.required", { field: t("field.fullName") }),
                                    },
                                    {
                                        min: 3,
                                        message: t("validate.minLength", { field: t("field.fullName"), min: 3 }),
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label={t("field.email")}
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: t("validate.required", { field: t("field.email") }),
                                    },
                                    { type: "email", message: t("validate.emailInvalidShort") },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label={t("field.phone")}
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: t("validate.required", { field: t("field.phone") }),
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: t("validate.phoneDigits"),
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label={t("field.address")}
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: t("validate.required", { field: t("field.address") }),
                                    },
                                    {
                                        min: 10,
                                        message: t("validate.minLength", { field: t("field.address"), min: 10 }),
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    size="large"
                                    rows={3}
                                    placeholder={t("payment.addressPlaceholder")}
                                />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label={t("payment.method")}
                                name="paymentMethod"
                            >
                                <Radio.Group
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="payment-methods"
                                >
                                    <Radio value="cod" className="payment-radio">
                                        <div className="payment-option">
                                            <ShoppingOutlined style={{ fontSize: 20 }} />
                                            <div>
                                                <strong>
                                                    {t("payment.cod")}
                                                </strong>
                                                <p>{t("payment.codNote")}</p>
                                            </div>
                                        </div>
                                    </Radio>
                                    <Radio value="momo" className="payment-radio">
                                        <div className="payment-option">
                                            <QrcodeOutlined style={{ fontSize: 20 }} />
                                            <div>
                                                <strong>{t("payment.momo")}</strong>
                                                <p>{t("payment.momoNote")}</p>
                                            </div>
                                        </div>
                                    </Radio>
                                    <Radio value="vnpay" className="payment-radio">
                                        <div className="payment-option">
                                            <CreditCardOutlined style={{ fontSize: 20 }} />
                                            <div>
                                                <strong>{t("payment.vnpay")}</strong>
                                                <p>{t("payment.vnpayNote")}</p>
                                            </div>
                                        </div>
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>

                            <div className="payment-actions">
                                <Button size="large" onClick={onBackToCart}>
                                    {t("payment.backToCart")}
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    className="submit-order-btn"
                                    loading={isPaymentLoading}
                                >
                                    {t("payment.pay")}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>

                <div className="cart-summary-section">
                    <div className="summary-card">
                        <h2>{t("payment.orderDetail")}</h2>

                        <div className="order-items-summary">
                            {carts.map((item) => (
                                <div key={item.id} className="order-item-summary">
                                    <img
                                        src={getBookImageUrl(item.detail.images)}
                                        alt={item.detail.name}
                                    />
                                    <div className="order-item-info">
                                        <p className="order-item-name">
                                            {item.detail.name}
                                        </p>
                                        <p className="order-item-quantity">
                                            x{item.quantity}
                                        </p>
                                    </div>
                                    <div className="order-item-price">
                                        {formatPrice(item.detail.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-item">
                            <span>{t("payment.subtotal")}</span>
                            <span className="summary-value">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>

                        <div className="summary-item">
                            <span>{t("payment.shipping")}</span>
                            <span className="summary-value">
                                {calculateShippingFee(totalPrice) === 0 ? (
                                    <span className="free-ship">{t("payment.free")}</span>
                                ) : (
                                    formatPrice(calculateShippingFee(totalPrice))
                                )}
                            </span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>{t("payment.grandTotal")}</span>
                            <span className="total-value">
                                {formatPrice(finalTotalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payment;



