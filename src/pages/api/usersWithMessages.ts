import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const usersWithMessages = async (req: NextApiRequest,
                                 res: NextApiResponse) => {

   const data = await prisma.user.findMany({
        include: {
            sentMessages: true,
            receivedMessages: true
        }
    })

    res.status(200).json(data)
}

export default usersWithMessages
