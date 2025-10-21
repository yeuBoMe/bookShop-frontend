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
const { TextArea } = Input;

interface BookUpdateValues {
    name: string,
    author: string,
    price: number,
    category: {
        id: number
    } | null,
    quantity: number,
    introduceText: string,
    description: string,
    reader: string,
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

            // const selectedCategory = categories.find(cat => cat.label === dataUpdate.category);
            const initialCategory = dataUpdate.category
                ? { id: categories.find(cat => cat.label === dataUpdate.category)?.value }
                : null;
            form.setFieldsValue({
                name: dataUpdate.name,
                author: dataUpdate.author,
                price: dataUpdate.price,
                // category: selectedCategory ? { id: selectedCategory.value } : { id: null },
                category: initialCategory,
                quantity: dataUpdate.quantity,
                introduceText: dataUpdate.introduceText,
                description: dataUpdate.description,
                reader: dataUpdate.reader,
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

    const handleSelectChange = (value: number | null) => {
        console.log(`selected ${value}`);
        form.setFieldsValue({ category: value !== null ? { id: value } : null });
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

        if (!dataUpdate) return;
        
        try {
            setIsLoading(true);
            const {
                name,
                author,
                price,
                quantity,
                category,
                introduceText,
                description,
                reader
            } = values;

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
            const finalCategory = category && category.id !== undefined ? category : null;
            const updateBookResponse = await updateBookAPI(
                dataUpdate.id,
                name,
                author,
                price,
                quantity,
                finalCategory,
                introduceText,
                description,
                reader,
            );

            if (updateBookResponse.data) {
                handleClearDataAndCloseModal();
                message.success("Update book successfully!");
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
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
                title="Update book"
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText="Update"
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
                                        label="Name:"
                                        name="name"
                                        rules={[
                                            { required: true, message: "Book's name is required" },
                                            { max: 100, message: "Name must be less than 100 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'\-.:\s]{1,100}$/,
                                                message: "Invalid name format",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label="Author:"
                                        name="author"
                                        rules={[
                                            { required: true, message: "Author is required" },
                                            { max: 100, message: "Author must be less than 100 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ'\-.\s]{1,100}$/,
                                                message: "Invalid author format",
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
                                        label="Price:"
                                        name="price"
                                        rules={[
                                            { required: true, message: "Price is required" },
                                            { type: "number", min: 0, message: "Price must be a positive number" },
                                        ]}
                                    >
                                        <InputNumber
                                            addonAfter="đ"
                                            style={{ width: "100%" }}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                            // khi gửi form thì bỏ dấu phẩy
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label="Quantity:"
                                        name="quantity"
                                        rules={[
                                            { required: true, message: "Quantity is required" },
                                            { type: "number", min: 1, max: 1000, message: "Quantity must be between 1 and 1000" },
                                        ]}
                                    >
                                        <InputNumber style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label="Category:"
                                        name={["category", "id"]}
                                    // rules={[{ required: true, message: "Category is required" }]}
                                    >
                                        <Select
                                            allowClear
                                            placeholder="Select a category"
                                            onChange={handleSelectChange}
                                            options={categories}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label="Introduce text:"
                                        name="introduceText"
                                        rules={[
                                            { required: true, message: "Introduce text is required" },
                                            { max: 200, message: "Introduce text must be less than 200 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'.,:;\-\u2013()\s]{1,200}$/,
                                                message: "Invalid introduce text format",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label="Reader:"
                                        name="reader"
                                        rules={[
                                            { required: true, message: "Reader is required" },
                                            { max: 200, message: "Reader must be less than 200 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ'.,\-()\s]{1,200}$/,
                                                message: "Invalid reader format",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Form.Item<BookUpdateValues>
                                        label="Description:"
                                        name="description"
                                        rules={[
                                            { required: true, message: "Description is required" },
                                            { max: 5000, message: "Description must be less than 5000 characters" },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'.,:;()\-–\s]{1,5000}$/,
                                                message: "Invalid description text format",
                                            },
                                        ]}
                                    >
                                        <TextArea
                                            rows={6}
                                            maxLength={5000}
                                            placeholder="Fill book description..."
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item<BookUpdateValues>
                                label="Image:"
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
