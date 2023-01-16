import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Edit from './Edit';
import Devices from './Devices';
import React, { useEffect } from 'react';
import { Tokens, User } from '../App';
import Profile from './Profile';


export async function logout(token:string) {
    const res = await fetch(window.origin+"1/auth/logout", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({logout: token})
    });
    if(!res.ok) throw new Error(await res.text());
}
type DashboardProps = {
    user:User,
    setUser:React.Dispatch<React.SetStateAction<User>>
}

export default function Dashboard({user,setUser}:DashboardProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if(!Tokens.logged) navigate("/login");
    })

  return (
    <div className='w-100 h-100 d-flex'>
        <nav className='d-flex flex-column px-1 shadow justify-content-around'>
            <NavLink className="material-icons" to="/dashboard/" title='dashboard'>dashboard</NavLink>
            <NavLink className="material-icons" to="/dashboard/devices" title='devices'>devices</NavLink>
            <NavLink className="material-icons" to="/dashboard/edit" title='edit'>edit</NavLink>
        </nav>
        <div className='flex-grow-1'>
            <Routes>
                <Route index element={ <Profile user={user} /> } />
                <Route path='/devices' element={ <Devices /> } />
                <Route path='/edit' element={ <Edit user={user} setUser={setUser} /> } />
            </Routes>
        </div>

    </div>
  )
}
