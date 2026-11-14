import { useState, useEffect, useRef } from "react";
import { Input, Avatar, Badge, Empty, App } from "antd";
import { useTranslation } from "react-i18next";
import { SearchOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import websocketService from "@/services/websocket.service";
import "@/styles/admin-chat.scss";

const ADMIN_CONVERSATIONS_KEY = "bookshop_admin_conversations";


const AdminChatWebSocket = () => {
  const { user } = useCurrentApp();
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<IAdminConversation[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasConnected = useRef(false);
  const processedMessages = useRef(new Set<string>());
  const selectedUserRef = useRef(selectedUserEmail);
  const notificationRef = useRef(notification);
  const autoRepliedUsers = useRef(new Set<string>()); // ✅ Track users đã auto reply

  const baseImageUrl = import.meta.env.VITE_IMAGE_URL || "https://res.cloudinary.com/dvglvfask/image/upload";

  // ✅ Keep refs in sync
  useEffect(() => {
    selectedUserRef.current = selectedUserEmail;
  }, [selectedUserEmail]);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  // ==================== LOAD ====================
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_CONVERSATIONS_KEY);
    if (saved) {
      try {
        const data: IAdminConversation[] = JSON.parse(saved);
        setConversations(data);

        // ✅ Load danh sách users đã được auto reply
        data.forEach(conv => {
          if (conv.messages.some(m => m.from === "ADMIN")) {
            autoRepliedUsers.current.add(conv.userEmail);
          }
        });

        console.log("📂 [ADMIN] Loaded", data.length, "conversations");
      } catch (error) {
        console.error("❌ [ADMIN] Error loading:", error);
      }
    }
  }, []);

  // ==================== SAVE ====================
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(ADMIN_CONVERSATIONS_KEY, JSON.stringify(conversations));
      console.log("💾 [ADMIN] Saved", conversations.length, "conversations");
    }
  }, [conversations]);

  // ✅ HÀM GỬI AUTO REPLY
  const sendAutoReply = (userEmail: string) => {
    // Kiểm tra xem đã gửi auto reply chưa
    if (autoRepliedUsers.current.has(userEmail)) {
      console.log("⚠️ [AUTO-REPLY] Already sent to:", userEmail);
      return;
    }

    console.log("🤖 [AUTO-REPLY] Sending welcome message to:", userEmail);

    const timestamp = new Date().toISOString();
    const autoMessage: IAdminMessage = {
      from: "ADMIN",
      text: t("admin.chat.autoReply"),
      timestamp,
    };

    // ✅ Thêm auto reply vào conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.userEmail === userEmail
          ? {
            ...c,
            messages: [...c.messages, autoMessage],
            lastMessage: t("admin.chat.autoMessage"),
            lastMessageTime: timestamp,
          }
          : c
      )
    );

    // ✅ Gửi qua WebSocket
    const wsMessage: IWebSocket = {
      sender: userEmail,
      receiver: user?.email || "ninh@gmail.com",
      content: t("admin.chat.autoReply"),
      timestamp,
      from: "ADMIN",
    };

    websocketService.sendToUser(wsMessage);

    // ✅ Đánh dấu đã auto reply
    autoRepliedUsers.current.add(userEmail);

    console.log("✅ [AUTO-REPLY] Sent successfully to:", userEmail);
  };

  // ==================== CONNECT ====================
  useEffect(() => {
    if (!user?.email || hasConnected.current) return;

    console.log("🔗 [ADMIN] Connecting...", user.email);
    hasConnected.current = true;

    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent<IWebSocket>;
      const data = customEvent.detail;

      // ✅ Key chống trùng lặp
      const messageKey = `${data.sender}-${data.timestamp}-${data.content}`;

      if (processedMessages.current.has(messageKey)) {
        console.log("⚠️ [ADMIN] Duplicate message detected, skipping:", messageKey);
        return;
      }

      processedMessages.current.add(messageKey);

      // Giới hạn size để tránh memory leak
      if (processedMessages.current.size > 200) {
        const keys = Array.from(processedMessages.current).slice(-200);
        processedMessages.current = new Set(keys);
      }

      // ✅ CHỈ XỬ LÝ MESSAGE TỪ USER
      if (data.from === "USER" && data.sender) {
        const newMessage: IAdminMessage = {
          from: "USER",
          text: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
          userEmail: data.sender,
        };

        console.log("💬 [ADMIN] Processing USER message from:", data.sender);

        const currentSelected = selectedUserRef.current;
        const shouldNotify = currentSelected !== data.sender;

        // ✅ Kiểm tra và gửi auto-reply
        setConversations((prev) => {
          const existingIndex = prev.findIndex(
            (c) => c.userEmail === data.sender
          );

          let updated: IAdminConversation[];
          let shouldSendAutoReply = false;

          if (existingIndex >= 0) {
            // Update existing conversation
            console.log("♻️ [ADMIN] Updating conversation");

            // ✅ Kiểm tra xem đã có tin nhắn từ ADMIN chưa
            const hasAdminMessage = prev[existingIndex].messages.some(m => m.from === "ADMIN");
            if (!hasAdminMessage && !autoRepliedUsers.current.has(data.sender)) {
              shouldSendAutoReply = true;
              console.log("🆕 [ADMIN] First message from this user - will auto-reply");
            }

            updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              messages: [...updated[existingIndex].messages, newMessage],
              lastMessage: data.content,
              lastMessageTime: data.timestamp || new Date().toISOString(),
              unreadCount: currentSelected !== data.sender
                ? updated[existingIndex].unreadCount + 1
                : updated[existingIndex].unreadCount
            };

            // Move to top
            const [conv] = updated.splice(existingIndex, 1);
            updated = [conv, ...updated];
          } else {
            // Create new conversation - definitely send auto-reply
            console.log("✨ [ADMIN] Creating new conversation");
            console.log("userAvatar from message:", data.userAvatar);

            shouldSendAutoReply = true;

            const newConv: IAdminConversation = {
              userEmail: data.sender,
              userName: data.sender.split("@")[0],
              userAvatar: data.userAvatar,
              lastMessage: data.content,
              lastMessageTime: data.timestamp || new Date().toISOString(),
              unreadCount: 1,
              messages: [newMessage],
            };

            console.log("Saved conversation:", newConv);
            updated = [newConv, ...prev];
          }

          // ✅ GỬI AUTO REPLY NGAY SAU KHI UPDATE STATE
          if (shouldSendAutoReply) {
            setTimeout(() => {
              sendAutoReply(data.sender);
            }, 500);
          }

          return updated;
        });

        // Notification
        if (shouldNotify) {
          notificationRef.current.info({
            message: t("admin.chat.newMessageFrom", { name: data.sender.split("@")[0] }),
            description: data.content,
            placement: "topRight",
            duration: 4,
          });
        }
      } else {
        console.log("⚠️ [ADMIN] Ignoring non-USER message:", data.from);
      }
    };

    websocketService.connect(
      user.email,
      () => {
        setIsConnected(true);
        console.log("✅ [ADMIN] Connected");
      },
      (error) => {
        console.error("❌ [ADMIN] Error:", error);
        setIsConnected(false);
        hasConnected.current = false;
        notification.error({
          message: t("admin.chat.connectError"),
          description: t("admin.chat.connectErrorDesc"),
          placement: "topRight",
        });
      },
      true
    );

    window.addEventListener("chatMessageReceived", handleNewMessage);

    return () => {
      console.log("🔌 [ADMIN] Cleanup on unmount");
      window.removeEventListener("chatMessageReceived", handleNewMessage);
      websocketService.disconnect();
      hasConnected.current = false;
    };
  }, [user?.email]);

  // ==================== AUTO SCROLL ====================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedUserEmail]);

  // ==================== SELECT ====================
  const handleSelectConversation = (userEmail: string) => {
    console.log("👆 [ADMIN] Selected:", userEmail);
    setSelectedUserEmail(userEmail);
    setConversations((prev) =>
      prev.map((c) => (c.userEmail === userEmail ? { ...c, unreadCount: 0 } : c))
    );
  };

  // ==================== SEND ====================
  const handleSend = () => {
    if (!input.trim() || !isConnected || !selectedUserEmail) {
      if (!isConnected) {
        notification.warning({
          message: t("admin.chat.notConnected"),
          description: t("admin.chat.pleaseWait"),
          placement: "topRight",
        });
      }
      return;
    }

    const adminText = input.trim();
    const timestamp = new Date().toISOString();

    const adminMessage: IAdminMessage = {
      from: "ADMIN",
      text: adminText,
      timestamp,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.userEmail === selectedUserEmail
          ? {
            ...c,
            messages: [...c.messages, adminMessage],
            lastMessage: adminText,
            lastMessageTime: timestamp,
          }
          : c
      )
    );

    setInput("");

    const wsMessage: IWebSocket = {
      sender: selectedUserEmail,
      receiver: user?.email || "ninh@gmail.com",
      content: adminText,
      timestamp,
      from: "ADMIN",
    };

    console.log("📤 [ADMIN] Sending to user:", wsMessage);
    websocketService.sendToUser(wsMessage);
  };

  // ==================== FORMAT TIME ====================
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return t("time.justNow");

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return t("time.justNow");
      if (minutes < 60) return t("time.minutes", { count: minutes });
      if (hours < 24) return t("time.hours", { count: hours });
      if (days < 7) return t("time.days", { count: days });
      return date.toLocaleDateString("vi-VN");
    } catch {
      return t("time.justNow");
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return t("time.justNow");
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return t("time.justNow");
    }
  };

  const getUserAvatarUrl = (conv: IAdminConversation) => {
    if (conv.userAvatar) {
      return `${baseImageUrl}/${conv.userAvatar}`;
    }
    return undefined;
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.userEmail === selectedUserEmail);

  return (
    <div className="admin-chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>{t("admin.chat.conversations", { count: conversations.length })}</h2>
          {/* Trước đây trạng thái kết nối chỉ là một chấm tròn xanh/đỏ: người mù
              màu đỏ–lục và người dùng trình đọc màn hình không nhận được thông tin.
              Nay có thêm nhãn chữ và role="status" để đọc thành tiếng. */}
          <div
            className={`connection-status ${isConnected ? "is-connected" : "is-disconnected"}`}
            role="status"
          >
            <span className="status-dot" aria-hidden="true"></span>
            <span className="status-text">
              {isConnected ? t("admin.chat.connected") : t("admin.chat.disconnected")}
            </span>
          </div>
        </div>
        <div className="sidebar-search">
          <Input
            placeholder={t("admin.chat.searchPlaceholder")}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <Empty
              description={t("admin.chat.noMessages")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.userEmail}
                className={`conversation-item ${selectedUserEmail === conv.userEmail ? "active" : ""
                  }`}
                onClick={() => handleSelectConversation(conv.userEmail)}
              >
                <Badge count={conv.unreadCount} offset={[-5, 5]}>
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    src={getUserAvatarUrl(conv)}
                  />
                </Badge>
                <div className="conv-info">
                  <div className="conv-header">
                    <span className="conv-name">{conv.userName}</span>
                    <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <div className="conv-preview">{conv.lastMessage}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-panel">
        {selectedConv ? (
          <>
            <div className="chat-header">
              <Avatar
                size={40}
                icon={<UserOutlined />}
                src={getUserAvatarUrl(selectedConv)}
              />
              <div className="chat-header-info">
                <h3>{selectedConv.userName}</h3>
                <span className="user-id">{selectedConv.userEmail}</span>
              </div>
            </div>

            <div className="chat-messages">
              {selectedConv.messages.map((msg, i) => (
                <div key={`${msg.timestamp}-${i}`} className={`message ${msg.from.toLowerCase()}`}>
                  {msg.from === "USER" && (
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      src={getUserAvatarUrl(selectedConv)}
                    />
                  )}
                  <div className="message-bubble">
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                    <span className="message-time">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <Input.TextArea
                placeholder={t("admin.chat.inputPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!isConnected}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <button
                className="send-button"
                onClick={handleSend}
                disabled={!isConnected || !input.trim()}
              >
                <SendOutlined />
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <Empty
              description={t("admin.chat.selectConversation")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatWebSocket;