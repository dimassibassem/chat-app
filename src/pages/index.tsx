import io, {Socket} from "socket.io-client";
import {KeyboardEvent, LegacyRef, useEffect, useId, useRef, useState} from "react";
import {NextPage} from "next";

let socket: Socket;

type Message = {
    author: string;
    message: string;
    createdAt: Date;
};

const Home: NextPage = () => {
    const [username, setUsername] = useState("");
    const [chosenUsername, setChosenUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [someoneIsTyping, setSomeoneIsTyping] = useState({});

    const socketInitializer = async () => {
        // We just call it because we don't need anything else out of it
        await fetch("/api/socketio");

        socket = io();

        socket.on("newIncomingMessage", (msg) => {
            setMessages((currentMsg) => [
                ...currentMsg,
                {author: msg.author, message: msg.message, createdAt: msg.createdAt},
            ]);
        });
        socket.on("typing", (user) => {
            setSomeoneIsTyping((current) => ({...current, [user]: true}));
        });
        socket.on("stopTyping", (user) => {
            setSomeoneIsTyping((current) => ({...current, [user]: false}));
        })
    };

    useEffect(() => {
        socketInitializer()
    }, []);

    const sendMessage = async () => {
        socket.emit("createdMessage", {author: chosenUsername, message, createdAt: new Date()});
        setMessages((currentMsg) => [
            ...currentMsg,
            {author: chosenUsername, message, createdAt: new Date()},
        ]);
        setMessage("");
    };


    const timer = () => setTimeout(() => {
        socket.emit("stopTyping", {author: chosenUsername});
    }, 2000)

    const handleKeypress = (e: KeyboardEvent<HTMLElement>) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let id = window.setTimeout(() => {}, 0);
        // eslint-disable-next-line no-plusplus
        while (id--) {
            window.clearTimeout(id); // will do nothing if no timeout with id is present
        }
        socket.emit("typing", {author: chosenUsername});
        if (e.keyCode === 13) {
            if (message) {
                socket.emit("stopTyping", {author: chosenUsername});
                sendMessage();
                return () => clearTimeout(timer());
            }
        }
        timer()
        return () => clearTimeout(timer());
    };

    const id = useId()
    const ref = useRef() as LegacyRef<HTMLInputElement> & { current: HTMLDivElement }

    ref.current?.scrollIntoView({behavior: "smooth"})

    return (
        <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
            <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
                {!chosenUsername ? (
                    <>
                        <h3 className="font-bold text-white text-xl">
                            How people should call you?
                        </h3>
                        <form>
                            <div className="grid grid-col-1">
                                <input
                                    type="text"
                                    placeholder="Identity..."
                                    value={username}
                                    className="p-3 rounded-md outline-none"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    onClick={() => {
                                        setChosenUsername(username);
                                    }}
                                    className="bg-white mt-8 rounded-md mx-10 py-2 text-xl"
                                >
                                    Go!
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
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
                                        {msg.author} : {msg.message}
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
                                    onKeyUp={handleKeypress}
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
                )}
            </main>
        </div>
    );
}

export default Home;
