import React, { LegacyRef, useEffect, useId, useRef, useState} from 'react';
import {NextPage} from "next";
import {useSession} from "next-auth/react";
import LoginBtn from "@/pages/LoginBtn";
import {socket} from "@/context/socket";
import {incomingMessage, outgoingMessage} from "@/audio/audio";
import {handleKeypress} from "@/utils";
import {Message, User} from "@/utils/types";

const Home: NextPage = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([] as Message[]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState({} as User);
    const [users, setUsers] = useState([] as User[]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState({} as User | null);
    const [chatWith, setChatWith] = useState({} as User);
    const {data: session} = useSession()
    const id = useId()
    const ref = useRef() as LegacyRef<HTMLInputElement> & { current: HTMLDivElement }
    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            setUser(session.user)
            socket.emit("assignRoom", session.user)
            setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
            if (isAdmin) {
                socket.emit("getUsers")
                socket.on("usersData", (data) => {
                    setUsers(data)
                })
            }
            socket.emit("checkUser", session.user)
        }
    }, [session, isAdmin])


    const changeRoom = () => {
        if (chatWith) {
            socket.emit("changeRoom", chatWith.email)
        }
    }

    function sendMessage() {
        if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            socket.emit("send_Message", {
                sender: user.email,
                receiver: chatWith.email,
                content: message,
                room: chatWith.email
            },)
            outgoingMessage()
        } else {
            socket.emit("send_Message", {
                sender: user.email,
                receiver: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
                content: message,
                room: process.env.NEXT_PUBLIC_ADMIN_EMAIL
            })
            outgoingMessage()
        }

        setMessage("")
    }

    socket.on("newIncomingMessage", async (msg: Message) => {
        incomingMessage()
        setMessages([...messages, msg])
    })

    socket.on("typing", async (data) => {
        setSomeoneIsTyping(data)
    });
    socket.on("stopTyping", async (data) => setSomeoneIsTyping(null));

    function handleKeypressFunction(e: KeyboardEvent) {
        handleKeypress(e, user, socket, message, sendMessage)
    }

    return (
        <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
            <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                <LoginBtn/>
                {isAdmin && users.map((availableUser) => (
                    <div key={availableUser.id} className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-2xl font-bold">{availableUser.name}</h1>
                        <button type="button" onClick={(e) => {
                            e.preventDefault()
                            setChatWith(availableUser)
                            changeRoom()
                        }}>Chat
                        </button>
                    </div>
                ))}


                {user ? (
                    <>
                        <p className="font-bold text-white text-xl">
                            Your username: {user.name}
                        </p>
                        {!isAdmin || chatWith ?
                            <div
                                className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
                                <div className="h-full last:border-b-0 overflow-y-scroll">
                                    {messages.map((msg, i) =>
                                        <div
                                            className="w-full py-1 px-2 border-b border-gray-200"
                                            key={`${id + i}`}
                                        >
                                            {msg.sender} : {msg.content}
                                        </div>
                                    )}
                                    {someoneIsTyping ? <div className="w-full py-1 px-2 border-b border-gray-200">
                                        {someoneIsTyping.name} is typing...
                                    </div> : null}
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
                            : null
                        }
                    </>
                ) : null
                }
            </main>
        </div>
    );
};
export default Home
