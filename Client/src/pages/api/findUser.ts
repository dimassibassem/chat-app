import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const findUserHandler = async (req: NextApiRequest,
                               res: NextApiResponse) => {

    const {email} = req.body as { email: string };
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    return res.status(200).json(user)
}

export default findUserHandler
