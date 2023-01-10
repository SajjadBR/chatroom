import { FormEventHandler, useState } from "react";
import { User } from "../App";


type EPP = {
    user:User,
    onsubmit:((data:any) => Promise<void | string>)
}

const emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


export default function EditProfile({user,onsubmit}:EPP) {
    const [username,setUsername] = useState(user.username);
    const [name,setName] = useState(user.name);
    const [email,setEmail] = useState(user.email);
    let [error,setError] = useState("")

    function mark(){
        let data:any = {};
        if(email !== user.email) data.email = email;
        if(name !== user.name) data.name = name;
        if(username !== user.username) data.username = username;

        if(data && data.email && !emailCheck.test(data.email)){
            return null;
        }

        if(Object.keys(data).length === 0)return null;
        return data;
    }

    const onEdit:FormEventHandler = (e) => {
        e.preventDefault();

        const data = mark()
        if(!data)return;

        onsubmit(data).then(res => {
            if(!res) return;
            console.log(res);
            setError(res);
        });
    }
    
  return (
    <form onSubmit={onEdit} >
      <div className="form-floating pt-2">
        <input className="form-control" placeholder="username" type="text" id="username" value={username} onInput={e => setUsername(e.currentTarget.value)} />
        <label className="form-label" htmlFor="username">Username:</label>
      </div>
      <div className="form-floating pt-2">
        <input className="form-control" placeholder="name" type="text" id="name" value={name} onInput={e => setName(e.currentTarget.value)} />
        <label className="form-label" htmlFor="name">Name:</label>
      </div>
      <div className="form-floating pt-2">
        <input className="form-control" placeholder="email" type="email" id="email" value={email} onInput={e => setEmail(e.currentTarget.value)} />
        <label className="form-label" htmlFor="email">Email:</label>
      </div>
      <span className="py-2">{error}</span>
      <button className="btn btn-primary my-2" type="submit">submit</button>
    </form>
  )
}
