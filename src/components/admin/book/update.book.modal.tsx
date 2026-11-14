import {
    fetchAllCategoriesSelectAPI,
    updateBookAPI,
    deleteBookMultipleImagesInCloudAPI,
    updateBookMultipleImagesToCloudAPI
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
import { useTranslation } from "react-i18next";
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

    const baseImageUrl = import.meta.env.VITE_IMAGE_URL || "https://res.cloudinary.com/dvglvfask/image/upload";

    const [form] = Form.useForm<BookUpdateValues>();
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
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
                const fetchAllCategoriesResponse = await fetchAllCategoriesSelectAPI();
                if (fetchAllCategoriesResponse.data) {
                    const categoriesData: CategorySelectValues[] = fetchAllCategoriesResponse.data.result;
                    const categoriesSelect = categoriesData.map((category: CategorySelectValues) => ({
                        value: category.id,
                        label: category.name
                    }));
                    setCategories(categoriesSelect);
                }
            } catch {
                message.error(t("admin.msg.loadCategoriesFail"));
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
                    url: `${baseImageUrl}/${img}`,
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
            message.error(t("admin.msg.imageTypeInvalid"));
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error(t("admin.msg.imageTooLarge"));
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
                    await deleteBookMultipleImagesInCloudAPI(dataUpdate.id, deletedImages);
                    console.log(`Deleted ${deletedImages.length} images`);
                } catch (error: any) {
                    console.error('Check error delete image >>> ', error);
                    message.warning(t("admin.msg.deleteImagesFail"));
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
                    await updateBookMultipleImagesToCloudAPI(dataUpdate.id, newFiles);
                    console.log(`Uploaded ${newFiles.length} images`);
                } catch (error: any) {
                    console.error('Check error update image >>> ', error);
                    message.error(t("admin.msg.uploadImagesFail"));
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
                message.success(t("admin.msg.updateSuccess", { entity: t("admin.entity.book") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
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
                title={t("admin.form.updateTitle", { entity: t("admin.entity.book") })}
                closable={false}
                maskClosable={false}
                open={isModalUpdateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText={t("common.update")}
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
                                        label={t("field.name")}
                                        name="name"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.name") }) },
                                            { max: 100, message: t("validate.maxLength", { field: t("field.name"), max: 100 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'\-.:\s]{1,100}$/,
                                                message: t("validate.invalid", { field: t("field.name") }),
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label={t("field.author")}
                                        name="author"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.author") }) },
                                            { max: 100, message: t("validate.maxLength", { field: t("field.author"), max: 100 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ'\-.\s]{1,100}$/,
                                                message: t("validate.invalid", { field: t("field.author") }),
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
                                        label={t("field.price")}
                                        name="price"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.price") }) },
                                            { type: "number", min: 0, message: t("validate.positive", { field: t("field.price") }) },
                                        ]}
                                    >
                                        <InputNumber
                                            addonAfter={t("common.currency")}
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
                                        label={t("field.quantity")}
                                        name="quantity"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.quantity") }) },
                                            { type: "number", min: 1, max: 1000, message: t("validate.range", { field: t("field.quantity"), min: 1, max: 1000 }) },
                                        ]}
                                    >
                                        <InputNumber style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item<BookUpdateValues>
                                        label={t("field.category")}
                                        name={["category", "id"]}
                                    // rules={[{ required: true, message: t("validate.required", { field: t("field.category") }) }]}
                                    >
                                        <Select
                                            placeholder={t("admin.form.selectCategory")}
                                            onChange={handleSelectChange}
                                            options={categories}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label={t("field.introduceText")}
                                        name="introduceText"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.introduceText") }) },
                                            { max: 200, message: t("validate.maxLength", { field: t("field.introduceText"), max: 200 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'.,:;\-\u2013()\s]{1,200}$/,
                                                message: t("validate.invalid", { field: t("field.introduceText") }),
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<BookUpdateValues>
                                        label={t("field.reader")}
                                        name="reader"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.reader") }) },
                                            { max: 200, message: t("validate.maxLength", { field: t("field.reader"), max: 200 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ'.,\-()\s]{1,200}$/,
                                                message: t("validate.invalid", { field: t("field.reader") }),
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
                                        label={t("field.description")}
                                        name="description"
                                        rules={[
                                            { required: true, message: t("validate.required", { field: t("field.description") }) },
                                            { max: 5000, message: t("validate.maxLength", { field: t("field.description"), max: 5000 }) },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹà-ỹ0-9'.,:;()\-–\s]{1,5000}$/,
                                                message: t("validate.invalid", { field: t("field.description") }),
                                            },
                                        ]}
                                    >
                                        <TextArea
                                            rows={6}
                                            maxLength={5000}
                                            placeholder={t("admin.form.fillDescription")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item<BookUpdateValues>
                                label={t("field.image")}
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
                                                <div style={{ marginTop: 8 }}>{t("admin.form.upload")}</div>
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
