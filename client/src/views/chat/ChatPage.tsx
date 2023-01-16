import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { User } from '../App';
import { Chat } from '../SocketWrapper';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import Messages from './Messages';

type ChatProps = {
    socket:Socket,
    user:User
    currentChat:Chat,
    sendMessage:((text:string,chat:Chat,setChat?:((chat:Chat)=>void)) => void),
}


export default function ChatPage({socket, user, currentChat, sendMessage}:ChatProps) {
    const navigate = useNavigate()
    const [chat,setChat] = useState<Chat>(currentChat);
    

    useEffect(() => {
        if(chat.contactId !== 0) return;
    
        socket.emit("getChat", chat.username, (res:any) => {
            if(res.error) {
                if(res.error === "404") {
                    navigate("/chats");
                }
                return console.error(res.error);
            }
            setChat(res.chat);
        });

    },[chat,navigate,socket]);
    

    return(
        <div className={'d-flex flex-column w-100 h-100  overflow-hidden'}>                
        {
        currentChat ?
        <>
            <ChatHeader chat={chat} />
            <Messages user={user} socket={socket} chat={currentChat} />
            <MessageInput sendMessage={(text:string)=>sendMessage(text,currentChat,setChat)} />
        </>:<h2>Getting the chat...</h2>
        }
        </div>
    );
}
