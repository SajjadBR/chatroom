import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Tokens, User } from "./App";
import ChatPage from "./chat/ChatPage";
import SearchChat from "./chat/SearchChat";
import Sidebar from "./chat/Sidebar";

export type Chat = {
    id: number,
    Users: Contact[]
}

export type Contact = {
    id: number,
    username: string
    name: string,
};

type SocketWrapperProps = {
    user:User
}

export default function SocketWrapper({user}:SocketWrapperProps) {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const showChats = pathname.startsWith("/chats");
    const username = showChats && pathname !== "/chats/search" && pathname.replace("/chats","").replace("/","")

    const socket = useMemo(() => io (window.origin+"1",{ auth: {token: Tokens.access}}), []);
    
    const [chats,setChats] = useState<Chat[] | undefined>();
    const [connected, setConnected] = useState<boolean>(socket.connected);

    const [currentChat,setCurrentChat] = useState<Chat | undefined>();
    
    function sendMessage(text:string){
        if(currentChat?.id !== 0) return socket.emit("sendMessage", currentChat!.id, text);
        
        socket.emit("startChat", currentChat.Users[0].id, (res:any) => {
            if(res.error) return console.error(res.error);
            console.log(res.chat);
            
            setChats(current => [...current!, res.chat]);
            setCurrentChat(res.chat);
            socket.emit("sendMessage", res.chat.id, text, (res:any) => {
                if(res.error) console.error(res.error);
                
            });
        });
    }

    async function onConnectError(err: Error) {
        if(err.message === "jwt expired" || err.message === "no token"){
            console.log(err.message);
            await Tokens.updateTokenSync();
            socket.auth = {token: Tokens.access};
            socket.connect();
        }
        else {
            console.warn(err.message)
            socket.connect();
        }
    }
    useEffect(() => {
        socket.on("connect_error", onConnectError);
        socket.on("connect", () => {
            setConnected(true);
        });
        socket.on("disconnect", (reason) => {
            console.warn(reason);
            setConnected(false);
        });

        socket.emit("getChats", (res:any) => {
            res.chats.pop()//TODO update server then this line
            setChats(res.chats);
        });
        socket.on("newChat", (chat) => {
            setChats(current => [...current!,chat]);
        }); 
        return () => {
            socket.removeAllListeners("connect_error");
            socket.removeAllListeners("disconnect");
            socket.removeAllListeners("connect");
            socket.removeAllListeners("newChat");
        }
    },[]);
    
    
    
    useEffect(() => {
        if(!chats) return;
        if(!username) return setCurrentChat(undefined);
        
        const exist = chats?.find(chat => chat.Users[0].username === username);
        if(exist) return setCurrentChat(exist);

        socket.emit("getChat", username, (res:any) => {
            if(res.error) {
                if(res.error === "404") {
                    navigate("/chats");
                    return setCurrentChat(undefined);
                }
                return console.error(res.error);
            }
            setCurrentChat(res.chat);
        });

    },[username, chats]);

        
    function deleteChat(id:number){
        socket.emit("deleteChat",id, (res:any) => {
            if(res.err) return console.error(res.err);
            
            setChats(current => current?.filter(value => value.id !== id));
        });
    }
    
    

    return (
        <>
        {showChats && connected && chats &&
        <div className="w-100 h-100 d-flex overflow-hidden">
            {pathname === "/chats/search" ?
            <SearchChat socket={socket} />:
            <>
            <Sidebar show={pathname === "/chats"} deleteChat={deleteChat} chats={chats} />
            <ChatPage user={user} sendMessage={sendMessage} currentChat={currentChat} socket={socket} />
            </>
            }
        </div>
        }
        {showChats && connected && !chats && <h1>Getting your Chats...</h1>}
        {showChats && !connected && <h1>connecting...</h1>}
        </>
    )
}
