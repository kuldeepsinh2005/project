import { io } from "socket.io-client";

// Connect to backend socket server
export const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], // for faster dev reloads
});
