import { createUserAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useState } from "react";

interface UserCreateValues {
    fullName: string;
    email: string;
    password: string;
    phone: string;
}

interface CreateUserProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const CreateUserModal = (props: CreateUserProps) => {
    const { isModalOpen, setIsModalOpen, refreshTable } = props;

    const [form] = Form.useForm<UserCreateValues>();
    const { notification, message } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCreateUser: FormProps<UserCreateValues>['onFinish'] = async (values) => {
        try {
            setIsLoading(true);

            const { fullName, email, password, phone } = values;
            const createUserResponse = await createUserAPI(fullName, email, password, phone);

            if (createUserResponse.data) {
                handleClearDataAndCloseModal();
                message.success("Tạo tài khoản thành công!");
                refreshTable();
            }

        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 3,
                placement: "topRight"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    }

    return (
        <>
            <Modal
                title="Create user"
                okText="Create"
                maskClosable={false}
                closable={false}
                open={isModalOpen}
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

                            <Form.Item<UserCreateValues>
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

                            <Form.Item<UserCreateValues>
                                label="Password:"
                                name="password"
                                rules={[
                                    { required: true, message: 'Password is required' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item<UserCreateValues>
                                label="Phone:"
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
                        </Form>
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default CreateUserModal;