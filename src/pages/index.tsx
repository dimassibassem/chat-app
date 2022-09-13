import io, {Socket} from "socket.io-client";
import {KeyboardEvent, LegacyRef, SetStateAction, useEffect, useId, useRef, useState} from "react";
import {NextPage} from "next";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import LoginBtn from "@/pages/LoginBtn";
import {outgoingMessage} from "@/audio/audio";
import {Message, User} from "@/utils/types";
import {getUser} from "@/utils";
import {newIncomingMessageHandler, stopTypingHandler, typingHandler, handleKeypress} from "@/utils/socketClientEvent";

let socket: Socket;

const Home: NextPage = () => {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [connectedUser, setConnectedUser] = useState() as [User, (user: SetStateAction<User>) => void];
    const {data: session} = useSession()
    const router = useRouter()
    const id = useId()
    const ref = useRef() as LegacyRef<HTMLInputElement> & { current: HTMLDivElement }

    const socketInitializer = async () => {
        // We just call it because we don't need anything else out of it
        await fetch("/api/socketio");
        socket = io();
        newIncomingMessageHandler(socket, setMessages);
        typingHandler(socket, setSomeoneIsTyping);
        stopTypingHandler(socket, setSomeoneIsTyping);
    };

    const sendMessage = async () => {
        socket.emit("createdMessage", {
            author: username,
            content: message,
            senderId: connectedUser.id,
            receiverId: 2,
            createdAt: new Date()
        });
        outgoingMessage()
        setMessages((currentMsg) => [
            ...currentMsg,
            {
                author: username,
                content: message,
                senderId: connectedUser.id,
                receiverId: 2,
                createdAt: new Date()
            },
        ]);
        setMessage("");
    };


    const handleKeypressFunction = (e: KeyboardEvent<HTMLElement>) => {
        handleKeypress(e, username, socket, message, sendMessage)
    }

    useEffect(() => {
        if (session) {
            setUsername(session.user?.name as string)
            setIsAdmin(session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
            getUser(session, setConnectedUser)
        }
    }, [session])

    useEffect(() => {
        if (isAdmin) {
            router.push("/admin")
        }
    }, [isAdmin, router])
    useEffect(() => {
        socketInitializer()
    }, []);

    ref.current?.scrollIntoView({behavior: "smooth"})


    console.log(someoneIsTyping);
    return (
        <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
            <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                <LoginBtn/>

                {isAdmin && <h2>Welcome Boss</h2>}

                {username ? (
                    <>
                        <p className="font-bold text-white text-xl">
                            Your username: {username}
                        </p>
                        <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
                            <div className="h-full last:border-b-0 overflow-y-scroll">
                                {messages.map((msg, i) => (
                                    <div
                                        className="w-full py-1 px-2 border-b border-gray-200"
                                        key={`${id + i}`}
                                    >
                                        {msg.author} : {msg.content}
                                    </div>
                                ))}

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
                    </>
                ) : null
                }
            </main>
        </div>
    );
}

export default Home;
