import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Socket } from "socket.io-client"
import SearchChatItem from "./SearchChatItem"


type SearchChatProps = {
    socket: Socket
}

export default function SearchChat({socket}:SearchChatProps) {

    const [results,setResults] = useState<any[]>([])
    const searchRef = useRef<HTMLInputElement>(null);

    function search(){
        const text = searchRef.current?.value;
        if(!text) return setResults([]);

        socket.emit("searchChats", text, (res:any) => {
            setResults(res.chats);
        })
    }

    return (
        <div id="main" className="w-100 d-flex flex-column py-2">
            <div className="d-flex justify-content-between px-3">
                <Link className="material-icons btn col-1 d-inline" to="/chats">arrow_back</Link>
                <div className="input-group w-75 shadow border col-11">
                    <label className="material-icons input-group-text" htmlFor="search-chat-input">search</label>
                    <input className="form-control" onInput={search} ref={searchRef} type="search" id="search-chat-input" placeholder="search for users,groups,channels" />
                </div>
            </div>
            <ul className="m-0 p-2 mt-2 w-100 flex-grow-1 overflow-y-auto ">
                {results.map(result => <SearchChatItem key={result.id} result={result} />)}
            </ul>
        </div>
    )
}
