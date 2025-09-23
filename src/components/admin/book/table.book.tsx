import { fetchAllBooksAPI } from '@/services/api.service';
import { dateRangeValidate } from '@/services/helper';
import { CloudDownloadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Space } from 'antd';
import { useRef, useState } from 'react';

type TSearch = {
    name: string;
    category: string;
    author: string;
    createdAt: string;
    createdAtRange: string;
}

const TableBook = () => {
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
        },
        {
            title: 'Author',
            dataIndex: 'author',
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
            render(dom, entity, index, action, schema) {
                return (
                    <>
                        <Space size={'middle'}>
                            <ReadOutlined
                                style={{ color: "green", cursor: "pointer" }}
                            />
                            <EditOutlined
                                style={{ color: "orange", cursor: "pointer" }}
                            />
                            <DeleteOutlined
                                style={{ color: "red", cursor: "pointer" }}
                            />
                        </Space>
                    </>
                )
            },
        },
    ];

    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    })

    const [dataDetail, setDataDetail] = useState<IBook | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const [isModalCreateOpen, setIsModalCreateOpen] = useState<boolean>(false);

    const [dataUpdate, setDataUpdate] = useState<IBook | null>(null);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState<boolean>(false);

    const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);

    const [currentDataTable, setCurrentDataTable] = useState<IBook[]>([]);

    return (
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
                    filterConditions.push(`category='${params.category}'`);
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
                        const order = sort[field] ? "asc" : "desc";
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
            headerTitle="Table book"
            toolBarRender={() => [
                <Button
                    key="export"
                    icon={<ExportOutlined />}
                    onClick={() => {
                        actionRef.current?.reload();
                    }}
                    type="primary"
                >
                    Export
                </Button>,
                <Button
                    key="import"
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                        actionRef.current?.reload();
                    }}
                    type="primary"
                >
                    Import
                </Button>,
                <Button
                    key="add"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        actionRef.current?.reload();
                    }}
                    type="primary"
                >
                    Add new
                </Button>,
            ]}
        />
    );
};

export default TableBook;

