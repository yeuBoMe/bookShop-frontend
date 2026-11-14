import { updateUserAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface UserUpdateValues {
    fullName: string;
    email: string;
    phone: string;
}

interface UpdateUserProps {
    isModalUpdateOpen: boolean;
    setIsModalUpdateOpen: (v: boolean) => void;
    dataUpdate: IUserView | null;
    setDataUpdate: (v: IUserView | null) => void;
    refreshTable: () => void;
}

const UpdateUserModal = (props: UpdateUserProps) => {
    const {
        isModalUpdateOpen,
        setIsModalUpdateOpen,
        dataUpdate,
        setDataUpdate,
        refreshTable
    } = props;
    const [form] = Form.useForm<UserUpdateValues>();
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                fullName: dataUpdate.fullName,
                email: dataUpdate.email,
                phone: dataUpdate.phone,
            });
        }
    }, [dataUpdate]);

    const handleUpdateUser: FormProps<UserUpdateValues>['onFinish'] = async (values) => {
        if (!dataUpdate) return;

        try {
            setIsLoading(true);
            const { fullName, phone } = values;
            const updateUserResponse = await updateUserAPI(dataUpdate?.id, fullName, phone);
            if (updateUserResponse.data) {
                handleClearDataAndCloseModal();
                message.success(t("admin.msg.updateSuccess", { entity: t("admin.entity.user") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message,
                duration: 5,
                placement: "topRight",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setDataUpdate(null);
        setIsModalUpdateOpen(false);
    }

    return (
        <>
            <Modal
                title={t("admin.form.updateTitle", { entity: t("admin.entity.user") })}
                okText={t("common.update")}
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
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
                            style={{ marginTop: "10px" }}
                            initialValues={{ remember: true }}
                            onFinish={handleUpdateUser}
                            autoComplete="off"
                        >
                            <Form.Item<UserUpdateValues>
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

                            <Form.Item<UserUpdateValues>
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
                                <Input disabled={true} />
                            </Form.Item>

                            <Form.Item<UserUpdateValues>
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

export default UpdateUserModal;