import { InboxOutlined } from "@ant-design/icons";
import { App, Modal, Table, type TableProps, type UploadProps } from "antd";
import { Upload } from 'antd';
import { useState } from "react";
import Exceljs from "exceljs";
import { Buffer } from "buffer";

const { Dragger } = Upload;

interface UserImportValues {
    fullName: string;
    email: string;
    phone: string;
}

interface UserImportProps {
    isModalImportOpen: boolean;
    setIsModalImportOpen: (v: boolean) => void;
}

const ImportUserModal = (props: UserImportProps) => {
    const { isModalImportOpen, setIsModalImportOpen } = props;
    const { message } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataImport, setDataImport] = useState<UserImportValues[]>([]);

    const propsImport: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1, // if upload more than 1, keep the last file
        accept: ".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
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
                console.log(info)
                message.success(`${info.file.name} file uploaded successfully.`);
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;

                    // load file to array buffer
                    const workbook = new Exceljs.Workbook();
                    const arrayBuffer = await file.arrayBuffer(); // lấy dữ liệu nhị phân của file
                    // const buffer = Buffer.from(arrayBuffer);
                    await workbook.xlsx.load(arrayBuffer); // nạp vào workbook để ExcelJS hiểu đc

                    // convert file to json
                    let jsonData: UserImportValues[] = [];
                    workbook.worksheets.forEach(function (sheet) {
                        // read first row as data keys (key: fullName, email, phone)
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

    const handleClearDataAndCloseModal = () => {
        setDataImport([]);
        setIsModalImportOpen(false);
    }

    const columns: TableProps<UserImportValues>['columns'] = [
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
    ];

    return (
        <>
            <Modal
                title="Import data user"
                okText="Import data"
                width={"50vw"}
                maskClosable={false}
                closable={false}
                open={isModalImportOpen}
                onOk={() => setIsModalImportOpen(false)}
                onCancel={handleClearDataAndCloseModal}
                okButtonProps={{ disabled: true }}
                loading={isLoading}
            >
                <Dragger {...propsImport}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Only accept .csv, .xls, .xlsx.
                    </p>
                </Dragger>
                <Table<UserImportValues>
                    style={{ marginTop: "15px" }}
                    title={() => <p style={{ fontWeight: "500" }}>Data upload:</p>}
                    columns={columns}
                    dataSource={dataImport}
                />
            </Modal>
        </>
    );
};

export default ImportUserModal;