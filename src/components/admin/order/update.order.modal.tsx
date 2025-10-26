import {
    fetchAllCategoriesAPI,
    updateBookAPI,
    updateBookMultipleImagesAPI,
    deleteBookMultipleImagesAPI,
    updateOrderAPI
} from "@/services/api.service";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
    App,
    Col,
    Form,
    Image,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Upload,
    type FormProps,
    type GetProp,
    type UploadFile,
    type UploadProps
} from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
const { TextArea } = Input;

interface OrderUpdateValues {
    status: string
}

interface UpdateOrderProps {
    isModalUpdateOpen: boolean;
    setIsModalUpdateOpen: (v: boolean) => void;
    dataUpdate: IOrder | null;
    setDataUpdate: (v: IOrder | null) => void;
    refreshTable: () => void;
}

const UpdateOrderModal = (props: UpdateOrderProps) => {
    const {
        isModalUpdateOpen,
        setIsModalUpdateOpen,
        dataUpdate,
        setDataUpdate,
        refreshTable
    } = props;

    const [form] = Form.useForm<OrderUpdateValues>();
    const { notification, message } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                status: dataUpdate.status
            });
        }
    }, [dataUpdate])

    const handleSelectChange = (value: number | null) => {
        console.log(`selected ${value}`);
        form.setFieldsValue({ category: value !== null ? { id: value } : null });
    };

    const handleUpdateBook: FormProps<OrderUpdateValues>['onFinish'] = async (values) => {
        if (!dataUpdate) return;

        try {
            setIsLoading(true);
            const { status } = values;

            const updateOrderResponse = await updateOrderAPI(dataUpdate.id, status);

            if (updateOrderResponse.data) {
                handleClearDataAndCloseModal();
                message.success("Update order successfully!");
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "An error happens when updating order",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error update order >>> ", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setIsModalUpdateOpen(false);
        setDataUpdate(null);
    }

    return (
        <>
            <Modal
                title="Update order"
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
                            onFinish={handleUpdateBook}
                            autoComplete="off"
                            style={{ marginTop: "10px" }}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item<OrderUpdateValues>
                                        label="Status:"
                                        name={["category", "id"]}
                                    // rules={[{ required: true, message: "Category is required" }]}
                                    >
                                        <Select
                                            allowClear
                                            placeholder="Select a category"
                                            onChange={handleSelectChange}
                                            options={categories}
                                        />
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

export default UpdateOrderModal;
