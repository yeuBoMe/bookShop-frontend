import { useEffect } from "react";
import { Link } from "react-router-dom";
import "styles/client/about.scss";

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const stats = [
        { number: "15+", label: "Năm kinh nghiệm" },
        { number: "50,000+", label: "Đầu sách" },
        { number: "100,000+", label: "Độc giả thân thiết" },
        { number: "4.9/5", label: "Đánh giá khách hàng" }
    ];

    const values = [
        {
            icon: "📚",
            title: "Đam mê sách",
            description: "Chúng tôi yêu sách và tin rằng mỗi cuốn sách đều có sức mạnh thay đổi cuộc đời người đọc."
        },
        {
            icon: "🎯",
            title: "Chất lượng",
            description: "Tuyển chọn kỹ lưỡng từng đầu sách, đảm bảo nội dung chất lượng và ý nghĩa với độc giả."
        },
        {
            icon: "💝",
            title: "Phục vụ tận tâm",
            description: "Đội ngũ tư vấn nhiệt tình, am hiểu sách, luôn sẵn sàng giúp bạn tìm cuốn sách phù hợp."
        },
        {
            icon: "🌱",
            title: "Cộng đồng đọc",
            description: "Xây dựng cộng đồng yêu sách, nơi mọi người chia sẻ đam mê và lan tỏa văn hóa đọc."
        }
    ];

    const team = [
        {
            name: "Nguyễn Thị Mai",
            position: "Founder & CEO",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
            description: "20 năm kinh nghiệm trong ngành xuất bản"
        },
        {
            name: "Trần Văn Minh",
            position: "Giám đốc Nội dung",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            description: "Chuyên gia tuyển chọn và đánh giá sách"
        },
        {
            name: "Lê Thị Hương",
            position: "Trưởng phòng Marketing",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
            description: "Kết nối sách với độc giả"
        },
        {
            name: "Phạm Đức Anh",
            position: "Quản lý Cửa hàng",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            description: "Mang đến trải nghiệm mua sắm tuyệt vời"
        }
    ];

    const milestones = [
        { year: "2009", event: "Khai trương cửa hàng đầu tiên tại Hà Nội" },
        { year: "2014", event: "Mở rộng chuỗi 10 chi nhánh toàn quốc" },
        { year: "2018", event: "Ra mắt nền tảng bán sách trực tuyến" },
        { year: "2021", event: "Đạt 100,000+ khách hàng thân thiết" },
        { year: "2024", event: "Trở thành nhà bán lẻ sách hàng đầu Việt Nam" }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Về Nhà Sách Của Chúng Tôi</h1>
                        <p className="hero-subtitle">
                            Hơn 15 năm đồng hành cùng hàng triệu độc giả Việt Nam,
                            chúng tôi tự hào là cầu nối giữa tri thức và tâm hồn
                        </p>
                        <div className="hero-quote">
                            <span className="quote-icon">"</span>
                            <p>Một cuốn sách, một hành trình, vô vàn khám phá</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <h3 className="stat-number">{stat.number}</h3>
                                <p className="stat-label">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section">
                <div className="container">
                    <div className="story-content">
                        <div className="story-text">
                            <h2 className="section-title">Câu chuyện của chúng tôi</h2>
                            <div className="story-badge">Từ năm 2009</div>
                            <p className="story-paragraph">
                                Khởi nguồn từ một cửa hàng sách nhỏ tại phố cổ Hà Nội, chúng tôi bắt đầu
                                với niềm đam mê mãnh liệt với sách và mong muốn lan tỏa văn hóa đọc đến
                                cộng đồng.
                            </p>
                            <p className="story-paragraph">
                                Qua 15 năm phát triển, từ một gian hàng khiêm tốn, chúng tôi đã trở thành
                                chuỗi nhà sách uy tín với hơn 20 chi nhánh trên toàn quốc và nền tảng
                                thương mại điện tử phục vụ hàng triệu độc giả.
                            </p>
                            <p className="story-paragraph">
                                Không chỉ bán sách, chúng tôi tạo ra không gian văn hóa nơi mọi người gặp gỡ,
                                chia sẻ và cùng nhau khám phá thế giới tri thức qua từng trang sách.
                                Mỗi cuốn sách chúng tôi giới thiệu đều được tuyển chọn kỹ lưỡng với tâm huyết
                                của người yêu sách.
                            </p>
                        </div>
                        <div className="story-image">
                            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
                                alt="Bookstore interior" />
                            <div className="image-caption">Không gian nhà sách ấm cúng của chúng tôi</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="timeline-section">
                <div className="container">
                    <h2 className="section-title text-center">Hành trình phát triển</h2>
                    <div className="timeline">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <span className="timeline-year">{milestone.year}</span>
                                    <p className="timeline-event">{milestone.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2 className="section-title text-center">Giá trị cốt lõi</h2>
                    <p className="section-subtitle">
                        Những nguyên tắc định hướng mọi hoạt động của chúng tôi
                    </p>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">{value.icon}</div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="container">
                    <h2 className="section-title text-center">Đội ngũ của chúng tôi</h2>
                    <p className="section-subtitle">
                        Những người đam mê sách và tận tâm với sứ mệnh lan tỏa văn hóa đọc
                    </p>
                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div key={index} className="team-card">
                                <div className="team-image">
                                    <img src={member.image} alt={member.name} />
                                    <div className="team-overlay">
                                        <p className="team-description">{member.description}</p>
                                    </div>
                                </div>
                                <div className="team-info">
                                    <h3 className="team-name">{member.name}</h3>
                                    <p className="team-position">{member.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">Tại sao chọn chúng tôi?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Giao hàng nhanh</h3>
                            <p>Miễn phí ship cho đơn từ 150,000đ</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎁</div>
                            <h3>Ưu đãi hấp dẫn</h3>
                            <p>Khuyến mãi và tích điểm đổi quà</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💯</div>
                            <h3>Cam kết chính hãng</h3>
                            <p>100% sách chính hãng, nguồn gốc rõ ràng</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Đổi trả dễ dàng</h3>
                            <p>Đổi trả trong vòng 7 ngày</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Bắt đầu hành trình khám phá sách</h2>
                        <p className="cta-text">
                            Tham gia cộng đồng hơn 100,000 độc giả đam mê và khám phá
                            thế giới tri thức cùng chúng tôi
                        </p>
                        <div className="cta-buttons">
                            <Link to={"/books"} className="cta-button primary">Khám phá ngay</Link>
                            <button className="cta-button secondary">Liên hệ</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;