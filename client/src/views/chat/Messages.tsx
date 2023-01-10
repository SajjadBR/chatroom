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
    let [messages, setMessages] = useState<Message[]>([]);
    
    function onNewMessage(newMessage:any) {
        console.log(newMessage);
        
        setMessages(current => [...current, newMessage]);
    }

    useEffect(() => {
        if(chat.id === 0) return;

        socket.emit("subscribeChat", chat.id);
        socket.on("newMessage", onNewMessage);

        socket.emit("getMessages", chat.id, (res:any) => {
            if(res.error) return console.error(res.error);
            // console.log(res.messages);
            
            setMessages(res.messages);
        });
        

        return () => {            
            socket.removeListener("newMessage", onNewMessage);
            socket.emit("unsubscribeChat", chat.id);
        }
        
    },[chat.id])

    return(
        <ul className="m-0 d-flex flex-column px-3 flex-grow-1 overflow-y-auto">
            {messages.map((message) => <MessageRow chat={chat} sent={message.UserId === user.id} message={message} key={message.id} />)}
            
        </ul>
    );
}

export default Messages;