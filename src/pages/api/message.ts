import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const messageHandler = async (req: NextApiRequest,
                              res: NextApiResponse) => {

    const {email, message, receiverId} = req.body as { email: string, message: string | null, receiverId: number };

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });

    if (user) {
        await prisma.message.create({
            data: {
                content: message,
                sender: {
                    connect: {
                        id: user?.id
                    }
                },
                receiver: {
                    connect: {
                        id: receiverId
                    }
                }
            }
        });
        return res.status(200).json({message: 'Message sent'})
    }

    return res.status(400).json({message: 'User not found'})
}

export default messageHandler
