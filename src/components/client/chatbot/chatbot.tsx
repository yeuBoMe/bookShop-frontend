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
            const chatbotResponse = await chatbotAPI(userText);
            const botReply = chatbotResponse.data?.message || "Mình chưa hiểu, hỏi lại nhé!";

            setLoading(false);
            // Streaming effect
            setMessages(prev => [...prev, { from: "bot", text: "" }]);
            
            let displayed = "";
            for (let i = 0; i < botReply.length; i++) {
                if (controller.signal.aborted) break;
                displayed += botReply[i];
                setMessages(prev => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                        from: "bot",
                        text: displayed + (i < botReply.length - 1 ? "▋" : ""),
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
        if (!user || !user.id) {
            notification.warning({
                message: "Chưa đăng nhập",
                description: "Vui lòng đăng nhập để trò chuyện với BookShop AI nhé",
                duration: 3,
                placement: "topRight"
            });
            setTimeout(() => {
                navigate("/login");
            }, 1000);
            return;
        }
        setOpen(true);
    }

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
                                style={{ color: "white" }}
                                icon={<CloseOutlined />}
                                onClick={() => setOpen(false)}
                            />
                        </div>

                        <div className="chatbot-messages">
                            {messages.length === 0 && !loading && (
                                <div className="chatbot-empty">
                                    Chào bạn! <br />Mình là trợ lý AI của BookShop
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <div key={index} className={`msg ${message.from}`}>
                                    <p>{message.text}</p>
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
                                disabled={loading}
                                allowClear
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                style={{ paddingLeft: "3px" }}
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