import {Socket} from "socket.io-client";
import {User} from "@/utils/userType";
import {Message} from "./messageType";

function typingHandler(socket: Socket, setSomeoneIsTyping: any) {
    socket.on("typing", async (data: User) => {
        setSomeoneIsTyping(data)
    });
}

function stopTypingHandler(socket: Socket, setSomeoneIsTyping: (arg0: null) => void) {
    socket.on("stopTyping", () => {
        setSomeoneIsTyping(null)
    })
}

export function usersDataListener(socket: Socket, setUsers: (arg0: User[]) => void) {
    socket.on("usersData", (data) => {
        setUsers(data)
    })
}

function newUserConnectedListener(socket: Socket, users: User[], setUsers: (arg0: User[]) => void) {
    socket.on("newUserConnected", (data) => {
        setUsers([...users, data])
    })
}

function userMessagesListener(socket: Socket, setMessages: (arg0: Message[]) => void) {
    socket.on("userMessages", (data) => {
        setMessages(data)
    })
}

function roomMessagesListener(socket: Socket, setMessages: (arg0: Message[]) => void) {
    socket.on("roomMessages", (data) => {
        setMessages(data)
    })

}

function newIncomingMessageListener(socket: Socket, setMessages: (arg0: Message[]) => void, messages: Message[], setUsers: (arg0: User[]) => void, users: User[], user: User | undefined) {
    socket.on("newIncomingMessage", async (msg: Message) => {
            setMessages([...messages, msg])
            setUsers(users.map((userElem) => {
                    if (user?.email === msg.sender?.email && msg.receiver?.email === userElem.email) {
                        userElem.lastMessage = msg.content
                        userElem.received = false
                    }
                    if (user?.email === msg.receiver?.email && msg.sender?.email === userElem.email) {
                        userElem.lastMessage = msg.content
                        userElem.received = true
                    }
                    return userElem
                }
            ))
        }
    )
}


export function globalSocketListeners(socket: Socket, users: User[], setUsers: { (arg0: User[]): void; (arg0: User[]): void }, setSomeoneIsTyping: { (arg0: User | null): void } | any, setMessages: { (arg0: Message[]): void }, messages: Message[], user: User | undefined) {

    newUserConnectedListener(socket, users, setUsers)

    userMessagesListener(socket, setMessages)

    roomMessagesListener(socket, setMessages)

    newIncomingMessageListener(socket, setMessages, messages, setUsers, users, user)

    typingHandler(socket, setSomeoneIsTyping)

    stopTypingHandler(socket, setSomeoneIsTyping)
}
