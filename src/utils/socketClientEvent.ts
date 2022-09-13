import {Socket} from "socket.io-client";
import {KeyboardEvent} from "react";
import {incomingMessage} from "@/audio/audio";
import {Message} from "@/utils/types";

export function newIncomingMessageHandler(socket: Socket, setMessages: (msg: (currentMsg: any) => (Message)[]) => void) {
    socket.on("newIncomingMessage", async (msg: string) => {
        incomingMessage()
        setMessages((currentMsg) => [
            ...currentMsg,
            msg,
        ]);
    });
}

export function typingHandler(socket: Socket, setSomeoneIsTyping: (arg0: (current: object) => object) => void) {
    socket.on("typing", async (user) => {
        setSomeoneIsTyping((current) => ({...current, [user]: true}));
    });
}

export function stopTypingHandler(socket: Socket, setSomeoneIsTyping: (arg0: (current: object) => object) => void) {
    socket.on("stopTyping", (user) => {
        setSomeoneIsTyping((current) => ({...current, [user]: false}));
    })
}


const timer = (author: string, socket: Socket) => setTimeout(() => {
    socket.emit("stopTyping", {author});
}, 2000)

export const handleKeypress = (e: KeyboardEvent<HTMLElement>, author: string, socket: Socket, message: any, sendMessage: any) => {
    let timerId = window.setTimeout(() => {
    }, 0);
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
