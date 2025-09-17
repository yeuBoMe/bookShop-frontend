import { deleteUserAPI, fetchAllUsersAPI } from '@/services/api.service';
import { dateRangeValidate } from '@/services/helper';
import { CloudDownloadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DetailUserDrawer from 'components/admin/user/detail.user.drawer';
import CreateUserModal from 'components/admin/user/create.user.modal';
import UpdateUserModal from 'components/admin/user/update.user.modal';
import ImportUserModal from './import.user.modal';

type TSearch = {
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
    createdAtRange: string;
}

const TableUser = () => {
    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    const [isModalImportOpen, setIsModalImportOpen] = useState<boolean>(false);
    const [isModalCreateOpen, setIsModalCreateOpen] = useState<boolean>(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<IUserView | null>(null);

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IUserView | null>(null);

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const handleDeleteUser = async (id: number) => {
        try {
            const deleteUserResponse = await deleteUserAPI(id);
            if (deleteUserResponse.data) {
                message.success("Delete user successfully!");
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight",
            });
        }
    }

    const columns: ProColumns<IUserTable>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Id',
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true,
            render(_, entity) {
                return (
                    <Link
                        to={"#"}
                        onClick={(e) => {
                            e.preventDefault(); // Chặn reload
                            setDataDetail(entity);
                            setIsDrawerOpen(true);
                        }}>
                        {entity.id}
                    </Link>
                )
            },
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
            sorter: true,
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            sorter: true,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            valueType: 'date',
            hideInSearch: true,
            sorter: true,
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
                        <Space size={'middle'}>
                            <ReadOutlined
                                style={{ cursor: "pointer", color: "green" }}
                                onClick={() => {
                                    setDataDetail(entity);
                                    setIsDrawerOpen(true);
                                }}
                            />
                            <EditOutlined
                                style={{ cursor: "pointer", color: "orange" }}
                                onClick={() => {
                                    setDataUpdate(entity);
                                    setIsModalUpdateOpen(true);
                                }}
                            />
                            <Popconfirm
                                placement="topLeft"
                                title={"Delete user"}
                                description={"Are you sure to delete this user?"}
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDeleteUser(entity.id)}
                            >
                                <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                            </Popconfirm>
                        </Space>
                    </>
                )
            },
        },
    ];

    return (
        <>
            <ProTable<IUserTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.fullName) {
                        filterConditions.push(`fullName~'${params.fullName}'`);
                    }
                    if (params.email) {
                        filterConditions.push(`email='${params.email}'`);
                    }
                    if (params.phone) {
                        filterConditions.push(`phone~'${params.phone}'`);
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
                        query += `&filter=${filterConditions.join(' and ')}`;
                    }

                    // Thêm sắp xếp vào query
                    if (sort) {
                        const sortFields = Object.keys(sort).map((field) => {
                            const order = sort[field] === 'ascend' ? 'asc' : 'desc';
                            return `${field},${order}`;
                        });
                        if (sortFields.length > 0) {
                            query += `&sort=${sortFields.join(',')}`;
                        }
                    }

                    console.log("Query sent:", query);
                    const fetchAllUsersResponse = await fetchAllUsersAPI(query);
                    if (fetchAllUsersResponse.data) {
                        setMeta(fetchAllUsersResponse.data.meta);
                    }

                    return {
                        data: fetchAllUsersResponse.data?.result,
                        page: params.current,
                        success: true,
                        total: fetchAllUsersResponse.data?.meta.total,
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
                    reload: true,
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
                    syncToInitialValues: true, // Khôi phục trạng thái từ URL khi tải lại
                }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => {
                        return (
                            <div>
                                {range[0]} - {range[1]} on {total} rows
                            </div>
                        )
                    },
                }}
                dateFormatter="string"
                headerTitle="Table user"
                toolBarRender={() => [
                    <>
                        <Button
                            key="button"
                            icon={<ExportOutlined />}
                            onClick={() => setIsModalCreateOpen(true)}
                            type="primary"
                        >
                            Export
                        </Button>
                        <Button
                            key="button"
                            icon={<CloudDownloadOutlined />}
                            onClick={() => setIsModalImportOpen(true)}
                            type="primary"
                        >
                            Import
                        </Button>
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalCreateOpen(true)}
                            type="primary"
                        >
                            Add new
                        </Button>
                    </>
                ]}
            />
            <ImportUserModal 
                isModalImportOpen={isModalImportOpen}
                setIsModalImportOpen={setIsModalImportOpen}
            />
            <CreateUserModal
                isModalCreateOpen={isModalCreateOpen}
                setIsModalCreateOpen={setIsModalCreateOpen}
                refreshTable={refreshTable}
            />
            <DetailUserDrawer
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
            />
            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                refreshTable={refreshTable}
            />
        </>
    );
};

export default TableUser;