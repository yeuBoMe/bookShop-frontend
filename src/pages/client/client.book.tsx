import { FilterTwoTone, ReloadOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Col, Form, Row, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Spin, Empty, App } from "antd";
import { useTranslation } from "react-i18next";
import type { FormProps, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchAllCategoriesSelectAPI, searchBooksAPI } from "@/services/api.service";
import "styles/client/book/client.book.scss";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { formatPrice, getBookImageUrl } from "@/services/helper";

interface FilterValues {
    category?: string[];
    range?: {
        from?: number;
        to?: number;
    }
    rating?: number;
}

const BookPage = () => {
    const [searchTerm] = useOutletContext() as [string];
    // Chờ người dùng ngừng gõ 400ms rồi mới gọi API, thay vì bắn request mỗi ký tự
    const debouncedSearchTerm = useDebounce(searchTerm, 400);
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const { t } = useTranslation();
    const addBookToCart = useAddToCart();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState<boolean>(true);

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [books, setBooks] = useState<IBook[]>([]);

    const [filter, setFilter] = useState<FilterValues>({});
    const [sort, setSort] = useState<TBookSort>("NEWEST");

    // Phan trang theo con tro: chi nho "cho vua dung", khong nho so trang.
    // Doi lai khong biet tong so trang - dung y voi cach hien thi "xem them".
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const fetchAllCategoriesResponse = await fetchAllCategoriesSelectAPI();
            if (fetchAllCategoriesResponse.data) {
                setCategories(fetchAllCategoriesResponse.data.result);
            }
        } catch (error: any) {
            notification.error({
                message: t("book.loadCategoriesFail"),
                description: error?.message ?? t("book.tryAgainLater"),
                placement: "topRight",
            });
        }
    };

    /** Ten the loai o o tich -> id, vi backend loc theo id. */
    const resolveCategoryIds = () => {
        if (!filter.category || filter.category.length === 0) {
            return undefined;
        }
        return categories
            .filter((category) => filter.category!.includes(category.name))
            .map((category) => category.id);
    };

    const buildSearchParams = (nextCursor: string | null): IBookSearchParams => ({
        keyword: debouncedSearchTerm || undefined,
        categoryIds: resolveCategoryIds(),
        minPrice: filter.range?.from,
        maxPrice: filter.range?.to,
        minRating: filter.rating,
        sort,
        cursor: nextCursor,
        size: 12,
    });

    /**
     * `append` = true khi bam "xem them": noi them vao danh sach dang co.
     * false khi doi bo loc: thay moi tu dau va bo con tro cu di.
     */
    const fetchBooks = async (nextCursor: string | null, append: boolean) => {
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await searchBooksAPI(buildSearchParams(nextCursor));
            if (response.data) {
                const page = response.data;
                setBooks((previous) => (append ? [...previous, ...page.items] : page.items));
                setCursor(page.nextCursor);
                setHasNext(page.hasNext);
            }
        } catch (error: any) {
            notification.error({
                message: t("book.loadBooksFail"),
                description: error?.message ?? t("book.tryAgainLater"),
                placement: "topRight",
            });
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    /**
     * Gộp mọi tiêu chí thành một khoá chuỗi rồi mới cho vào mảng phụ thuộc.
     *
     * Không dùng thẳng `filter` và `categories`: `filter` đổi tham chiếu mỗi lần form
     * re-render, còn `categories` nạp xong mới có id để ánh xạ — để nguyên hai thứ đó
     * thì mỗi lần mở trang sẽ gọi API hai lần dù tiêu chí không hề đổi.
     */
    const searchKey = [
        debouncedSearchTerm,
        sort,
        (resolveCategoryIds() ?? []).join("."),
        filter.range?.from ?? "",
        filter.range?.to ?? "",
        filter.rating ?? "",
    ].join("|");

    // Đổi tiêu chí là phải bắt đầu lại từ đầu, không giữ con trỏ cũ
    useEffect(() => {
        fetchBooks(null, false);
    }, [searchKey]);


    const handleChangeFilter = (_changedValues: any, values: any) => {
        setFilter(values);
    };

    const onFinish: FormProps<FilterValues>['onFinish'] = async (values: any) => {
        setFilter(values);
    };

    const handleReset = () => {
        form.resetFields();
        setFilter({});
    }

    const handleTabChange = (key: string) => {
        const sortByTabKey: Record<string, TBookSort> = {
            "1": "RATING_DESC",
            "2": "NEWEST",
            "3": "PRICE_ASC",
            "4": "PRICE_DESC",
        };
        setSort(sortByTabKey[key] ?? "NEWEST");
    };

    const handleRatingClick = (rating: number) => {
        const currentRating = form.getFieldValue('rating');
        if (currentRating === rating) {
            // Nếu click vào rating đang active, bỏ chọn
            form.setFieldValue('rating', undefined);
            setFilter({ ...filter, rating: undefined });
        } else {
            // Set rating mới
            form.setFieldValue('rating', rating);
            setFilter({ ...filter, rating });
        }
    };

    const handleNavigateBookItem = (bookId: number) => {
        navigate(`/books/${bookId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const handleAddToCart = (e: React.MouseEvent, book: IBook) => {
        e.stopPropagation();
        addBookToCart(book, 1);
    };

    const items: TabsProps["items"] = [
        { key: "1", label: t("book.sortPopular") },
        { key: "2", label: t("book.sortNewest") },
        { key: "3", label: t("book.sortPriceAsc") },
        { key: "4", label: t("book.sortPriceDesc") },
    ];

    return (
        <div className="book-page-container">
            <Row gutter={[20, 20]}>
                {/* Filter Sidebar */}
                <Col xs={24} sm={24} md={6} lg={6}>
                    <div className="filter-sidebar">
                        <div className="filter-header">
                            <span>
                                <FilterTwoTone /> {t("book.filters")}
                            </span>
                            <ReloadOutlined onClick={handleReset} />
                        </div>

                        <Form
                            form={form}
                            className="filter-form"
                            onFinish={onFinish}
                            onValuesChange={handleChangeFilter}
                            layout="vertical"
                        >
                            <Form.Item label={<strong>{t("book.categories")}</strong>}>
                                <Form.Item<FilterValues>
                                    name="category"
                                    noStyle
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            {categories.map((category) => (
                                                <Col span={24} key={category.id} className="category-checkbox">
                                                    <Checkbox value={category.name}>
                                                        {category.name}
                                                    </Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                            </Form.Item>

                            <Divider />

                            <Form.Item label={<strong>{t("book.priceRange")}</strong>}>
                                <div className="price-range-inputs">
                                    <Form.Item<FilterValues>
                                        name={["range", "from"]}
                                        noStyle
                                    >
                                        <InputNumber
                                            min={0}
                                            placeholder={t("book.priceFrom")}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                        />
                                    </Form.Item>
                                    <span>-</span>
                                    <Form.Item<FilterValues>
                                        name={["range", "to"]}
                                        noStyle
                                    >
                                        <InputNumber
                                            min={0}
                                            placeholder={t("book.priceTo")}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                        />
                                    </Form.Item>
                                </div>
                            </Form.Item>

                            <Divider />

                            <Form.Item label={<strong>{t("book.rating")}</strong>}>
                                <div className="rating-options">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div
                                            key={rating}
                                            className="rating-item"
                                            onClick={() => handleRatingClick(rating)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Rate value={rating} disabled />
                                            {rating < 5 && <span className="rating-text">{t("book.ratingAndUp")}</span>}
                                        </div>
                                    ))}
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>

                {/* Products Grid */}
                <Col xs={24} sm={24} md={18} lg={18}>
                    <div className="products-section">
                        <Tabs
                            defaultActiveKey="1"
                            items={items}
                            onChange={handleTabChange}
                            className="sort-tabs"
                        />

                        {loading ? (
                            <div className="loading-container">
                                <Spin size="large" tip={t("book.loading")} />
                            </div>
                        ) : books.length === 0 ? (
                            <div className="empty-container">
                                <Empty description={t("book.noMatch")} />
                            </div>
                        ) : (
                            <>
                                <Row gutter={[20, 20]} className="books-grid">
                                    {books.map((book) => (
                                        <Col xs={12} sm={8} md={8} lg={6} key={book.id}>
                                            <div className="book-card">
                                                <div
                                                    className="book-image-wrapper"
                                                    onClick={() => handleNavigateBookItem(book.id)}
                                                >
                                                    <img
                                                        src={getBookImageUrl(book.images)}
                                                        alt={book.name}
                                                    />
                                                    <div className="book-badge">{t("common.hot")}</div>
                                                </div>

                                                <div className="book-info">
                                                    <div
                                                        className="book-name"
                                                        onClick={() => handleNavigateBookItem(book.id)}
                                                    >
                                                        {book.name}
                                                    </div>

                                                    <div className="book-price">
                                                        {formatPrice(book.price)}
                                                    </div>

                                                    <div className="book-rating">
                                                        <Rate value={book.averageStars ?? 0} allowHalf disabled />
                                                        <span className="sold-count">{t("book.soldCount")}</span>
                                                    </div>

                                                    <Button
                                                        type="default"
                                                        icon={<ShoppingCartOutlined />}
                                                        className="book-add-cart-btn"
                                                        onClick={(e) => handleAddToCart(e, book)}
                                                        block
                                                    >
                                                        {t("book.addToCart")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                {hasNext && (
                                    <div className="load-more-wrapper">
                                        <Button
                                            size="large"
                                            loading={isLoadingMore}
                                            onClick={() => fetchBooks(cursor, true)}
                                        >
                                            {t("book.loadMore")}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BookPage;