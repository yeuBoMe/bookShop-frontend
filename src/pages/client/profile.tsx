import { useEffect, useState } from "react";
import { Modal, Tabs, Form, Input, Button, Upload, Image, App } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { FormProps, GetProp, UploadFile, UploadProps } from "antd";
import { v4 as uuidv4 } from 'uuid';
import "styles/client/profile.scss";
import { useCurrentApp } from "@/components/context/app.context";
import {
    deleteUserAvatarInCloudAPI,
    updateUserAPI,
    updateUserAvatarToCloudAPI,
    updateUserPasswordAPI
} from "@/services/api.service";

interface InfoValues {
    email: string;
    fullName: string;
    phone: string;
    avatar: UploadFile[];
}

interface PasswordValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const ProfilePage = () => {
    const { user, setUser } = useCurrentApp();
    const { notification, message } = App.useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("1");

    const [infoForm] = Form.useForm<InfoValues>();
    const [passwordForm] = Form.useForm<PasswordValues>();

    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [deletedImage, setDeletedImage] = useState<string>("");

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState('');

    const [isUpdateInfoLoading, setIsUpdateInfoLoading] = useState<boolean>(false);
    const [isUpdatePassLoading, setIsUpdatePassLoading] = useState<boolean>(false);

    const baseImageUrl = import.meta.env.VITE_IMAGE_URL || "https://res.cloudinary.com/dvglvfask/image/upload";
    const urlAvatar = user?.avatar ? `${baseImageUrl}/${user.avatar}` : '';

    useEffect(() => {
        if (isModalOpen === true && user && user.id) {
            const avatarFile = user.avatar
                ? [
                    {
                        uid: uuidv4(),
                        name: user.avatar,
                        status: "done" as const,
                        url: urlAvatar,
                    },
                ]
                : [];

            setFileList(avatarFile);
            setDeletedImage("");

            infoForm.setFieldsValue({
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                avatar: avatarFile,
            });
        } else {
            setDeletedImage("");
            setFileList([]);
        }
    }, [isModalOpen, user]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setActiveTab("1");
        infoForm.resetFields();
        passwordForm.resetFields();
        setFileList([]);
        setDeletedImage("");
    };

    const handleUpdateInfo: FormProps<InfoValues>['onFinish'] = async (values) => {
        console.log('Success:', values);
        if (!user) return;

        try {
            setIsUpdateInfoLoading(true);
            const { fullName, phone } = values;

            if (deletedImage) {
                try {
                    setImageLoading(true);
                    await deleteUserAvatarInCloudAPI(user.id, deletedImage);
                    console.log(`Deleted ${deletedImage.length} image`);
                } catch (error: any) {
                    console.error('Check error delete image >>> ', error);
                    message.warning('Cannot delete image!');
                }
            }

            let updatedAvatar: string | undefined = user.avatar;
            const newAvatar = fileList.length > 0 && fileList[0].originFileObj;

            if (newAvatar) {
                try {
                    setImageLoading(true);
                    const updateUserAvatarToCloudResponse = await updateUserAvatarToCloudAPI(user.id, newAvatar);
                    if (updateUserAvatarToCloudResponse.data) {
                        updatedAvatar = updateUserAvatarToCloudResponse.data.avatar;
                    }
                } catch (error: any) {
                    console.error('Check error update image >>> ', error);
                    message.error('Cannot upload new image');
                    throw error;
                }
            }

            const updateUserResponse = await updateUserAPI(user.id, fullName, phone);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            if (updateUserResponse.data) {
                setUser({
                    ...user!,
                    fullName,
                    phone,
                    avatar: updatedAvatar
                });

                message.success("Cập nhật tài khoản thành công!");
                handleCloseModal();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "An error happens when updating user",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error update user >>> ", error.message);
        } finally {
            setIsUpdateInfoLoading(false);
            setImageLoading(false);
        }
    };

    const handleUpdatePassword: FormProps<PasswordValues>['onFinish'] = async (values) => {
        console.log("Đổi mật khẩu:", values);
        if (!user) return;

        try {
            setIsUpdatePassLoading(true);
            const { currentPassword, newPassword, confirmPassword } = values;

            const updateUserPasswordResponse = await updateUserPasswordAPI(
                user.id,
                currentPassword,
                newPassword,
                confirmPassword
            );

            await new Promise((resolve) => setTimeout(resolve, 2000));

            if (updateUserPasswordResponse.data) {
                message.success("Đổi mật khẩu thành công!");
                handleCloseModal();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "An error happens when updating password",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error update user password >>> ", error.message);
        } finally {
            setIsUpdatePassLoading(false);
        }
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleRemove = (file: UploadFile) => {
        if (file.url && file.name) {
            setDeletedImage(file.name);
            console.log('Đã đánh dấu xóa ảnh:', file.name);
        }

        setFileList(prevList => prevList.filter(item => item.uid !== file.uid));
        return true;
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) message.error('Chỉ cho phép upload file JPG/PNG!');
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        return isJpgOrPng && isLt2M || Upload.LIST_IGNORE;
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const normFile = (e: any) => {
        if (Array.isArray(e)) return e;
        return e && e.fileList;
    };

    const tabItems = [
        {
            key: "1",
            label: "Cập nhật thông tin",
            children: (
                <div className="profile-tab-content">
                    <Form
                        form={infoForm}
                        layout="vertical"
                        onFinish={handleUpdateInfo}
                        className="profile-form"
                    >
                        <div className="profile-avatar-section">
                            <Form.Item<InfoValues>
                                label="Avatar:"
                                name="avatar"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
                                <Upload
                                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                    listType="picture-circle"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    onRemove={handleRemove}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}
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
                        </div>
                        <Form.Item<InfoValues>
                            label="Email:"
                            name="email"
                            rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
                        >
                            <Input prefix={<MailOutlined />} size="large" disabled />
                        </Form.Item>

                        <Form.Item<InfoValues>
                            label="Tên hiển thị:"
                            name="fullName"
                            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                        >
                            <Input prefix={<UserOutlined />} size="large" />
                        </Form.Item>

                        <Form.Item<InfoValues>
                            label="Số điện thoại:"
                            name="phone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" }]}
                        >
                            <Input prefix={<PhoneOutlined />} size="large" />
                        </Form.Item>

                        <Form.Item className="form-actions">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={isUpdateInfoLoading}
                            >
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )
        },
        {
            key: "2",
            label: "Đổi mật khẩu",
            children: (
                <div className="profile-tab-content">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleUpdatePassword}
                        className="profile-form"
                    >
                        <Form.Item<PasswordValues>
                            label="Mật khẩu hiện tại:"
                            name="currentPassword"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu hiện tại"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item<PasswordValues>
                            label="Mật khẩu mới:"
                            name="newPassword"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item<PasswordValues>
                            label="Xác nhận mật khẩu mới:"
                            name="confirmPassword"
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                // ({ getFieldValue }) => ({
                                //     validator(_, value) {
                                //         if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                                //         return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                //     }
                                // })
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Xác nhận mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item className="form-actions">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={isUpdatePassLoading}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )
        }
    ];

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1 className="profile-title">Tài khoản của tôi</h1>
                <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>
                    Quản lý tài khoản
                </Button>
            </div>

            <Modal
                title="Quản lý tài khoản"
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={700}
                className="profile-modal"
                centered
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="profile-tabs"
                />
            </Modal>
        </div>
    );
};

export default ProfilePage;