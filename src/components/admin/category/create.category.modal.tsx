import { createCategoryAPI } from "@/services/api.service";
import { App, Col, Form, Input, Modal, Row, type FormProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CategoryCreateValues {
    name: string;
}

interface CreateCategoryProps {
    isModalCreateOpen: boolean;
    setIsModalCreateOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const CreateCategoryModal = (props: CreateCategoryProps) => {
    const { isModalCreateOpen, setIsModalCreateOpen, refreshTable } = props;
    const [form] = Form.useForm<CategoryCreateValues>();
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCreateCategory: FormProps<CategoryCreateValues>['onFinish'] = async (values) => {
        try {
            setIsLoading(true);
            const { name } = values;
            const createCategoryResponse = await createCategoryAPI(name);
            if (createCategoryResponse.data) {
                handleClearDataAndCloseModal();
                message.success(t("admin.msg.createSuccess", { entity: t("admin.entity.category") }));
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
    }

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setIsModalCreateOpen(false);
    }

    return (
        <>
            <Modal
                title={t("admin.form.createTitle", { entity: t("admin.entity.category") })}
                closable={false}
                maskClosable={false}
                open={isModalCreateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText={t("common.create")}
                width={"50vw"}
            >
                <Row justify={"center"}>
                    <Col xl={24} md={22} lg={22}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            onFinish={handleCreateCategory}
                            autoComplete="off"
                            style={{ marginTop: "10px" }}
                        >
                            <Row gutter={16}>
                                <Col span={17}>
                                    <Form.Item<CategoryCreateValues>
                                        label={t("field.name")}
                                        name="name"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.name") }) },
                                            { max: 100, message: t("validate.maxLength", { field: t("field.name"), max: 100 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'\-.:\s]{1,100}$/,
                                                message: t("validate.invalid", { field: t("field.name") }),
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

export default CreateCategoryModal;