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
        io.in(msg.room).emit("newIncomingMessage", message);
    });
};

export const typingHandler = (io: Server, socket: Socket) => {
    socket.on("typing", (data) => {
        socket.to(data.room).emit("typing", data.user);
    })
}
export const stopTypingHandler = (io: Server, socket: Socket) => {
    socket.on("stopTyping", (data) => {
        socket.to(data.room).emit("stopTyping", data.user);
    })
}

export const getUsersHandler = (io: Server, socket: Socket) => {
    socket.on("getUsers", async (email) => {
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        not: email
                    }
                },
            })
            socket.emit("usersData", users)
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
    socket.on("assignRoom", (user) => {
        console.log(`${socket.id} : ${user.name} connected in room ${user.email}`);
        socket.join(user.email);
    })
}


export const getUserMessagesHandler = (io: Server, socket: Socket) => {
    socket.on("getUserMessages", async (connectedUser) => {

            let messages: any[] = []
            const user = await prisma.user.findUnique({
                    where: {
                        email: connectedUser.email
                    }
                }
            )
            if (user) {
                messages = await prisma.message.findMany({
                    where: {
                        OR: [
                            {
                                senderId: user.id
                            },
                            {
                                receiverId: user.id
                            }
                        ]
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    include: {
                        sender: {
                            select: {
                                name: true
                            }
                        },
                        receiver: {
                            select: {
                                name: true
                            }
                        }
                    }
                })
            }
            messages.map((message) => {
                message.sender = message.sender.name
                message.receiver = message.receiver.name
            })

            socket.emit("userMessages", messages)
        }
    )
}

export const currentRoomMessagesHandler = (io: Server, socket: Socket) => {
    socket.on("currentRoomMessages", async (room) => {
            let messages: any[] = []
            const user = await prisma.user.findUnique({
                    where: {
                        email: room
                    }
                }
            )
            if (user) {
                messages = await prisma.message.findMany({
                    where: {
                        OR: [
                            {
                                senderId: user.id
                            },
                            {
                                receiverId: user.id
                            }
                        ]
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    include: {
                        sender: {
                            select: {
                                name: true
                            }
                        },
                        receiver: {
                            select: {
                                name: true
                            }
                        }
                    }
                })
            }
            messages.map((message) => {
                message.sender = message.sender.name
                message.receiver = message.receiver.name
            })

            socket.emit("roomMessages", messages)
        }
    )
}
