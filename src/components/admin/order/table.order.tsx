import { deleteOrderAPI, fetchAllOrdersAPI } from '@/services/api.service';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ExportOutlined, ReadOutlined, TruckOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space, Tag } from 'antd';
import { useRef, useState, type JSX } from 'react';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import DetailOrderDrawer from 'components/admin/order/detail.order.drawer';
import UpdateOrderModal from 'components/admin/order/update.order.modal';

type TSearch = {
    name: string;
    address: string;
    totalPrice: number;
    status: string;
    createdAtRange: string;
}

const TableOrder = () => {
    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    const [isDrawerDetailOpen, setIsDrawerDetailOpen] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<IOrder | null>(null);

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IOrder | null>(null);

    const [currentDataTable, setCurrentDataTable] = useState<IOrder[]>([]);
    const [isDeleteOrder, setIsDeleteOrder] = useState<boolean>(false);

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const handleDeleteOrder = async (id: number) => {
        try {
            setIsDeleteOrder(true);
            await new Promise((resolve) => setTimeout(resolve, 400));
            const deleteOrderResponse = await deleteOrderAPI(id);
            if (deleteOrderResponse) {
                message.success("Delete order successfully!");
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
            setIsDeleteOrder(false);
        }
    }

    const getStatusTag = (status: string) => {
        const upperStatus = status?.toUpperCase();

        const configs: Record<string, { text: string; color: string; icon: JSX.Element }> = {
            PENDING: {
                text: "PENDING",
                color: "orange",
                icon: <ClockCircleOutlined />,
            },
            SHIPPING: {
                text: "SHIPPING",
                color: "cyan",
                icon: <TruckOutlined />,
            },
            SUCCESS: {
                text: "SUCCESS",
                color: "green",
                icon: <CheckCircleOutlined />,
            },
            CANCEL: {
                text: "CANCEL",
                color: "red",
                icon: <CloseCircleOutlined />,
            },
        };

        const config = configs[upperStatus] || configs.PENDING;

        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const columns: ProColumns<IOrder>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Id',
            dataIndex: 'id',
            copyable: true,
            hideInSearch: true,
            render(_, entity) {
                return (
                    <Link
                        to={"#"}
                        onClick={(e) => {
                            e.preventDefault();
                            setDataDetail(entity);
                            setIsDrawerDetailOpen(true);
                        }}
                    >
                        {entity.id}
                    </Link>
                )
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            valueType: 'digit',
            fieldProps: {
                addonAfter: '₫',
            },
            sorter: true,
            render: (_, entity) => {
                return entity.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            valueEnum: {
                pending: { text: 'Pending', status: 'Warning' },
                shipping: { text: 'Shipping', status: 'Processing' },
                success: { text: 'Success', status: 'Success' },
                cancel: { text: 'Cancel', status: 'Error' },
            },
            render: (_, entity) => getStatusTag(entity.status),
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAtRange',
            valueType: 'dateRange',
            hideInTable: true,
        },
        {
            title: 'Action',
            hideInSearch: true,
            render(_, entity) {
                return (
                    <>
                        <Space size={"middle"}>
                            <ReadOutlined
                                style={{ color: "green", cursor: "pointer" }}
                                onClick={() => {
                                    setDataDetail(entity);
                                    setIsDrawerDetailOpen(true);
                                }}
                            />
                            <EditOutlined
                                style={{ color: "orange", cursor: "pointer" }}
                                onClick={() => {
                                    setDataUpdate(entity);
                                    setIsModalUpdateOpen(true);
                                }}
                            />
                            <Popconfirm
                                placement='topLeft'
                                title="Delete order"
                                description="Are you sure to delete this order?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDeleteOrder(entity.id)}
                                okButtonProps={{ loading: isDeleteOrder }}
                            >
                                <DeleteOutlined
                                    style={{ color: "red", cursor: "pointer" }}
                                />
                            </Popconfirm>
                        </Space>
                    </>
                )
            },
        },
    ];
    return (
        <>
            <ProTable<IOrder, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.name) {
                        filterConditions.push(`name~'${params.name}'`);
                    }
                    if (params.address) {
                        filterConditions.push(`address~'${params.address}'`);
                    }
                    if (params.totalPrice) {
                        filterConditions.push(`totalPrice='${params.totalPrice}'`);
                    }
                    if (params.status) {
                        filterConditions.push(`status~'${params.status}'`);
                    }

                    if (params.createdAtRange && params.createdAtRange[0] && params.createdAtRange[1]) {
                        const dateRangeResult = dateRangeValidate(params.createdAtRange);
                        if (dateRangeResult) {
                            const [startDate, endDate] = dateRangeResult;
                            filterConditions.push(`createdAt>='${startDate}'`);
                            filterConditions.push(`createdAt<='${endDate}'`);
                        }
                    }

                    if (filterConditions.length > 0) {
                        query += `&filter=${filterConditions.join(" and ")}`;
                    }

                    if (sort && Object.keys(sort).length > 0) {
                        const sortFields = Object.keys(sort).map((field) => {
                            const order = sort[field] === 'ascend' ? "asc" : "desc";
                            return `${field},${order}`;
                        });

                        if (sortFields.length > 0) {
                            query += `&sort=${sortFields.join(',')}`;
                        }
                    } else {
                        query += `&sort=createdAt,desc`;
                    }

                    const fetchAllOrdersResponse = await fetchAllOrdersAPI(query);

                    if (fetchAllOrdersResponse.data) {
                        setMeta(fetchAllOrdersResponse.data.meta);
                        setCurrentDataTable(fetchAllOrdersResponse.data.result);
                    }

                    return {
                        data: fetchAllOrdersResponse.data?.result,
                        current: params.current,
                        success: true,
                        total: fetchAllOrdersResponse.data?.meta.total,
                    };
                }}
                editable={{
                    type: 'multiple',
                }}
                columnsState={{
                    persistenceKey: 'pro-table-singe-demos',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                form={{
                    syncToUrl: (values, type) => {
                        if (type === 'get') {
                            return {
                                ...values,
                                created_at: [values.startTime, values.endTime],
                            };
                        }
                        return values;
                    },
                    syncToInitialValues: true,
                }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal(total, range) {
                        return (
                            <div>
                                {range[0]} - {range[1]} on {total} rows
                            </div>
                        )
                    },
                }}
                dateFormatter="string"
                headerTitle="Table Order"
                toolBarRender={() => [
                    <CSVLink
                        data={currentDataTable}
                        filename='export-order.csv'
                    >
                        <Button
                            key="export"
                            icon={<ExportOutlined />}
                            type="primary"
                        >
                            Export
                        </Button>
                    </CSVLink>
                    ,
                ]}
            />
            <DetailOrderDrawer
                isDrawerDetailOpen={isDrawerDetailOpen}
                setIsDrawerDetailOpen={setIsDrawerDetailOpen}
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
            />
            <UpdateOrderModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                refreshTable={refreshTable}
            />
        </>
    );
};

export default TableOrder;