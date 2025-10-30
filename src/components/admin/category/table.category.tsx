import { deleteCategoryAPI } from '@/services/api.service';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type TSearch = {
    name: string;
    createdAtRange: string;
}

const TableCategory = () => {
    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    const [isModalCreateOpen, setIsModalCreateOpen] = useState<boolean>(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<ICategory | null>(null);

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<ICategory | null>(null);

    const [isDeleteCategory, setIsDeleteCategory] = useState<boolean>(false);

    const [currentDataTable, setCurrentDataTable] = useState<ICategory[]>([]);

    const handleDeleteCategory = async (id: number) => {
        try {
            setIsDeleteCategory(true);
            const deleteCategoryResponse = await deleteCategoryAPI(id);
            if (deleteCategoryResponse) {
                message.success("Delete category successfully!");
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
            setIsDeleteCategory(false);
        }
    }

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const columns: ProColumns<ICategory>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: true,
            hideInSearch: true,
            render(_, entity) {
                return (
                    <Link
                        to={"#"}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsDrawerOpen(true);
                            setDataDetail(entity);
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
            copyable: true,
            sorter: true,
        },
        {
            title: 'Created At',
            dataIndex: 'createAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Create At',
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
                                    setIsDrawerOpen(true);
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
                                title="Delete category"
                                description="Are you sure to delete this category?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDeleteCategory(entity.id)}
                                okButtonProps={{ loading: isDeleteCategory }}
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
        <ProTable<ICategory, TSearch>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (params, sort, filter) => {
                console.log(params, sort, filter);

                return {

                }
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
            }}
            pagination={{
                pageSize: 5,
                onChange: (page) => console.log(page),
            }}
            dateFormatter="string"
            headerTitle="Table Category"
            toolBarRender={() => [
                <Button
                    key="add"
                    icon={<PlusOutlined />}
                    type="primary"
                >
                    Add
                </Button>,
            ]}
        />
    );
};

export default TableCategory;