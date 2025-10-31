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
                label: 'Id',
                children: <p>{dataDetail.id}</p>,
            },
            {
                key: '2',
                label: 'Name',
                children: <p>{dataDetail.name}</p>,
            },
            {
                key: '3',
                label: 'Created At',
                children: <p>{formatDateTime(dataDetail.createdAt)}</p>,
            },
            {
                key: '4',
                label: 'Updated At',
                children: <p>{formatDateTime(dataDetail.updatedAt)}</p>,
            },
        ] : [])
    ];

    return (
        <>
            <Drawer
                title="Category Detail"
                placement={"right"}
                onClose={handleClearDataAndCloseDrawer}
                open={isDrawerOpen}
                width={"50vw"}
            >
                <Descriptions
                    title="Category Info"
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