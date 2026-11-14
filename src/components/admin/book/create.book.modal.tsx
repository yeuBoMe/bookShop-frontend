import { createBookAPI, fetchAllCategoriesSelectAPI, updateBookMultipleImagesToCloudAPI } from "@/services/api.service";
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
const { TextArea } = Input;

interface BookCreateValues {
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

interface CreateBookProps {
    isModalCreateOpen: boolean;
    setIsModalCreateOpen: (v: boolean) => void;
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

const CreateBookModal = (props: CreateBookProps) => {
    const { isModalCreateOpen, setIsModalCreateOpen, refreshTable } = props;
    const [form] = Form.useForm<BookCreateValues>();
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState('');

    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [categories, setCategories] = useState<{ value: number, label: string }[]>([]);

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const fetchAllCategoriesResponse = await fetchAllCategoriesSelectAPI();
                if (fetchAllCategoriesResponse.data) {
                    const categoriesData: CategorySelectValues[] = fetchAllCategoriesResponse.data?.result;
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
    }, []);

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

    const handleSelectChange = (value: number) => {
        console.log(`selected ${value}`);
        form.setFieldsValue({ category: value !== null ? { id: value } : null });
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleCreateBook: FormProps<BookCreateValues>['onFinish'] = async (values) => {
        console.log('Success:', values);

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

            const finalCategory = category && category.id !== undefined ? category : null;
            const createBookResponse = await createBookAPI(
                name,
                author,
                price,
                quantity,
                finalCategory,
                introduceText,
                description,
                reader
            );

            if (createBookResponse.data) {
                // Xử lý upload ảnh nếu có
                if (fileList.length > 0) {
                    const files = fileList
                        .filter(file => file.originFileObj) // lọc các pt trong fileList, giữ lai file có thuộc tính originFileObj
                        .map(file => file.originFileObj as File); // chuyển từng file trong Upload tm đk sang File 

                    if (files.length > 0) {
                        setImageLoading(true);
                        await updateBookMultipleImagesToCloudAPI(createBookResponse.data.id, files);
                    }
                }

                handleClearDataAndCloseModal();
                message.success(t("admin.msg.createSuccess", { entity: t("admin.entity.book") }));
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });
            console.log("Check error create book >>> ", error)
        } finally {
            setIsLoading(false);
            setImageLoading(false);
        }
    };

    const handleClearDataAndCloseModal = () => {
        form.resetFields();
        setImageLoading(false);
        setFileList([]);
        setIsModalCreateOpen(false);
    }

    return (
        <>
            <Modal
                title={t("admin.form.createTitle", { entity: t("admin.entity.book") })}
                closable={false}
                maskClosable={false}
                open={isModalCreateOpen}
                onOk={() => form.submit()}
                onCancel={handleClearDataAndCloseModal}
                loading={isLoading}
                okText={t("common.create")}
                width={"50vw"}
            >
                <Row justify={"center"}>
                    <Col xl={24} md={22} lg={22}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            onFinish={handleCreateBook}
                            autoComplete="off"
                            style={{ marginTop: "10px" }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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
                                    <Form.Item<BookCreateValues>
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

                            <Form.Item<BookCreateValues>
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

export default CreateBookModal;