import {Server} from 'socket.io'
import {Data, Message, ServerToClientEvents} from '@/utils/types';
import prisma from "@/utils/prismaClient";

export const messageHandler = (io: Server, socket: ServerToClientEvents) => {
    socket.on("createdMessage", async (msg: Message) => {
        await prisma.message.create({
            data: {
                // @ts-ignore
                content: msg.content,
                receiverId: msg.receiverId,
                senderId: msg.senderId,
                createdAt: msg.createdAt
            }
        })
        socket.broadcast.emit("newIncomingMessage", msg);
    });
};

export const typingHandler = (io: Server,socket: ServerToClientEvents) => {
    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data.author || "Anonymous");
    })
}
export const stopTypingHandler = (io: Server,socket: ServerToClientEvents) => {
    socket.on("stopTyping", (data: Data) => {
        socket.broadcast.emit("stopTyping", data.author || "Anonymous");
    })
}
