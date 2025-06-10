import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

interface WebSocketHookProps {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url = `ws://${window.location.host}/ws`,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: WebSocketHookProps = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionState('connected');
      setSocket(ws);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage({
          ...message,
          timestamp: new Date()
        });

        // Handle different message types
        handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setConnectionState('disconnected');
      setSocket(null);

      // Attempt reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('error');
    };

    return ws;
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'load_update':
        queryClient.invalidateQueries({ queryKey: ['/api/loads'] });
        queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
        break;
      
      case 'driver_update':
        queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
        break;
      
      case 'iot_update':
        queryClient.invalidateQueries({ queryKey: ['/api/iot/devices'] });
        break;
      
      case 'negotiation_update':
        queryClient.invalidateQueries({ queryKey: ['/api/negotiations'] });
        break;
      
      case 'alert':
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        // Could trigger toast notification here
        break;
      
      case 'security_event':
        queryClient.invalidateQueries({ queryKey: ['/api/security/events'] });
        queryClient.invalidateQueries({ queryKey: ['/api/security/report'] });
        break;
      
      case 'weather_update':
        queryClient.invalidateQueries({ queryKey: ['/api/weather'] });
        break;
      
      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [queryClient]);

  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected. Message not sent:', message);
    return false;
  }, [socket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close();
    }
    
    setSocket(null);
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [socket]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}