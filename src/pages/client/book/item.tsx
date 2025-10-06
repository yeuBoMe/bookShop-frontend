import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Breadcrumb,
    Rate,
    InputNumber,
    Button,
    Tabs,
    Spin,
    App,
    Divider
} from "antd";
import {
    ShoppingCartOutlined,
    SafetyOutlined,
    HomeOutlined
} from "@ant-design/icons";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "styles/client/book.detail.scss";
import BookGalleryModal from "@/components/client/book/gallery.modal";
import { getBookByIdAPI } from "@/services/api.service";

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notification, message } = App.useApp();

    const [loading, setLoading] = useState<boolean>(true);
    const [book, setBook] = useState<IBook | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const [modalGalleryOpen, setModalGalleryOpen] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const refGallery = useRef<ImageGallery>(null);
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

    useEffect(() => {
        if (id) {
            const bookId = parseInt(id);
            fetchBookDetailById(bookId);
        }
    }, [id]);

    const fetchBookDetailById = async (bookId: number) => {
        try {
            setLoading(true);
            const fetchBookByIdResponse = await getBookByIdAPI(bookId);

            if (fetchBookByIdResponse.data) {
                setBook(fetchBookByIdResponse.data);
            }

        } catch (error: any) {
            console.error("Failed to fetch book:", error);
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });

        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    };

    const handleBuyNow = () => {
        message.info("Chức năng đang phát triển");
    };

    if (loading || !book) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Đang tải thông tin sách..." />
            </div>
        );
    }

    const handleOnClickImage = () => {
        setModalGalleryOpen(true);
        setCurrentImageIndex(refGallery.current?.getCurrentIndex() ?? 0)
    }

    const images = book?.images.map((img) => ({
        original: `${baseUrl}/upload/book/${img}`,
        thumbnail: `${baseUrl}/upload/book/${img}`,
    })) || [];

    const tabItems = [
        {
            key: "1",
            label: "Mô tả sản phẩm",
            children: (
                <div className="description-content">
                    <h3>Giới thiệu sách</h3>
                    <p>{book.introduceText || "Không có thông tin giới thiệu."}</p>

                    <h3>Nội dung chính</h3>
                    <p>{book.description || "Không có mô tả chi tiết."}</p>

                    <h3>Đối tượng đọc giả</h3>
                    <p>{book.reader || "Phù hợp với mọi đối tượng độc giả."}</p>
                </div>
            ),
        },
        {
            key: "2",
            label: "Thông số kỹ thuật",
            children: (
                <div className="description-content">
                    <ul>
                        <li><strong>Tên sách:</strong> {book.name}</li>
                        <li><strong>Tác giả:</strong> {book.author}</li>
                        <li><strong>Thể loại:</strong> {book.category}</li>
                        <li><strong>Giá:</strong> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(book.price)}</li>
                        <li><strong>Số lượng còn lại:</strong> {book.quantity}</li>
                        <li><strong>Ngày tạo:</strong> {book.createdAt ? new Date(book.createdAt).toLocaleDateString("vi-VN") : "N/A"}</li>
                        <li><strong>Ngày cập nhật:</strong> {book.updatedAt ? new Date(book.updatedAt).toLocaleDateString("vi-VN") : "N/A"}</li>
                    </ul>
                </div>
            ),
        },
        {
            key: "3",
            label: `Đánh giá (128)`,
            children: (
                <div className="reviews-content">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-avatar">N</div>
                                <div className="reviewer-info">
                                    <div className="reviewer-name">Nguyễn Văn A</div>
                                    <div className="review-date">15/03/2024</div>
                                </div>
                                <Rate disabled defaultValue={5} />
                            </div>
                            <div className="review-text">
                                Cuốn sách rất hay, nội dung chi tiết và dễ hiểu. Rất phù hợp
                                cho những ai muốn nâng cao kỹ năng lập trình. Giao hàng nhanh,
                                đóng gói cẩn thận. Sẽ ủng hộ shop lần sau!
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="book-detail-container">
                {/* Breadcrumb */}
                <div className="book-breadcrumb">
                    <Breadcrumb
                        items={[
                            {
                                title: <HomeOutlined onClick={() => navigate("/")} style={{ cursor: "pointer" }} />,
                            },
                            {
                                title: <span onClick={() => navigate("/books")} style={{ cursor: "pointer" }}>Sản phẩm</span>,
                            },
                            {
                                title: <span onClick={() => navigate(`/books?category.name=${book.category}`)} style={{ cursor: "pointer" }}>{book.category}</span>,
                            },
                            {
                                title: book.name,
                            },
                        ]}
                    />
                </div>

                {/* Main Content */}
                <div className="book-detail-content">
                    <div className="book-detail-main">
                        {/* Gallery */}
                        <div className="book-gallery">
                            <ImageGallery
                                ref={refGallery}
                                items={images}
                                showPlayButton={false}
                                showFullscreenButton={false}
                                showNav={false}
                                thumbnailPosition="bottom"
                                onClick={handleOnClickImage}
                            />
                        </div>

                        {/* Book Info */}
                        <div className="book-info">
                            <h1 className="book-title">{book.name}</h1>

                            {/* Rating */}
                            <div className="book-rating-section">
                                <div className="rating-group">
                                    <Rate disabled defaultValue={5} />
                                    <span className="rating-number">5.0</span>
                                </div>
                                <span className="divider"></span>
                                <span className="sold-count">Đã bán 1.2k</span>
                            </div>

                            {/* Price */}
                            <div className="book-price-section">
                                <div className="price-label">Giá bán</div>
                                <div className="current-price">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(book.price)}
                                </div>
                                <div>
                                    <span className="original-price">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(book.price * 1.3)}
                                    </span>
                                    <span className="discount-badge">-23%</span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="book-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Tác giả:</span>
                                    <span className="meta-value">{book.author}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Thể loại:</span>
                                    <span className="meta-value">{book.category}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Tình trạng:</span>
                                    <span className="meta-value">Còn hàng</span>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="quantity-section">
                                <div className="quantity-label">Số lượng</div>
                                <div className="quantity-controls">
                                    <InputNumber
                                        min={1}
                                        max={book.quantity}
                                        value={quantity}
                                        onChange={(value) => setQuantity(value || 1)}
                                        size="large"
                                    />
                                    <span className="stock-info">
                                        {book.quantity} sản phẩm có sẵn
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <Button
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    className="btn-add-cart"
                                    onClick={handleAddToCart}
                                >
                                    Thêm vào giỏ
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="btn-buy-now"
                                    onClick={handleBuyNow}
                                >
                                    Mua ngay
                                </Button>
                            </div>

                            {/* Guarantee */}
                            <div className="guarantee-section">
                                <div className="guarantee-title">
                                    <SafetyOutlined /> Cam kết từ BookShop
                                </div>
                                <ul>
                                    <li>✓ Sản phẩm chính hãng 100%</li>
                                    <li>✓ Đổi trả miễn phí trong 7 ngày</li>
                                    <li>✓ Freeship đơn hàng từ 150.000đ</li>
                                    <li>✓ Hỗ trợ 24/7</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Description Tabs */}
                    <div className="book-description-section">
                        <Tabs defaultActiveKey="1" items={tabItems} />
                    </div>
                </div>
            </div>
            <BookGalleryModal
                modalGalleryOpen={modalGalleryOpen}
                setModalGalleryOpen={setModalGalleryOpen}
                currentImageIndex={currentImageIndex}
                items={images}
            // title={"Book Image"}
            />
        </>
    );
};

export default BookDetailPage;