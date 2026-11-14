import ImageGallery from "react-image-gallery";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import "react-image-gallery/styles/css/image-gallery.css";

interface BookGalleryProps {
    modalGalleryOpen: boolean;
    setModalGalleryOpen: (v: boolean) => void;
    currentImageIndex: number;
    items: { original: string; thumbnail: string }[];
    title: string;
}

const BookGalleryModal = (props: BookGalleryProps) => {
    const { t } = useTranslation();
    const {
        modalGalleryOpen,
        setModalGalleryOpen,
        currentImageIndex,
        items,
        title
    } = props;

    const refGallery = useRef<ImageGallery>(null);

    useEffect(() => {
        if (modalGalleryOpen && refGallery.current) {
            refGallery.current.slideToIndex(currentImageIndex);
        }
    }, [modalGalleryOpen, currentImageIndex]);

    const handleClearDataAndCloseModal = () => {
        setModalGalleryOpen(false);
    };

    return (
        <Modal
            title={title}
            closable={true}
            maskClosable={false}
            open={modalGalleryOpen}
            onCancel={handleClearDataAndCloseModal}
            footer={null}
            width="50vw"
        >
            {items.length > 0 ? (
                <ImageGallery
                    ref={refGallery}
                    items={items}
                    showPlayButton={false}
                    showFullscreenButton={false}
                    startIndex={currentImageIndex}
                    showThumbnails={true}
                    showBullets={false}
                />
            ) : (
                <div>{t("error.noImages")}</div>
            )}
        </Modal>
    );
};

export default BookGalleryModal;