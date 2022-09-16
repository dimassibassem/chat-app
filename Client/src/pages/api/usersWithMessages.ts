import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';
import {Message} from "@/utils/types";

const usersWithMessages = async (req: NextApiRequest,
                                 res: NextApiResponse) => {


    const data = await prisma.user.findMany({
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

    const result = data.map((user: any) => {
            const messages: Array<Message> = []
            user.receivedMessages.map((message: Message) => messages.push({
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
            }))
            user.sentMessages.map((message: Message) => messages.push({
                id: message.id,
                content: message.content,
                receiverId: message.receiverId,
                senderId: message.senderId,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,

            }))

            const {sentMessages, receivedMessages, ...rest} = user
            messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            return {...rest, messages}
        }
    )

    return res.status(200).json(result)
}

export default usersWithMessages
