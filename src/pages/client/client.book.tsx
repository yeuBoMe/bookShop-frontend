import { FilterTwoTone, ReloadOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Col, Form, Row, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, Empty, App } from "antd";
import type { FormProps, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { fetchAllBooksAPI, fetchAllBooksWithAverageRatingAPI, fetchAllCategoriesSelectAPI } from "@/services/api.service";
import "styles/client/book/client.book.scss";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useCurrentApp } from "@/components/context/app.context";

interface FilterValues {
    category?: string[];
    range?: {
        from?: number;
        to?: number;
    }
    rating?: number;
}

const BookPage = () => {
    const [searchTerm] = useOutletContext() as any;
    const navigate = useNavigate();
    const { user, setCarts } = useCurrentApp();
    const { notification, message } = App.useApp();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState<boolean>(true);

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [books, setBooks] = useState<IBook[]>([]);

    const [filter, setFilter] = useState<FilterValues>({});
    const [sort, setSort] = useState<string>("updatedAt,desc");

    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 12,
        pages: 0,
        total: 0
    });

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
            console.error("Failed to fetch categories:", error);
        }
    };

    const buildQuery = (page: number) => {
        let query = `page=${page}&size=${meta.pageSize}`;
        let filterConditions: string[] = [];

        if (filter.category && filter.category.length > 0) {
            const categoryConditions = filter.category.map(name => `category.name='${name}'`).join(" or ");
            filterConditions.push(`(${categoryConditions})`);
        }
        if (filter.range?.from) {
            filterConditions.push(`price>=${filter.range.from}`);
        }
        if (filter.range?.to) {
            filterConditions.push(`price<=${filter.range.to}`);
        }
        if (searchTerm) {
            filterConditions.push(`name~~'${searchTerm}'`);
        }

        if (filterConditions.length > 0) {
            query += `&filter=${filterConditions.join(" and ")}`;
        }

        if (sort) {
            query += `&sort=${sort}`;
        }

        return query;
    }

    const fetchBooks = async (page: number) => {
        try {
            setLoading(true);
            const queryBuilt = buildQuery(page);

            if (filter.rating) {
                const fetchAllBooksWithAverageRatingResponse = await fetchAllBooksWithAverageRatingAPI(filter.rating, queryBuilt);
                if (fetchAllBooksWithAverageRatingResponse.data) {
                    setBooks(fetchAllBooksWithAverageRatingResponse.data.result);
                    setMeta(fetchAllBooksWithAverageRatingResponse.data.meta);
                }
            } else {
                const fetchAllBooksResponse = await fetchAllBooksAPI(queryBuilt);
                if (fetchAllBooksResponse.data) {
                    console.log("Check query >>> ", queryBuilt);
                    setBooks(fetchAllBooksResponse.data.result);
                    setMeta(fetchAllBooksResponse.data.meta);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch books:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(1);
    }, [filter, sort, searchTerm]);

    const handleChangeFilter = (changedValues: any, values: any) => {
        console.log("Filter changed:", changedValues, values);
        setFilter(values);
    };

    const onFinish: FormProps<FilterValues>['onFinish'] = async (values: any) => {
        console.log("Apply filter:", values);
        setFilter(values);
    };

    const handleReset = () => {
        form.resetFields();
        setFilter({});
    }

    const handlePageChange = (page: number) => {
        fetchBooks(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTabChange = (key: string) => {
        console.log("Tab changed:", key);
        switch (key) {
            case "1":
                setSort("updatedAt,desc");
                break;
            case "2":
                setSort("createdAt,asc");
                break;
            case "3":
                setSort("price,asc");
                break;
            case "4":
                setSort("price,desc");
                break;
            default:
                break;
        }
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

        if (!user || !user.id) {
            notification.warning({
                message: "Chưa đăng nhập",
                description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
                duration: 3,
                placement: "topRight"
            });
            setTimeout(() => {
                navigate("/login");
            }, 1000);
            return;
        }

        if (!book) return;

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
            setCarts(data);
        }

        message.success(`Đã thêm 1 sản phẩm "${book.name}" vào giỏ hàng`);
    };

    const items: TabsProps["items"] = [
        { key: "1", label: "Phổ biến" },
        { key: "2", label: "Hàng Mới" },
        { key: "3", label: "Giá Thấp Đến Cao" },
        { key: "4", label: "Giá Cao Đến Thấp" },
    ];

    return (
        <div className="book-page-container">
            <Row gutter={[20, 20]}>
                {/* Filter Sidebar */}
                <Col xs={24} sm={24} md={6} lg={6}>
                    <div className="filter-sidebar">
                        <div className="filter-header">
                            <span>
                                <FilterTwoTone /> Bộ lọc tìm kiếm
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
                            <Form.Item label={<strong>Danh mục sản phẩm</strong>}>
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

                            <Form.Item label={<strong>Khoảng giá</strong>}>
                                <div className="price-range-inputs">
                                    <Form.Item<FilterValues>
                                        name={["range", "from"]}
                                        noStyle
                                    >
                                        <InputNumber
                                            min={0}
                                            placeholder="đ TỪ"
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
                                            placeholder="đ ĐẾN"
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                        />
                                    </Form.Item>
                                </div>
                            </Form.Item>

                            <Divider />

                            <Form.Item label={<strong>Đánh giá</strong>}>
                                <div className="rating-options">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div
                                            key={rating}
                                            className="rating-item"
                                            onClick={() => handleRatingClick(rating)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Rate value={rating} disabled />
                                            {rating < 5 && <span className="rating-text">trở lên</span>}
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
                                <Spin size="large" tip="Đang tải sản phẩm..." />
                            </div>
                        ) : books.length === 0 ? (
                            <div className="empty-container">
                                <Empty description="Không có sản phẩm nào phù hợp" />
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
                                                        src={
                                                            book.images && book.images.length > 0
                                                                ? `${baseUrl}/upload/book/${book.images[0]}`
                                                                : "https://via.placeholder.com/200x280?text=No+Image"
                                                        }
                                                        alt={book.name}
                                                    />
                                                    <div className="book-badge">Hot</div>
                                                </div>

                                                <div className="book-info">
                                                    <div
                                                        className="book-name"
                                                        onClick={() => handleNavigateBookItem(book.id)}
                                                    >
                                                        {book.name}
                                                    </div>

                                                    <div className="book-price">
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }).format(book.price)}
                                                    </div>

                                                    <div className="book-rating">
                                                        <Rate value={book.averageStars} allowHalf disabled />
                                                        <span className="sold-count">Đã bán 1.2k</span>
                                                    </div>

                                                    <Button
                                                        type="default"
                                                        icon={<ShoppingCartOutlined />}
                                                        className="book-add-cart-btn"
                                                        onClick={(e) => handleAddToCart(e, book)}
                                                        block
                                                    >
                                                        Thêm vào giỏ
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                <div className="pagination-wrapper">
                                    <Pagination
                                        current={meta.current}
                                        total={meta.total}
                                        pageSize={meta.pageSize}
                                        responsive
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BookPage;