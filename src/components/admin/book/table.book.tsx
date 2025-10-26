import { deleteBookAPI, fetchAllBooksAPI } from '@/services/api.service';
import { dateRangeValidate } from '@/services/helper';
import { CloudDownloadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import CreateBookModal from 'components/admin/book/create.book.modal';
import ImportBookModal from 'components/admin/book/import.book.modal';
import UpdateBookModal from 'components/admin/book/update.book.modal';
import DetailBookDrawer from 'components/admin/book/detail.book.drawer';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';

type TSearch = {
    name: string;
    category: string;
    author: string;
    createdAtRange: string;
}

const TableBook = () => {
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

    const [dataDetail, setDataDetail] = useState<IBook | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const [dataUpdate, setDataUpdate] = useState<IBook | null>(null);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);

    const [isDeleteBook, setIsDeleteBook] = useState<boolean>(false);

    const [currentDataTable, setCurrentDataTable] = useState<IBook[]>([]);

    const handleDeleteBook = async (id: number) => {
        setIsDeleteBook(true);

        try {
            const deleteBookResponse = await deleteBookAPI(id);
            await new Promise<void>((resolve) => setTimeout(resolve, 400));
            if (deleteBookResponse) {
                message.success("Delete book successfully!");
                refreshTable();
                console.log("Check response >>> ", deleteBookResponse);
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });
        } finally {
            setIsDeleteBook(false);
        }
    }

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const columns: ProColumns<IBook>[] = [
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
                            setDataDetail(entity);
                            setIsDrawerOpen(true);
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
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            copyable: true,
            sorter: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            valueType: 'money',
            sorter: true,
            hideInSearch: true,
            render: (_, entity) => {
                return entity.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
        },
        {
            title: 'Author',
            dataIndex: 'author',
            sorter: true,
            copyable: true,
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
                        <Space size={'middle'}>
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
                                title="Delete book"
                                description="Are you sure to delete this book?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDeleteBook(entity.id)}
                                okButtonProps={{ loading: isDeleteBook }}
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
            <ProTable<IBook, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise<void>((resolve) => setTimeout(resolve, 500));

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.name) {
                        filterConditions.push(`name~'${params.name}'`);
                    }
                    if (params.category) {
                        filterConditions.push(`category.name='${params.category}'`);
                    }
                    if (params.author) {
                        filterConditions.push(`author='${params.author}'`);
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

                    const fetchAllBooksResponse = await fetchAllBooksAPI(query);

                    if (fetchAllBooksResponse.data) {
                        setMeta(fetchAllBooksResponse.data.meta);
                        setCurrentDataTable(fetchAllBooksResponse.data.result ?? []);
                    }

                    return {
                        data: fetchAllBooksResponse.data?.result,
                        current: params.current,
                        success: true,
                        total: fetchAllBooksResponse.data?.meta.total,
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
                headerTitle="Table Book"
                toolBarRender={() => [
                    <CSVLink
                        data={currentDataTable}
                        filename='export-book.csv'
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
                        onClick={() => {
                            setIsModalCreateOpen(true);
                        }}
                        type="primary"
                    >
                        Add new
                    </Button>,
                ]}
            />
            <ImportBookModal
                isModalImportOpen={isModalImportOpen}
                setIsModalImportOpen={setIsModalImportOpen}
                refreshTable={refreshTable}
            />
            <CreateBookModal
                isModalCreateOpen={isModalCreateOpen}
                setIsModalCreateOpen={setIsModalCreateOpen}
                refreshTable={refreshTable}
            />
            <DetailBookDrawer
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
            />
            <UpdateBookModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                refreshTable={refreshTable}
            />
        </>
    );
};

export default TableBook;

