import {KeyboardEvent} from "react";
import {Socket} from "socket.io-client";

const timer = (author: string, socket: Socket) => setTimeout(() => {
    socket.emit("stopTyping", {author});
}, 2000)

export const handleKeypress = (e: KeyboardEvent<HTMLElement>, author: string, socket: Socket, message: any, sendMessage: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let timerId = window.setTimeout(() => {
    }, 0);
    // eslint-disable-next-line no-plusplus
    while (timerId--) {
        window.clearTimeout(timerId); // will do nothing if no timeout with id is present
    }
    socket.emit("typing", {author});
    if (e.keyCode === 13) {
        if (message) {
            sendMessage();
            socket.emit("stopTyping", {author});
            return () => clearTimeout(timer(author, socket));
        }
    }
    timer(author, socket)
    return () => clearTimeout(timer(author, socket));
};
