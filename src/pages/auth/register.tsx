import { useState } from 'react';
import type { FormProps } from 'antd';
import { App, Button, Col, Divider, Form, Input, Row } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '@/services/api.service';
import 'styles/auth/register.scss';

interface RegisterValues {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

const RegisterPage = () => {
  const [form] = Form.useForm<RegisterValues>();
  const navigate = useNavigate();
  const { notification, message } = App.useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegisterRequest: FormProps<RegisterValues>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);

      const { fullName, email, password, phone } = values;
      const registerResponse = await registerAPI(fullName, email, password, phone);

      if (registerResponse?.data) {
        console.log("Check data register >>> ", registerResponse);

        message.success("Tạo tài khoản thành công!");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error: any) {
      console.log("Check error >>>", error);

      const errorMessage = error?.message;
      notification.error({
        message: 'Error',
        description: errorMessage,
        duration: 5,
        placement: 'topRight',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <main className="register-main">
        <Row justify="center" className="register-page">
          <Col xs={22} sm={20} md={16} lg={10} xl={8}>
            <div className="register-card">

              {/* Logo */}
              <div className="register-logo">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
                  <path d="M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3l-1 2h2l1-2h6l1 2h2l-1-2h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 13H5V5h14z" />
                </svg>
              </div>

              {/* Heading */}
              <h1 className="register-title">Tạo tài khoản mới</h1>
              <p className="register-subtitle">Đăng ký để bắt đầu mua sắm tại Laptopshop</p>

              {/* FORM */}
              <Form
                name="basic"
                layout="vertical"
                form={form}
                onFinish={handleRegisterRequest}
                autoComplete="off"
              >
                <Form.Item<RegisterValues>
                  label="Họ và tên:"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Name is required' },
                    { max: 100, message: 'Name must be less than 100 characters' },
                    {
                      pattern: /^[A-Za-zÀ-ỹà-ỹ'\-.\s]{1,100}$/,
                      message: "Name must only contain letters, spaces, apostrophes, dashes or dots"
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label="Email:"
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { max: 150, message: 'Email must not exceed 150 characters' },
                    {
                      pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/,
                      message: "Email format is invalid"
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label="Mật khẩu:"
                  name="password"
                  rules={[
                    { required: true, message: 'Password is required' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label="Số điện thoại:"
                  name="phone"
                  rules={[
                    { required: true, message: 'Phone is required' },
                    {
                      pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                      message: 'Phone number is invalid (Vietnamese format)'
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item className="register-button">
                  <div className="register-buttons-wrapper">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      size="large"
                      className="register-submit-button"
                    >
                      Đăng ký
                    </Button>
                  </div>
                </Form.Item>
              </Form>

              <Divider>Hoặc</Divider>

              <div className="register-login-link">
                Đã có tài khoản?
                <Link to={"/login"}> Đăng nhập</Link>
              </div>

            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer className="register-footer">
        <span className="footer-copy">© Hoài Ninh 2025</span>
        <nav className="footer-links">
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản</a>
          <a href="#">Liên hệ</a>
        </nav>
      </footer>
    </div>
  );
};

export default RegisterPage;