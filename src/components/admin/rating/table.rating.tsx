import { deleteRatingAPI, fetchAllRatingsAPI } from '@/services/api.service';
import { DeleteOutlined, ExportOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';
import DetailRatingDrawer from 'components/admin/rating/detail.rating.drawer';
import { dateRangeValidate } from '@/services/helper';

type TSearch = {
    stars: number;
    comment: string;
    user: string;
    book: string;
    createdAtRange: string;
}

const TableRating = () => {
    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    const [dataDetail, setDataDetail] = useState<IRating | null>(null);
    const [isDrawerDetailOpen, setIsDrawerDetailOpen] = useState<boolean>(false);

    const [currentDataTable, setCurrentDataTable] = useState<IRating[]>([]);
    const [isDeleteRating, setIsDeleteRating] = useState<boolean>(false);

    const handleDeleteRating = async (ratingId: number) => {
        try {
            setIsDeleteRating(true);
            const deleteRatingResponse = await deleteRatingAPI(ratingId);
            await new Promise((resolver) => setTimeout(resolver, 1000));

            if (deleteRatingResponse) {
                message.success(t("admin.msg.deleteSuccess", { entity: t("admin.entity.rating") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message || t("common.error"),
                duration: 5,
                placement: "topRight",
            });
        } finally {
            setIsDeleteRating(false);
        }
    }

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const columns: ProColumns<IRating>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: t("admin.table.id"),
            dataIndex: 'id',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: t("admin.table.stars"),
            dataIndex: 'stars',
            valueType: "digit",
            sorter: true,
        },
        {
            title: t("admin.table.comment"),
            dataIndex: 'comment',
            sorter: true,
            ellipsis: true,
        },
        {
            title: t("admin.table.user"),
            dataIndex: 'user',
            sorter: true,
            render(_, entity) {
                return (
                    <span>{entity.user.name}</span>
                );
            },
        },
        {
            title: t("admin.table.book"),
            dataIndex: 'book',
            sorter: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: t("admin.table.createdAt"),
            dataIndex: 'createdAt',
            valueType: "date",
            hideInSearch: true,
            sorter: true,
        },
        {
            title: t("admin.table.createdAt"),
            dataIndex: 'createdAtRange',
            valueType: "dateRange",
            hideInTable: true,
        },
        {
            title: t("admin.table.action"),
            hideInSearch: true,
            render(_, entity) {
                return (
                    <>
                        <Space size={'middle'}>
                            <ReadOutlined
                                style={{ color: "green", cursor: "pointer" }}
                                onClick={() => {
                                    setDataDetail(entity);
                                    setIsDrawerDetailOpen(true);
                                }}
                            />
                            <Popconfirm
                                placement='topLeft'
                                title={t("admin.confirm.deleteTitle", { entity: t("admin.entity.rating") })}
                                description={t("admin.confirm.deleteDescription", { entity: t("admin.entity.rating") })}
                                okText={t("common.yes")}
                                cancelText={t("common.no")}
                                onConfirm={() => handleDeleteRating(entity.id)}
                                okButtonProps={{ loading: isDeleteRating }}
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
            <ProTable<IRating, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise<void>((resolve) => setTimeout(resolve, 500));

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.stars) {
                        filterConditions.push(`stars='${params.stars}'`);
                    }
                    if (params.comment) {
                        filterConditions.push(`comment~~'${params.comment}'`);
                    }
                    if (params.user) {
                        filterConditions.push(`user.fullName~~'${params.user}'`);
                    }
                    if (params.book) {
                        filterConditions.push(`book.name~~'${params.book}'`);
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
                            const sortOrder = sort[field] === "ascend" ? "asc" : "desc";
                            return `${field},${sortOrder}`;
                        });

                        if (sortFields.length > 0) {
                            query += `&sort=${sortFields.join(",")}`;
                        }
                    } else {
                        query += "&sort=createdAt,desc";
                    }

                    const fetchAllRatingsResponse = await fetchAllRatingsAPI(query);

                    if (fetchAllRatingsResponse.data) {
                        setMeta(fetchAllRatingsResponse.data.meta);
                        setCurrentDataTable(fetchAllRatingsResponse.data.result);
                    }

                    return {
                        data: fetchAllRatingsResponse.data?.result,
                        current: params.current,
                        success: true,
                        total: fetchAllRatingsResponse.data?.meta.total,
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
                                {t("admin.table.paginationTotal", { from: range[0], to: range[1], total })}
                            </div>
                        )
                    },
                }}
                dateFormatter="string"
                headerTitle={t("admin.table.header", { entity: t("admin.entityPlural.rating") })}
                toolBarRender={() => [
                    <CSVLink
                        data={currentDataTable}
                        filename='export-rating.csv'
                    >
                        <Button
                            key="export"
                            icon={<ExportOutlined />}
                            type="primary"
                        >
                            {t("admin.table.export")}
                        </Button>
                    </CSVLink>
                ]}
            />
            <DetailRatingDrawer
                isDrawerDetailOpen={isDrawerDetailOpen}
                setIsDrawerDetailOpen={setIsDrawerDetailOpen}
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}  
            />
        </>
    );
};

export default TableRating;