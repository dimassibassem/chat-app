import {createContext} from "react";
import {io, Socket} from "socket.io-client";

export const socket: Socket = io("http://localhost:3001")

export const SocketContext = createContext(socket)
