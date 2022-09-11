import {NextPage} from "next";
import axios from "axios";
import {useEffect, useState} from "react";

const Admin: NextPage = () => {

    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        const res = await axios.get("/api/usersWithMessages")
        setUsers(res.data)
    }

    useEffect(() => {
        getUsers()
    }, [])
    console.log(users);
    return (
        <div>
            Admin page
        </div>
    )
}
export default Admin;
