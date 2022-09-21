import {Socket} from "socket.io-client";
import {Session} from "next-auth";
import {User} from "@/utils/userType";
import {outgoingMessage} from "@/audio/audio";

const timer = (data: { user: User | undefined; room: string; }, socket: Socket) => setTimeout(() => {
    socket.emit("stopTyping", data);
}, 2000)

export const changeRoom = (availableUser: User, setChatWith: (arg0: User) => void, setRoom: (arg0: string) => void, socket: Socket) => {
    setChatWith(availableUser)
    setRoom(availableUser.email)
    socket.emit("changeRoom", availableUser.email)
}

export function sendMessageFunction(session: Session | null, socket: Socket, user: User | undefined, message: string, room: string, setMessages: any, chatWith: User | null, setMessage: ((arg0: string) => void)) {
    if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        socket.emit("send_Message", {
            sender: user?.email,
            receiver: chatWith?.email,
            content: message,
            room
        })
    } else {
        socket.emit("send_Message", {
            sender: user?.email,
            receiver: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            content: message,
            room
        })
    }
    outgoingMessage()
    setMessage("")
}

export const handleKeypress = (e: KeyboardEvent, user: User | undefined, socket: Socket, message: string, room: string, session: Session | null, setMessages: any, chatWith: User | null, setMessage: (arg0: string) => void) => {
    let timerId = window.setTimeout(() => {
    }, 0);
    while (timerId--) {
        window.clearTimeout(timerId); // will do nothing if no timeout with id is present
    }
    socket.emit("typing", {user, room});
    if (e.keyCode === 13) {
        if (message) {
            sendMessageFunction(session, socket, user, message, room, setMessages, chatWith, setMessage)
            socket.emit("stopTyping", {user, room});
            return () => clearTimeout(timer({user, room}, socket));
        }
    }
    timer({user, room}, socket)
    return () => clearTimeout(timer({user, room}, socket));
};
