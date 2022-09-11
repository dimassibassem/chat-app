import {useSession, signIn, signOut} from "next-auth/react"
import {NextComponentType} from "next";
import axios from "axios";
import {Session} from "next-auth";
import {useEffect} from "react";


const addUserIfNotExist = async (session: Session) => {
    await axios.post("/api/user", {name: session.user?.name, email: session.user?.email, image: session.user?.image})
}

const LoginBtn: NextComponentType = () => {
    const {data: session} = useSession()

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
