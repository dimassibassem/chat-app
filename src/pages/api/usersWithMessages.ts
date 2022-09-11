import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const usersWithMessages = async (req: NextApiRequest,
                                 res: NextApiResponse) => {

    type UserMessage = {
        id: number,
        content: string,
        senderId?: number,
        receiverId?: number,
        createdAt: Date,
        updatedAt: Date
        status: string,
    }


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
                    receiverId : true,
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
            const messages: Array<UserMessage> = []
            user.receivedMessages.map((message: UserMessage) => messages.push({
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                status: 'RECEIVED'
            }))

            user.sentMessages.map((message: UserMessage) => messages.push({
                id: message.id,
                content: message.content,
                receiverId: message.receiverId,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                status: 'SENT'
            }))
        const {sentMessages, receivedMessages, ...rest} = user
        messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        return {...rest, messages}
        }
    )

    return res.status(200).json(result)
}

export default usersWithMessages
