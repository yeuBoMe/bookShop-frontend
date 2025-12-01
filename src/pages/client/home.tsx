import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App, Carousel, Rate, Spin } from "antd";
import {
    ShoppingCartOutlined,
    TruckOutlined,
    SafetyOutlined,
    CustomerServiceOutlined,
    RightOutlined,
    FireOutlined,
    StarOutlined,
    ThunderboltOutlined
} from "@ant-design/icons";
import "styles/client/home.scss";
import { fetchAllBooksAPI, fetchAllCategoriesSelectAPI } from "@/services/api.service";
import { useCurrentApp } from "@/components/context/app.context";

const HomePage = () => {
    const { user, setCarts } = useCurrentApp();
    const { message, notification } = App.useApp();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [featuredBooks, setFeaturedBooks] = useState<IBook[]>([]);
    const [newArrivals, setNewArrivals] = useState<IBook[]>([]);
    const [bestSellers, setBestSellers] = useState<IBook[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);

    const baseImageUrl = `${import.meta.env.VITE_IMAGE_URL}`;

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch categories
            const categoriesRes = await fetchAllCategoriesSelectAPI();
            if (categoriesRes.data) {
                setCategories(categoriesRes.data.result.slice(0, 6));
            }

            // Fetch featured books (nổi bật)
            const featuredRes = await fetchAllBooksAPI("page=1&size=8&sort=updatedAt,asc");
            if (featuredRes.data) {
                setFeaturedBooks(featuredRes.data.result);
            }

            // Fetch new arrivals (hàng mới)
            const newRes = await fetchAllBooksAPI("page=1&size=4&sort=createdAt,asc");
            if (newRes.data) {
                setNewArrivals(newRes.data.result);
            }

            // Fetch best sellers (bán chạy)
            const bestRes = await fetchAllBooksAPI("page=1&size=4&sort=price,desc");
            if (bestRes.data) {
                setBestSellers(bestRes.data.result);
            }

        } catch (error) {
            console.error("Failed to fetch homepage data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Navigate with scroll to top
    const handleNavigate = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Navigate to product detail
    const handleProductClick = (bookId: number) => {
        navigate(`/books/${bookId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddEachProductToCart = (e: React.MouseEvent, book: IBook) => {
        // Ngăn chặn sự kiện click lan ra card cha
        e.stopPropagation();

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

        const cartStorage = localStorage.getItem("carts");
        if (cartStorage) {
            const carts = JSON.parse(cartStorage) as ICart[];

            let isExistIndex = carts.findIndex((cart) => cart.id === book.id);
            if (isExistIndex > -1) {
                carts[isExistIndex].quantity = carts[isExistIndex].quantity + 1;
            } else {
                carts.push({
                    id: book.id,
                    quantity: 1,
                    detail: book
                });
            }

            localStorage.setItem("carts", JSON.stringify(carts));
            setCarts(carts);
        } else {
            const data = [{
                id: book.id,
                quantity: 1,
                detail: book
            }];
            localStorage.setItem("carts", JSON.stringify(data));

            // sync React context
            setCarts(data);
        }

        message.success(`Đã thêm 1 sản phẩm "${book.name}" vào giỏ hàng!`);
    }

    const renderBookCard = (book: IBook) => (
        <div
            key={book.id}
            className="product-card"
            onClick={() => handleProductClick(book.id)}
        >
            <div className="product-card__image">
                <img
                    src={
                        book.images && book.images.length > 0
                            ? `${baseImageUrl}/${book.images[0]}`
                            : "https://via.placeholder.com/200x280?text=No+Image"
                    }
                    alt={book.name}
                />
                <div className="product-card__badge">Hot</div>
            </div>
            <div className="product-card__content">
                <h3 className="product-card__title">{book.name}</h3>
                <div className="product-card__rating">
                    <Rate disabled defaultValue={5} className="stars" />
                    <span className="count">(99)</span>
                </div>
                <div className="product-card__price">
                    <span className="current">{formatPrice(book.price)}</span>
                    <span className="original">{formatPrice(book.price * 1.3)}</span>
                </div>
                <button
                    className="product-card__btn"
                    onClick={(e) => handleAddEachProductToCart(e, book)}
                >
                    <ShoppingCartOutlined /> Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="homepage-loading">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    return (
        <div className="homepage">
            {/* Hero Banner */}
            <section className="hero">
                <Carousel autoplay autoplaySpeed={5000} effect="fade">
                    <div className="hero__slide hero__slide--1">
                        <div className="hero__content">
                            <span className="hero__subtitle">Ưu đãi đặc biệt</span>
                            <h1 className="hero__title">
                                Mua Sắm Thông Minh <br />
                                <span className="highlight">Tiết Kiệm Hơn 50%</span>
                            </h1>
                            <p className="hero__description">
                                Khám phá hàng ngàn sản phẩm chất lượng cao với giá cực ưu đãi
                            </p>
                            <button
                                className="hero__btn"
                                onClick={() => handleNavigate("/books")}
                            >
                                Mua Ngay <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800" alt="Banner 1" />
                        </div>
                    </div>

                    <div className="hero__slide hero__slide--2">
                        <div className="hero__content">
                            <span className="hero__subtitle">Bộ sưu tập mới</span>
                            <h1 className="hero__title">
                                Sản Phẩm Mới <br />
                                <span className="highlight">Xu Hướng 2025</span>
                            </h1>
                            <p className="hero__description">
                                Cập nhật những sản phẩm hot nhất, đáp ứng mọi nhu cầu
                            </p>
                            <button
                                className="hero__btn"
                                onClick={() => handleNavigate("/books")}
                            >
                                Khám Phá <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800" alt="Banner 2" />
                        </div>
                    </div>

                    <div className="hero__slide hero__slide--3">
                        <div className="hero__content">
                            <span className="hero__subtitle">Giao hàng miễn phí</span>
                            <h1 className="hero__title">
                                Freeship Toàn Quốc <br />
                                <span className="highlight">Đơn Từ 150K</span>
                            </h1>
                            <p className="hero__description">
                                Nhận hàng nhanh chóng, tiện lợi ngay tại nhà bạn
                            </p>
                            <button
                                className="hero__btn"
                                onClick={() => handleNavigate("/books")}
                            >
                                Đặt Hàng <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800" alt="Banner 3" />
                        </div>
                    </div>
                </Carousel>
            </section>

            {/* Features */}
            <section className="features">
                <div className="features__container">
                    <div className="features__item">
                        <div className="features__icon features__icon--delivery">
                            <TruckOutlined />
                        </div>
                        <div className="features__content">
                            <h3>Giao Hàng Nhanh</h3>
                            <p>Freeship đơn từ 150K</p>
                        </div>
                    </div>

                    <div className="features__item">
                        <div className="features__icon features__icon--secure">
                            <SafetyOutlined />
                        </div>
                        <div className="features__content">
                            <h3>Thanh Toán An Toàn</h3>
                            <p>Bảo mật 100%</p>
                        </div>
                    </div>

                    <div className="features__item">
                        <div className="features__icon features__icon--return">
                            <ShoppingCartOutlined />
                        </div>
                        <div className="features__content">
                            <h3>Đổi Trả Dễ Dàng</h3>
                            <p>Trong vòng 7 ngày</p>
                        </div>
                    </div>

                    <div className="features__item">
                        <div className="features__icon features__icon--support">
                            <CustomerServiceOutlined />
                        </div>
                        <div className="features__content">
                            <h3>Hỗ Trợ 24/7</h3>
                            <p>Tư vấn nhiệt tình</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories">
                <div className="section-header">
                    <h2 className="section-title">
                        <StarOutlined /> Danh Mục Nổi Bật
                    </h2>
                    <button
                        className="section-link"
                        onClick={() => handleNavigate("/books")}
                    >
                        Xem tất cả <RightOutlined />
                    </button>
                </div>

                <div className="categories__grid">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="category-card"
                        >
                            <div className="category-card__icon">
                                <ShoppingCartOutlined />
                            </div>
                            <h3 className="category-card__name">{category.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Flash Sale */}
            <section className="flash-sale">
                <div className="section-header">
                    <h2 className="section-title">
                        <ThunderboltOutlined /> Sản phẩm bán chạy
                    </h2>
                </div>

                <div className="products-grid">
                    {bestSellers.map((book) => renderBookCard(book))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-products">
                <div className="section-header">
                    <h2 className="section-title">
                        <FireOutlined /> Sản Phẩm Nổi Bật
                    </h2>
                    <button
                        className="section-link"
                        onClick={() => handleNavigate("/books")}
                    >
                        Xem tất cả <RightOutlined />
                    </button>
                </div>

                <div className="products-grid">
                    {featuredBooks.map((book) => renderBookCard(book))}
                </div>
            </section>

            {/* New Arrivals */}
            <section className="new-arrivals">
                <div className="section-header">
                    <h2 className="section-title">
                        <StarOutlined /> Hàng Mới Về
                    </h2>
                    <button
                        className="section-link"
                        onClick={() => handleNavigate("/books")}
                    >
                        Xem tất cả <RightOutlined />
                    </button>
                </div>

                <div className="products-grid">
                    {newArrivals.map((book) => renderBookCard(book))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="newsletter">
                <div className="newsletter__content">
                    <h2 className="newsletter__title">Đăng Ký Nhận Ưu Đãi</h2>
                    <p className="newsletter__description">
                        Nhận ngay voucher 100K cho đơn hàng đầu tiên
                    </p>
                    <div className="newsletter__form">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn..."
                            className="newsletter__input"
                        />
                        <button className="newsletter__btn">Đăng Ký</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;