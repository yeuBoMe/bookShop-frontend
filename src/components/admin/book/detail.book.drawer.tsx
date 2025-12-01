import {
    Badge,
    Descriptions,
    Drawer,
    Image,
    Upload,
    type DescriptionsProps,
    type GetProp,
    type UploadFile,
    type UploadProps
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface DrawerBookProps {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (v: boolean) => void;
    dataDetail: IBook | null;
    setDataDetail: (v: IBook | null) => void;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const DetailBookDrawer = (props: DrawerBookProps) => {
    const { isDrawerOpen, setIsDrawerOpen, dataDetail, setDataDetail } = props;
    const baseImageUrl = `${import.meta.env.VITE_IMAGE_URL}`;

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const formatDateTime = (value?: string | Date) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "N/A";
    }

    const formatCurrencyVND = (value?: number) => {
        if (!value) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const handleClearDataAndCloseDrawer = () => {
        setIsDrawerOpen(false);
        setDataDetail(null);
    }

    useEffect(() => {
        if (dataDetail) {
            let imgFiles: UploadFile[] = [];
            if (dataDetail.images && dataDetail.images.length > 0) {
                imgFiles = dataDetail.images.map((img) => ({
                    uid: uuidv4(),
                    name: img,
                    status: 'done',
                    url: `${baseImageUrl}/${img}`,
                }))
            }

            setFileList(imgFiles);
            console.log("Check data img >>> ", imgFiles)
        } else {
            setFileList([]);
        }
    }, [dataDetail]);

    const items: DescriptionsProps['items'] = [
        ...(dataDetail ? [
            {
                key: '1',
                label: 'Name',
                span: 2,
                children: <p>{dataDetail.name}</p>,
            },
            {
                key: '2',
                label: 'Id',
                children: <p>{dataDetail.id}</p>,
            },
            {
                key: '3',
                label: 'Author',
                children: <p>{dataDetail.author}</p>,
            },
            {
                key: '4',
                label: 'Category',
                children: (
                    <Badge
                        status="processing"
                        text={dataDetail.category ? dataDetail.category : "NULL"}
                    />
                ),
            },
            {
                key: '5',
                label: 'Price',
                children: <p>{formatCurrencyVND(dataDetail.price)}</p>,
            },
            {
                key: '6',
                label: 'Created At',
                children: <p>{formatDateTime(dataDetail.createdAt)}</p>,
            },
            {
                key: '7',
                label: 'Updated At',
                children: <p>{formatDateTime(dataDetail.updatedAt)}</p>,
            },
        ] : [])
    ];

    return (
        <>
            <Drawer
                title="Book Detail"
                placement={"right"}
                onClose={handleClearDataAndCloseDrawer}
                open={isDrawerOpen}
                width={"50vw"}
            >
                <Descriptions
                    title="Book Info"
                    items={items}
                    size="small"
                    bordered
                    column={2}
                />

                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "16px",
                        margin: "25px 0 10px 0",
                        color: "#1677ff", // màu primary của antd
                    }}
                >
                    Book Image
                </div>

                <Upload
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    showUploadList={
                        { showRemoveIcon: false }
                    }
                />

                {previewImage && (
                    <Image
                        wrapperStyle={{ display: 'none' }}
                        preview={{
                            visible: previewOpen,
                            onVisibleChange: (visible) => setPreviewOpen(visible),
                            afterOpenChange: (visible) => !visible && setPreviewImage(''),
                        }}
                        src={previewImage}
                    />
                )}
            </Drawer>
        </>
    );
};

export default DetailBookDrawer;