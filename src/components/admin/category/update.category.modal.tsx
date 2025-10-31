import { updateCategoryAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useEffect, useState } from "react";

interface CategoryUpdateValues {
    name: string;
}

interface UpdateCategoryProps {
    isModalUpdateOpen: boolean;
    setIsModalUpdateOpen: (v: boolean) => void;
    dataUpdate: ICategory | null;
    setDataUpdate: (v: ICategory | null) => void;
    refreshTable: () => void;
}

const UpdateCategoryModal = (props: UpdateCategoryProps) => {
    const {
        isModalUpdateOpen,
        setIsModalUpdateOpen,
        dataUpdate,
        setDataUpdate,
        refreshTable
    } = props;
    const [form] = Form.useForm<CategoryUpdateValues>();
    const { notification, message } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
            });
        }
    }, [dataUpdate])

    const handleUpdateCategory: FormProps<CategoryUpdateValues>['onFinish'] = async (values) => {
        if (!dataUpdate) return;
        try {
            setIsLoading(true);
            const { name } = values;
            const updateCategoryResponse = await updateCategoryAPI(dataUpdate.id, name);
            if (updateCategoryResponse.data) {
                handleClearDataAndCloseModal();
                message.success("Update category successfully!");
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setIsModalUpdateOpen(false);
        setDataUpdate(null);
    }

    return (
        <>
            <Modal
                title="Update category"
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText="Update"
                width={"50vw"}
            >
                <Row justify={"center"}>
                    <Col xl={24} md={22} lg={22}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            onFinish={handleUpdateCategory}
                            autoComplete="off"
                            style={{ marginTop: "10px" }}
                        >
                            <Row gutter={16}>
                                <Col span={17}>
                                    <Form.Item<CategoryUpdateValues>
                                        label="Name:"
                                        name="name"
                                        rules={[
                                            { required: true, message: "Category's name is required" },
                                            { max: 100, message: "Name must be less than 100 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'\-.:\s]{1,100}$/,
                                                message: "Invalid name format",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Modal >
        </>
    );
};

export default UpdateCategoryModal;