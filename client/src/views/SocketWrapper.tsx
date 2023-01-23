import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io,Socket } from "socket.io-client";
import { Tokens, User } from "./App";
import ChatPage from "./chat/ChatPage";
import SearchChat from "./chat/SearchChat";
import Sidebar from "./chat/Sidebar";

export function pEmit(socket:Socket,ev:string,...args:any[]){
    return new Promise<any>((resolve,reject) => {
        socket.emit(ev,...args,(res:any) => {
            if(res.error) return reject({message:res.error});
            resolve(res);
        });
    });
}

export type ChatType = "private"|"channel"|"group";

export type Chat = {
    id: number,
    name:string,
    username:string,
    type:ChatType,
    contactId:number
}

export type Contact = {
    id: number,
    username: string
    name: string,
};

const Notification = memo(({socket}:{socket:Socket}) => {
    const [message,setMessage] = useState<any>()
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(()=>{
        socket.on("newMessage",(m:any) => {
            console.log(m);
            
            setMessage(m);

            setTimeout(() => {
                console.log("close");
                
                closeButtonRef.current!.click();
            }, 5000);
        });
    },[socket])

    return(
        <>
        {message &&
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div id="notification" className="toast toast-primary show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <svg className="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
                        <rect width="100%" height="100%" fill="#007aff"></rect>
                    </svg>
                    <strong className="me-auto">{message.UserId}</strong>
                    <small>{message.createdAt}</small>
                    <button ref={closeButtonRef} type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div className="toast-body">
                    {JSON.stringify(message)}
                </div>
            </div>
        </div>
        }
        </>
    )
})

export default function SocketWrapper({user}:{user:User}) {
    console.log("SW");
    const socket = useMemo(()=> io(window.origin+"1",{ auth: {token: Tokens.access}}),[])
    
    const {pathname} = useLocation();
    const {showChats,username} = useMemo(() => {
        const x = pathname.startsWith("/chats");
        const y = x && pathname !== "/chats/search" && pathname.replace("/chats","").replace("/","")
        return {showChats:x,username:y}
    },[pathname]);
 
    const [chats,setChats] = useState<Chat[]>();
    const [chat,setChat] = useState<Chat>();

    
    const deleteChat = useCallback((id:number)=>{
        socket.emit("deleteChat",id, (res:any) => {
            if(res.err) return console.error(res.err);
            
            setChats(current => current?.filter(value => value.id !== id));
        });
    },[socket]);

    
    const sendMessage = useCallback((text:string) => {
        if(!chat) return;
        if(chat.id !== 0) {
            socket.emit("sendMessage", chat.id, text);
            return;
        }

        pEmit(socket,"startChat",chat.contactId).then((res:any) => {
            setChats(current => [...current!, res.chat]);
            socket.emit("sendMessage", res.chat.id, text);
            setChat(res.chat);
        });
        
    },[socket,chat]);


    useEffect(() => {
        socket.emit("getChats", (res:any)=> {
            if(res.error) throw new Error(res.error);
            setChats(res.chats);
        });

        function onNewChat(chat:Chat) {
            setChats(current => [...current!,chat]);
        }
        socket.on("newChat", onNewChat);

        console.log(socket.listeners("newChat"));

        return () => {
            socket.removeListener("newChat",onNewChat);
        }
    },[socket]);

    useEffect(() => {
        if(!username) {
            if(chat) setChat(undefined);
            return;
        }

        if(chats === undefined) return;
        const exist = chats.find(c=>c.username === username);
        if(exist) return setChat(exist);
        
        socket.emit("getChat", username, (res:any) => {
            if(res.error) {
                if(res.error === "404") {
                    // navigate("/chats");
                }
                return console.error(res.error);
            }
            setChat(res.chat);
        });

// eslint-disable-next-line
    },[username,chats]);


    return (
        <>
        {showChats &&
        <div className="w-100 h-100 overflow-hidden">
            {pathname === "/chats/search" ?
            <SearchChat socket={socket} />:
            (
                (!username) ?
                <Sidebar deleteChat={deleteChat} chats={chats} />:
                <ChatPage user={user} sendMessage={sendMessage} chat={chat} socket={socket} />
            )
            }
        </div>
        }
        <Notification socket={socket} />
        </>
    )
}

/*
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


        socket.on("connect_error", onConnectError);
        socket.on("connect", () => {
            setConnected(true);
        });
        socket.on("disconnect", (reason) => {
            console.warn(reason);
            setConnected(false);
        });

*/