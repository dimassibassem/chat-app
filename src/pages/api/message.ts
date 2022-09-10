import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const messageHandler = async (req: NextApiRequest,
                              res: NextApiResponse) => {

    if (req.method === 'POST') {
        const {email, message} = req.body as { email: string, message: string };

        const user = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (user) {
            const newMessage = await prisma.message.create({
                data: {
                    content: message,
                    user: {
                        connect: {
                            id: user?.id
                        }
                    }
                }
            });
            res.status(201).json(newMessage);
        }

    } else {
        res.status(405).end();
    }

}

export default messageHandler
