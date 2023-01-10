import { useNavigate } from "react-router-dom";
import { Contact } from "../SocketWrapper";


type CHP = {
    contact: Contact
}

export default function ChatHeader({contact}:CHP) {
  let src = contact.id ? `${window.origin}1/img/profile/${contact.id}` : "/images/profile.jpg"; 
  const navigate = useNavigate();
  return (
    <div className="shadow rounded border border-2 w-100 p-2 align-items-center row m-0 ">
      <button className="material-icons col-2 col-md-1 btn" type="button" onClick={e => navigate("/chats")}>arrow_back</button>
      <img src={src} alt="contact's profile" className="col-3 col-md-2 rounded-circle" />
      <div className="col-6">
        <span>{contact.name}</span>
        <small>online</small>
      </div>
      <div className="col-1 col-md-3 p-1">
        <span className="material-icons">edit</span>
        <small className="material-icons">settings</small>
      </div>
    </div>
  )
}
