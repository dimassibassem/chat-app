import {Socket} from "socket.io-client";
import {KeyboardEvent} from "react";
import {incomingMessage} from "@/audio/audio";
import {Message, User} from "@/utils/types";

export function newIncomingMessageHandler(socket: Socket, user: User, setMessages: (msg: (currentMsg: Array<Message>) => (Message)[]) => void) {
    socket.on("newIncomingMessage", async (msg: Message) => {
        if (msg.senderId === user.id || msg.receiverId === user.id) {
            incomingMessage()
            setMessages((currentMsg) => [
                ...currentMsg,
                msg,
            ]);
        }
    });
}

export function typingHandler(socket: Socket, sender: User, receiver: User, setSomeoneIsTyping: (arg0: (current: object) => object) => void) {
    socket.on("typing", async () => {
        setSomeoneIsTyping((current) => ({...current, [sender.id]: receiver.id}));
    });
}

export function stopTypingHandler(socket: Socket,sender:User, setSomeoneIsTyping: (arg0: (current: object) => object) => void) {
    socket.on("stopTyping", () => {
        setSomeoneIsTyping((current) => ({...current, [sender.id]: null}));
    })
}


const timer = (user: User, socket: Socket) => setTimeout(() => {
    socket.emit("stopTyping", user);
}, 2000)

export const handleKeypress = (e: KeyboardEvent<HTMLElement>, user: User, socket: Socket, message: any, sendMessage: any) => {
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
