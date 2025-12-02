import { useState, useEffect, useRef } from "react";
import { Button, Input, FloatButton, Spin, App } from "antd";
import { MessageOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { chatbotAPI } from "@/services/api.service";
import { useCurrentApp } from "@/components/context/app.context";
import { useNavigate } from "react-router-dom";
import "@/styles/chatbot.scss";

interface Message {
    from: "user" | "bot";
    text: string;
}

const CHAT_STORAGE_KEY = "bookshop_chat_history";

const ChatbotPopup = () => {
    const { user } = useCurrentApp();
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<AbortController | null>(null);

    // Lưu + khôi phục lịch sử chat theo user
    useEffect(() => {
        if (!user?.id) return;

        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const all = JSON.parse(saved);
            if (all[user.id]) {
                setMessages(all[user.id]);
            }
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id || messages.length === 0) return;
        const all = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "{}");
        all[user.id] = messages;
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all));
    }, [messages, user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput("");
        setMessages(prev => [...prev, { from: "user", text: userText }]);
        setLoading(true);

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const res = await chatbotAPI(userText);
            const botReply = res.data?.message || "Mình chưa hiểu, hỏi lại nhé!";

            setLoading(false);
            setMessages(prev => [...prev, { from: "bot", text: "" }]);

            let displayed = "";
            for (let i = 0; i < botReply.length; i++) {
                if (controller.signal.aborted) break;
                displayed += botReply[i];
                setMessages(prev => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                        from: "bot",
                        text: displayed + (i < botReply.length - 1 ? "cursor" : ""),
                    };
                    return copy;
                });
                await new Promise(r => setTimeout(r, 20));
            }
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setMessages(prev => [...prev, { from: "bot", text: "Oops! Bot đang ngủ gật rồi!" }]);
            }
        } finally {
            controllerRef.current = null;
        }
    };

    const handleOpenPopUp = () => {
        if (!user?.id) {
            notification.warning({
                message: "Chưa đăng nhập",
                description: "Vui lòng đăng nhập để trò chuyện với BookShop AI nhé",
                placement: "topRight",
            });
            setTimeout(() => navigate("/login"), 1000);
            return;
        }
        setOpen(true);
    };

    return (
        <>
            <FloatButton
                icon={<MessageOutlined />}
                type="primary"
                className="chatbot-trigger"
                onClick={handleOpenPopUp}
            />

            {open && (
                <div className="chatbot-wrapper" onClick={() => setOpen(false)}>
                    <div className="chatbot-backdrop" />
                    <div className="chatbot-container" onClick={e => e.stopPropagation()}>
                        <div className="chatbot-header">
                            <span>BookShop AI</span>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                style={{ color: "white" }}
                                onClick={() => setOpen(false)}
                            />
                        </div>

                        <div className="chatbot-messages">
                            {messages.length === 0 && !loading && (
                                <div className="chatbot-empty">
                                    Chào bạn! <br />Mình là trợ lý AI của BookShop
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`msg ${msg.from}`}>
                                    <p>{msg.text}</p>
                                </div>
                            ))}

                            {loading && (
                                <div className="msg bot">
                                    <Spin size="small" /> Đang suy nghĩ...
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input">
                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={handleSend}
                                disabled={loading}
                                allowClear
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                loading={loading}
                                disabled={!input.trim()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotPopup;