import {NextPage} from "next";
import axios from "axios";
import {KeyboardEvent, LegacyRef, SetStateAction, useEffect, useId, useRef, useState} from "react";
import io, {Socket} from "socket.io-client";
import {signOut, useSession} from "next-auth/react";
import {outgoingMessage} from "@/audio/audio";
import {User, Message} from "@/utils/types";
import {getUser} from "@/utils";
import {newIncomingMessageHandler, stopTypingHandler, typingHandler, handleKeypress} from "@/utils/socketClientEvent";


let socket: Socket;
const Admin: NextPage = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState({});
    const [chatWith, setChatWith] = useState() as [User, (user: SetStateAction<User>) => void];
    const [connectedUser, setConnectedUser] = useState() as [User, (user: SetStateAction<User>) => void];
    const {data: session} = useSession()
    const socketInitializer = async () => {
        // We just call it because we don't need anything else out of it
        await fetch("/api/socketio");
        socket = io();
        newIncomingMessageHandler(socket, setMessages);
        typingHandler(socket, setSomeoneIsTyping);
        stopTypingHandler(socket, setSomeoneIsTyping);
    };

    const id = useId();
    const ref = useRef() as LegacyRef<HTMLInputElement> & { current: HTMLDivElement }
    ref.current?.scrollIntoView({behavior: "smooth"})

    function chatWithUser(user: SetStateAction<any>) {
        setChatWith(user)
        setMessages(user.messages)
    }

    const sendMessage = async () => {
        socket.emit("createdMessage", {
            author: "Admin",
            content: message,
            receiverId: chatWith.id,
            senderId: connectedUser.id,
            createdAt: new Date()
        });
        outgoingMessage()
        setMessages((currentMsg) => [
            ...currentMsg,
            {
                author: "Admin",
                content: message,
                senderId: connectedUser.id,
                receiverId: chatWith.id,
                createdAt: new Date()
            },
        ]);
        setMessage("");
    };


    const getUsers = async () => {
        const res = await axios.get("/api/usersWithMessages")
        setUsers(res.data)
    }


    const handleKeypressFunction = (e: KeyboardEvent<HTMLElement>) => {
        handleKeypress(e, "admin", socket, message, sendMessage)
    }

    useEffect(() => {
        socketInitializer()
    }, []);
    useEffect(() => {
        if (session) {
            getUser(session, setConnectedUser)
            getUsers()
        }
    }, [session])
    if (session) {
        return (
            <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
                <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                    Admin page
                    <button type="button" onClick={() => signOut()}>Sign out</button>
                    {users.map((user: User) => (
                        <div key={user.id}>
                            <h1>{user.name}</h1>
                            <h2>{user.email}</h2>
                            <img referrerPolicy="no-referrer" src={user.image} alt=""/>
                            <button type="button" className="rounded-full bg-amber-200 shadow-xl p-4" onClick={() => {
                                chatWithUser(user)
                            }}>Chat with
                            </button>
                        </div>
                    ))}
                    {chatWith ?
                        <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
                            <div className="h-full last:border-b-0 overflow-y-scroll">
                                {messages.map((msg) => {
                                        if (msg.senderId === connectedUser.id) {
                                            return (
                                                <div className="bg-blue-500" key={msg.id}>
                                                    {session.user?.name} : {msg.content}
                                                </div>
                                            )
                                        }
                                        return (
                                            <div className="bg-green-500" key={msg.id}>
                                                {chatWith.name} : {msg.content}
                                            </div>
                                        )
                                    }
                                )}
                                {Object.keys(someoneIsTyping).map((user) => {
                                        // @ts-ignore
                                        if (someoneIsTyping[user]) {
                                            return <div className="w-full py-1 px-2 border-b border-gray-200"
                                                        key={id + user}>{user} is typing...</div>
                                        }
                                        return <div key={id + Math.random()}
                                                    className="h-8 py-1 px-2"
                                        />
                                    }
                                )}
                                <div ref={ref}/>
                            </div>

                            <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                                <input
                                    type="text"
                                    placeholder="New message..."
                                    value={message}
                                    className="outline-none py-2 px-2 rounded-bl-md flex-1"
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeypressFunction}
                                />
                                <div
                                    className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
                                    <button
                                        type="button"
                                        className="group-hover:text-white px-3 h-full"
                                        onClick={() => {
                                            sendMessage();
                                        }}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>

                        </div>
                        : null}
                </main>
            </div>
        )
    }
    return <div>Loading...</div>
}
export default Admin;
