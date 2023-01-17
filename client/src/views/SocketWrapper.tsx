import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { io,Socket } from "socket.io-client";
import { Tokens, User } from "./App";
import ChatPage from "./chat/ChatPage";
import SearchChat from "./chat/SearchChat";
import Sidebar from "./chat/Sidebar";
import PromiseView from "./PromiseView";

function startSocket(){
    return new Promise<Socket>((resolve,reject) => {
        const socket = io (window.origin+"1",{ auth: {token: Tokens.access}})
        socket.once("connect", () => resolve(socket));
        socket.once("connect_error", () => reject({message:"connection error"}));
    });
}
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

function GetChats({user,socket}:{user:User,socket:Socket}){
    function sw({data}:{data:any}){
        const chats = data.chats;

        return(
            <SocketWrapper2 user={user} socket={socket} initialChats={chats} />
        )
    }

    return(
        <PromiseView promise={pEmit(socket,"getChats")} Result={sw}>
            <h2>Getting your chats...</h2>
        </PromiseView>
    )
}

export default function SocketWrapper({user}:{user:User}) {

    function gc({data}:{data:any}){
        return(
            <GetChats user={user} socket={data} />
        )
    }
    
    return(
        <PromiseView promise={startSocket()} Result={gc}>
            <h2>Connecting...</h2>
        </PromiseView>
    )
}
function SocketWrapper2({user,socket,initialChats}:{user:User,socket:Socket,initialChats:Chat[]}) {
    console.log("SW");
    
    const {pathname} = useLocation();
    const {showChats,username} = useMemo(() => {
        const x = pathname.startsWith("/chats");
        const y = x && pathname !== "/chats/search" && pathname.replace("/chats","").replace("/","")
        return {showChats:x,username:y}
    },[pathname]);
 
    const [chats,setChats] = useState<Chat[]>(initialChats);
    
    const exist = chats?.find(c=>c.username === username);

    console.log(chats,pathname);
    
    const deleteChat = useCallback((id:number)=>{
        socket.emit("deleteChat",id, (res:any) => {
            if(res.err) return console.error(res.err);
            
            setChats(current => current?.filter(value => value.id !== id));
        });
    },[socket]);

    const startChat = useCallback((id:number)=>{
        return pEmit(socket,"startChat",id).then((res:any) => {
            setChats(current => [...current!, res.chat]);
            return res;
        });
    },[socket]);
    
    const sendMessage = useCallback((text:string,chat:Chat,setChat?:((chat:Chat)=>void)) => {
        if(chat.id !== 0) {
            socket.emit("sendMessage", chat.id, text);
            return;
        }

        startChat(chat.contactId).then(res => {
            socket.emit("sendMessage", res.chat.id, text);
            setChat?.(res.chat);
        })
        
    },[socket,startChat]);


    useEffect(() => {
        socket.on("newChat", (chat) => {
            setChats(current => [...current!,chat]);
        }); 
        
        return () => {
            socket.removeAllListeners("newChat");
        }
    },[socket]);

    if(!showChats)return null;

    return (
        <>
        <div className="w-100 h-100 overflow-hidden">
            {pathname === "/chats/search" ?
            <SearchChat socket={socket} />:
            (
                (!username) ?
                <Sidebar deleteChat={deleteChat} chats={chats} />:
                <ChatPage user={user} sendMessage={sendMessage} currentChat={exist || {id:0,username,name:"",type:"private",contactId:0}} socket={socket} />
            )
            }
        </div>
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


/*

        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div id="notification" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                {// <img src="..." className="rounded me-2" alt="...">
                }
                <strong className="me-auto">Bootstrap</strong>
                <small>11 mins ago</small>
                <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div className="toast-body">
                Hello, world! This is a toast message.
                </div>
            </div>
        </div>
*/
