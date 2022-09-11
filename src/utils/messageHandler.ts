import {Server} from 'socket.io'
import {ServerToClientEvents} from '@/utils/types';

export default (io: Server, socket: ServerToClientEvents) => {
    socket.on("createdMessage", (msg: object) => {
        socket.broadcast.emit("newIncomingMessage", msg);
    });
};
