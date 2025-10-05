import { useState, useEffect } from "react";
import "styles/client/client.footer.scss";

const Footer = () => {
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
            <footer className="footer-container">
                <div className="footer-content">
                    <div className="footer-main">
                        {/* Giới thiệu */}
                        <div className="footer-section">
                            <h2 className="footer-brand">LaptopShop</h2>
                            <p className="footer-username">@hoaininh</p>
                            <p className="footer-description">
                                Mình là Hoài Ninh, bán laptop cá nhân, hàng xách tay chất lượng cao, giá cả hợp lý. Cảm ơn bạn đã ủng hộ!
                            </p>
                        </div>

                        {/* Thông tin shop */}
                        <div className="footer-section">
                            <h3 className="footer-title">Thông tin shop</h3>
                            <ul className="footer-list">
                                <li>Giới thiệu về BookShop</li>
                                <li>Chính sách đổi trả trong 7 ngày</li>
                                <li>Freeship đơn hàng từ 150.000đ</li>
                            </ul>
                        </div>

                        {/* Hỗ trợ khách hàng */}
                        <div className="footer-section">
                            <h3 className="footer-title">Hỗ trợ khách hàng</h3>
                            <ul className="footer-list">
                                <li>Hướng dẫn đặt hàng</li>
                                <li>Phương thức thanh toán</li>
                                <li>Chính sách bảo mật</li>
                            </ul>
                        </div>

                        {/* Liên hệ */}
                        <div className="footer-section">
                            <h3 className="footer-title">Liên hệ</h3>
                            <div className="contact-item">
                                <span className="contact-label">Chủ shop:</span>
                                <span className="contact-value">Hoài Ninh</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-label">SĐT:</span>
                                <span className="contact-value">0123 456 789</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-label">Email:</span>
                                <span className="contact-value">ninh2k4@gmail.com</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-label">Địa chỉ:</span>
                                <span className="contact-value">Gần trường ĐH Điện Lực</span>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="footer-bottom">
                        <div className="copyright">
                            <span className="copyright-icon">©</span>
                            <span>Hoài Ninh - BookShop, All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    className="scroll-to-top-btn"
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