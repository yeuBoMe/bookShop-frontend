import { updateOrderAPI } from "@/services/api.service";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, TruckOutlined } from "@ant-design/icons";
import {
    App,
    Col,
    Form,
    Modal,
    Row,
    Select,
    type FormProps,
} from "antd";
import { useEffect, useState } from "react";

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

    const orderStatusOptions = [
        {
            value: "PENDING",
            label: (
                <span>
                    <ClockCircleOutlined style={{ color: "orange", marginRight: 8 }} />
                    PENDING
                </span>
            ),
        },
        {
            value: "SHIPPING",
            label: (
                <span>
                    <TruckOutlined style={{ color: "cyan", marginRight: 8 }} />
                    SHIPPING
                </span>
            ),
        },
        {
            value: "SUCCESS",
            label: (
                <span>
                    <CheckCircleOutlined style={{ color: "green", marginRight: 8 }} />
                    SUCCESS
                </span>
            ),
        },
        {
            value: "CANCEL",
            label: (
                <span>
                    <CloseCircleOutlined style={{ color: "red", marginRight: 8 }} />
                    CANCEL
                </span>
            ),
        },
    ];

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
                                <Col span={17}>
                                    <Form.Item<OrderUpdateValues>
                                        label="Status:"
                                        name={["status"]}
                                        rules={[{ required: true, message: "Status is required" }]}
                                    >
                                        <Select
                                            options={orderStatusOptions}
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
