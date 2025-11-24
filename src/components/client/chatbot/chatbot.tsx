import { useState, useEffect, useRef } from "react";
import { Button, Input, FloatButton } from "antd";
import { MessageOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import "@/styles/chatbot.scss";

const ChatbotPopup = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { from: "user", text: input }]);
        setTimeout(() => {
            setMessages(prev => [...prev, { from: "bot", text: "Chào bạn! Mình là trợ lý AI của BookShop" }]);
        }, 800);
        setInput("");
    };

    return (
        <>
            <FloatButton
                icon={<MessageOutlined />}
                type="primary"
                className="chatbot-trigger"
                onClick={() => setOpen(true)}
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
                            {messages.length === 0 && (
                                <div className="chatbot-empty">
                                    Chào bạn! <br />Mình có thể giúp gì?
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`msg ${m.from}`}>
                                    <p>{m.text}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input">
                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={handleSend}
                                allowClear
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                style={{ paddingLeft: "3px" }}
                                icon={<SendOutlined />}
                                onClick={handleSend}
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