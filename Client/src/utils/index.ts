import {Socket} from "socket.io-client";
import {Message, User} from "@/utils/types";

export function typingHandler(socket: Socket, setSomeoneIsTyping: any) {

    socket.on("typing", async (data: User) => {
        setSomeoneIsTyping(data)
    });
}

export function stopTypingHandler(socket: Socket, setSomeoneIsTyping: (arg0: null) => void) {
    socket.on("stopTyping", () => {
        setSomeoneIsTyping(null)
    })
}


const timer = (user: User, socket: Socket) => setTimeout(() => {
    socket.emit("stopTyping", user);
}, 2000)

export const handleKeypress = (e: KeyboardEvent, user: User, socket: Socket, message: Message, sendMessage: { (): void; }) => {
    let timerId = window.setTimeout(() => {
    }, 0);
    while (timerId--) {
        window.clearTimeout(timerId); // will do nothing if no timeout with id is present
    }
    socket.emit("typing", user);
    if (e.keyCode === 13) {
        if (message) {
            sendMessage();
            socket.emit("stopTyping", user);
            return () => clearTimeout(timer(user, socket));
        }
    }
    timer(user, socket)
    return () => clearTimeout(timer(user, socket));
};
