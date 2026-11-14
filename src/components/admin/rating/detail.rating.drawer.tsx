import { useTranslation } from "react-i18next";
import { Badge, Descriptions, Drawer, type DescriptionsProps } from "antd";
import dayjs from "dayjs";

interface DrawerRatingProps {
    isDrawerDetailOpen: boolean;
    setIsDrawerDetailOpen: (v: boolean) => void;
    dataDetail: IRating | null;
    setDataDetail: (v: IRating | null) => void;
}

const DetailRatingDrawer = (props: DrawerRatingProps) => {
    const { t } = useTranslation();
    const {
        isDrawerDetailOpen,
        setIsDrawerDetailOpen,
        dataDetail,
        setDataDetail
    } = props;

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
                label: t("admin.table.user"),
                children: <p>{dataDetail.user.name}</p>,
            },
            {
                key: '3',
                label: t("admin.table.book"),
                children: <p>{dataDetail.book}</p>,
            },
            {
                key: '4',
                label: t("admin.table.stars"),
                children: (
                    <Badge
                        status="processing"
                        text={dataDetail.stars}
                    />
                ),
            },
            {
                key: '5',
                label: t("admin.table.comment"),
                children: <p>{dataDetail.comment}</p>,
            },
            {
                key: '6',
                label: t("admin.table.createdAt"),
                children: <p>{formatDateTime(dataDetail?.createdAt)}</p>,
            },
            {
                key: '7',
                label: t("admin.table.updatedAt"),
                children: <p>{formatDateTime(dataDetail?.updatedAt)}</p>,
            },
        ] : [])
    ];

    const handleClearDataAndCloseDrawer = () => {
        setIsDrawerDetailOpen(false);
        setDataDetail(null);
    }

    return (
        <>
            <Drawer
                title={t("admin.detail.title", { entity: t("admin.entity.rating") })}
                placement={"right"}
                width={"50vw"}
                open={isDrawerDetailOpen}
                onClose={handleClearDataAndCloseDrawer}
            >
                <Descriptions
                    title={t("admin.detail.info", { entity: t("admin.entity.rating") })}
                    items={items}
                    bordered
                    size="small"
                    column={1}
                />
            </Drawer>
        </>
    );
};

export default DetailRatingDrawer;