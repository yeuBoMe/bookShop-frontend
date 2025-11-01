import { deleteCategoryAPI, fetchAllCategoriesAPI } from '@/services/api.service';
import { dateRangeValidate } from '@/services/helper';
import { CloudDownloadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import CreateCategoryModal from 'components/admin/category/create.category.modal';
import UpdateCategoryModal from 'components/admin/category/update.category.modal';
import DetailCategoryDrawer from 'components/admin/category/detail.category.drawer';
import ImportCategoryModal from './import.category.modal';

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
    const [isModalImportOpen, setIsModalImportOpen] = useState<boolean>(false);

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
            await new Promise((resolve) => setTimeout(resolve, 400));
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
        <>
            <ProTable<ICategory, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise((resolve) => setTimeout(resolve, 400));

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.name) {
                        filterConditions.push(`name~~'${params.name}'`);
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

                    if (sort && Object.keys(sort).length > 0) {
                        const sortFields = Object.keys(sort).map((field) => {
                            const order = sort[field] === "ascend" ? "asc" : "desc";
                            return `${field},${order}`;
                        });

                        if (sortFields.length > 0) {
                            query += `&sort=${sortFields.join(",")}`;
                        }
                    } else {
                        query += "&sort=createdAt,desc";
                    }

                    const fetchAllCategoriesResponse = await fetchAllCategoriesAPI(query);

                    if (fetchAllCategoriesResponse.data) {
                        setCurrentDataTable(fetchAllCategoriesResponse.data.result);
                        setMeta(fetchAllCategoriesResponse.data.meta);
                    }

                    return {
                        data: fetchAllCategoriesResponse.data?.result,
                        current: params.current,
                        success: true,
                        total: fetchAllCategoriesResponse.data?.meta.total,
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
                }}
                pagination={{
                    showSizeChanger: true,
                    current: meta.current,
                    pageSize: meta.pageSize,
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
                headerTitle="Table Category"
                toolBarRender={() => [
                    <CSVLink
                        data={currentDataTable}
                        filename='export-category.csv'
                    >
                        <Button
                            key="export"
                            icon={<ExportOutlined />}
                            type="primary"
                        >
                            Export
                        </Button>
                    </CSVLink>,
                    <Button
                        key="import"
                        icon={<CloudDownloadOutlined />}
                        onClick={() => setIsModalImportOpen(true)}
                        type="primary"
                    >
                        Import
                    </Button>,
                    <Button
                        key="add"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalCreateOpen(true)}
                        type="primary"
                    >
                        Add
                    </Button>,
                ]}
            />
            <ImportCategoryModal 
                isModalImportOpen={isModalImportOpen}
                setIsModalImportOpen={setIsModalImportOpen}
                refreshTable={refreshTable}
            />
            <CreateCategoryModal
                isModalCreateOpen={isModalCreateOpen}
                setIsModalCreateOpen={setIsModalCreateOpen}
                refreshTable={refreshTable}
            />
            <UpdateCategoryModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                refreshTable={refreshTable}
            />
            <DetailCategoryDrawer
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
            />
        </>
    );
};

export default TableCategory;