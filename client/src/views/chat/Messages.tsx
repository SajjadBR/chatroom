import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../App";
import { Chat } from "../SocketWrapper";
import MessageRow from "./MessageRow";

export interface Message{
    id:number,
    UserId:number,
    text:string,
    createdAt:string
}

type MessagesProps = {
    chat:Chat,
    user:User,
    socket:Socket
}


function Messages({chat,socket,user}:MessagesProps){
    let [messages, setMessages] = useState<Message[]>();
    
    useEffect(() => {
        if(chat.id === 0) return;
        function onNewMessage(newMessage:any) {
            console.log(newMessage);
            
            setMessages(current => [...current!, newMessage]);
        }

        socket.on("newMessage", onNewMessage);

        socket.emit("getMessages", chat.id, (res:any) => {
            if(res.error) return console.error(res.error);
            // console.log(res.messages);
            
            setMessages(res.messages);
        });
        

        return () => {            
            socket.removeListener("newMessage", onNewMessage);
        }
        
    },[chat.id])

    return(
        <ul className="m-0 d-flex flex-column px-3 flex-grow-1 overflow-y-auto">
            {messages?
            messages.map((message) => <MessageRow chat={chat} sent={message.UserId === user.id} message={message} key={message.id} />):
            <>
            <div className="col-3 m-1 h-25 placeholder rounded" aria-hidden="true"></div>
            <div className="col-5 m-1 h-50 placeholder rounded" aria-hidden="true"></div>
            <div className="col-2 m-1 h-25 placeholder rounded" aria-hidden="true"></div>
            </>
            }
        </ul>
    );
}

export default Messages;