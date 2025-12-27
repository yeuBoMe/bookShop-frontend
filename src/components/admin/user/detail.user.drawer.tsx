import { Avatar, Badge, Descriptions, Drawer } from "antd";
import type { DescriptionsProps } from "antd/lib";
import dayjs from "dayjs";

interface DrawerUserProps {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (v: boolean) => void;
    dataDetail: IUserView | null;
    setDataDetail: (v: IUserView | null) => void;
}

const DetailUserDrawer = (props: DrawerUserProps) => {
    const { isDrawerOpen, setIsDrawerOpen, dataDetail, setDataDetail } = props;
    const baseImageUrl = import.meta.env.VITE_IMAGE_URL || "https://res.cloudinary.com/dvglvfask/image/upload";
    const urlAvatar = `${baseImageUrl}/${dataDetail?.avatar}`;

    const formatDateTime = (value?: string | Date) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "N/A";
    }

    const items: DescriptionsProps['items'] = [
        ...(dataDetail ? [
            {
                key: '1',
                label: 'Id',
                children: <p>{dataDetail.id}</p>,
            },
            {
                key: '2',
                label: 'Full Name',
                children: <p>{dataDetail.fullName}</p>,
            },
            {
                key: '3',
                label: 'Email',
                children: <p>{dataDetail.email}</p>,
            },
            {
                key: '4',
                label: 'Phone',
                children: <p>{dataDetail.phone}</p>,
            },
            {
                key: '5',
                label: 'Role',
                children: (
                    <Badge
                        status="processing"
                        text={dataDetail.role?.name ? dataDetail.role.name : "USER"}
                    />
                ),
            },
            {
                key: '6',
                label: 'Avatar',
                children: (
                    <Avatar
                        src={dataDetail.avatar ? urlAvatar : "user"}
                    />
                ),
            },
            {
                key: '7',
                label: 'Created At',
                children: <p>{formatDateTime(dataDetail?.createdAt)}</p>,
            },
            {
                key: '8',
                label: 'Updated At',
                children: <p>{formatDateTime(dataDetail?.updatedAt)}</p>,
            },
        ] : [])
    ];

    const handleClearDataAndCloseDrawer = () => {
        setIsDrawerOpen(false);
        setDataDetail(null);
    }

    return (
        <>
            <Drawer
                title="User Detail"
                placement={"right"}
                width={"50vw"}
                open={isDrawerOpen}
                onClose={handleClearDataAndCloseDrawer}
            >
                <Descriptions
                    title="User Info"
                    items={items}
                    bordered
                    size="small"
                    column={2}
                />
            </Drawer>
        </>
    );
};

export default DetailUserDrawer;