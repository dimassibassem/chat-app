import {NextApiRequest, NextApiResponse} from "next";

import prisma from '@/utils/prismaClient';

const userHandler = async (req: NextApiRequest,
                           res: NextApiResponse) => {

    const {image, name, email} = req.body as { image: string, name: string, email: string };
    let user
    user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                image,
                name,
                email
            }
        });
    }
    return res.status(200).json(user)
}

export default userHandler