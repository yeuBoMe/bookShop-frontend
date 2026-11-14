import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "styles/client/about.scss";

/**
 * Nội dung trang giới thiệu nằm trong file dịch (src/i18n/locales), không viết
 * cứng trong component: các mảng dưới đây chỉ giữ phần KHÔNG đổi theo ngôn ngữ
 * (con số, icon, ảnh, tên riêng) cùng khoá dịch cho phần chữ.
 */
const STATS = [
    { number: "15+", labelKey: "about.stats.years" },
    { number: "50,000+", labelKey: "about.stats.titles" },
    { number: "100,000+", labelKey: "about.stats.readers" },
    { number: "4.9/5", labelKey: "about.stats.rating" },
];

const VALUES = [
    { icon: "📚", key: "passion" },
    { icon: "🎯", key: "quality" },
    { icon: "💝", key: "service" },
    { icon: "🌱", key: "community" },
];

const TEAM = [
    {
        // Tên riêng giữ nguyên ở mọi ngôn ngữ
        name: "Nguyễn Thị Mai",
        key: "ceo",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
        name: "Trần Văn Minh",
        key: "content",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
        name: "Lê Thị Hương",
        key: "marketing",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
    {
        name: "Phạm Đức Anh",
        key: "store",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
];

const MILESTONES = ["2009", "2014", "2018", "2021", "2024"];

const FEATURES = [
    { icon: "🚚", key: "shipping" },
    { icon: "🎁", key: "deals" },
    { icon: "💯", key: "genuine" },
    { icon: "🔄", key: "returns" },
];

const AboutPage = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">{t("about.heroTitle")}</h1>
                        <p className="hero-subtitle">{t("about.heroSubtitle")}</p>
                        <div className="hero-tagline">
                            <p>{t("about.heroTagline")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {STATS.map((stat) => (
                            <div key={stat.labelKey} className="stat-card">
                                <h3 className="stat-number">{stat.number}</h3>
                                <p className="stat-label">{t(stat.labelKey)}</p>
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
                            <h2 className="section-title">{t("about.storyTitle")}</h2>
                            <div className="story-badge">{t("about.storyBadge")}</div>
                            <p className="story-paragraph">{t("about.story1")}</p>
                            <p className="story-paragraph">{t("about.story2")}</p>
                            <p className="story-paragraph">{t("about.story3")}</p>
                        </div>
                        <div className="story-image">
                            <img
                                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
                                alt={t("about.imageAlt")}
                            />
                            <div className="image-caption">{t("about.imageCaption")}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="timeline-section">
                <div className="container">
                    <h2 className="section-title text-center">{t("about.timelineTitle")}</h2>
                    <div className="timeline">
                        {MILESTONES.map((year) => (
                            <div key={year} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <span className="timeline-year">{year}</span>
                                    <p className="timeline-event">{t(`about.milestones.${year}`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2 className="section-title text-center">{t("about.valuesTitle")}</h2>
                    <p className="section-subtitle">{t("about.valuesSubtitle")}</p>
                    <div className="values-grid">
                        {VALUES.map((value) => (
                            <div key={value.key} className="value-card">
                                <div className="value-icon" aria-hidden="true">{value.icon}</div>
                                <h3 className="value-title">{t(`about.values.${value.key}.title`)}</h3>
                                <p className="value-description">
                                    {t(`about.values.${value.key}.description`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="container">
                    <h2 className="section-title text-center">{t("about.teamTitle")}</h2>
                    <p className="section-subtitle">{t("about.teamSubtitle")}</p>
                    <div className="team-grid">
                        {TEAM.map((member) => (
                            <div key={member.key} className="team-card">
                                <div className="team-image">
                                    <img src={member.image} alt={member.name} />
                                    <div className="team-overlay">
                                        <p className="team-description">
                                            {t(`about.team.${member.key}.description`)}
                                        </p>
                                    </div>
                                </div>
                                <div className="team-info">
                                    <h3 className="team-name">{member.name}</h3>
                                    <p className="team-position">
                                        {t(`about.team.${member.key}.position`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">{t("about.featuresTitle")}</h2>
                    <div className="features-grid">
                        {FEATURES.map((feature) => (
                            <div key={feature.key} className="feature-card">
                                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                                <h3>{t(`about.features.${feature.key}.title`)}</h3>
                                <p>{t(`about.features.${feature.key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">{t("about.ctaTitle")}</h2>
                        <p className="cta-text">{t("about.ctaText")}</p>
                        <div className="cta-buttons">
                            <Link to={"/books"} className="cta-button primary">
                                {t("about.ctaPrimary")}
                            </Link>
                            <button className="cta-button secondary">{t("about.ctaSecondary")}</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
