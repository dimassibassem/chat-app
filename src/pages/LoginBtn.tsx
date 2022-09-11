import {useSession, signIn, signOut} from "next-auth/react"
import {NextComponentType} from "next";
import axios from "axios";
import {Session} from "next-auth";
import {useEffect} from "react";


const LoginBtn: NextComponentType = () => {
    const {data: session} = useSession()

    const addUserIfNotExist = async (activeSession: Session) => {
        await axios.post("/api/user", {
            name: activeSession.user?.name,
            email: activeSession.user?.email,
            image: activeSession.user?.image
        })
    }
    useEffect(() => {
        if (session) {
            addUserIfNotExist(session)
        }
    }, [session])
    if (session) {
        return (
            <button type="button" onClick={() => signOut()}>Sign out</button>
        )
    }
    return (
        <>
            Not signed in <br/>
            <button type="button" onClick={() => signIn()}>Sign in</button>
        </>
    )
}
export default LoginBtn
