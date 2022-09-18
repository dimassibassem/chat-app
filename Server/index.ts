import {
    assignRoomHandler,
    changeRoomHandler,
    checkUserHandler, currentRoomMessagesHandler, disconnectHandler, getUserMessagesHandler,
    getUsersHandler,
    messageHandler,
    stopTypingHandler,
    typingHandler
} from "./utils/socketEvents";

const express = require('express');
import {Server, Socket} from 'socket.io';

const cors = require('cors');
const http = require('http')
const port = process.env.PORT || 3001
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', async (socket: Socket) => {

    assignRoomHandler(io, socket);
    checkUserHandler(io, socket);
    getUserMessagesHandler(io, socket);
    currentRoomMessagesHandler(io, socket);
    changeRoomHandler(io, socket);
    getUsersHandler(io, socket);
    messageHandler(io, socket);
    typingHandler(io, socket);
    stopTypingHandler(io, socket);
    disconnectHandler(io, socket);
});

server.listen(port, () => {
        console.log(`Server is up on port ${port}`);
    }
);

