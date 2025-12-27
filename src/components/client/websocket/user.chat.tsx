// File: src/components/client/websocket/user.chat.tsx

import { useState, useEffect, useRef } from "react";
import { Button, Input, FloatButton, App } from "antd";
import { MessageOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import { useNavigate } from "react-router-dom";
import websocketService from "@/services/websocket.service";
import "@/styles/user-chat.scss";

const CHAT_STORAGE_KEY = "bookshop_user_chat_history";

const UserChatWebSocket = () => {
  const { user } = useCurrentApp();
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<IUserMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasConnected = useRef(false);
  const openRef = useRef(open);
  const notificationRef = useRef(notification);

  // ✅ Keep refs in sync
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  // ==================== LOAD ====================
  useEffect(() => {
    if (!user?.email) return;

    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const allChats = JSON.parse(saved);
        if (allChats[user.email]) {
          setMessages(allChats[user.email]);
          console.log("📂 [USER] Loaded", allChats[user.email].length, "messages");
        }
      } catch (error) {
        console.error("❌ [USER] Error loading:", error);
      }
    }
  }, [user?.email]);

  // ==================== SAVE ====================
  useEffect(() => {
    if (!user?.email || messages.length === 0) return;

    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      const allChats = saved ? JSON.parse(saved) : {};
      allChats[user.email] = messages;
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allChats));
      console.log("💾 [USER] Saved", messages.length, "messages");
    } catch (error) {
      console.error("❌ [USER] Error saving:", error);
    }
  }, [messages, user?.email]);

  // ==================== CONNECT (CHỈ CHẠY MỘT LẦN) ====================
  useEffect(() => {
    if (!user?.email || hasConnected.current) return;

    console.log("🔗 [USER] Connecting...", user.email);
    hasConnected.current = true;

    // ✅ Handler dùng ref để không cần dependency
    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent<IWebSocket>;
      const data = customEvent.detail;

      console.log("========================================");
      console.log("📩 [USER] WebSocket Event:");
      console.log("  From:", data.from);
      console.log("  Sender:", data.sender);
      console.log("  Content:", data.content);
      console.log("  Timestamp:", data.timestamp);
      console.log("========================================");

      if (data.from === "ADMIN") {
        const newMessage: IUserMessage = {
          from: "ADMIN",
          text: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        console.log("💬 [USER] Adding admin message");

        setMessages((prev) => [...prev, newMessage]);

        // ✅ Dùng ref thay vì state
        if (!openRef.current) {
          notificationRef.current.info({
            message: "💬 Admin trả lời",
            description: data.content,
            placement: "topRight",
            duration: 4,
          });
        }
      } else {
        console.log("⚠️ [USER] Ignoring non-ADMIN message:", data.from);
      }
    };

    websocketService.connect(
      user.email,
      () => {
        setIsConnected(true);
        console.log("✅ [USER] Connected");
      },
      (error) => {
        console.error("❌ [USER] Error:", error);
        setIsConnected(false);
        hasConnected.current = false;
        notification.error({
          message: "Lỗi kết nối",
          description: "Không thể kết nối chat",
          placement: "topRight",
        });
      },
      false
    );

    window.addEventListener("chatMessageReceived", handleNewMessage);

    // ✅ Cleanup CHỈ khi component unmount
    return () => {
      console.log("🔌 [USER] Cleanup on unmount");
      window.removeEventListener("chatMessageReceived", handleNewMessage);
      websocketService.disconnect();
      hasConnected.current = false;
    };
  }, [user?.email]); // ✅ CHỈ phụ thuộc user.email

  // ==================== AUTO SCROLL ====================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==================== SEND ====================
  const handleSend = () => {
    if (!input.trim() || !isConnected || !user?.email) {
      if (!isConnected) {
        notification.warning({
          message: "Chưa kết nối",
          description: "Đang kết nối lại...",
          placement: "topRight",
        });
      }
      return;
    }

    const userText = input.trim();
    const timestamp = new Date().toISOString();

    const userMessage: IUserMessage = {
      from: "USER",
      text: userText,
      timestamp,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const ADMIN_EMAIL = "ninh@gmail.com";

    const wsMessage: IWebSocket = {
      sender: user.email,
      receiver: ADMIN_EMAIL,
      content: userText,
      timestamp,
      from: "USER",
      userAvatar: user?.avatar,
    };

    console.log("📤 [USER] Sending:", wsMessage);
    websocketService.sendToAdmin(wsMessage);
  };

  // ==================== OPEN ====================
  const handleOpenPopup = () => {
    if (!user?.email) {
      notification.warning({
        message: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để chat",
        placement: "topRight",
      });
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setOpen(true);
  };

  // ==================== FORMAT TIME ====================
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Vừa xong";
      }
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Vừa xong";
    }
  };

  // ==================== RENDER ====================
  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="default"
        className="user-chat-trigger"
        onClick={handleOpenPopup}
        tooltip="Chat với Admin"
      />

      {open && (
        <div className="user-chat-wrapper" onClick={() => setOpen(false)}>
          <div className="user-chat-backdrop" />
          <div className="user-chat-container" onClick={(e) => e.stopPropagation()}>
            <div className="user-chat-header">
              <div>
                <div style={{ fontWeight: 600 }}>Chat với Admin</div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                  {isConnected ? "🟢 Đang kết nối" : "🔴 Mất kết nối"}
                </div>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                style={{ color: "white" }}
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="user-chat-messages">
              {messages.length === 0 && (
                <div className="user-chat-empty">
                  Chào bạn! 👋<br />Gửi tin nhắn để được hỗ trợ
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={`${msg.timestamp}-${i}`} className={`msg ${msg.from.toLowerCase()}`}>
                  <p>{msg.text}</p>
                  <span className="msg-time">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="user-chat-input">
              <Input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                disabled={!isConnected}
                allowClear
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!isConnected || !input.trim()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserChatWebSocket;