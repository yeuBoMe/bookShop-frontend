import { useState, useEffect, useRef } from "react";
import { Input, Avatar, Badge, Empty, App } from "antd";
import { SearchOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import websocketService from "@/services/websocket.service";
import "@/styles/admin-chat.scss";

const ADMIN_CONVERSATIONS_KEY = "bookshop_admin_conversations";

const AdminChatWebSocket = () => {
  const { user } = useCurrentApp();
  const { notification } = App.useApp();

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

  const baseImageUrl = import.meta.env.VITE_IMAGE_URL || "https://res.cloudinary.com/dvglvfask/image/upload";
  const userAvatar = `${baseImageUrl}/${user?.avatar}`;

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

  // ==================== CONNECT (CHỈ CHẠY MỘT LẦN) ====================
  useEffect(() => {
    if (!user?.email || hasConnected.current) return;

    console.log("🔗 [ADMIN] Connecting...", user.email);
    hasConnected.current = true;

    // ✅ Handler dùng ref để không cần dependency
    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent<IWebSocket>;
      const data = customEvent.detail;

      console.log("========================================");
      console.log("📩 [ADMIN] WebSocket Event:");
      console.log("  From:", data.from);
      console.log("  Sender:", data.sender);
      console.log("  Content:", data.content);
      console.log("  Timestamp:", data.timestamp);
      console.log("========================================");

      // ✅ Chống duplicate
      const messageKey = `${data.sender}-${data.content}-${data.timestamp}`;

      if (processedMessages.current.has(messageKey)) {
        console.log("⚠️ [ADMIN] Duplicate message detected, skipping");
        return;
      }

      processedMessages.current.add(messageKey);

      if (processedMessages.current.size > 100) {
        const keysArray = Array.from(processedMessages.current);
        processedMessages.current = new Set(keysArray.slice(-100));
      }

      if (data.from === "USER" && data.sender) {
        const newMessage: IAdminMessage = {
          from: "USER",
          text: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
          userEmail: data.sender,
        };

        console.log("💬 [ADMIN] Processing USER message from:", data.sender);

        // ✅ Dùng ref để check selected user
        const currentSelected = selectedUserRef.current;
        const shouldNotify = currentSelected !== data.sender;

        setConversations((prev) => {
          const existingIndex = prev.findIndex(
            (c) => c.userEmail === data.sender
          );

          if (existingIndex >= 0) {
            console.log("♻️ [ADMIN] Updating conversation");
            const updated = [...prev];

            updated[existingIndex].messages.push(newMessage);
            updated[existingIndex].lastMessage = data.content;
            updated[existingIndex].lastMessageTime = data.timestamp || new Date().toISOString();

            if (currentSelected !== data.sender) {
              updated[existingIndex].unreadCount += 1;
            }

            const [conv] = updated.splice(existingIndex, 1);
            return [conv, ...updated];
          } else {
            console.log("✨ [ADMIN] Creating new conversation");
            const newConv: IAdminConversation = {
              userEmail: data.sender,
              userName: data.sender.split("@")[0],
              lastMessage: data.content,
              lastMessageTime: data.timestamp || new Date().toISOString(),
              unreadCount: 1,
              messages: [newMessage],
            };

            return [newConv, ...prev];
          }
        });

        // ✅ Notification sau khi update state
        if (shouldNotify) {
          notificationRef.current.info({
            message: `💬 ${data.sender.split("@")[0]}`,
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
          message: "Lỗi kết nối",
          description: "Không thể kết nối WebSocket",
          placement: "topRight",
        });
      },
      true
    );

    window.addEventListener("chatMessageReceived", handleNewMessage);

    // ✅ Cleanup CHỈ khi component unmount
    return () => {
      console.log("🔌 [ADMIN] Cleanup on unmount");
      window.removeEventListener("chatMessageReceived", handleNewMessage);
      websocketService.disconnect();
      hasConnected.current = false;
    };
  }, [user?.email]); // ✅ CHỈ phụ thuộc user.email

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
          message: "Chưa kết nối",
          description: "Vui lòng đợi...",
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
      if (isNaN(date.getTime())) {
        return "Vừa xong";
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes} phút`;
      if (hours < 24) return `${hours} giờ`;
      if (days < 7) return `${days} ngày`;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "Vừa xong";
    }
  };

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

  // ==================== FILTER ====================
  const filteredConversations = conversations.filter(
    (c) =>
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.userEmail === selectedUserEmail);

  // ==================== RENDER ====================
  return (
    <div className="admin-chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Đoạn chat ({conversations.length})</h2>
          <div className="connection-status">
            {isConnected ? (
              <span className="status-dot connected"></span>
            ) : (
              <span className="status-dot disconnected"></span>
            )}
          </div>
        </div>

        <div className="sidebar-search">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <Empty
              description="Chưa có tin nhắn"
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
                  <Avatar size={48} src={userAvatar} />
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
              <Avatar size={40} icon={<UserOutlined />} src={selectedConv.userAvatar} />
              <div className="chat-header-info">
                <h3>{selectedConv.userName}</h3>
                <span className="user-id">{selectedConv.userEmail}</span>
              </div>
            </div>

            <div className="chat-messages">
              {selectedConv.messages.map((msg, i) => (
                <div key={`${msg.timestamp}-${i}`} className={`message ${msg.from.toLowerCase()}`}>
                  {msg.from === "USER" && <Avatar size={32} icon={<UserOutlined />} />}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
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
                placeholder="Aa"
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
              description="Chọn cuộc trò chuyện"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatWebSocket;