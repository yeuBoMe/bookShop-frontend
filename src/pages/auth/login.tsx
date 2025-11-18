import { useState } from 'react';
import type { FormProps } from 'antd';
import { App, Button, Col, Divider, Form, Input, Row } from 'antd';
import "styles/auth/login.scss";
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '@/services/api.service';
import { useCurrentApp } from '@/components/context/app.context';

interface LoginValues {
  username: string;
  password: string;
};

const LoginPage = () => {
  const { setUser, setIsAuthenticated } = useCurrentApp();
  const [form] = Form.useForm<LoginValues>();
  const navigate = useNavigate();
  const { notification, message } = App.useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const handleLoginRequest: FormProps<LoginValues>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);
      const loginResponse = await loginAPI(values.username, values.password);

      if (loginResponse?.data) {
        localStorage.setItem("access_token", loginResponse.data.access_token);

        const mappedILoginToIUser: IUser = {
          id: loginResponse.data.user.id,
          fullName: loginResponse.data.user.name,
          email: loginResponse.data.user.email,
          avatar: loginResponse.data.user.avatar || "",
          phone: loginResponse.data.user.phone || "",
          role: loginResponse.data.user.role,
        };
        console.log(">>>>", mappedILoginToIUser)

        setUser(mappedILoginToIUser);
        setIsAuthenticated(true);

        message.success("Đăng nhập thành công!");

        const userRole = mappedILoginToIUser.role?.name;
        const redirectPath = userRole === "ADMIN" ? "/admin" : "/";
        setTimeout(() => {
          navigate(redirectPath);
        }, 500);
      }
    } catch (error: any) {
      console.log("Check data error >>> ", error);
      // notification.error({
      //   message: "Error",
      //   description: error?.message && Array.isArray(error.message)
      //     ? error.message[0]
      //     : error.message,
      //   duration: 5,
      //   placement: 'topRight'
      // });
      notification.error({
        message: "Error",
        description: "Tài khoản đăng nhập không chính xác",
        duration: 5,
        placement: 'topRight'
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = 'http://localhost:8080/api/v1/auth/login/google';
  };

  return (
    <Row justify={"center"} className="login-page">
      <Col xs={22} sm={20} md={16} lg={10} xl={8}>
        <fieldset className="login-fieldset">
          <legend className="login-legend">
            Đăng nhập
          </legend>

          <Form
            name="basic"
            layout="vertical"
            form={form}
            onFinish={handleLoginRequest}
            autoComplete="off"
          >
            <Form.Item<LoginValues>
              label="Email:"
              name="username"
              rules={[
                { required: true, message: 'Email is required' },
                { max: 150, message: 'Email must not exceed 150 characters' },
                {
                  pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/,
                  message: "Email format is invalid"
                }
              ]}
            >
              <Input size="large" placeholder="example@email.com" />
            </Form.Item>

            <Form.Item<LoginValues>
              label="Mật khẩu:"
              name="password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password size="large" placeholder="••••••••" />
            </Form.Item>

            <Form.Item className="login-button">
              <div className="login-buttons-wrapper">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  size="large"
                  className="login-submit-button"
                >
                  Đăng nhập
                </Button>
                <Button
                  loading={isGoogleLoading}
                  onClick={handleGoogleLogin}
                  size="large"
                  className="google-login-button"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <g fill="none" fillRule="evenodd">
                        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                      </g>
                    </svg>
                  }
                />
              </div>
            </Form.Item>
          </Form>

          <Divider>Hoặc</Divider>

          <div className="login-register-link">
            Chưa có tài khoản?
            <Link to={"/register"}> Đăng ký</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default LoginPage;