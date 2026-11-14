import { createUserAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UserCreateValues {
    fullName: string;
    email: string;
    password: string;
    phone: string;
}

interface CreateUserProps {
    isModalCreateOpen: boolean;
    setIsModalCreateOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const CreateUserModal = (props: CreateUserProps) => {
    const { isModalCreateOpen, setIsModalCreateOpen, refreshTable } = props; 
    const [form] = Form.useForm<UserCreateValues>();
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCreateUser: FormProps<UserCreateValues>['onFinish'] = async (values) => {
        setIsLoading(true);

        try {
            const { fullName, email, password, phone } = values;
            const createUserResponse = await createUserAPI(fullName, email, password, phone);

            if (createUserResponse.data) {
                handleClearDataAndCloseModal();
                message.success(t("admin.msg.createSuccess", { entity: t("admin.entity.user") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setIsModalCreateOpen(false);
    }

    return (
        <>
            <Modal
                title={t("admin.form.createTitle", { entity: t("admin.entity.user") })}
                okText={t("common.create")}
                maskClosable={false}
                closable={false}
                open={isModalCreateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
            >
                <Row justify={"center"}>
                    <Col xs={24} md={22} lg={22}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            onFinish={handleCreateUser}
                            style={{ marginTop: "10px" }}
                            autoComplete="off"
                        >
                            <Form.Item<UserCreateValues>
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

                            <Form.Item<UserCreateValues>
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

                            <Form.Item<UserCreateValues>
                                label={t("field.password")}
                                name="password"
                                rules={[
                                    { required: true, message: t("validate.required", { field: t("field.password") }) },
                                    { min: 6, message: t("validate.minLength", { field: t("field.password"), min: 6 }) }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item<UserCreateValues>
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
                        </Form>
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default CreateUserModal;