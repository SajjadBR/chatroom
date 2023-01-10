import { NavLink } from "react-router-dom";
import { Chat, Contact } from "../SocketWrapper";

type SCP = {
    chat: Chat,
    deleteChat:((id:number) => void)
}

function SidebarContact({chat,deleteChat}:SCP) {
    const contact:Contact = chat.Users[0];

    return(
        <NavLink className="row m-0 py-1 align-items-center border text-black text-decoration-none overflow-hidden"  to={"/chats/" + contact.username}>
            <img className="col-4 col-md-2 rounded-circle" src={`${window.origin}1/img/profile/${contact.id}`} alt="" />
            <div className="col-5 col-md-7 d-flex flex-column">
                <span>{contact.name}</span>
                <small>...</small>
            </div>
            <div className="col-3">
                <button className="material-icons btn btn-outline-danger" onClick={e=> {e.preventDefault(); deleteChat(chat.id);}} type="button">delete</button>
            </div>
        </NavLink>
    );
}


export default SidebarContact;