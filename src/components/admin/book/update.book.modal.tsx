import { 
    fetchAllCategoriesAPI, 
    updateBookAPI, 
    updateBookMultipleImagesAPI, 
    deleteBookMultipleImagesAPI 
} from "@/services/api.service";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
    App,
    Col,
    Form,
    Image,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Upload,
    type FormProps,
    type GetProp,
    type UploadFile,
    type UploadProps
} from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface BookUpdateValues {
    name: string,
    author: string,
    price: number,
    category: {
        id: number
    },
    quantity: number,
    images: UploadFile[];
}

interface CategorySelectValues {
    id: number,
    name: string,
}

interface UpdateBookProps {
    isModalUpdateOpen: boolean;
    setIsModalUpdateOpen: (v: boolean) => void;
    dataUpdate: IBook | null;
    setDataUpdate: (v: IBook | null) => void;
    refreshTable: () => void;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const UpdateBookModal = (props: UpdateBookProps) => {
    const {
        isModalUpdateOpen,
        setIsModalUpdateOpen,
        dataUpdate,
        setDataUpdate,
        refreshTable
    } = props;

    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

    const [form] = Form.useForm<BookUpdateValues>();
    const { notification, message } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState('');

    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [deletedImages, setDeletedImages] = useState<string[]>([]);

    const [categories, setCategories] = useState<{ value: number, label: string }[]>([]);

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const fetchAllBooksResponse = await fetchAllCategoriesAPI();
                if (fetchAllBooksResponse.data) {
                    const categoriesData: CategorySelectValues[] = fetchAllBooksResponse.data.result;
                    const categoriesSelect = categoriesData.map((category: CategorySelectValues) => ({
                        value: category.id,
                        label: category.name
                    }));
                    setCategories(categoriesSelect);
                }
            } catch {
                message.error("Cannot load list categories!");
            }
        };
        fetchAllCategories();
    }, [])

    useEffect(() => {
        if (dataUpdate) {
            let imgFiles: UploadFile[] = [];
            if (dataUpdate.images && dataUpdate.images.length > 0) {
                imgFiles = dataUpdate.images.map((img) => ({
                    uid: uuidv4(),
                    name: img,
                    status: 'done',
                    url: `${baseUrl}/upload/book/${img}`,
                }));
            }
            setFileList(imgFiles);
            setDeletedImages([]); // Reset deletedImages

            const selectedCategory = categories.find(cat => cat.label === dataUpdate.category);
            form.setFieldsValue({
                name: dataUpdate.name,
                author: dataUpdate.author,
                price: dataUpdate.price,
                category: selectedCategory ? { id: selectedCategory.value } : { id: 0 },
                quantity: dataUpdate.quantity,
                images: imgFiles,
            });
        } else {
            setFileList([]);
            setDeletedImages([]);
        }
    }, [dataUpdate])

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ cho phép upload file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M || Upload.LIST_IGNORE;
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const handleRemove = (file: UploadFile) => {
        // if old images hav url and name, add to deletedImages
        if (file.url && file.name) {
            setDeletedImages(prev => [...prev, file.name]);
            console.log('Đã đánh dấu xóa ảnh:', file.name);
        }

        // Delete file from fileList UI
        setFileList(prevList => prevList.filter(item => item.uid !== file.uid));
        return true;
    };

    const handleSelectChange = (value: number) => {
        console.log(`selected ${value}`);
        form.setFieldsValue({ category: { id: value } });
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleUpdateBook: FormProps<BookUpdateValues>['onFinish'] = async (values) => {
        console.log('Form values:', values);
        console.log('Images removed >>> ', deletedImages);

        setIsLoading(true);
        try {
            if (dataUpdate) {
                const { name, author, price, quantity, category } = values;

                // Step 1: Delete all removed images at client and in db server 
                if (deletedImages.length > 0) {
                    setImageLoading(true);
                    try {
                        await deleteBookMultipleImagesAPI(dataUpdate.id, deletedImages);
                        console.log(`Deleted ${deletedImages.length} images`);
                    } catch (error: any) {
                        console.error('Check error delete image >>> ', error);
                        message.warning('Cannot delete images!');
                        // Continue update
                    }
                }

                // Step 2: Upload images
                const newFiles = fileList
                    .filter(file => file.originFileObj)
                    .map(file => file.originFileObj as File);

                if (newFiles.length > 0) {
                    setImageLoading(true);
                    try {
                        await updateBookMultipleImagesAPI(dataUpdate.id, newFiles);
                        console.log(`Uploaded ${newFiles.length} images`);
                    } catch (error: any) {
                        console.error('Check error update image >>> ', error);
                        message.error('Cannot upload new images');
                        throw error; // Stop if upload fail
                    }
                }

                // Step 3: Update book
                const updateBookResponse = await updateBookAPI(dataUpdate.id, name, author, price, quantity, category);

                if (updateBookResponse.data) {
                    handleClearDataAndCloseModal();
                    message.success("Update book successfully!");
                    refreshTable();
                }
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi",
                description: error?.message || "An error happens when updating book",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error update book >>> ", error.message);
        } finally {
            setIsLoading(false);
            setImageLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setImageLoading(false);
        setIsModalUpdateOpen(false);
        setFileList([]);
        setDeletedImages([]);
        setDataUpdate(null);
    }

    return (
        <>
            <Modal
                title="Cập nhật sách"
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText="Cập nhật"
                width={"50vw"}
            >
                <Row justify={"center"}>
                    <Col xl={24} md={22} lg={22}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            onFinish={handleUpdateBook}
                            autoComplete="off"
                            style={{ marginTop: "10px" }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label="Tên sách:"
                                        name="name"
                                        rules={[
                                            { required: true, message: "Tên sách là bắt buộc" },
                                            { max: 100, message: "Tên sách phải nhỏ hơn 100 ký tự" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'\-.:\s]{1,100}$/,
                                                message: "Định dạng tên không hợp lệ",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label="Tác giả:"
                                        name="author"
                                        rules={[
                                            { required: true, message: "Tác giả là bắt buộc" },
                                            { max: 100, message: "Tên tác giả phải nhỏ hơn 100 ký tự" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ'\-.\s]{1,100}$/,
                                                message: "Định dạng tên tác giả không hợp lệ",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label="Giá:"
                                        name="price"
                                        rules={[
                                            { required: true, message: "Giá là bắt buộc" },
                                            { type: "number", min: 0, message: "Giá phải là số dương" },
                                        ]}
                                    >
                                        <InputNumber
                                            addonAfter="đ"
                                            style={{ width: "100%" }}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label="Số lượng:"
                                        name="quantity"
                                        rules={[
                                            { required: true, message: "Số lượng là bắt buộc" },
                                            { type: "number", min: 1, max: 1000, message: "Số lượng phải từ 1 đến 1000" },
                                        ]}
                                    >
                                        <InputNumber style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label="Thể loại:"
                                        name={["category", "id"]}
                                        rules={[{ required: true, message: "Thể loại là bắt buộc" }]}
                                    >
                                        <Select
                                            placeholder="Chọn thể loại"
                                            onChange={handleSelectChange}
                                            options={categories}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item<BookUpdateValues>
                                label="Ảnh:"
                                name="images"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
                                <Upload
                                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    onRemove={handleRemove}
                                    beforeUpload={beforeUpload}
                                    multiple
                                >
                                    {imageLoading ? (
                                        <LoadingOutlined />
                                    )
                                        : (
                                            <button style={{ border: 0, background: 'none' }} type="button">
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </button>
                                        )}
                                </Upload>
                            </Form.Item>
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

                        </Form>
                    </Col>
                </Row>
            </Modal >
        </>
    );
};

export default UpdateBookModal;
