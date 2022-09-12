import {Server} from 'socket.io'
import {Message, ServerToClientEvents} from '@/utils/types';
import prisma from "@/utils/prismaClient";

export default (io: Server, socket: ServerToClientEvents) => {
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
