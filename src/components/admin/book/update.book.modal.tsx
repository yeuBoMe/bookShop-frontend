interface UpdateBookProps {
    isModalUpdateOpen: boolean;
    setIsModalUpdateOpen: (v: boolean) => void;
    dataUpdate: IBook | null;
    setDataUpdate: (v: IBook | null) => void;
    refreshTable: () => void;
}

const UpdateBookModal = (props: UpdateBookProps) => {
    const {
        isModalUpdateOpen,
        setIsModalUpdateOpen,
        dataUpdate,
        setDataUpdate,
        refreshTable
    } = props;
    return (
        <div>UpdateBookModal</div>
    );
};

export default UpdateBookModal;