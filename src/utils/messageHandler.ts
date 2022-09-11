import {Server} from 'socket.io'

export interface ServerToClientEvents {
    broadcast: { emit(event: string, data: string | object): void },
    emit(event: string, data: object): void,
    on(event: string, func: (msg: object) => void): void;
}

export default (io: Server, socket: ServerToClientEvents) => {
    socket.on("createdMessage", (msg: object) => {
        socket.broadcast.emit("newIncomingMessage", msg);
    });
};
