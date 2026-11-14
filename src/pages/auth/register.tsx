import { useState } from 'react';
import type { FormProps } from 'antd';
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();
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

        message.success(t("auth.registerSuccess"));
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error: any) {
      console.log("Check error >>>", error);

      const errorMessage = error?.message;
      notification.error({
        message: t("common.error"),
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
              <h1 className="register-title">{t("auth.registerTitle")}</h1>
              <p className="register-subtitle">{t("auth.registerSubtitle")}</p>

              {/* FORM */}
              <Form
                name="basic"
                layout="vertical"
                form={form}
                onFinish={handleRegisterRequest}
                autoComplete="off"
              >
                <Form.Item<RegisterValues>
                  label={t("field.fullName")}
                  name="fullName"
                  rules={[
                    { required: true, message: t("validate.required", { field: t("field.fullName") }) },
                    { max: 100, message: t("validate.maxLength", { field: t("field.fullName"), max: 100 }) },
                    {
                      pattern: /^[A-Za-zÀ-ỹà-ỹ'\-.\s]{1,100}$/,
                      message: t("validate.nameCharset")
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label={t("field.email")}
                  name="email"
                  rules={[
                    { required: true, message: t("validate.required", { field: t("field.email") }) },
                    { max: 150, message: t("validate.maxLength", { field: t("field.email"), max: 150 }) },
                    {
                      pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/,
                      message: t("validate.emailInvalid")
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label={t("field.password")}
                  name="password"
                  rules={[
                    { required: true, message: t("validate.required", { field: t("field.password") }) },
                    { min: 6, message: t("validate.minLength", { field: t("field.password"), min: 6 }) }
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item<RegisterValues>
                  label={t("field.phone")}
                  name="phone"
                  rules={[
                    { required: true, message: t("validate.required", { field: t("field.phone") }) },
                    {
                      pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                      message: t("validate.phoneInvalid")
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
                      {t("auth.register")}
                    </Button>
                  </div>
                </Form.Item>
              </Form>

              <Divider>{t("auth.or")}</Divider>

              <div className="register-login-link">
                {t("auth.haveAccount")}
                <Link to={"/login"}> {t("auth.login")}</Link>
              </div>

            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer className="register-footer">
        <span className="footer-copy">{t("auth.copyright")}</span>
        <nav className="footer-links">
          <a href="#">{t("auth.privacy")}</a>
          <a href="#">{t("auth.terms")}</a>
          <a href="#">{t("auth.contact")}</a>
        </nav>
      </footer>
    </div>
  );
};

export default RegisterPage;