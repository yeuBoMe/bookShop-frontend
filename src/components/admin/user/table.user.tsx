import { fetchAllUsersAPI } from '@/services/api.service';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
        render(dom, entity, index, action, schema) {
            return (
                <Link to={"#"}>{entity.id}</Link>
            )
        },
        // ellipsis: true,
        // tooltip: '标题过长会自动收缩',
        // formItemProps: {
        //     rules: [
        //         {
        //             required: true,
        //             message: '此项为必填项',
        //         },
        //     ],
        // },
    },
    {
        title: 'Full Name',
        dataIndex: 'fullName',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        copyable: true,
    },
    {
        title: 'Phone',
        dataIndex: 'phone',
    },
    {
        title: 'Created At',
        dataIndex: 'createdAt',
    },
    {
        title: 'Action',
        hideInSearch: true,
        render(dom, entity, index, action, schema) {
            return (
                <>
                    <Space size={'middle'}>
                        <ReadOutlined style={{ cursor: "pointer", color: "green" }} />
                        <EditOutlined style={{ cursor: "pointer", color: "orange" }} />
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                    </Space>
                </>
            )
        },
    },
    // {
    //     disable: true,
    //     title: '状态',
    //     dataIndex: 'state',
    //     filters: true,
    //     onFilter: true,
    //     ellipsis: true,
    //     valueType: 'select',
    //     valueEnum: {
    //         all: { text: '超长'.repeat(50) },
    //         open: {
    //             text: '未解决',
    //             status: 'Error',
    //         },
    //         closed: {
    //             text: '已解决',
    //             status: 'Success',
    //             disabled: true,
    //         },
    //         processing: {
    //             text: '解决中',
    //             status: 'Processing',
    //         },
    //     },
    // },
    // {
    //     disable: true,
    //     title: '标签',
    //     dataIndex: 'labels',
    //     search: false,
    //     renderFormItem: (_, { defaultRender }) => {
    //         return defaultRender(_);
    //     },
    //     render: (_, record) => (
    //         <Space>
    //             {record.labels.map(({ name, color }) => (
    //                 <Tag color={color} key={name}>
    //                     {name}
    //                 </Tag>
    //             ))}
    //         </Space>
    //     ),
    // },
    // {
    //     title: '创建时间',
    //     key: 'showTime',
    //     dataIndex: 'created_at',
    //     valueType: 'date',
    //     sorter: true,
    //     hideInSearch: true,
    // },
    // {
    //     title: '创建时间',
    //     dataIndex: 'created_at',
    //     valueType: 'dateRange',
    //     hideInTable: true,
    //     search: {
    //         transform: (value) => {
    //             return {
    //                 startTime: value[0],
    //                 endTime: value[1],
    //             };
    //         },
    //     },
    // },
    // {
    //     title: '操作',
    //     valueType: 'option',
    //     key: 'option',
    //     render: (text, record, _, action) => [
    //         <a
    //             key="editable"
    //             onClick={() => {
    //                 action?.startEditable?.(record.id);
    //             }}
    //         >
    //             编辑
    //         </a>,
    //         <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
    //             查看
    //         </a>,
    //         <TableDropdown
    //             key="actionGroup"
    //             onSelect={() => action?.reload()}
    //             menus={[
    //                 { key: 'copy', name: '复制' },
    //                 { key: 'delete', name: '删除' },
    //             ]}
    //         />,
    //     ],
    // },
];

const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    return (
        <>
            <ProTable<IUserTable>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    const fetchAllUsersResponse = await fetchAllUsersAPI(params?.current ?? 1, params?.pageSize ?? 5);
                    if (fetchAllUsersResponse.data) {
                        setMeta(fetchAllUsersResponse.data.meta);
                    }

                    // const data = await (await fetch('https://proapi.azurewebsites.net/github/issues')).json()
                    return {
                        data: fetchAllUsersResponse.data?.result,
                        page: 1,
                        success: true,
                        total: fetchAllUsersResponse.data?.meta.total,
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
                    // 由于配置了 transform，提交的参数与定义的不同这里需要转化一下
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
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            actionRef.current?.reload();
                        }}
                        type="primary"
                    >
                        Add new
                    </Button>
                ]}
            />
        </>
    );
};

export default TableUser;