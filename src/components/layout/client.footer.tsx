import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "styles/client/layout/client.footer.scss";

const Footer = () => {
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

    const { t } = useTranslation();
    const [showFooter, setShowFooter] = useState<boolean>(false); // Trạng thái hiển thị footer

    // Xử lý nút scroll to top
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hiển thị footer sau 2 giây
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFooter(true);
        }, 2000); // 2000ms = 2 giây

        return () => clearTimeout(timer);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Nếu chưa đến 2 giây thì ẩn hoàn toàn footer
    if (!showFooter) {
        return null;
    }

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
                                {t("footer.description")}
                            </p>
                        </div>

                        {/* Shop Info */}
                        <div className="footer__section">
                            <h3 className="footer__title">{t("footer.shopInfo")}</h3>
                            <ul className="footer__list">
                                <li className="footer__item">{t("footer.about")}</li>
                                <li className="footer__item">{t("footer.returnPolicy")}</li>
                                <li className="footer__item">{t("footer.freeship")}</li>
                            </ul>
                        </div>

                        {/* Customer Support */}
                        <div className="footer__section">
                            <h3 className="footer__title">{t("footer.support")}</h3>
                            <ul className="footer__list">
                                <li className="footer__item">{t("footer.orderGuide")}</li>
                                <li className="footer__item">{t("footer.paymentMethods")}</li>
                                <li className="footer__item">{t("footer.privacy")}</li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer__section">
                            <h3 className="footer__title">{t("footer.contact")}</h3>
                            <div className="footer__contact">
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">{t("footer.owner")}</span>
                                    <span className="footer__contact-value">Hoài Ninh</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">{t("footer.phone")}</span>
                                    <span className="footer__contact-value">0123 456 789</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">{t("footer.email")}</span>
                                    <span className="footer__contact-value">ninh2k4@gmail.com</span>
                                </div>
                                <div className="footer__contact-item">
                                    <span className="footer__contact-label">{t("footer.address")}</span>
                                    <span className="footer__contact-value">{t("footer.addressValue")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="footer__copyright">
                        <span className="footer__copyright-icon">©</span>
                        <span className="footer__copyright-text">{t("footer.copyright")}</span>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    className="scroll-top"
                    onClick={scrollToTop}
                    aria-label={t("common.scrollTop")}
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