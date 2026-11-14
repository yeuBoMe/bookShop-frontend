import { updateOrderAPI } from "@/services/api.service";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DollarCircleOutlined, TruckOutlined } from "@ant-design/icons";
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
import { useTranslation } from "react-i18next";

interface OrderUpdateValues {
    status: string
}

/**
 * Luat chuyen trang thai, PHAI khop StatusEnum.ALLOWED_TRANSITIONS ben backend.
 * Lech nhau thi nguoi dung chon duoc trang thai ma backend se tu choi.
 * SUCCESS va CANCEL la trang thai ket thuc nen khong con luoi chon nao.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ["SHIPPING", "PAID", "CANCEL"],
    UNPAID: ["PAID", "CANCEL"],
    PAID: ["SHIPPING", "CANCEL"],
    SHIPPING: ["SUCCESS", "CANCEL"],
    SUCCESS: [],
    CANCEL: [],
};

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

    const { t } = useTranslation();
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
                message.success(t("admin.msg.updateSuccess", { entity: t("admin.entity.order") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
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

    const currentStatus = dataUpdate?.status ?? "";
    const selectableStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    const isFinalStatus = selectableStatuses.length === 0;

    const allOrderStatusOptions = [
        {
            value: "PENDING",
            label: (
                <span>
                    <ClockCircleOutlined style={{ color: "orange", marginRight: 8 }} />
                    {t("admin.order.status.PENDING")}
                </span>
            ),
        },
        {
            value: "SHIPPING",
            label: (
                <span>
                    <TruckOutlined style={{ color: "cyan", marginRight: 8 }} />
                    {t("admin.order.status.SHIPPING")}
                </span>
            ),
        },
        {
            value: "SUCCESS",
            label: (
                <span>
                    <CheckCircleOutlined style={{ color: "green", marginRight: 8 }} />
                    {t("admin.order.status.SUCCESS")}
                </span>
            ),
        },
        {
            value: "CANCEL",
            label: (
                <span>
                    <CloseCircleOutlined style={{ color: "red", marginRight: 8 }} />
                    {t("admin.order.status.CANCEL")}
                </span>
            ),
        },
        {
            value: "PAID",
            label: (
                <span>
                    <DollarCircleOutlined style={{ color: "blue", marginRight: 8 }} />
                    {t("admin.order.status.PAID")}
                </span>
            ),
        },
    ];

    // Giu lai chinh trang thai hien tai de o chon khong bi trong,
    // con lai chi hien nhung trang thai backend cho phep chuyen toi.
    const orderStatusOptions = allOrderStatusOptions.filter(
        (option) => option.value === currentStatus || selectableStatuses.includes(option.value)
    );

    return (
        <>
            <Modal
                title={t("admin.form.updateTitle", { entity: t("admin.entity.order") })}
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText={t("common.update")}
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
                                        label={t("field.status")}
                                        name={["status"]}
                                        rules={[{ required: true, message: t("validate.required", { field: t("field.status") }) }]}
                                    >
                                        <Select
                                            options={orderStatusOptions}
                                            disabled={isFinalStatus}
                                            placeholder={isFinalStatus ? t("admin.order.finalStatusHint") : undefined}
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
