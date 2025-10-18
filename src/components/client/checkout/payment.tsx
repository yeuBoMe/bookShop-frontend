import { useEffect, useState } from "react";
import { Button, Form, Input, Radio, type FormProps } from "antd";
import { ShoppingOutlined, CreditCardOutlined } from "@ant-design/icons";
import "styles/client/checkout/payment.scss";
import { useCurrentApp } from "@/components/context/app.context";

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
    isPaymentLoading: boolean;
    onBackToCart: () => void;
    onPaymentSubmit: (values: UserCheckoutValues) => void;
}

const Payment = (props: PaymentProps) => {
    const { user } = useCurrentApp();
    const { carts, totalPrice, isPaymentLoading, onBackToCart, onPaymentSubmit } = props;
    const [form] = Form.useForm<UserCheckoutValues>();
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");
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

    const handlePayment: FormProps<UserCheckoutValues>['onFinish'] = async (values) => {
        onPaymentSubmit(values);
    };

    return (
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
    );
};

export default Payment;