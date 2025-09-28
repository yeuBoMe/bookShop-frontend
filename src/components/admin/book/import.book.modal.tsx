interface ImportProps {
    isModalImportOpen: boolean;
    setIsModalImportOpen: (v: boolean) => void;
    refreshTable: () => void;
}

const ImportBookModal = (props: ImportProps) => {
    const {isModalImportOpen, setIsModalImportOpen, refreshTable} = props;

    return (
        <div>ImportBookModal</div>
    );
};

export default ImportBookModal;