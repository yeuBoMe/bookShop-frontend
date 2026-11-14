import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App, Carousel, Rate, Spin } from "antd";
import { useTranslation } from "react-i18next";
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
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { formatPrice, getBookImageUrl } from "@/services/helper";

const HomePage = () => {
    const { notification } = App.useApp();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const addBookToCart = useAddToCart();

    const [loading, setLoading] = useState(true);
    const [featuredBooks, setFeaturedBooks] = useState<IBook[]>([]);
    const [newArrivals, setNewArrivals] = useState<IBook[]>([]);
    const [bestSellers, setBestSellers] = useState<IBook[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const categoriesRes = await fetchAllCategoriesSelectAPI();
            if (categoriesRes.data) {
                setCategories(categoriesRes.data.result.slice(0, 6));
            }

            const featuredRes = await fetchAllBooksAPI("page=1&size=8&sort=updatedAt,asc");
            if (featuredRes.data) {
                setFeaturedBooks(featuredRes.data.result);
            }

            const newRes = await fetchAllBooksAPI("page=1&size=4&sort=createdAt,asc");
            if (newRes.data) {
                setNewArrivals(newRes.data.result);
            }

            const bestRes = await fetchAllBooksAPI("page=1&size=4&sort=price,desc");
            if (bestRes.data) {
                setBestSellers(bestRes.data.result);
            }

        } catch (error: any) {
            notification.error({
                message: t("home.loadFail"),
                description: error?.message ?? t("book.tryAgainLater"),
                placement: "topRight",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleProductClick = (bookId: number) => {
        navigate(`/books/${bookId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddEachProductToCart = (e: React.MouseEvent, book: IBook) => {
        e.stopPropagation();
        addBookToCart(book, 1);
    };

    const renderBookCard = (book: IBook) => (
        <div
            key={book.id}
            className="product-card"
            onClick={() => handleProductClick(book.id)}
        >
            <div className="product-card__image">
                <img
                    src={getBookImageUrl(book.images)}
                    alt={book.name}
                />
                <div className="product-card__overlay" />
                <div className="product-card__badge">{t("common.hot")}</div>
            </div>
            <div className="product-card__content">
                <h3 className="product-card__title">{book.name}</h3>
                <div className="product-card__rating">
                    <Rate value={book.averageStars ?? 0} allowHalf disabled className="stars" />
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
                    <ShoppingCartOutlined /> {t("home.addToCart")}
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="homepage-loading">
                <Spin size="large" tip={t("home.loading")} />
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
                            <span className="hero__subtitle">{t("home.heroBadge1")}</span>
                            <h1 className="hero__title">
                                {t("home.heroTitle1a")} <br />
                                <span className="highlight">{t("home.heroTitle1b")}</span>
                            </h1>
                            <p className="hero__description">
                                {t("home.heroDesc1")}
                            </p>
                            <button className="hero__btn" onClick={() => handleNavigate("/books")}>
                                {t("home.heroCta1")} <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800" alt={t("home.heroTitle1a")} />
                        </div>
                    </div>

                    <div className="hero__slide hero__slide--2">
                        <div className="hero__content">
                            <span className="hero__subtitle">{t("home.heroBadge2")}</span>
                            <h1 className="hero__title">
                                {t("home.heroTitle2a")} <br />
                                <span className="highlight">{t("home.heroTitle2b")}</span>
                            </h1>
                            <p className="hero__description">
                                {t("home.heroDesc2")}
                            </p>
                            <button className="hero__btn" onClick={() => handleNavigate("/books")}>
                                {t("home.heroCta2")} <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800" alt={t("home.heroTitle2a")} />
                        </div>
                    </div>

                    <div className="hero__slide hero__slide--3">
                        <div className="hero__content">
                            <span className="hero__subtitle">{t("home.heroBadge3")}</span>
                            <h1 className="hero__title">
                                {t("home.heroTitle3a")} <br />
                                <span className="highlight">{t("home.heroTitle3b")}</span>
                            </h1>
                            <p className="hero__description">
                                {t("home.heroDesc3")}
                            </p>
                            <button className="hero__btn" onClick={() => handleNavigate("/books")}>
                                {t("home.heroCta3")} <RightOutlined />
                            </button>
                        </div>
                        <div className="hero__image">
                            <img src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800" alt={t("home.heroTitle3a")} />
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
                            <h3>{t("home.perk1")}</h3>
                            <p>{t("home.perk1Note")}</p>
                        </div>
                    </div>
                    <div className="features__item">
                        <div className="features__icon features__icon--secure">
                            <SafetyOutlined />
                        </div>
                        <div className="features__content">
                            <h3>{t("home.perk2")}</h3>
                            <p>{t("home.perk2Note")}</p>
                        </div>
                    </div>
                    <div className="features__item">
                        <div className="features__icon features__icon--return">
                            <ShoppingCartOutlined />
                        </div>
                        <div className="features__content">
                            <h3>{t("home.perk3")}</h3>
                            <p>{t("home.perk3Note")}</p>
                        </div>
                    </div>
                    <div className="features__item">
                        <div className="features__icon features__icon--support">
                            <CustomerServiceOutlined />
                        </div>
                        <div className="features__content">
                            <h3>{t("home.perk4")}</h3>
                            <p>{t("home.perk4Note")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories">
                <div className="section-header">
                    <h2 className="section-title">
                        <StarOutlined /> {t("home.featuredCategories")}
                    </h2>
                    <button className="section-link" onClick={() => handleNavigate("/books")}>
                        {t("home.seeAll")} <RightOutlined />
                    </button>
                </div>
                <div className="categories__grid">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card">
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
                <div>
                    <div className="section-header">
                        <h2 className="section-title">
                            <ThunderboltOutlined /> {t("home.bestSellers")}
                        </h2>
                    </div>
                    <div className="products-grid">
                        {bestSellers.map((book) => renderBookCard(book))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-products">
                <div className="section-header">
                    <h2 className="section-title">
                        <FireOutlined /> {t("home.featuredProducts")}
                    </h2>
                    <button className="section-link" onClick={() => handleNavigate("/books")}>
                        {t("home.seeAll")} <RightOutlined />
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
                        <StarOutlined /> {t("home.newArrivals")}
                    </h2>
                    <button className="section-link" onClick={() => handleNavigate("/books")}>
                        {t("home.seeAll")} <RightOutlined />
                    </button>
                </div>
                <div className="products-grid">
                    {newArrivals.map((book) => renderBookCard(book))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="newsletter">
                <div className="newsletter__content">
                    <h2 className="newsletter__title">{t("home.newsletterTitle")}</h2>
                    <p className="newsletter__description">
                        {t("home.newsletterDesc")}
                    </p>
                    <div className="newsletter__form">
                        <input
                            type="email"
                            placeholder={t("home.newsletterPlaceholder")}
                            className="newsletter__input"
                        />
                        <button className="newsletter__btn">{t("home.newsletterCta")}</button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;