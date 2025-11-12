import { useEffect, useState } from "react";
import { App, Button, Form, Input, Modal, Radio, type FormProps } from "antd";
import { ShoppingOutlined, CreditCardOutlined } from "@ant-design/icons";
import "styles/client/checkout/payment.scss";
import { useCurrentApp } from "@/components/context/app.context";
import { createAnOrderAPI, createVnpayUrlAPI } from "@/services/api.service";

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
    const [form] = Form.useForm<UserCheckoutValues>();
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");
    const [isModalQROpen, setIsModalQROpen] = useState<boolean>(false);
    const [qrMessage, setQrMessage] = useState<string>("");
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.fullName,
                email: user.email,
                phone: user.phone
            });
        }
    }, [user]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

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
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (createOrderResponse.data) {
            localStorage.removeItem("carts");
            setCarts([]);
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
                await new Promise((resolve) => setTimeout(resolve, 1000));

                if (vnPayUrl.data) {
                    window.location.href = vnPayUrl.data.paymentUrl;
                }
                return;
            }

            if (values.paymentMethod === "banking") {
                const dynamicMessage = `Thanh toan don hang ${Date.now()}`;
                setQrMessage(dynamicMessage);
                setIsModalQROpen(true);
            }

            if (values.paymentMethod === "cod") {
                await createOrderAndSuccess(values, "Thanh toán COD thành công!");
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

    const handleConfirmTransfer = async () => {
        try {
            const values = form.getFieldsValue();
            setIsModalQROpen(false);
            await createOrderAndSuccess(values, "Thủ tục thanh toán mã QR sẽ được kiểm tra, bạn chờ lát nhé!");
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "Lỗi khi xác nhận thanh toán!",
                duration: 5,
                placement: "topRight",
            });
            console.log("error order banking >>>", error);
        }
    };

    return (
        <>
            <div className="cart-content">
                <div className="cart-items-section">
                    <div className="payment-info-section">
                        <h3>Thông tin người nhận</h3>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handlePayment}
                            initialValues={{
                                paymentMethod: "cod",
                            }}
                        >
                            <Form.Item<UserCheckoutValues>
                                label="Họ và tên:"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập họ tên!",
                                    },
                                    {
                                        min: 3,
                                        message: "Họ tên phải có ít nhất 3 ký tự!",
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label="Email:"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập email!",
                                    },
                                    { type: "email", message: "Email không hợp lệ!" },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label="Số điện thoại:"
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số điện thoại!",
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: "Số điện thoại phải có 10 chữ số!",
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label="Địa chỉ:"
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập địa chỉ!",
                                    },
                                    {
                                        min: 10,
                                        message: "Địa chỉ phải có ít nhất 10 ký tự!",
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    size="large"
                                    rows={3}
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </Form.Item>

                            <Form.Item<UserCheckoutValues>
                                label="Hình thức thanh toán"
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
                                                    Thanh toán khi nhận hàng (COD)
                                                </strong>
                                                <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                        </div>
                                    </Radio>
                                    <Radio value="banking" className="payment-radio">
                                        <div className="payment-option">
                                            <CreditCardOutlined style={{ fontSize: 20 }} />
                                            <div>
                                                <strong>Chuyển khoản ngân hàng</strong>
                                                <p>Chuyển khoản qua tài khoản ngân hàng</p>
                                            </div>
                                        </div>
                                    </Radio>
                                    <Radio value="vnpay" className="payment-radio">
                                        <div className="payment-option">
                                            <CreditCardOutlined style={{ fontSize: 20 }} />
                                            <div>
                                                <strong>Ví VNPay</strong>
                                                <p>Thanh toán trực tuyến qua cổng VNPay</p>
                                            </div>
                                        </div>
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>

                            <div className="payment-actions">
                                <Button size="large" onClick={onBackToCart}>
                                    Quay lại giỏ hàng
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    className="submit-order-btn"
                                    loading={isPaymentLoading}
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>

                <div className="cart-summary-section">
                    <div className="summary-card">
                        <h2>Chi tiết đơn hàng</h2>

                        <div className="order-items-summary">
                            {carts.map((item) => (
                                <div key={item.id} className="order-item-summary">
                                    <img
                                        src={
                                            item.detail.images &&
                                                item.detail.images.length > 0
                                                ? `${baseUrl}/upload/book/${item.detail.images[0]}`
                                                : "https://via.placeholder.com/50x65?text=No+Image"
                                        }
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
                            <span>Tạm tính:</span>
                            <span className="summary-value">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>

                        <div className="summary-item">
                            <span>Phí vận chuyển:</span>
                            <span className="summary-value">
                                {totalPrice >= 150000 ? (
                                    <span className="free-ship">Miễn phí</span>
                                ) : (
                                    formatPrice(30000)
                                )}
                            </span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Tổng cộng:</span>
                            <span className="total-value">
                                {formatPrice(
                                    totalPrice + (totalPrice >= 150000 ? 0 : 30000)
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={isModalQROpen}
                width={"50vw"}
                className="qr-payment-modal"
                title="Quét mã QR để thanh toán"
                closable={false}
                maskClosable={false}
                onCancel={() => setIsModalQROpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalQROpen(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        onClick={handleConfirmTransfer}
                        loading={isPaymentLoading}
                    >
                        Tôi đã chuyển khoản
                    </Button>,
                ]}
            >
                <div className="qr-modal-content">
                    <div className="qr-image-wrapper">
                        <img
                            src={`https://img.vietqr.io/image/970415-888850105888-compact2.png?amount=${finalTotalPrice}&addInfo=${encodeURIComponent(qrMessage)}&accountName=LY%20HOAI%20NINH`}
                            alt="QR VietQR"
                            className="qr-image"
                        />
                    </div>
                    <div className="qr-info">
                        <div className="qr-info-item">
                            <strong>Số tiền:</strong>
                            <span className="amount">{formatPrice(finalTotalPrice)}</span>
                        </div>
                        <div className="qr-info-item">
                            <strong>Lời nhắn:</strong>
                            <span>{qrMessage}</span>
                        </div>
                        <div className="qr-info-item">
                            <strong>Ngân hàng:</strong>
                            <span>Vietinbank - LY HOAI NINH</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Payment;