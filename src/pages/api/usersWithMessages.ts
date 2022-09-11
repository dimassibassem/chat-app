import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

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
                }
            },
            sentMessages: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
        }
    })

    res.status(200).json(data)
}

export default usersWithMessages
