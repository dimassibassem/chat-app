import {Server} from 'socket.io'
import {NextApiRequest, NextApiResponse} from "next";
import messageHandler, {ServerToClientEvents} from '@/utils/messageHandler';

type Data = {
    author?: string,
}

const ioHandler = (req: NextApiRequest,
                   res: NextApiResponse) => {
    // It means that socket server was already initialised
    // @ts-ignore
    if (res.socket.server.io) {
        console.log("Already set up");
        res.end();
        return;
    }

    // @ts-ignore
    const io = new Server(res.socket.server);
    // @ts-ignore
    res.socket.server.io = io;

    // Define actions inside
    io.on("connection", (socket: ServerToClientEvents) => {
        messageHandler(io, socket);
        socket.on("typing", (data: Data) => {
            socket.broadcast.emit("typing", data.author || "Anonymous");
        })
        socket.on("stopTyping", (data: Data) => {
            socket.broadcast.emit("stopTyping", data.author || "Anonymous");
        })
    });

    console.log("Setting up socket");
    res.end();
};

export default ioHandler
