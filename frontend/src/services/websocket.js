import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
  }

  connect(token) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        
        // Disable debug logging in production
        this.stompClient.debug = (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('STOMP: ' + str);
          }
        };

        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        this.stompClient.connect(
          headers,
          (frame) => {
            console.log('WebSocket connected: ' + frame);
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // Subscribe to user-specific queues
            this.subscribeToUserQueues();
            
            resolve();
          },
          (error) => {
            console.error('WebSocket connection error:', error);
            this.connected = false;
            this.handleReconnect(token);
            reject(error);
          }
        );
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  subscribeToUserQueues() {
    if (!this.stompClient || !this.connected) return;

    // Subscribe to private message queue
    const messageSubscription = this.stompClient.subscribe('/user/queue/messages', (message) => {
      try {
        const messageData = JSON.parse(message.body);
        this.handleMessage('messages', messageData);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Subscribe to notification queue
    const notificationSubscription = this.stompClient.subscribe('/user/queue/notifications', (notification) => {
      try {
        const notificationData = JSON.parse(notification.body);
        this.handleMessage('notifications', notificationData);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set('messages', messageSubscription);
    this.subscriptions.set('notifications', notificationSubscription);
  }

  handleMessage(type, data) {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${type} handler:`, error);
      }
    });
  }

  sendMessage(receiverId, content, messageType = 'TEXT') {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      const messageData = {
        receiverId,
        content,
        messageType,
        timestamp: new Date().toISOString()
      };

      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(messageData));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  subscribe(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  unsubscribe(type, handler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(token).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Disconnect
      this.stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
      });
    }
    
    this.connected = false;
    this.stompClient = null;
    this.messageHandlers.clear();
  }

  isConnected() {
    return this.connected;
  }

  // Utility method to get connection status
  getStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;