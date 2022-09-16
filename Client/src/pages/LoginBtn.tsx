import {useSession, signIn, signOut} from "next-auth/react"
import {NextComponentType} from "next";
import {useEffect} from "react";
import {addUserIfNotExist} from "@/utils";

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
