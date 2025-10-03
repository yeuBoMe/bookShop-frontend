import { InboxOutlined } from "@ant-design/icons";
import { App, Modal, Table, type TableProps, type UploadProps } from "antd";
import { Upload } from 'antd';
import { useState } from "react";
import Exceljs from "exceljs";
import { importListUsersFromFileAPI } from "@/services/api.service";
import templateFile from "assets/template/users_import.xlsx?url";
// import { Buffer } from "buffer";

const { Dragger } = Upload;

interface UserImportValues {
    fullName: string;
    email: string;
    phone: string;
}

interface UserImportProps {
    isModalImportOpen: boolean;
    setIsModalImportOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const ImportUserModal = (props: UserImportProps) => {
    const { isModalImportOpen, setIsModalImportOpen, refreshTable } = props;
    const { notification, message } = App.useApp();
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
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
                console.log(info);
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
            // const dataSubmit = dataImport.map(item => ({
            //     ...item
            // }));
            const dataSubmit = dataImport.map(item => ({
                fullName: item.fullName?.toString()?.trim() || '',
                email: item.email?.toString()?.trim() || '',
                phone: item.phone?.toString()?.trim() || ''
            }));

            console.log("Check data list >>> ", dataSubmit);

            const importUsersFromFileResponse = await importListUsersFromFileAPI(dataSubmit);

            if (importUsersFromFileResponse.data) {
                console.log("Checkout list >>> ", importUsersFromFileResponse.data);
                handleClearDataAndCloseModal();
                notification.success({
                    message: "Import users from file",
                    description: `Success = ${importUsersFromFileResponse.data.countSuccess}. 
                    Error = ${importUsersFromFileResponse.data.countError}`,
                    duration: 5,
                    placement: "topRight",
                });
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: "All users import wrong valid, please check info again!",
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
                <Table<UserImportValues>
                    rowKey={"id"}
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