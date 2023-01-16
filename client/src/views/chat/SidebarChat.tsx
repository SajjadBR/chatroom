import { NavLink } from "react-router-dom";
import { Chat } from "../SocketWrapper";

type SCP = {
    chat: Chat,
    deleteChat:((id:number) => void)
}

function SidebarContact({chat,deleteChat}:SCP) {

    return(
        <NavLink className="row m-0 p-2 align-items-center border overflow-x-hidden"  to={"/chats/" + chat.username}>
            <img className="col-4 col-md-2 rounded-circle" src={`${window.origin}1/img/profile/${chat.contactId}`} alt="chat" />
            <div className="col-5 col-md-7 d-flex flex-column">
                <span>{chat.name}</span>
                <small>...</small>
            </div>
            <div className="col-3">
                <button className="material-icons btn btn-outline-danger" onClick={e=> {e.preventDefault(); deleteChat(chat.id);}} type="button">delete</button>
            </div>
        </NavLink>
    );
}


export default SidebarContact;