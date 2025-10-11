import { FilterTwoTone, ReloadOutlined } from "@ant-design/icons";
import { Col, Form, Row, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, Empty } from "antd";
import type { FormProps, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { fetchAllBooksAPI, fetchAllCategoriesAPI } from "@/services/api.service";
import "styles/client/client.book.scss";
import { useNavigate } from "react-router-dom";

interface FilterValues {
    category?: string[];
    range?: {
        from?: number;
        to?: number;
    }
}

const BookPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState<boolean>(true);

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [books, setBooks] = useState<IBook[]>([]);

    const [filter, setFilter] = useState<FilterValues>({});
    const [sort, setSort] = useState<string>("updatedAt,desc");

    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 9,
        pages: 0,
        total: 0
    });

    // Fetch categories
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const fetchCategories = async () => {
            try {
                const response = await fetchAllCategoriesAPI();
                if (response.data) {
                    setCategories(response.data.result);
                }
            } catch (error: any) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

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

        if (filterConditions.length > 0) {
            query += `&filter=${filterConditions.join(" and ")}`;
        }

        if (sort) {
            query += `&sort=${sort}`;
        }

        return query;
    }

    // Fetch books với pagination
    const fetchBooks = async (page: number) => {
        try {
            setLoading(true);
            const queryBuilt = buildQuery(page);
            const response = await fetchAllBooksAPI(queryBuilt);
            if (response.data) {
                console.log("Check query >>> ", queryBuilt);
                setBooks(response.data.result);
                setMeta(response.data.meta);
            }
        } catch (error: any) {
            console.error("Failed to fetch books:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(1);
    }, [filter, sort]);

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
            case "3": // Giá thấp đến cao
                setSort("price,asc");
                break;
            case "4": // Giá cao đến thấp
                setSort("price,desc");
                break;
            default:
                break;
        }
    };

    const handleNavigateBookItem = (bookId: number) => {
        navigate(`/books/${bookId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

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
                                {/* <Button
                                    onClick={() => form.submit()}
                                    className="apply-filter-btn"
                                    type="primary"
                                >
                                    Áp dụng
                                </Button> */}
                            </Form.Item>

                            <Divider />

                            <Form.Item label={<strong>Đánh giá</strong>}>
                                <div className="rating-options">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="rating-item">
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
                        {/* Tabs for sorting */}
                        <Tabs
                            defaultActiveKey="1"
                            items={items}
                            onChange={handleTabChange}
                            className="sort-tabs"
                        />

                        {/* Books Grid */}
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
                                                {/* Book Image */}
                                                <div className="book-image-wrapper">
                                                    <img
                                                        src={
                                                            book.images && book.images.length > 0
                                                                ? `${baseUrl}/upload/book/${book.images[0]}`
                                                                : "https://via.placeholder.com/200x280?text=No+Image"
                                                        }
                                                        alt={book.name}
                                                        onClick={() => handleNavigateBookItem(book.id)}
                                                    />
                                                </div>

                                                {/* Book Info */}
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
                                                        <Rate value={5} disabled />
                                                        <span className="sold-count">Đã bán 29</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                {/* Pagination */}
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