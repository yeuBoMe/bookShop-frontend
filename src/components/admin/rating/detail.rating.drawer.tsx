
import { Badge, Descriptions, Drawer, type DescriptionsProps } from "antd";
import dayjs from "dayjs";

interface DrawerRatingProps {
    isDrawerDetailOpen: boolean;
    setIsDrawerDetailOpen: (v: boolean) => void;
    dataDetail: IRating | null;
    setDataDetail: (v: IRating | null) => void;
}

const DetailRatingDrawer = (props: DrawerRatingProps) => {
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
                label: 'Id',
                children: <p>{dataDetail.id}</p>,
            },
            {
                key: '2',
                label: 'User',
                children: <p>{dataDetail.user.name}</p>,
            },
            {
                key: '3',
                label: 'Book',
                children: <p>{dataDetail.book}</p>,
            },
            {
                key: '4',
                label: 'Stars',
                children: (
                    <Badge
                        status="processing"
                        text={dataDetail.stars}
                    />
                ),
            },
            {
                key: '5',
                label: 'Comment',
                children: <p>{dataDetail.comment}</p>,
            },
            {
                key: '6',
                label: 'Created At',
                children: <p>{formatDateTime(dataDetail?.createdAt)}</p>,
            },
            {
                key: '7',
                label: 'Updated At',
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
                title="Rating Detail"
                placement={"right"}
                width={"50vw"}
                open={isDrawerDetailOpen}
                onClose={handleClearDataAndCloseDrawer}
            >
                <Descriptions
                    title="Rating Info"
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