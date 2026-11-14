import { Avatar, Badge, Descriptions, Drawer } from "antd";
import { useTranslation } from "react-i18next";
import type { DescriptionsProps } from "antd/lib";
import dayjs from "dayjs";

interface DrawerUserProps {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (v: boolean) => void;
    dataDetail: IUserView | null;
    setDataDetail: (v: IUserView | null) => void;
}

const DetailUserDrawer = (props: DrawerUserProps) => {
    const { t } = useTranslation();
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
                label: t("admin.table.id"),
                children: <p>{dataDetail.id}</p>,
            },
            {
                key: '2',
                label: t("admin.table.fullName"),
                children: <p>{dataDetail.fullName}</p>,
            },
            {
                key: '3',
                label: t("admin.table.email"),
                children: <p>{dataDetail.email}</p>,
            },
            {
                key: '4',
                label: t("admin.table.phone"),
                children: <p>{dataDetail.phone}</p>,
            },
            {
                key: '5',
                label: t("admin.table.role"),
                children: (
                    <Badge
                        status="processing"
                        text={dataDetail.role?.name ? dataDetail.role.name : "USER"}
                    />
                ),
            },
            {
                key: '6',
                label: t("admin.table.avatar"),
                children: (
                    <Avatar
                        src={dataDetail.avatar ? urlAvatar : "user"}
                    />
                ),
            },
            {
                key: '7',
                label: t("admin.table.createdAt"),
                children: <p>{formatDateTime(dataDetail?.createdAt)}</p>,
            },
            {
                key: '8',
                label: t("admin.table.updatedAt"),
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
                title={t("admin.detail.title", { entity: t("admin.entity.user") })}
                placement={"right"}
                width={"50vw"}
                open={isDrawerOpen}
                onClose={handleClearDataAndCloseDrawer}
            >
                <Descriptions
                    title={t("admin.detail.info", { entity: t("admin.entity.user") })}
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