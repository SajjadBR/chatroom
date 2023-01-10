import { useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Tokens } from "../App"
import Login from "./Login"
import Signup from "./Signup"

type AuthProps = {
    type: "login"|"signup"
}

export default function Auth({type}:AuthProps) {
    const navigate = useNavigate();

    useEffect(() => {
     if(Tokens.logged) navigate('/');
    });

  return (
    <div className="container bg-light py-2">
    <nav className="nav nav-tabs">
        <NavLink className="nav-link" to="/login">login</NavLink>
        <NavLink className="nav-link" to="/signup">signup</NavLink>

    </nav>
    {type === "login" && <Login />}
    {type === "signup" && <Signup />}
    </div>
  )
}
