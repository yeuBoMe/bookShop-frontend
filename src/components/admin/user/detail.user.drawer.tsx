import { Badge, Descriptions, Drawer } from "antd";
import type { DescriptionsProps } from "antd/lib";

interface DrawerUserProps {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (v: boolean) => void;
    dataDetail: IUserView | null;
    setDataDetail: (v: IUserView | null) => void;
}

const DetailUserDrawer = (props: DrawerUserProps) => {
    const { isDrawerOpen, setIsDrawerOpen, dataDetail, setDataDetail } = props;

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
                label: 'Created At',
                children: <p>{dataDetail.createdAt.toString()}</p>,
            },
            {
                key: '6',
                label: 'Updated At',
                children: <p>{dataDetail.updatedAt.toString()}</p>,
            },
            {
                key: '7',
                label: 'Role',
                children: <Badge
                    status="processing"
                    text={dataDetail.role?.name ? dataDetail.role.name : "USER"}
                />,
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
                title="User information"
                placement={"right"}
                width={500}
                open={isDrawerOpen}
                onClose={handleClearDataAndCloseDrawer}
            >
                <Descriptions
                    title="User Info"
                    items={items}
                    bordered
                    size="small"
                    layout="horizontal"
                    column={3}
                />
            </Drawer>
        </>
    );
};

export default DetailUserDrawer;