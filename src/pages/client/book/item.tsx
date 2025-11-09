import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Breadcrumb,
    Rate,
    InputNumber,
    Button,
    Tabs,
    App,
    Divider,
    Skeleton,
    Pagination,
    Empty,
    Avatar,
    Input,
    Popconfirm
} from "antd";
import {
    ShoppingCartOutlined,
    SafetyOutlined,
    HomeOutlined,
    UserOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "styles/client/book/book.detail.scss";
import BookGalleryModal from "@/components/client/book/gallery.modal";
import {
    createRatingAPI,
    deleteRatingAPI,
    fetchListRatingsByBookIdAPI,
    getBookByIdAPI,
    getRatingByUserIdAndBookIdAPI
} from "@/services/api.service";
import { useCurrentApp } from "@/components/context/app.context";

const { TextArea } = Input;

const BookDetailPage = () => {
    const { id } = useParams();
    const { user, setCarts } = useCurrentApp();
    const navigate = useNavigate();

    const { notification, message } = App.useApp();

    const [loading, setLoading] = useState<boolean>(false);
    const [ratingsLoading, setRatingsLoading] = useState<boolean>(false);
    const [deleteRatingLoading, setDeleteRatingLoading] = useState<boolean>(false);

    const [book, setBook] = useState<IBook | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const [ratings, setRatings] = useState<IRating[]>([]);
    const [totalRatings, setTotalRatings] = useState<number>(0);
    const [userRating, setUserRating] = useState<IRating | null>(null);

    const [newRatingStars, setNewRatingStars] = useState<number>(0);
    const [newRatingComment, setNewRatingComment] = useState<string>("");
    const [isSubmitRating, setIsSubmitRating] = useState<boolean>(false);

    const [modalGalleryOpen, setModalGalleryOpen] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const refGallery = useRef<ImageGallery>(null);
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;
    const currentUserAvatarUrl = `${baseUrl}/upload/avatar/${user?.avatar}`;

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 3,
        pages: 0,
        total: 0
    });

    useEffect(() => {
        if (id) {
            const bookId = parseInt(id);
            fetchBookDetailById(bookId);
            fetchListRatingsByBookId(bookId, 1);
            if (user && user.id) {
                fetchUserRating(user?.id, bookId);
            }
        }
    }, [id]);

    const fetchBookDetailById = async (bookId: number) => {
        try {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
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

    const fetchListRatingsByBookId = async (bookId: number, page: number) => {
        try {
            setRatingsLoading(true);
            const query = `page=${page}&size=${meta.pageSize}&sort=createdAt,desc`;
            const fetchListRatingsByBookIdResponse = await fetchListRatingsByBookIdAPI(bookId, query);
            if (fetchListRatingsByBookIdResponse.data) {
                setMeta(fetchListRatingsByBookIdResponse.data.meta);
                setRatings(fetchListRatingsByBookIdResponse.data.result);
                setTotalRatings(fetchListRatingsByBookIdResponse.data.meta.total);
            }
        } catch (error: any) {
            console.error("Failed to fetch ratings:", error);
        } finally {
            setRatingsLoading(false);
        }
    }

    const fetchUserRating = async (userId: number, bookId: number) => {
        try {
            const getRatingByUserIdAndBookIdResponse = await getRatingByUserIdAndBookIdAPI(userId, bookId);
            if (getRatingByUserIdAndBookIdResponse.data) {
                setUserRating(getRatingByUserIdAndBookIdResponse.data);
            }
        } catch (error: any) {
            // User hasn't rated yet
            setUserRating(null);
        }
    }

    const handleSubmitRating = async () => {
        if (!user || !user.id) {
            notification.warning({
                message: "Chưa đăng nhập",
                description: "Vui lòng đăng nhập để đánh giá sản phẩm",
                duration: 3,
                placement: "topRight",
            });
            setTimeout(() => {
                navigate("/login");
            }, 1000);
            return;
        }

        if (!book) { return };

        try {
            setIsSubmitRating(true);
            const dataSend = {
                stars: newRatingStars,
                comment: newRatingComment,
                user: { id: user.id },
                book: { id: book.id }
            };

            const createRatingResponse = await createRatingAPI(dataSend);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log("Check data rating>>>", createRatingResponse);
            if (createRatingResponse.data) {
                message.success("Bạn đã thêm đánh giá thành công, cảm ơn bạn!");
                setNewRatingStars(0);
                setNewRatingComment("");
                window.location.reload();
                // await fetchListRatingsByBookId(parseInt(id!), 1);
                // await fetchUserRating(user.id, parseInt(id!));
                // setLoading(true);
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi",
                description: error?.message || "Không thể gửi đánh giá",
                duration: 5,
                placement: "topRight",
            });
            console.log("Check error rating>>>", error);
        } finally {
            setIsSubmitRating(false);
            setLoading(false);
        }
    }

    // const handleDeleteRating = async (ratingId: number) => {
    //     if (!user) { return };

    //     try {
    //         setDeleteRatingLoading(true);
    //         const deleteRatingResponse = await deleteRatingAPI(ratingId);
    //         await new Promise((resolver) => setTimeout(resolver, 1000));

    //         if (deleteRatingResponse) {
    //             message.success("Xóa đánh giá thành công!");
    //             await fetchListRatingsByBookId(parseInt(id!), 1);
    //             await fetchUserRating(user.id, parseInt(id!));
    //         }
    //     } catch (error: any) {
    //         notification.error({
    //             message: "Lỗi",
    //             description: error?.message || "Không thể gửi đánh giá",
    //             duration: 5,
    //             placement: "topRight",
    //         });
    //     } finally {
    //         setDeleteRatingLoading(false);
    //     }
    // }

    const handleAddToCart = () => {
        // Kiểm tra đăng nhập
        if (!user || !user.id) {
            notification.warning({
                message: "Chưa đăng nhập",
                description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
                duration: 3,
                placement: "topRight"
            });
            // Chuyển hướng về trang đăng nhập sau 1 giây
            setTimeout(() => {
                navigate("/login");
            }, 1000);
            return;
        }

        if (!book) return;

        // update local storage
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage) {
            // update
            const carts = JSON.parse(cartStorage) as ICart[];

            // check exists
            let isExistIndex = carts.findIndex(cart => cart.id === book.id);
            if (isExistIndex > -1) {
                carts[isExistIndex].quantity = carts[isExistIndex].quantity + quantity;
            } else {
                carts.push({
                    id: book.id,
                    quantity: quantity,
                    detail: book
                });
            }

            localStorage.setItem("carts", JSON.stringify(carts));
            setCarts(carts);
        } else {
            // create
            const data = [{
                id: book.id,
                quantity: quantity,
                detail: book!
            }];

            localStorage.setItem("carts", JSON.stringify(data));

            // sync React context
            setCarts(data);
        }
        message.success(`Đã thêm ${quantity} sản phẩm "${book.name}" vào giỏ hàng`);
    };

    const handlePageChange = (page: number) => {
        fetchListRatingsByBookId(parseInt(id!), page);
    }

    const formatDate = (dateString?: string | Date) => {
        return dateString ? new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }) : "N/A";
    };

    if (loading) {
        return (
            <div className="book-detail-container">
                <div className="book-breadcrumb">
                    <Skeleton active>
                        <Skeleton.Button active style={{ width: 80, height: 20, marginRight: 10 }} />
                        <Skeleton.Button active style={{ width: 80, height: 20, marginRight: 10 }} />
                        <Skeleton.Button active style={{ width: 120, height: 20, marginRight: 10 }} />
                        <Skeleton.Button active style={{ width: 200, height: 20 }} />
                    </Skeleton>
                </div>
                <div className="book-detail-content">
                    <div className="book-detail-main">
                        <div className="book-gallery">
                            <Skeleton.Image active style={{ width: 450, height: 550, borderRadius: 8 }} />
                            <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center" }}>
                                {[1, 2, 3, 4].map((item) => (
                                    <Skeleton.Image
                                        key={item}
                                        active
                                        style={{ width: 100, height: 100, borderRadius: 4 }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="book-info">
                            <Skeleton.Input active style={{ width: "100%", height: 40, marginBottom: 15 }} />
                            <div className="book-rating-section">
                                <Skeleton.Button active style={{ width: 120, height: 20, marginRight: 20 }} />
                                <Skeleton.Button active style={{ width: 40, height: 20, marginRight: 20 }} />
                                <Skeleton.Button active style={{ width: 80, height: 20 }} />
                            </div>
                            <div
                                className="book-price-section"
                                style={{
                                    background: "linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%)",
                                    padding: 25,
                                    borderRadius: 8,
                                    marginBottom: 25,
                                }}
                            >
                                <Skeleton.Input active style={{ width: 100, height: 20, marginBottom: 8 }} />
                                <Skeleton.Input active style={{ width: 200, height: 36, marginBottom: 8 }} />
                                <Skeleton.Input active style={{ width: 150, height: 20 }} />
                            </div>
                            <div className="book-meta">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="meta-item" style={{ display: "flex", padding: "12px 0" }}>
                                        <Skeleton.Input active style={{ width: 140, height: 20, marginRight: 10 }} />
                                        <Skeleton.Input active style={{ width: 200, height: 20 }} />
                                    </div>
                                ))}
                            </div>
                            <div className="quantity-section">
                                <Skeleton.Input active style={{ width: 100, height: 20, marginBottom: 12 }} />
                                <div className="quantity-controls" style={{ display: "flex", gap: 15 }}>
                                    <Skeleton.Input active style={{ width: 120, height: 40 }} />
                                    <Skeleton.Input active style={{ width: 150, height: 20 }} />
                                </div>
                            </div>
                            <div className="action-buttons" style={{ display: "flex", gap: 15, marginBottom: 20 }}>
                                <Skeleton.Button active style={{ width: 200, height: 48, borderRadius: 6 }} />
                                <Skeleton.Button active style={{ width: 200, height: 48, borderRadius: 6 }} />
                            </div>
                            <div
                                className="guarantee-section"
                                style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 6, padding: 15 }}
                            >
                                <Skeleton.Input active style={{ width: 200, height: 20, marginBottom: 10 }} />
                                <Skeleton active paragraph={{ rows: 4, width: ["80%", "60%", "70%", "50%"] }} />
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className="book-description-section">
                        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                            {[1, 2, 3].map((item) => (
                                <Skeleton.Button key={item} active style={{ width: 120, height: 40 }} />
                            ))}
                        </div>
                        <div
                            className="description-content"
                            style={{ padding: 25, background: "#fafafa", borderRadius: 6 }}
                        >
                            <Skeleton active paragraph={{ rows: 6, width: ["100%", "80%", "90%", "70%", "85%", "60%"] }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="loading-container">
                <p>Không tìm thấy sách</p>
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
            label: "Thông số chi tiết",
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
            label: `Đánh giá (${totalRatings})`,
            children: (
                <div className="reviews-content">
                    {/* Rating Form - Only show if user hasn't rated */}
                    {!userRating && (
                        <div className="rating-form">
                            <h3>Viết đánh giá của bạn</h3>
                            <div className="rating-stars">
                                <span>Đánh giá:</span>
                                <Rate
                                    value={newRatingStars}
                                    onChange={setNewRatingStars}
                                />
                            </div>
                            <TextArea
                                rows={4}
                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm... (tối đa 200 ký tự)"
                                value={newRatingComment}
                                onChange={(e) => setNewRatingComment(e.target.value)}
                                showCount
                                required
                            />
                            <Button
                                type="primary"
                                onClick={handleSubmitRating}
                                loading={isSubmitRating}
                                style={{ marginTop: 10 }}
                            >
                                Gửi đánh giá
                            </Button>
                        </div>
                    )}

                    {/* User's existing rating */}
                    {userRating && (
                        <div className="user-rating-notice">
                            <div className="notice-header">
                                <span>✓ Bạn đã đánh giá sản phẩm này</span>
                            </div>
                            <div className="review-item user-review">
                                <div className="review-header">
                                    <div className="reviewer-avatar">
                                        {user?.avatar ? (
                                            <Avatar
                                                src={currentUserAvatarUrl}
                                                size={40}
                                                alt={user.fullName || "User Avatar"}
                                            />
                                        ) : (
                                            <Avatar icon={<UserOutlined />} />
                                        )}

                                    </div>
                                    <div className="reviewer-info">
                                        <div className="reviewer-name">{userRating.user.name}</div>
                                        <div className="review-date">
                                            {formatDate(userRating.createdAt)}
                                        </div>
                                    </div>
                                    <Rate disabled value={userRating.stars} />
                                    {/* <Popconfirm
                                        placement='topLeft'
                                        title="Xóa đánh giá"
                                        description="Bạn có muốn xóa đánh giá này?"
                                        okText="Ok"
                                        cancelText="Hủy"
                                        onConfirm={() => handleDeleteRating(userRating.id)}
                                        okButtonProps={{ loading: deleteRatingLoading }}
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        >
                                            Xóa
                                        </Button>
                                    </Popconfirm> */}
                                </div>
                                <div className="review-text">{userRating.comment}</div>
                            </div>
                        </div>
                    )}

                    <Divider />

                    {/* All ratings */}
                    <h3>Tất cả đánh giá</h3>
                    {ratingsLoading ? (
                        <Skeleton active paragraph={{ rows: 3 }} />
                    ) : ratings.length > 0 ? (
                        <>
                            {ratings.map((rating) => {
                                const userAvatarUrl = rating.user?.avatar
                                    ? `${baseUrl}/upload/avatar/${rating.user.avatar}`
                                    : null;

                                return (
                                    <div key={rating.id} className="review-item">
                                        <div className="review-header">
                                            <div className="reviewer-avatar">
                                                {rating.user?.avatar ? (
                                                    <Avatar
                                                        src={userAvatarUrl}
                                                        size={40}
                                                        alt={rating.user.name || "User Avatar"}
                                                    />
                                                ) : (
                                                    <Avatar icon={<UserOutlined />} />
                                                )}
                                            </div>
                                            <div className="reviewer-info">
                                                <div className="reviewer-name">{rating.user.name}</div>
                                                <div className="review-date">
                                                    {formatDate(rating.createdAt)}
                                                </div>
                                            </div>
                                            <Rate disabled value={rating.stars} />
                                        </div>
                                        <div className="review-text">{rating.comment}</div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            <div style={{ marginTop: 20, textAlign: "center" }}>
                                <Pagination
                                    current={meta.current}
                                    total={totalRatings}
                                    pageSize={meta.pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    responsive
                                />
                            </div>
                        </>
                    ) : (
                        <Empty description="Chưa có đánh giá nào" />
                    )}
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
                                title: <span>{book.category}</span>,
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
                                    <Rate defaultValue={book.averageStars} allowHalf disabled />
                                    <span className="rating-number">{book.averageStars}.0</span>
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
                                    Thêm vào giỏ hàng
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
                title={book.name}
            />
        </>
    );
};

export default BookDetailPage;