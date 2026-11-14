import { deleteBookAPI, fetchAllBooksAPI } from '@/services/api.service';
import { exportBooksCsvAPI } from "@/services/api.service";
import { downloadBlobAsFile } from "@/services/helper";
import { dateRangeValidate } from '@/services/helper';
import { CloudDownloadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, ReadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateBookModal from 'components/admin/book/create.book.modal';
import ImportBookModal from 'components/admin/book/import.book.modal';
import UpdateBookModal from 'components/admin/book/update.book.modal';
import DetailBookDrawer from 'components/admin/book/detail.book.drawer';
import { Link } from 'react-router-dom';

type TSearch = {
    name: string;
    category: string;
    author: string;
    price: number;
    createdAtRange: string;
}

const TableBook = () => {
    const actionRef = useRef<ActionType | null>(null);
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
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

    const [isExporting, setIsExporting] = useState<boolean>(false);

    // Giữ lại bộ lọc đang áp trên bảng để nút Export tải đúng tập dữ liệu người dùng đang xem
    const exportFilterRef = useRef<IBookSearchParams>({});

    const handleDeleteBook = async (id: number) => {
        setIsDeleteBook(true);

        try {
            const deleteBookResponse = await deleteBookAPI(id);
            await new Promise<void>((resolve) => setTimeout(resolve, 400));
            if (deleteBookResponse) {
                message.success(t("admin.msg.deleteSuccess", { entity: t("admin.entity.book") }));
                refreshTable();
                console.log("Check response >>> ", deleteBookResponse);
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
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
            title: t("admin.table.id"),
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
            title: t("admin.table.name"),
            dataIndex: 'name',
            copyable: true,
            ellipsis: true,
            sorter: true,
        },
        {
            title: t("admin.table.category"),
            dataIndex: 'category',
            copyable: true,
            sorter: true,
        },
        {
            title: t("admin.table.price"),
            dataIndex: 'price',
            valueType: 'digit',
            fieldProps: {
                addonAfter: "₫",
            },
            sorter: true,
            render: (_, entity) => {
                return entity.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
        },
        {
            title: t("admin.table.author"),
            dataIndex: 'author',
            sorter: true,
            copyable: true,
        },
        {
            title: t("admin.table.createdAt"),
            dataIndex: 'createdAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: t("admin.table.createdAt"),
            dataIndex: 'createdAtRange',
            valueType: 'dateRange',
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
                                title={t("admin.confirm.deleteTitle", { entity: t("admin.entity.book") })}
                                description={t("admin.confirm.deleteDescription", { entity: t("admin.entity.book") })}
                                okText={t("common.yes")}
                                cancelText={t("common.no")}
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

    /**
     * Tải toàn bộ dữ liệu theo bộ lọc đang chọn, không chỉ trang đang hiển thị.
     *
     * Trước đây dùng CSVLink với `currentDataTable` nên chỉ xuất được đúng số dòng
     * đang nằm trên màn hình — lọc ra 3.000 cuốn thì vẫn chỉ tải về 10 dòng.
     */
    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportBooksCsvAPI(exportFilterRef.current);
            downloadBlobAsFile(blob as unknown as Blob, "export-book.csv");
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message ?? t("admin.table.exportFail"),
                placement: "topRight",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <ProTable<IBook, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    await new Promise<void>((resolve) => setTimeout(resolve, 500));

                    exportFilterRef.current = {
                        keyword: params.name || params.author || undefined,
                        categoryName: params.category || undefined,
                        minPrice: params.price ? Number(params.price) : undefined,
                    };

                    let query = `page=${params.current}&size=${params.pageSize}`;
                    let filterConditions = [];

                    if (params.name) {
                        filterConditions.push(`name~~'${params.name}'`);
                    }
                    if (params.category) {
                        filterConditions.push(`category.name='${params.category}'`);
                    }
                    if (params.author) {
                        filterConditions.push(`author~~'${params.author}'`);
                    }
                    if (params.price) {
                        filterConditions.push(`price=${params.price}`);
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
                    console.log("Check query>>>", query)

                    if (fetchAllBooksResponse.data) {
                        setMeta(fetchAllBooksResponse.data.meta);
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
                                {t("admin.table.paginationTotal", { from: range[0], to: range[1], total })}
                            </div>
                        )
                    },
                }}
                dateFormatter="string"
                headerTitle={t("admin.table.header", { entity: t("admin.entityPlural.book") })}
                toolBarRender={() => [
                    <Button
                        key="export"
                        icon={<ExportOutlined />}
                        type="primary"
                        loading={isExporting}
                        onClick={handleExport}
                    >
                        {t("admin.table.export")}
                    </Button>,
                    <Button
                        key="import"
                        icon={<CloudDownloadOutlined />}
                        onClick={() => setIsModalImportOpen(true)}
                        type="primary"
                    >
                        {t("admin.table.import")}
                    </Button>,
                    <Button
                        key="add"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsModalCreateOpen(true);
                        }}
                        type="primary"
                    >
                        {t("admin.table.addNew")}
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

