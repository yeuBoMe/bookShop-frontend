import { InboxOutlined } from "@ant-design/icons";
import { Alert, App, Modal, Table, Tag, Upload, type TableProps, type UploadProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import templateFile from "assets/template/categories_import.xlsx?url";
import { importCategoriesBatchAPI } from "@/services/api.service";
import {
    IMPORT_ACTION_COLORS,
    asImportText,
    formatImportError,
    normalizeImportAction,
    parseWorkbookRows,
} from "@/services/import.helper";

const { Dragger } = Upload;

interface CategoryImportValues {
    id?: number;
    action?: TImportAction;
    name?: string;
}

interface ImportFailure {
    index: number;
    errorMessage: unknown;
    item: CategoryImportValues;
}

interface CategoryImportProps {
    isModalImportOpen: boolean;
    setIsModalImportOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const ImportCategoryModal = (props: CategoryImportProps) => {
    const { isModalImportOpen, setIsModalImportOpen, refreshTable } = props;
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [dataImport, setDataImport] = useState<CategoryImportValues[]>([]);
    const [failures, setFailures] = useState<ImportFailure[]>([]);

    const propsImport: UploadProps = {
        name: "file",
        multiple: false,
        maxCount: 1,
        accept: ".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        customRequest({ onSuccess }) {
            setTimeout(() => {
                if (onSuccess) onSuccess("ok");
            }, 1000);
        },
        async onChange(info) {
            const { status } = info.file;

            if (status === "done") {
                message.success(t("admin.importModal.uploadOk", { file: info.file.name }));
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;
                    const rows = await parseWorkbookRows(file);

                    setFailures([]);
                    setDataImport(
                        rows.map((raw, index) => ({ ...(raw as CategoryImportValues), id: index + 1 }))
                    );
                }
            } else if (status === "error") {
                message.error(t("admin.importModal.uploadFail", { file: info.file.name }));
            }
        },
    };

    const handleImport = async () => {
        setIsSubmit(true);

        try {
            const dataSubmit = dataImport.map((item) => ({
                action: normalizeImportAction(item.action),
                name: asImportText(item.name) ?? "",
            }));

            const response = await importCategoriesBatchAPI(dataSubmit);
            const result = response.data;
            if (!result) return;

            const failedRows = Array.isArray(result.detail) ? (result.detail as ImportFailure[]) : [];
            setFailures(failedRows);

            notification.success({
                message: t("admin.importModal.importTitle", { entity: t("admin.entityPlural.category") }),
                description: t("admin.importModal.resultSummary", {
                    success: result.countSuccess,
                    error: result.countError,
                }),
                duration: 5,
                placement: "topRight",
            });

            refreshTable();

            // Còn dòng lỗi thì giữ modal mở để người dùng đọc lý do và sửa file
            if (result.countError === 0) {
                handleClearDataAndCloseModal();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description:
                    error?.message ??
                    t("admin.importModal.allInvalid", { entity: t("admin.entityPlural.category") }),
                duration: 5,
                placement: "topRight",
            });
        } finally {
            setIsSubmit(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        setDataImport([]);
        setFailures([]);
        setIsModalImportOpen(false);
    };

    const columns: TableProps<CategoryImportValues>["columns"] = [
        {
            title: t("admin.importModal.action"),
            dataIndex: "action",
            key: "action",
            width: 110,
            render: (value: unknown) => {
                const action = normalizeImportAction(value);
                return <Tag color={IMPORT_ACTION_COLORS[action]}>{action}</Tag>;
            },
        },
        { title: t("admin.table.name"), dataIndex: "name", key: "name" },
    ];

    const failureColumns: TableProps<ImportFailure>["columns"] = [
        { title: t("admin.importModal.rowNumber"), dataIndex: "index", key: "index", width: 80 },
        {
            title: t("admin.importModal.errorReason"),
            dataIndex: "errorMessage",
            key: "errorMessage",
            render: (value: unknown) => formatImportError(value),
        },
    ];

    return (
        <>
            <Modal
                title={t("admin.importModal.title", { entity: t("admin.entity.category") })}
                okText={t("admin.importModal.ok")}
                width={"55vw"}
                maskClosable={false}
                closable={false}
                open={isModalImportOpen}
                onOk={handleImport}
                onCancel={handleClearDataAndCloseModal}
                okButtonProps={{
                    disabled: dataImport.length === 0,
                    loading: isSubmit,
                }}
            >
                <Dragger {...propsImport}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t("admin.importModal.dragText")}</p>
                    <p className="ant-upload-hint">
                        {t("admin.importModal.actionHint")}
                        &nbsp;
                        <a onClick={(e) => e.stopPropagation()} download href={templateFile}>
                            {t("admin.importModal.sample")}
                        </a>
                    </p>
                </Dragger>

                <Table<CategoryImportValues>
                    rowKey={"id"}
                    size="small"
                    style={{ marginTop: "15px" }}
                    title={() => <p style={{ fontWeight: 500 }}>{t("admin.importModal.dataUpload")}</p>}
                    columns={columns}
                    dataSource={dataImport}
                />

                {failures.length > 0 && (
                    <>
                        <Alert
                            style={{ marginTop: 16 }}
                            type="warning"
                            showIcon
                            message={t("admin.importModal.partialSuccess", { error: failures.length })}
                        />
                        <Table<ImportFailure>
                            rowKey={"index"}
                            size="small"
                            style={{ marginTop: 8 }}
                            pagination={false}
                            columns={failureColumns}
                            dataSource={failures}
                        />
                    </>
                )}
            </Modal>
        </>
    );
};

export default ImportCategoryModal;
