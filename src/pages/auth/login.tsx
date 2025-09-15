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

  const handleLoginRequest: FormProps<LoginValues>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);

      const loginResponse = await loginAPI(values.username, values.password);

      if (loginResponse?.data) {
        localStorage.setItem("access_token", loginResponse.data.access_token);

        const mappedILoginToIUser: IUser = {
          id: loginResponse.data.user.id,
          fullName: loginResponse.data.user.name, // map từ name → fullName
          email: loginResponse.data.user.email,
          avatar: loginResponse.data.user.avatar || "",
          phone: loginResponse.data.user.phone || "",  // nếu API không trả thì tạm gán ""
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
        }, 500); // Chuyển hướng sau 0.5 giây
      }
    } catch (error: any) {
      console.log("Check data error >>> ", error);
      notification.error({
        message: "Error",
        description: error?.message && Array.isArray(error.message)
          ? error.message[0]
          : error.message,
        duration: 5,
        placement: 'topRight'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const onFinishFailed: FormProps<LoginValues>['onFinishFailed'] = (errorInfo) => {
  //   console.log('Failed:', errorInfo);
  // };

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
            // onFinishFailed={onFinishFailed}
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
              <Input />
            </Form.Item>

            <Form.Item<LoginValues>
              label="Mật khẩu:"
              name="password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item className="login-button">
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Đăng nhập
              </Button>
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