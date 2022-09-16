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
        socket.broadcast.emit("newIncomingMessage", msg, receiver);
    });
};

export const typingHandler = (io: Server,socket: ServerToClientEvents) => {
    socket.on("typing", (sender,receiver) => {
        socket.broadcast.emit("typing", sender,receiver);
    })
}
export const stopTypingHandler = (io: Server,socket: ServerToClientEvents) => {
    socket.on("stopTyping", (sender) => {
        // @ts-ignore
        socket.broadcast.emit("stopTyping", sender);
    })
}
