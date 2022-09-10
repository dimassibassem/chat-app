import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const userHandler = async (req: NextApiRequest,
                           res: NextApiResponse) => {

    const {name} = req.body;
    const {email} = req.body;

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });

    if (!user) {
        await prisma.user.create({
            data: {
                name,
                email
            }
        });
    }
    res.status(200)
}

export default userHandler