import { Chat } from "../SocketWrapper";
import { Message } from "./Messages";

type MessageRowProps = {
    message: Message,
    chat:Chat,
    sent?:boolean
}

export default function MessageRow({message,sent,chat}:MessageRowProps) {
    const users = chat.Users;
    const user = users.find(u => u.id === message.UserId);
    const data = new Date(message.createdAt);
    

    return(
        <li className={"py-1 px-2 rounded d-flex flex-column my-1 " + (sent?"bg-primary text-light align-self-end text-end":"bg-dark-subtle")} style={{width: "max-content"}} >
            <small className="" style={{fontSize:".7em"}}>{user?user.name:"you"}</small>
            <span className="" > {message.text}</span>
            <span style={{fontSize:".5em"}} className={""+(sent?"text-white-emphasis":"text-secondary")}>{data.toLocaleTimeString()}</span>
        </li>
    )

}
