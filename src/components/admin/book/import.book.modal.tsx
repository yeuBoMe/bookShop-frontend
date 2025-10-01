import { InboxOutlined } from "@ant-design/icons";
import { App, Modal, Table, Upload, type TableProps, type UploadProps } from "antd";
import Exceljs from "exceljs";
import { useState } from "react";
import templateFile from "assets/template/books_import.xlsx?url";
import { importListBooksFromFileAPI } from "@/services/api.service";

const { Dragger } = Upload;

interface BookImportValues {
    name: string;
    author: string;
    price: number;
    quantity: number;
}

interface BookImportProps {
    isModalImportOpen: boolean;
    setIsModalImportOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const ImportBookModal = (props: BookImportProps) => {
    const { isModalImportOpen, setIsModalImportOpen, refreshTable } = props;
    const { notification, message } = App.useApp();
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [dataImport, setDataImport] = useState<BookImportValues[]>([]);

    const propsImport: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1, // if upload more than 1, keep the last file
        accept: ".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        customRequest({ file, onSuccess }) {
            setTimeout(() => {
                if (onSuccess) onSuccess("ok");
            }, 1000);
        },
        async onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;

                    // convert file xlsx to buffer (exceljs read data)
                    const workbook = new Exceljs.Workbook();
                    const arrayBuffer = await file.arrayBuffer();
                    await workbook.xlsx.load(arrayBuffer);

                    // convert file to json
                    let jsonData: BookImportValues[] = [];
                    workbook.worksheets.forEach(function (sheet) {
                        // read first row as data keys
                        let firstRow = sheet.getRow(1);
                        if (!firstRow.cellCount) return;

                        let keys = firstRow.values as any[];
                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber == 1) return;
                            let values = row.values as any;
                            let obj: any = {};
                            for (let i = 1; i < keys.length; i++) {
                                obj[keys[i]] = values[i];
                            }
                            jsonData.push(obj);
                        })
                    });

                    jsonData = jsonData.map((item, index) => {
                        return { ...item, id: index + 1 }
                    })

                    setDataImport(jsonData);
                    console.log("Check data import >>>", jsonData)
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const handleImport = async () => {
        setIsSubmit(true);

        try {
            const dataSubmit = dataImport.map((item) => ({
                name: item.name.toString().trim() || '',
                author: item.author.toString().trim() || '',
                price: item.price,
                quantity: item.quantity,
            }));

            console.log("Check data list >>> ", dataSubmit);

            const importListBooksFromFileResponse = await importListBooksFromFileAPI(dataSubmit);
            if (importListBooksFromFileResponse.data) {
                console.log("Checkout list >>> ", importListBooksFromFileResponse.data);
                handleClearDataAndCloseModal();
                notification.success({
                    message: "Import users from file",
                    description: `Success = ${importListBooksFromFileResponse.data.countSuccess}. 
                    Error = ${importListBooksFromFileResponse.data.countError}`,
                    duration: 5,
                    placement: "topRight",
                });
                refreshTable();
            }

        } catch (error: any) {
            notification.error({
                message: "Error",
                description: "All books import wrong valid, please check info again!",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error >>> ", error);
        } finally {
            setIsSubmit(false);
        }
    }

    const handleClearDataAndCloseModal = () => {
        setDataImport([]);
        setIsModalImportOpen(false);
    }

    const columns: TableProps<BookImportValues>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
    ];

    return (
        <>
            <Modal
                title="Import book data"
                okText="Import data"
                width={"50vw"}
                maskClosable={false}
                closable={false}
                open={isModalImportOpen}
                onOk={handleImport}
                onCancel={handleClearDataAndCloseModal}
                okButtonProps={{
                    disabled: dataImport.length > 0 ? false : true,
                    loading: isSubmit
                }}
            >
                <Dragger {...propsImport}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Only accept .csv, .xls, .xlsx.
                        &nbsp;
                        <a
                            onClick={e => e.stopPropagation()}
                            download
                            href={templateFile}
                        >
                            Download Sample File
                        </a>
                    </p>
                </Dragger>
                <Table<BookImportValues>
                    rowKey={"id"}
                    style={{ marginTop: "15px" }}
                    title={() => <p style={{ fontWeight: "500" }}>Data upload:</p>}
                    columns={columns}
                    dataSource={dataImport}
                />
            </Modal>
        </>
    )
};

export default ImportBookModal;