import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Socket } from "socket.io-client";
import { Chat } from "../SocketWrapper";


export default function ChatHeader({chat,socket}:{chat:Chat,socket:Socket}) {
  const [status,setStatus] = useState<string>("");

  const dateStr = new Date(status).toLocaleString();
  const statusText = dateStr === "Invalid Date" ? status : dateStr;

  useEffect(() => {
    socket.emit("getStatus",chat.contactId,(res:any)=> {
      setStatus(res.status);
    });
  },[chat.contactId]);

  return (
    <div className="shadow rounded border border-2 w-100 p-2 align-items-center row m-0 ">
      <Link className="material-icons col-2 col-md-1 btn" to="/chats">arrow_back</Link>
      <img src={`${window.origin}1/img/profile/${chat.contactId}`} alt="contact's profile" className="col-3 col-md-2 col-lg-1 rounded-circle" />
      <div className="col-6 d-flex flex-column">
        <span>{chat.name}</span>
        <small>{statusText}</small>
      </div>
      <div className="col-1 col-md-3 p-1">
        <span className="material-icons">edit</span>
        <small className="material-icons">settings</small>
      </div>
    </div>
  )
}
