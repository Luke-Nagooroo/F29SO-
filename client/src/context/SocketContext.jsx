import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("user-online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });
    socket.on("user-offline", (userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const value = {
    socket: socketRef.current,
    connected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
