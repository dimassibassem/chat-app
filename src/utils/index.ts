import {Session} from "next-auth";
import axios from "axios";


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
