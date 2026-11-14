import { useTranslation } from "react-i18next";
import {
    Descriptions,
    Drawer,
    type DescriptionsProps,
} from "antd";
import dayjs from "dayjs";

interface DrawerCategoryProps {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (v: boolean) => void;
    dataDetail: ICategory | null;
    setDataDetail: (v: ICategory | null) => void;
}

const DetailCategoryDrawer = (props: DrawerCategoryProps) => {
    const { t } = useTranslation();
    const { isDrawerOpen, setIsDrawerOpen, dataDetail, setDataDetail } = props;

    const handleClearDataAndCloseDrawer = () => {
        setIsDrawerOpen(false);
        setDataDetail(null);
    }

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
                label: t("admin.table.name"),
                children: <p>{dataDetail.name}</p>,
            },
            {
                key: '3',
                label: t("admin.table.createdAt"),
                children: <p>{formatDateTime(dataDetail.createdAt)}</p>,
            },
            {
                key: '4',
                label: t("admin.table.updatedAt"),
                children: <p>{formatDateTime(dataDetail.updatedAt)}</p>,
            },
        ] : [])
    ];

    return (
        <>
            <Drawer
                title={t("admin.detail.title", { entity: t("admin.entity.category") })}
                placement={"right"}
                onClose={handleClearDataAndCloseDrawer}
                open={isDrawerOpen}
                width={"50vw"}
            >
                <Descriptions
                    title={t("admin.detail.info", { entity: t("admin.entity.category") })}
                    items={items}
                    size="small"
                    bordered
                    column={2}
                />
            </Drawer>
        </>
    );
};

export default DetailCategoryDrawer;