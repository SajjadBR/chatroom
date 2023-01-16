import { useState } from "react"
import { Link } from "react-router-dom"
import { Socket } from "socket.io-client"
import PromiseView from "../PromiseView"
import { pEmit } from "../SocketWrapper"
import SearchChatItem from "./SearchChatItem"


type SearchChatProps = {
    socket: Socket
}

function result({data}:{data:any}){
    console.log(data.chats);
    const results:any[] = data.chats;
    
    return(
        <ul className="m-0 p-2 mt-2 w-100 flex-grow-1 overflow-auto ">
            {results.map(result => <SearchChatItem key={result.id} result={result} />)}
        </ul>

    )
}

export default function SearchChat({socket}:SearchChatProps) {
    const [text,setText] = useState("")

    return (
        <div id="main" className="w-100 d-flex flex-column py-2 h-100 overflow-hidden">
            <div className="d-flex justify-content-between px-3">
                <Link className="material-icons btn col-1 d-inline" to="/chats">arrow_back</Link>
                <div className="input-group w-75 shadow border col-11">
                    <label className="material-icons input-group-text" htmlFor="search-chat-input">search</label>
                    <input className="form-control" value={text} onInput={e=>setText(e.currentTarget.value)} type="search" id="search-chat-input" placeholder="search for users ,groups ,channels" />
                </div>
            </div>
            {text ?
            <PromiseView promise={pEmit(socket,"searchChats",text)} Result={result}>
                Searching...
            </PromiseView>:
            <h3 className="p-3">type something</h3>
            }
        </div>
    )
}
