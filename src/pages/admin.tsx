import {NextPage} from "next";
import axios from "axios";
import {KeyboardEvent, LegacyRef, SetStateAction, useEffect, useId, useRef, useState} from "react";
import io, {Socket} from "socket.io-client";
import {useSession} from "next-auth/react";
import {incomingMessage, outgoingMessage} from "@/audio/audio";

type Message = {
    id?: number;
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
    content?: string;
    message?: string;
    senderId?: number;
    receiverId?: number;
}
type User = {
    id?: number;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

let socket: Socket;
const Admin: NextPage = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState({});
    const [chatWith, setChatWith] = useState() as [User, (user: SetStateAction<User>) => void];
    const [connectedUser, setConnectedUser] = useState();
    const {data: session} = useSession()
    const getUser = async () => {
        const res = await axios.post("/api/findUser", {
            email: session?.user?.email
        });
        setConnectedUser(res.data);
    }


    const socketInitializer = async () => {
        // We just call it because we don't need anything else out of it

        await fetch("/api/socketio");

        socket = io();
        socket.on("newIncomingMessage", async (msg) => {
            incomingMessage()
            setMessages((currentMsg) => [
                ...currentMsg,
                msg,
            ]);

        });
        socket.on("typing", async (user) => {
            setSomeoneIsTyping((current) => ({...current, [user]: true}));
        });
        socket.on("stopTyping", (user) => {
            setSomeoneIsTyping((current) => ({...current, [user]: false}));
        })
    };

    useEffect(() => {
        socketInitializer()
    }, []);
    useEffect(() => {
        getUser()
    }, [session])

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
            message,
            receiverId: chatWith.id,
            // @ts-ignore
            senderId: connectedUser.id,
            createdAt: new Date()
        });
        outgoingMessage()
        setMessages((currentMsg) => [
            ...currentMsg,
            // @ts-ignore
            {author: "Admin", message, senderId: connectedUser.id, receiverId: chatWith.id, createdAt: new Date()},
        ]);
        setMessage("");
    };


    const getUsers = async () => {
        const res = await axios.get("/api/usersWithMessages")
        setUsers(res.data)
    }
    useEffect(() => {
        getUsers()
    }, [])


    const timer = () => setTimeout(() => {
        socket.emit("stopTyping", {author: "Admin"});
    }, 2000)

    const handleKeypress = (e: KeyboardEvent<HTMLElement>) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let timerId = window.setTimeout(() => {
        }, 0);
        // eslint-disable-next-line no-plusplus
        while (timerId--) {
            window.clearTimeout(timerId); // will do nothing if no timeout with id is present
        }
        socket.emit("typing", {author: "Admin"});
        if (e.keyCode === 13) {
            if (message) {
                sendMessage();
                socket.emit("stopTyping", {author: "Admin"});
                return () => clearTimeout(timer());
            }
        }
        timer()
        return () => clearTimeout(timer());
    };
    console.log(messages);
    console.log("connectedUser", connectedUser);
    if (session) {
        return (
            <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
                <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                    Admin page
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
                                        // @ts-ignore
                                        if (msg.senderId === connectedUser.id) {
                                            return (
                                                <div className="bg-blue-500" key={msg.id}>
                                                    {session.user?.name} : {msg.content || msg.message}
                                                </div>
                                            )
                                        }
                                        // @ts-ignore
                                        return (
                                            <div className="bg-green-500" key={msg.id}>
                                                {chatWith.name} : {msg.content || msg.message}
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
                                    onKeyDown={handleKeypress}
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