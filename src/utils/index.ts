import {KeyboardEvent} from "react";
import {Socket} from "socket.io-client";
import {Session} from "next-auth";
import axios from "axios";

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

export const addUserIfNotExist = async (activeSession: Session) => {
    await axios.post("/api/user", {
        name: activeSession.user?.name,
        email: activeSession.user?.email,
        image: activeSession.user?.image
    })
}

export const getUser = async (session: Session, setConnectedUser: (arg0: any) => void) => {
    const res = await axios.post("/api/findUser", {
        email: session?.user?.email
    });
    setConnectedUser(res.data);
}
