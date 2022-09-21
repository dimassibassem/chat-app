import React, {LegacyRef, useEffect, useId, useRef, useState} from 'react';
import {NextPage} from "next";
import {useSession} from "next-auth/react";
import LoginBtn from "@/pages/LoginBtn";
import {socket} from "@/context/socket";
import {incomingMessage, outgoingMessage} from "@/audio/audio";
import {handleKeypress, stopTypingHandler, typingHandler} from "@/utils";
import {Message} from "@/utils/messageType";
import {User} from "@/utils/userType";

const Home: NextPage = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<User>();
    const [users, setUsers] = useState<User[]>([]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState();
    const [chatWith, setChatWith] = useState<User | null>(null);
    const [room, setRoom] = useState<string>("");
    const {data: session} = useSession()
    const id = useId()
    const ref = useRef() as LegacyRef<HTMLInputElement> & { current: HTMLDivElement }

    useEffect(() => {
        if (session?.user) {
            setUser(session.user as User)
            setRoom(session.user.email as string)
        }
    }, [session])

    useEffect(() => {
        if (user) {
            socket.emit("assignRoom", user)
            socket.emit("checkUser", user)
            if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                setIsAdmin(true)
                socket.emit("getUsers", user.email)
                socket.on("usersData", (data) => {
                    setUsers(data)
                })
            } else {
                socket.emit("getUserMessages", user)
            }
        }
    }, [user])

    socket.on("newUserConnected", (data) => {
        setUsers([...users, data])
    })

    socket.on("userMessages", (data) => {
        setMessages(data)
    })

    const changeRoom = (availableUser: any) => {
        setChatWith(availableUser)
        setRoom(availableUser.email)
        socket.emit("changeRoom", availableUser.email)
    }

    useEffect(() => {
        if (room) {
            socket.emit("currentRoomMessages", room)
        }
    }, [room])

    socket.on("roomMessages", (data) => {
        setMessages(data)
    })

    function sendMessage() {
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

    socket.on("newIncomingMessage", async (msg: Message) => {
            setMessages([...messages, msg])

            setUsers(users.map((userElem) => {
                    if (user.email === msg.sender?.email && msg.receiver?.email === userElem.email) {
                        userElem.lastMessage = msg.content
                        userElem.received = false
                    }
                    if (user.email === msg.receiver?.email && msg.sender?.email === userElem.email) {
                        userElem.lastMessage = msg.content
                        userElem.received = true
                    }
                    return userElem
                }
            ))
        }
    )


    typingHandler(socket, setSomeoneIsTyping)

    // @ts-ignore
    stopTypingHandler(socket, setSomeoneIsTyping)


    function handleKeypressFunction(e: KeyboardEvent) {
        // @ts-ignore
        handleKeypress(e, user, socket, message, sendMessage, room)
    }


    useEffect(() => {
        if (messages[messages.length - 1]?.receiver?.email === user?.email) {
            incomingMessage()
        }
    }, [messages, user])

    return (
        <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
            <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                <LoginBtn/>
                {isAdmin && users.map((availableUser) => (
                    <div key={availableUser.id} className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-2xl font-bold">{availableUser.name}</h1>
                        {availableUser.lastMessage !== "" && (
                            <h3>{availableUser.received ? availableUser.name : user?.name} : {availableUser.lastMessage}</h3>
                        )}
                        <button type="button" onClick={() => {
                            changeRoom(availableUser)
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
                                            {msg.sender?.name} : {msg.content}
                                        </div>
                                    )}
                                    {someoneIsTyping ? <div className="w-full py-1 px-2 border-b border-gray-200">
                                        {/* @ts-ignore */}
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
                                        // @ts-ignore
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
