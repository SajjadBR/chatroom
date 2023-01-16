import { Link } from "react-router-dom";
import { Chat } from "../SocketWrapper";


export default function ChatHeader({chat}:{chat:Chat}) {
  return (
    <div className="shadow rounded border border-2 w-100 p-2 align-items-center row m-0 ">
      <Link className="material-icons col-2 col-md-1 btn" to="/chats">arrow_back</Link>
      <img src={`${window.origin}1/img/profile/${chat.contactId}`} alt="contact's profile" className="col-3 col-md-2 rounded-circle" />
      <div className="col-6">
        <span>{chat.name}</span>
        <small>online</small>
      </div>
      <div className="col-1 col-md-3 p-1">
        <span className="material-icons">edit</span>
        <small className="material-icons">settings</small>
      </div>
    </div>
  )
}
