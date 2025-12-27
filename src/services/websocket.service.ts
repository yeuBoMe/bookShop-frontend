import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";

class WebSocketService {
  private stompClient: Client | null = null;
  private connected: boolean = false;
  private currentUserEmail: string = "";
  private isAdmin: boolean = false;

  connect(
    userEmail: string,
    onConnected?: () => void,
    onError?: (error: any) => void,
    isAdminRole: boolean = false
  ): void {
    // ✅ Tránh connect lại nếu đã connected với cùng user
    if (this.connected && this.currentUserEmail === userEmail) {
      console.log("⚠️ Already connected as", userEmail);
      if (onConnected) onConnected();
      return;
    }

    this.currentUserEmail = userEmail;
    this.isAdmin = isAdminRole;

    const baseBackendUrl = import.meta.env.VITE_BACKEND_URL || "https://bookshop-backend-k6vv.onrender.com";
    const socket = new SockJS(`${baseBackendUrl}/chat-websocket`);

    // ✅ Lấy JWT token từ localStorage
    const accessToken = localStorage.getItem("access_token");

    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str: string) => {
        console.log("🔌 STOMP:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        "user-email": userEmail,
        // ✅ Gửi JWT token để backend validate
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      onConnect: () => {
        this.connected = true;
        console.log(
          "✅ WebSocket Connected!",
          userEmail,
          isAdminRole ? "(ADMIN)" : "(USER)"
        );

        // ✅ Luôn subscribe queue cá nhân
        this.subscribeToUserMessages(userEmail);

        // ✅ CHỈ subscribe topic admin.messages nếu isAdminRole = true
        if (isAdminRole) {
          this.subscribeToAdminMessages();
        }

        if (onConnected) onConnected();
      },
      onStompError: (frame: any) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        console.error("Details:", frame.body);
        this.connected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        this.connected = false;
        console.log("🔌 WebSocket connection closed");
      },
    });

    this.stompClient.activate();
  }

  private subscribeToUserMessages(userEmail: string): void {
    if (this.stompClient && this.connected) {
      // ✅ Subscribe vào topic riêng của user (thay vì queue)
      const userTopic = `/topic/user.${userEmail
        .replace(/@/g, ".")
        .replace(/\./g, "_")}`;

      this.stompClient.subscribe(userTopic, (message: IMessage) => {
        console.log("📩 User topic received for", userEmail, ":", message.body);
        const data: IWebSocket = JSON.parse(message.body);

        // ✅ Đảm bảo có timestamp
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        const event = new CustomEvent("chatMessageReceived", {
          detail: data,
        });
        window.dispatchEvent(event);
      });
      console.log(`📬 Subscribed to ${userTopic}`);
    }
  }

  private subscribeToAdminMessages(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.subscribe(
        "/topic/admin.messages",
        (message: IMessage) => {
          console.log("📩 Topic admin received:", message.body);
          const data: IWebSocket = JSON.parse(message.body);

          // ✅ Đảm bảo có timestamp
          if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
          }

          // Dispatch realtime
          const event = new CustomEvent("chatMessageReceived", {
            detail: data,
          });
          window.dispatchEvent(event);
        }
      );
      console.log("📬 Subscribed to /topic/admin.messages (ADMIN mode)");
    }
  }

  sendToAdmin(message: IWebSocket): void {
    if (this.stompClient && this.connected) {
      // ✅ Đảm bảo có timestamp và from
      const finalMessage = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        from: "USER" as const,
      };

      this.stompClient.publish({
        destination: "/app/chat.toAdmin",
        body: JSON.stringify(finalMessage),
      });
      console.log("📤 Sent to admin:", finalMessage);
    } else {
      console.error("❌ Not connected");
    }
  }

  sendToUser(message: IWebSocket): void {
    if (this.stompClient && this.connected) {
      // ✅ Đảm bảo có timestamp và from
      const finalMessage = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        from: "ADMIN" as const,
      };

      this.stompClient.publish({
        destination: "/app/chat.toUser",
        body: JSON.stringify(finalMessage),
      });
      console.log("📤 Sent to user:", finalMessage);
    } else {
      console.error("❌ Not connected");
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
      this.currentUserEmail = "";
      this.isAdmin = false;
      console.log("🔌 Disconnected");
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
