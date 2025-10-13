import { useState, useEffect } from "react";
import "styles/client/layout/client.footer.scss";

const Footer = () => {
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <footer className="footer">
                <div className="footer__container">
                    <div className="footer__grid">
                        {/* About Section */}
                        <div className="footer__section footer__section--about">
                            <h2 className="footer__brand">BookShop</h2>
                            <p className="footer__username">@hoaininh</p>
                            <p className="footer__description">
                                Mình là Hoài Ninh, bán laptop cá nhân, hàng xách tay chất lượng cao, giá cả hợp lý. Cảm ơn bạn đã ủng hộ!
                            </p>
                        </div>

                        {/* Shop Info */}
                        <div className="footer__section">
                            <h3 className="footer__title">Thông tin shop</h3>
                            <ul className="footer__list">
                                <li className="footer__item">Giới thiệu về BookShop</li>
                                <li className="footer__item">Chính sách đổi trả trong 7 ngày</li>
                                <li className="footer__item">Freeship đơn hàng từ 150.000đ</li>
                            </ul>
                        </div>

                        {/* Customer Support */}
                        <div className="footer__section">
                            <h3 className="footer__title">Hỗ trợ khách hàng</h3>
                            <ul className="footer__list">
                                <li className="footer__item">Hướng dẫn đặt hàng</li>
                                <li className="footer__item">Phương thức thanh toán</li>
                                <li className="footer__item">Chính sách bảo mật</li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer__section">
                            <h3 className="footer__title">Liên hệ</h3>
                            <div className="footer__contact">
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">Chủ shop:</span>
                                    <span className="footer__contact-value">Hoài Ninh</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">SĐT:</span>
                                    <span className="footer__contact-value">0123 456 789</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">Email:</span>
                                    <span className="footer__contact-value">ninh2k4@gmail.com</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">Địa chỉ:</span>
                                    <span className="footer__contact-value">Gần trường ĐH Điện Lực</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="footer__copyright">
                        <span className="footer__copyright-icon">©</span>
                        <span className="footer__copyright-text">Hoài Ninh - BookShop, All rights reserved.</span>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    className="scroll-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default Footer;