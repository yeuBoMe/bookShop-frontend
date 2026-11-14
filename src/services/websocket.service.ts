import SockJS from "sockjs-client";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

class WebSocketService {
  private stompClient: Client | null = null;

  private connected = false;
  private currentUserEmail = "";

  // ✅ LƯU SUBSCRIPTION (QUAN TRỌNG)
  private userSubscription?: StompSubscription;
  private adminSubscription?: StompSubscription;

  connect(
    userEmail: string,
    onConnected?: () => void,
    onError?: (error: any) => void,
    isAdminRole: boolean = false
  ): void {
    // ✅ Nếu đã connect đúng user thì không làm gì
    if (this.connected && this.currentUserEmail === userEmail) {
      console.log("⚠️ Already connected as", userEmail);
      onConnected?.();
      return;
    }

    this.currentUserEmail = userEmail;

    const baseBackendUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "https://bookshop-backend-k6vv.onrender.com";

    const socket = new SockJS(`${baseBackendUrl}/chat-websocket`);

    const accessToken = localStorage.getItem("access_token");

    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: (str) => console.log("🔌 STOMP:", str),

      connectHeaders: {
        "user-email": userEmail,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },

      onConnect: () => {
        console.log(
          "✅ WebSocket Connected",
          userEmail,
          isAdminRole ? "(ADMIN)" : "(USER)"
        );

        this.connected = true;

        // ✅ SUBSCRIBE USER (1 LẦN DUY NHẤT)
        this.subscribeToUserMessages(userEmail);

        // ✅ ADMIN CHỈ SUBSCRIBE 1 LẦN
        if (isAdminRole) {
          this.subscribeToAdminMessages();
        }

        onConnected?.();
      },

      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        this.connected = false;
        onError?.(frame);
      },

      onWebSocketClose: () => {
        console.log("🔌 WebSocket closed");
        this.connected = false;
      },
    });

    this.stompClient.activate();
  }

  // ================= USER =================
  private subscribeToUserMessages(userEmail: string): void {
    if (!this.stompClient || !this.connected) return;

    // ✅ CHỐNG SUBSCRIBE TRÙNG
    if (this.userSubscription) {
      console.log("⚠️ User topic already subscribed");
      return;
    }

    const userTopic = `/topic/user.${userEmail
      .replace(/@/g, ".")
      .replace(/\./g, "_")}`;

    this.userSubscription = this.stompClient.subscribe(
      userTopic,
      (message: IMessage) => {
        const data: IWebSocket = JSON.parse(message.body);
        data.timestamp ||= new Date().toISOString();

        window.dispatchEvent(
          new CustomEvent("chatMessageReceived", { detail: data })
        );
      }
    );

    console.log("📬 Subscribed:", userTopic);
  }

  // ================= ADMIN =================
  private subscribeToAdminMessages(): void {
    if (!this.stompClient || !this.connected) return;

    // ✅ CHỐNG SUBSCRIBE TRÙNG (CỐT LÕI FIX BUG)
    if (this.adminSubscription) {
      console.log("⚠️ Admin topic already subscribed");
      return;
    }

    this.adminSubscription = this.stompClient.subscribe(
      "/topic/admin.messages",
      (message: IMessage) => {
        const data: IWebSocket = JSON.parse(message.body);
        data.timestamp ||= new Date().toISOString();

        window.dispatchEvent(
          new CustomEvent("chatMessageReceived", { detail: data })
        );
      }
    );

    console.log("📬 Subscribed: /topic/admin.messages");
  }

  // ================= SEND =================
  sendToAdmin(message: IWebSocket): void {
    if (!this.stompClient || !this.connected) {
      console.error("❌ Not connected");
      return;
    }

    this.stompClient.publish({
      destination: "/app/chat.toAdmin",
      body: JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        from: "USER",
      }),
    });
  }

  sendToUser(message: IWebSocket): void {
    if (!this.stompClient || !this.connected) {
      console.error("❌ Not connected");
      return;
    }

    this.stompClient.publish({
      destination: "/app/chat.toUser",
      body: JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        from: "ADMIN",
      }),
    });
  }

  // ================= DISCONNECT =================
  disconnect(): void {
    console.log("🔌 Disconnecting WebSocket");

    // ✅ UNSUBSCRIBE TRIỆT ĐỂ
    this.userSubscription?.unsubscribe();
    this.adminSubscription?.unsubscribe();

    this.userSubscription = undefined;
    this.adminSubscription = undefined;

    this.stompClient?.deactivate();

    this.connected = false;
    this.currentUserEmail = "";
  }

  isConnected(): boolean {
    return this.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
