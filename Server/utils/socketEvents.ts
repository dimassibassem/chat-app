import {Server, Socket} from 'socket.io'
// @ts-ignore
import prisma from "./prismaClient";
// @ts-ignore
import {Message} from "./types";

export const messageHandler = (io: Server, socket: Socket) => {
    socket.on("send_Message", async (msg) => {
        const receiver = await prisma.user.findUnique({
                where: {
                    email: msg.receiver
                }
            }
        )
        const sender = await prisma.user.findUnique({
                where: {
                    email: msg.sender
                }
            }
        )
        if (receiver && sender) {
            await prisma.message.create({
                data: {
                    content: msg.content,
                    receiverId: receiver.id,
                    senderId: sender.id,
                    createdAt: new Date()
                }
            })
        }
        const message = {
            content: msg.content,
            sender: sender?.name || msg.sender,
            receiver: receiver?.name || msg.receiver,
        }
        console.log(msg.room);
        io.in(msg.room).emit("newIncomingMessage", message);
    });
};

export const typingHandler = (io: Server, socket: Socket) => {
    socket.on("typing", (data) => {
        // console.log(data.sender);
        // console.log(data.receiver);
        socket.broadcast.emit("typing", data);
    })
}
export const stopTypingHandler = (io: Server, socket: Socket) => {
    socket.on("stopTyping", (user) => {
        // console.log(data);
        socket.broadcast.emit("stopTyping", user);
    })
}

export const getUsersHandler = (io: Server, socket: Socket) => {
    socket.on("getUsers", async () => {
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        not: process.env.NEXT_PUBLIC_ADMIN_EMAIL
                    }
                },
                include: {
                    receivedMessages: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            updatedAt: true,
                            receiverId: true,
                            senderId: true,
                        }
                    },
                    sentMessages: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            updatedAt: true,
                            senderId: true,
                            receiverId: true,
                        }
                    }
                }
            })

            const result = users.map((user: any) => {
                    const messages: any = []
                    user.receivedMessages.map((message:Message) => messages.push({
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        receiverId: message.receiverId,
                        createdAt: message.createdAt,
                        updatedAt: message.updatedAt,
                    }))

                    user.sentMessages.map((message:Message) => messages.push({
                        id: message.id,
                        content: message.content,
                        receiverId: message.receiverId,
                        senderId: message.senderId,
                        createdAt: message.createdAt,
                        updatedAt: message.updatedAt,

                    }))

                    const {sentMessages, receivedMessages, ...rest} = user
                    messages.sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime())
                    return {...rest, messages}
                }
            )
            socket.emit("usersData", result)
        }
    )
}

export const checkUserHandler = (io: Server, socket: Socket) => {
    socket.on("checkUser", async (user) => {
            const userExist = await prisma.user.findUnique({
                where: {
                    email: user.email
                }
            })
        if (!userExist) {
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name,
                        image: user.image
                    }
                })
            }
        }
    )
}

export const disconnectHandler = (io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}

export const changeRoomHandler = (io: Server, socket: Socket) => {
    socket.on("changeRoom", (room) => {
        console.log(`User ${socket.id} changed room to ${room}`);
        socket.join(room);
    })
}

export const assignRoomHandler = (io: Server, socket: Socket) => {
    socket.on("assignRoom",(user) => {
        console.log(`${socket.id} : ${user.name} connected in room ${user.email}`);
        socket.join(user.email);
    })
}
