import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    App,
    Button,
    InputNumber,
    Empty,
    Popconfirm,
    Steps,
    Form,
    Input,
    Radio,
} from "antd";
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    MinusOutlined,
    PlusOutlined,
    ShoppingOutlined,
    SolutionOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import "styles/client/checkout.scss";

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
    const [form] = Form.useForm<UserCheckoutValues>();
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");

    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map((item) => {
                sum += item.detail.price * item.quantity;
            });
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }

        if (user && currentStep === 1) {
            console.log(">>> user ", user)
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            });
        }
    }, [carts, user, currentStep]);

    const handleUpdateQuantity = (bookId: number, newQuantity: number) => {
        if (!carts) return;
        const updatedCarts = carts.map((item) => {
            if (item.id === bookId) {
                if (newQuantity > item.detail.quantity) {
                    message.warning(`Chỉ còn ${item.detail.quantity} sản phẩm`);
                    return { ...item, quantity: item.detail.quantity };
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        setCarts(updatedCarts);
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
    };

    const handleRemoveItem = (bookId: number) => {
        if (!carts) return;
        const updatedCarts = carts.filter((item) => item.id !== bookId);
        setCarts(updatedCarts);
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
        message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    const handleClearCart = () => {
        setCarts([]);
        localStorage.removeItem("carts");
        message.success("Đã xóa tất cả sản phẩm");
    };

    const handleContinueToPayment = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToCart = () => {
        setCurrentStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePayment = async (values: any) => {
        // Logic thanh toán sẽ được thêm vào đây
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
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
                <div className="cart-content">
                    <div className="cart-items-section">
                        <div className="cart-items-header">
                            <span className="header-product">Sản phẩm</span>
                            <span className="header-price">Đơn giá</span>
                            <span className="header-quantity">Số lượng</span>
                            <span className="header-total">Thành tiền</span>
                            <span className="header-action">Thao tác</span>
                        </div>

                        <div className="cart-items-list">
                            {carts.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-product">
                                        <img
                                            src={
                                                item.detail.images &&
                                                    item.detail.images.length > 0
                                                    ? `${baseUrl}/upload/book/${item.detail.images[0]}`
                                                    : "https://via.placeholder.com/100x130?text=No+Image"
                                            }
                                            alt={item.detail.name}
                                        />
                                        <div className="item-info">
                                            <h3
                                                className="item-name"
                                                onClick={() => navigate(`/books/${item.id}`)}
                                            >
                                                {item.detail.name}
                                            </h3>
                                            <p className="item-category">
                                                {item.detail.category}
                                            </p>
                                            <p className="item-stock">
                                                Còn lại: {item.detail.quantity} sản phẩm
                                            </p>
                                        </div>
                                    </div>

                                    <div className="item-price">
                                        {formatPrice(item.detail.price)}
                                    </div>

                                    <div className="item-quantity">
                                        <div className="quantity-control">
                                            <Button
                                                size="small"
                                                icon={<MinusOutlined />}
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        Math.max(1, item.quantity - 1)
                                                    )
                                                }
                                                disabled={item.quantity <= 1}
                                            />
                                            <InputNumber
                                                min={1}
                                                max={item.detail.quantity}
                                                value={item.quantity}
                                                onChange={(value) =>
                                                    handleUpdateQuantity(item.id, value || 1)
                                                }
                                                controls={false}
                                                className="quantity-input"
                                            />
                                            <Button
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() =>
                                                    handleUpdateQuantity(item.id, item.quantity + 1)
                                                }
                                                disabled={item.quantity >= item.detail.quantity}
                                            />
                                        </div>
                                    </div>

                                    <div className="item-total">
                                        {formatPrice(item.detail.price * item.quantity)}
                                    </div>

                                    <div className="item-action">
                                        <Popconfirm
                                            title="Xóa sản phẩm"
                                            description="Bạn có chắc muốn xóa sản phẩm này?"
                                            onConfirm={() => handleRemoveItem(item.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-actions">
                            <Popconfirm
                                title="Xóa tất cả sản phẩm"
                                description="Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?"
                                onConfirm={handleClearCart}
                                okText="Xóa tất cả"
                                cancelText="Hủy"
                            >
                                <Button icon={<DeleteOutlined />} danger>
                                    Xóa tất cả
                                </Button>
                            </Popconfirm>
                            <Button onClick={() => navigate("/books")}>
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    </div>

                    <div className="cart-summary-section">
                        <div className="summary-card">
                            <h2>Thông tin đơn hàng</h2>

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

                            {totalPrice >= 150000 && (
                                <div className="summary-promotion">
                                    <span>🎉 Bạn được miễn phí vận chuyển!</span>
                                </div>
                            )}

                            {totalPrice < 150000 && (
                                <div className="summary-note">
                                    Mua thêm{" "}
                                    <strong>{formatPrice(150000 - totalPrice)}</strong> để
                                    được freeship
                                </div>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Tổng cộng:</span>
                                <span className="total-value">
                                    {formatPrice(
                                        totalPrice + (totalPrice >= 150000 ? 0 : 30000)
                                    )}
                                </span>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                className="checkout-btn"
                                onClick={handleContinueToPayment}
                            >
                                Tiến hành đặt hàng
                            </Button>

                            <div className="summary-guarantee">
                                <h3>🛡️ Cam kết từ BookShop</h3>
                                <ul>
                                    <li>✓ Sản phẩm chính hãng 100%</li>
                                    <li>✓ Đổi trả miễn phí trong 7 ngày</li>
                                    <li>✓ Hỗ trợ 24/7</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bước 2: Đặt hàng */}
            {currentStep === 1 && (
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
                                    name="fullName"
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
                                    <Button size="large" onClick={handleBackToCart}>
                                        Quay lại giỏ hàng
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        htmlType="submit"
                                        className="submit-order-btn"
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
            )}

            {/* Bước 3: Thanh toán */}
            {currentStep === 2 && (
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
            )}
        </div>
    );
};

export default CheckoutPage;