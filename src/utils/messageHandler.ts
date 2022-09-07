import {Server} from 'socket.io'

interface ServerToClientEvents {
    broadcast: { emit(eventName: string, data: string) : void },
    emit(eventName: string, data: string) : void,
    on(createdMessage1: string, createdMessage: (msg: string) => void): void;
}

export default (io: Server, socket: ServerToClientEvents) => {
    const createdMessage = (msg: string) => {
        socket.broadcast.emit("newIncomingMessage", msg);
    };

    socket.on("createdMessage", createdMessage);
};
