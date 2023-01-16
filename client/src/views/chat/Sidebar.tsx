import SidebarChat from './SidebarChat';
import { Link } from 'react-router-dom';
import { Chat } from '../SocketWrapper';

type SidebarProps = {
    chats?:Chat[],
    deleteChat:((id:number)=>void),
}

export default function Sidebar({chats,deleteChat}:SidebarProps) {

    const placeholder = <div className="m-0 p-2 d-flex align-items-center border" aria-hidden="true">
                <img src='' alt='' className="col-3 col-md-1 placeholder rounded-circle" style={{aspectRatio:1}} />
                <span className='col-1'></span>
                <span className='col-4 placeholder'></span>
            </div>
    
    return (
        <div className='w-100 h-100 p-2 position-relative overflow-y-auto'>
            {(chats === undefined)? 
            <>
            {placeholder}
            {placeholder}
            {placeholder}
            </>:
            <>
            {chats.map(chat => <SidebarChat deleteChat={deleteChat} key={chat.id} chat={chat} />)}
            {!chats.length && <h3>no chats yet</h3>}
            </>
            } 
            <Link className='material-icons btn btn-dark rounded-circle p-3 mb-4 me-4 position-fixed bottom-0 end-0' to='/chats/search'>add</Link>
        </div>

    )
}