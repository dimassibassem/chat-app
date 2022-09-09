import {useSession, signIn, signOut} from "next-auth/react"
import {NextComponentType} from "next";

const LoginBtn: NextComponentType = () => {
    const {data: session} = useSession()
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
