import { updateUserAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useEffect, useState } from "react";

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
        setIsLoading(true);

        if (dataUpdate) {
            try {
                const { fullName, phone } = values;
                const updateUserResponse = await updateUserAPI(dataUpdate?.id, fullName, phone);
                if (updateUserResponse.data) {
                    handleClearDataAndCloseModal();
                    message.success("Update user successfully!");
                    refreshTable();
                }
            } catch (error: any) {
                notification.error({
                    message: "Error",
                    description: error?.message,
                    duration: 5,
                    placement: "topRight",
                });
            } finally {
                setIsLoading(false);
            }
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
                title="Update user"
                okText="Update"
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
                                label="Full Name:"
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

                            <Form.Item<UserUpdateValues>
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
                                <Input disabled={true} />
                            </Form.Item>

                            <Form.Item<UserUpdateValues>
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

export default UpdateUserModal;